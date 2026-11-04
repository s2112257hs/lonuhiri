const REQUIRED_ENV = [
  "GOOGLE_BUSINESS_CLIENT_ID", "GOOGLE_BUSINESS_CLIENT_SECRET",
  "GOOGLE_BUSINESS_REFRESH_TOKEN", "GOOGLE_BUSINESS_ACCOUNT_ID",
  "GOOGLE_BUSINESS_LOCATION_ID",
];
const RATINGS = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

export class GoogleReviewsError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = "GoogleReviewsError";
    this.status = status;
  }
}

export function googleReviewsConfiguration(env = process.env) {
  const missing = REQUIRED_ENV.filter((name) => !env[name]?.trim());
  const account = env.GOOGLE_BUSINESS_ACCOUNT_ID?.trim();
  const location = env.GOOGLE_BUSINESS_LOCATION_ID?.trim();
  const invalid = [];
  // IDs are opaque strings, not numbers. Reject resource paths and whitespace.
  const invalidId = (id) => /[/\\\s]/.test(id) || id === "." || id === "..";
  if (account && invalidId(account)) invalid.push("GOOGLE_BUSINESS_ACCOUNT_ID");
  if (location && invalidId(location)) invalid.push("GOOGLE_BUSINESS_LOCATION_ID");
  return {
    configured: !missing.length && !invalid.length,
    missing, invalid,
    locationName: account && location ? `accounts/${encodeURIComponent(account)}/locations/${encodeURIComponent(location)}` : "",
  };
}

function redactGoogleError(value, sensitiveValues) {
  let text = typeof value === "string" ? value : "";
  for (const secret of sensitiveValues.filter(Boolean).sort((a, b) => b.length - a.length)) {
    for (const variant of new Set([secret, encodeURIComponent(secret), JSON.stringify(secret).slice(1, -1)])) {
      text = text.split(variant).join("[REDACTED]");
    }
  }
  return text.slice(0, 3000);
}

async function googleRequest(url, options, fetchImpl, sensitiveValues) {
  let response;
  try {
    response = await fetchImpl(url, { ...options, signal: AbortSignal.timeout(15000) });
  } catch {
    throw new GoogleReviewsError("Google could not be reached. Please try syncing again.");
  }
  if (!response.ok) {
    // Show provider diagnostics, never credentials or an unrestricted response.
    const messages = {
      400: "Google rejected the request. Check your OAuth credentials and account/location IDs.",
      401: "Google authorization expired or was revoked. Generate a new refresh token.",
      403: "Google denied access. Check Business Profile API approval, API enablement, and profile permissions.",
      404: "Google could not find this Business Profile location. Check the account and location IDs.",
      429: "Google's request quota has been reached. Please try again later.",
    };
    let body;
    try { body = await response.json(); } catch { /* Fall back for non-JSON errors. */ }
    const providerError = body?.error;
    const code = typeof providerError === "string" ? providerError : providerError?.status;
    const description = typeof providerError === "object" ? providerError?.message : body?.error_description;
    const details = Array.isArray(providerError?.details) ? providerError.details : [];
    const reason = details.find((detail) => typeof detail.reason === "string")?.reason;
    const quotaLimit = details.find((detail) => detail.metadata?.quota_limit_value !== undefined)?.metadata.quota_limit_value;
    const message = redactGoogleError([
      `Google HTTP ${response.status}${typeof code === "string" ? ` (${code})` : ""}:`,
      typeof description === "string" ? description : messages[response.status] || "Google returned an error. Please try again later.",
      typeof reason === "string" ? `Reason: ${reason}.` : "",
      quotaLimit !== undefined ? `Quota limit: ${String(quotaLimit)}.` : "",
      String(quotaLimit) === "0" ? "This project needs Business Profile API access approval." : "",
    ].filter(Boolean).join(" "), sensitiveValues);
    throw new GoogleReviewsError(message);
  }
  try { return await response.json(); }
  catch { throw new GoogleReviewsError("Google returned an unreadable response. Please try again."); }
}

