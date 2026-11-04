import { randomUUID } from "node:crypto";
import { fetchAllGoogleReviews, googleReviewsConfiguration, GoogleReviewsError, saveGoogleReviews } from "./googleReviews.js";

export const GOOGLE_SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000;
const RETRY_INTERVAL_MS = 60 * 60 * 1000;
const LOCK_DURATION_MS = 10 * 60 * 1000;

// Dependencies are passed in so tests never need credentials or a real database.
export function createGoogleReviewSync({ connect, Review, SyncState, env = process.env, fetchImpl = fetch, clock = () => new Date() }) {
  return async function sync({ force = false } = {}) {
    const config = googleReviewsConfiguration(env);
    if (!config.configured) {
      if (force) throw new GoogleReviewsError("Google reviews are not configured. Complete the settings listed in the admin panel.", 503);
      return { skipped: true, reason: "not-configured" };
    }
    await connect();
    const now = clock();
    try {
      await SyncState.updateOne({ _id: config.locationName }, {
        $setOnInsert: { lockedUntil: new Date(0), nextAttemptAt: new Date(0) },
      }, { upsert: true });
    } catch (error) {
      // Another request may have created the same location state first.
      if (error.code !== 11000) throw error;
    }
    const lockId = randomUUID();
    const state = await SyncState.findOneAndUpdate({
      _id: config.locationName,
      lockedUntil: { $lte: now },
      ...(!force ? { nextAttemptAt: { $lte: now } } : {}),
    }, { $set: { lockedUntil: new Date(now.getTime() + LOCK_DURATION_MS), lockId } }, { new: true });
    if (!state) return { skipped: true, reason: "not-due-or-busy" };
    try {
      const result = await fetchAllGoogleReviews({ env, fetchImpl });
      await Review.init();
      const counts = await saveGoogleReviews(Review, result, clock());
      const completedAt = clock();
      await SyncState.updateOne({ _id: config.locationName, lockId }, { $set: {
        lockedUntil: new Date(0), lastSuccessfulAt: completedAt,
        nextAttemptAt: new Date(completedAt.getTime() + GOOGLE_SYNC_INTERVAL_MS), lastError: "",
      } });
      return { ...counts, averageRating: result.averageRating, syncedAt: completedAt.toISOString() };
    } catch (error) {
      const message = error instanceof GoogleReviewsError ? error.message : "Reviews could not be saved. Please try syncing again.";
      await SyncState.updateOne({ _id: config.locationName, lockId }, { $set: {
        lockedUntil: new Date(0), nextAttemptAt: new Date(clock().getTime() + RETRY_INTERVAL_MS), lastError: message,
      } });
      if (force) throw new GoogleReviewsError(message, error instanceof GoogleReviewsError ? error.status : 500);
      return { skipped: true, reason: "failed" };
    }
  };
}
