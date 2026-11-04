import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fetchAllGoogleReviews, googleReviewsConfiguration, saveGoogleReviews } from "../lib/googleReviews.js";
import { createGoogleReviewSync, GOOGLE_SYNC_INTERVAL_MS } from "../lib/googleReviewSync.js";
import { GoogleReviewsError } from "../lib/googleReviews.js";
import ReviewModel from "../models/Review.js";

const env = {
  GOOGLE_BUSINESS_CLIENT_ID: "test-client",
  GOOGLE_BUSINESS_CLIENT_SECRET: "test-secret",
  GOOGLE_BUSINESS_REFRESH_TOKEN: "test-refresh",
  GOOGLE_BUSINESS_ACCOUNT_ID: "123",
  GOOGLE_BUSINESS_LOCATION_ID: "456",
};
const review = (id, extra = {}) => ({ reviewId: id, reviewer: { displayName: "Guest" }, starRating: "FIVE", comment: "Lovely stay", createTime: "2026-10-01T12:00:00Z", ...extra });
const response = (body, status = 200) => ({ ok: status === 200, status, json: async () => body });
function mockGoogle(pages) {
  const calls = [];
  return {
    calls,
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      if (url.includes("oauth2")) return response({ access_token: "test-access-token" });
      assert.ok(pages.length, "Unexpected extra Google request");
      return response(pages.shift());
    },
  };
}

test("configuration identifies missing and malformed settings without secrets", () => {
  assert.equal(googleReviewsConfiguration({}).missing.length, 5);
  assert.equal(googleReviewsConfiguration(env).configured, true);
  assert.equal(JSON.stringify(googleReviewsConfiguration(env)).includes("test-secret"), false);
  assert.deepEqual(googleReviewsConfiguration({ ...env, GOOGLE_BUSINESS_ACCOUNT_ID: "accounts/123" }).invalid, ["GOOGLE_BUSINESS_ACCOUNT_ID"]);
});

test("opaque account/location IDs preserve characters and are URL encoded", async () => {
  const customEnv = { ...env, GOOGLE_BUSINESS_ACCOUNT_ID: "000account-A", GOOGLE_BUSINESS_LOCATION_ID: "location_ABC+?" };
  assert.equal(googleReviewsConfiguration(customEnv).configured, true);
  const mock = mockGoogle([{ totalReviewCount: 0 }]);
  await fetchAllGoogleReviews({ env: customEnv, fetchImpl: mock.fetchImpl });
  assert.match(mock.calls[1].url, /accounts\/000account-A\/locations\/location_ABC%2B%3F\/reviews\?/);
});

test("Google quota errors expose the provider message, reason and zero-quota explanation", async () => {
  const message = "Quota exceeded for Requests per minute of mybusiness.googleapis.com.";
  await assert.rejects(fetchAllGoogleReviews({ env, fetchImpl: async () => response({ error: {
    status: "RESOURCE_EXHAUSTED", message,
    details: [{ reason: "RATE_LIMIT_EXCEEDED", metadata: { quota_limit_value: "0" } }],
  } }, 429) }), (error) => {
    assert.match(error.message, /Google HTTP 429 \(RESOURCE_EXHAUSTED\)/);
    assert.ok(error.message.includes(message));
    assert.match(error.message, /RATE_LIMIT_EXCEEDED/);
    assert.match(error.message, /Quota limit: 0/);
    assert.match(error.message, /access approval/);
    return true;
  });
});

test("OAuth error descriptions are visible while known credentials are redacted", async () => {
  await assert.rejects(fetchAllGoogleReviews({ env, fetchImpl: async () => response({
    error: "invalid_grant",
    error_description: "Token test-refresh was revoked; client test-client with secret test-secret rejected.",
  }, 400) }), (error) => {
    assert.match(error.message, /Google HTTP 400 \(invalid_grant\)/);
    assert.match(error.message, /was revoked/);
    for (const secret of ["test-refresh", "test-client", "test-secret"]) assert.equal(error.message.includes(secret), false);
    return true;
  });
});