export function normalizeBusinessReview(review, locationName) {
  const rating = RATINGS[review.starRating];
  const date = new Date(review.createTime);
  if (typeof review.reviewId !== "string" || !review.reviewId || !rating || !Number.isFinite(date.getTime())) {
    throw new GoogleReviewsError("Google returned an incomplete review. No changes have been saved.");
  }
  return {
    googleReviewId: review.reviewId,
    googleResourceName: `${locationName}/reviews/${review.reviewId}`,
    googleLocationName: locationName,
    source: "google",
    name: review.reviewer?.isAnonymous ? "Anonymous Google reviewer" : review.reviewer?.displayName || "Google reviewer",
    avatar: review.reviewer?.profilePhotoUrl || "",
    rating,
    review: review.comment || "",
    reviewedAt: date,
    date: date.toISOString().slice(0, 10),
  };
}

export async function fetchAllGoogleReviews({ env = process.env, fetchImpl = fetch } = {}) {
  const config = googleReviewsConfiguration(env);
  if (!config.configured) {
    throw new GoogleReviewsError("Google reviews are not configured. Complete the settings listed in the admin panel.", 503);
  }
  const sensitiveValues = [env.GOOGLE_BUSINESS_CLIENT_ID.trim(), env.GOOGLE_BUSINESS_CLIENT_SECRET.trim(), env.GOOGLE_BUSINESS_REFRESH_TOKEN.trim()];
  const token = await googleRequest("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_BUSINESS_CLIENT_ID.trim(),
      client_secret: env.GOOGLE_BUSINESS_CLIENT_SECRET.trim(),
      refresh_token: env.GOOGLE_BUSINESS_REFRESH_TOKEN.trim(),
      grant_type: "refresh_token",
    }),
  }, fetchImpl, sensitiveValues);
  if (!token.access_token) throw new GoogleReviewsError("Google did not issue an access token. Check your OAuth configuration.");
  sensitiveValues.push(token.access_token);

  const records = new Map();
  const visitedTokens = new Set();
  let pageToken = "";
  let totalReviewCount = 0;
  let averageRating = null;
  do {
    const params = new URLSearchParams({ pageSize: "50", orderBy: "updateTime desc" });
    if (pageToken) params.set("pageToken", pageToken);
    const data = await googleRequest(
      `https://mybusiness.googleapis.com/v4/${config.locationName}/reviews?${params}`,
      { headers: { Authorization: `Bearer ${token.access_token}` } }, fetchImpl, sensitiveValues,
    );
    if (!Number.isInteger(data.totalReviewCount) || data.totalReviewCount < 0 ||
        (data.reviews !== undefined && !Array.isArray(data.reviews)) ||
        (data.nextPageToken !== undefined && typeof data.nextPageToken !== "string")) {
      throw new GoogleReviewsError("Google returned an invalid review list. No changes have been saved.");
    }
    totalReviewCount = data.totalReviewCount ?? totalReviewCount;
    averageRating = data.averageRating ?? averageRating;
    for (const review of data.reviews || []) {
      const normalized = normalizeBusinessReview(review, config.locationName);
      records.set(normalized.googleResourceName, normalized);
    }
    pageToken = data.nextPageToken || "";
    if (pageToken && visitedTokens.has(pageToken)) {
      throw new GoogleReviewsError("Google returned repeated pagination. No changes have been saved.");
    }
    if (pageToken) visitedTokens.add(pageToken);
  } while (pageToken);
  // A partial response must never cause existing reviews to be hidden.
  if (records.size < totalReviewCount) {
    throw new GoogleReviewsError("Google returned fewer reviews than expected. Please sync again; no changes have been saved.");
  }
  return { reviews: [...records.values()], totalReviewCount, averageRating, locationName: config.locationName };
}

export async function saveGoogleReviews(Review, result, now = new Date()) {
  const operations = result.reviews.map((review) => ({
    updateOne: {
      filter: { source: "google", googleResourceName: review.googleResourceName },
      update: {
        $set: { ...review, googleSyncedAt: now },
        // Preserve homepage selection, order and active status.
        $setOnInsert: { featured: false, popular: false, isActive: true, order: 0 },
      },
      upsert: true,
    },
  }));
  let saved = { upsertedCount: 0, matchedCount: 0 };
  if (operations.length) saved = await Review.bulkWrite(operations, { ordered: true });
  await Review.updateMany({
    source: "google", googleLocationName: result.locationName,
    googleResourceName: { $nin: result.reviews.map((review) => review.googleResourceName) },
  }, { $set: { isActive: false, featured: false } });
  return { imported: saved.upsertedCount, updated: saved.matchedCount, fetched: result.reviews.length };
}