test("fetches every Google page and deduplicates repeated review IDs", async () => {
  const mock = mockGoogle([
    { totalReviewCount: 3, averageRating: 5, reviews: [review("one"), review("two")], nextPageToken: "next-page" },
    { totalReviewCount: 3, averageRating: 5, reviews: [review("two"), review("three")] },
  ]);
  const result = await fetchAllGoogleReviews({ env, fetchImpl: mock.fetchImpl });
  assert.equal(result.reviews.length, 3);
  assert.equal(mock.calls.length, 3);
  assert.equal(mock.calls[0].options.body.get("grant_type"), "refresh_token");
  assert.equal(mock.calls[1].options.headers.Authorization, "Bearer test-access-token");
  assert.equal(new URL(mock.calls[1].url).searchParams.get("pageSize"), "50");
  assert.equal(new URL(mock.calls[2].url).searchParams.get("pageToken"), "next-page");
  assert.equal(result.reviews[0].googleResourceName, "accounts/123/locations/456/reviews/one");
});

test("includes rating-only reviews and anonymous authors", async () => {
  const mock = mockGoogle([{ totalReviewCount: 1, reviews: [review("one", { comment: undefined, reviewer: { isAnonymous: true } })] }]);
  const result = await fetchAllGoogleReviews({ env, fetchImpl: mock.fetchImpl });
  assert.equal(result.reviews[0].review, "");
  assert.equal(result.reviews[0].name, "Anonymous Google reviewer");
  assert.equal(result.reviews[0].rating, 5);
});

test("rejects partial results before saving", async () => {
  const mock = mockGoogle([{ totalReviewCount: 2, reviews: [review("one")] }]);
  await assert.rejects(fetchAllGoogleReviews({ env, fetchImpl: mock.fetchImpl }), /fewer reviews/);
});

test("rejects malformed successful responses instead of hiding all reviews", async () => {
  const mock = mockGoogle([{}]);
  await assert.rejects(fetchAllGoogleReviews({ env, fetchImpl: mock.fetchImpl }), /invalid review list/);
});

test("detects repeated page tokens", async () => {
  const mock = mockGoogle([
    { totalReviewCount: 1, reviews: [review("one")], nextPageToken: "loop" },
    { totalReviewCount: 1, reviews: [review("one")], nextPageToken: "loop" },
  ]);
  await assert.rejects(fetchAllGoogleReviews({ env, fetchImpl: mock.fetchImpl }), /repeated pagination/);
});

test("Google authorization errors do not expose raw responses", async () => {
  await assert.rejects(fetchAllGoogleReviews({ env, fetchImpl: async () => response({ error: "test-secret" }, 403) }), (error) => {
    assert.match(error.message, /denied access/);
    assert.equal(error.message.includes("test-secret"), false);
    return true;
  });
});

test("missing credentials make no network requests", async () => {
  await assert.rejects(fetchAllGoogleReviews({ env: {}, fetchImpl: () => { throw new Error("Must not be called"); } }), (error) => error.status === 503);
});

test("sync refreshes content while preserving selection and order", async () => {
  const mock = mockGoogle([{ totalReviewCount: 1, reviews: [review("one")] }]);
  const result = await fetchAllGoogleReviews({ env, fetchImpl: mock.fetchImpl });
  let operations;
  let hiddenFilter;
  const Review = {
    bulkWrite: async (items) => { operations = items; return { upsertedCount: 0, matchedCount: 1 }; },
    updateMany: async (filter) => { hiddenFilter = filter; },
  };
  const counts = await saveGoogleReviews(Review, result);
  assert.deepEqual(counts, { imported: 0, updated: 1, fetched: 1 });
  const update = operations[0].updateOne.update;
  for (const field of ["featured", "order", "isActive"]) assert.equal(field in update.$set, false);
  assert.equal(update.$setOnInsert.featured, false);
  assert.equal(hiddenFilter.googleLocationName, result.locationName);
  assert.deepEqual(hiddenFilter.googleResourceName.$nin, [result.reviews[0].googleResourceName]);
});

test("a verified zero-review response hides old imports only for this location", async () => {
  const mock = mockGoogle([{ totalReviewCount: 0 }]);
  const result = await fetchAllGoogleReviews({ env, fetchImpl: mock.fetchImpl });
  let hiddenFilter;
  const Review = {
    bulkWrite: async () => { throw new Error("No upserts expected"); },
    updateMany: async (filter) => { hiddenFilter = filter; },
  };
  await saveGoogleReviews(Review, result);
  assert.equal(hiddenFilter.source, "google");
  assert.equal(hiddenFilter.googleLocationName, "accounts/123/locations/456");
});

test("Google reviews can be selected without a link while imported content stays protected", async () => {
  const source = fs.readFileSync(new URL("../controller/reviewController.js", import.meta.url), "utf8")
    .replace(/^import .*;$/gm, "").replace(/export const /g, "const ");
  let saved = false;
  const doc = { source: "google", name: "Guest", review: "Original", featured: false, isActive: true, save: async () => { saved = true; } };
  const Review = { findById: async () => doc };
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  const updateReview = await new AsyncFunction("connectToDatabase", "Review", source + "; return updateReview;")(async () => {}, Review);
  const res = { status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
  await updateReview({ query: { id: "one" }, body: { featured: true } }, res);
  assert.equal(res.code, 200);
  assert.equal(doc.featured, true);
  assert.equal(saved, true);
  await updateReview({ query: { id: "one" }, body: { name: "Changed", review: "Changed" } }, res);
  assert.equal(res.code, 200);
  assert.equal(doc.name, "Guest");
  assert.equal(doc.review, "Original");
  assert.equal(saved, true);
});

test("rating-only Google reviews validate and only the Google cache has TTL expiry", async () => {
  await new ReviewModel({ source: "google", name: "Guest", rating: 5, review: "" }).validate();
  await assert.rejects(new ReviewModel({ source: "manual", name: "Guest", rating: 5, review: "" }).validate());
  const ttl = ReviewModel.schema.indexes().find(([fields]) => fields.googleSyncedAt);
  assert.equal(ttl[1].expireAfterSeconds, 30 * 24 * 60 * 60);
});

test("sync endpoint requires admin access and returns a clear setup-pending response", async () => {
  const source = fs.readFileSync(new URL("../pages/api/reviews/google.js", import.meta.url), "utf8")
    .replace(/^import .*;$/gm, "").replace("export default async function handler", "async function handler");
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  let session = null;
  const handler = await new AsyncFunction("getServerSession", "authOptions", "syncGoogleReviews", "getGoogleReviewSyncStatus", "GoogleReviewsError", source + "; return handler;")(
    async () => session, {},
    async () => { throw new GoogleReviewsError("Google reviews are not configured.", 503); },
    async () => googleReviewsConfiguration({}), GoogleReviewsError,
  );
  const res = { setHeader() {}, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
  const req = { method: "POST", headers: { "content-type": "application/json" } };
  await handler(req, res);
  assert.equal(res.code, 401);
  session = { user: { role: "guest" } };
  await handler(req, res);
  assert.equal(res.code, 401);
  session = { user: { role: "admin" } };
  await handler({ ...req, method: "GET" }, res);
  assert.equal(res.code, 200);
  assert.equal(res.data.data.configured, false);
  await handler(req, res);
  assert.equal(res.code, 503);
  await handler({ ...req, headers: {} }, res);
  assert.equal(res.code, 415);
});

function syncHarness(fetchImpl) {
  let now = new Date("2026-10-13T12:00:00Z");
  let state;
  let saves = 0;
  const SyncState = {
    updateOne: async (filter, update) => {
      if (!state) state = { _id: filter._id, ...update.$setOnInsert };
      if (filter.lockId && filter.lockId !== state.lockId) return;
      Object.assign(state, update.$set || {});
    },
    findOneAndUpdate: async (filter, update) => {
      if (state.lockedUntil > filter.lockedUntil.$lte ||
          (filter.nextAttemptAt && state.nextAttemptAt > filter.nextAttemptAt.$lte)) return null;
      Object.assign(state, update.$set);
      return { ...state };
    },
  };
  const Review = {
    init: async () => {},
    bulkWrite: async () => { saves++; return { upsertedCount: 1, matchedCount: 0 }; },
    updateMany: async () => {},
  };
  return {
    sync: createGoogleReviewSync({ connect: async () => {}, Review, SyncState, env, fetchImpl, clock: () => now }),
    advance: (ms) => { now = new Date(now.getTime() + ms); },
    state: () => state,
    saves: () => saves,
  };
}

test("automatic refresh runs once per day and a manual sync can refresh immediately", async () => {
  const mock = mockGoogle([
    { totalReviewCount: 1, reviews: [review("one")] },
    { totalReviewCount: 1, reviews: [review("one")] },
    { totalReviewCount: 1, reviews: [review("one")] },
  ]);
  const harness = syncHarness(mock.fetchImpl);
  assert.equal((await harness.sync()).fetched, 1);
  assert.equal((await harness.sync()).skipped, true);
  assert.equal(harness.saves(), 1);
  harness.advance(GOOGLE_SYNC_INTERVAL_MS);
  assert.equal((await harness.sync()).fetched, 1);
  assert.equal(harness.saves(), 2);
  assert.equal((await harness.sync({ force: true })).fetched, 1);
  assert.equal(harness.saves(), 3);
});

test("simultaneous visitors share a database lease and only one imports", async () => {
  let release;
  let notifyStarted;
  const started = new Promise((resolve) => { notifyStarted = resolve; });
  const pending = new Promise((resolve) => { release = resolve; });
  const harness = syncHarness(async (url) => {
    if (url.includes("oauth2")) return response({ access_token: "test-access" });
    notifyStarted();
    await pending;
    return response({ totalReviewCount: 1, reviews: [review("one")] });
  });
  const first = harness.sync();
  await started;
  assert.equal((await harness.sync()).skipped, true);
  assert.equal((await harness.sync({ force: true })).skipped, true);
  release();
  assert.equal((await first).fetched, 1);
  assert.equal(harness.saves(), 1);
});

test("automatic failures retain cached data and wait one hour before retrying", async () => {
  let requests = 0;
  const harness = syncHarness(async () => { requests++; return response({}, 403); });
  assert.equal((await harness.sync()).reason, "failed");
  assert.equal(harness.saves(), 0);
  assert.match(harness.state().lastError, /denied access/);
  assert.equal((await harness.sync()).skipped, true);
  assert.equal(requests, 1);
  harness.advance(60 * 60 * 1000);
  assert.equal((await harness.sync()).reason, "failed");
  assert.equal(requests, 2);
});

test("review requests trigger automatic refresh and still return cached data on failure", async () => {
  const source = fs.readFileSync(new URL("../controller/reviewController.js", import.meta.url), "utf8")
    .replace(/^import .*;$/gm, "").replace(/export const /g, "const ");
  let refreshed = false;
  const cached = [{ source: "google", name: "Guest", review: "Cached review", featured: true }];
  const Review = {
    countDocuments: async () => 1,
    find: () => ({ sort() { return this; }, limit() { return this; }, skip: async () => cached }),
  };
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  const getReviews = await new AsyncFunction("connectToDatabase", "Review", "syncGoogleReviews", source + "; return getReviews;")(
    async () => {}, Review, async () => { refreshed = true; throw new Error("Temporary provider error"); },
  );
  const res = { status(code) { this.code = code; return this; }, json(data) { this.data = data; } };
  await getReviews({ query: { featured: "true" }, isReviewAdmin: false }, res);
  assert.equal(refreshed, true);
  assert.equal(res.code, 200);
  assert.deepEqual(res.data.data, cached);
});
