import connectToDatabase from "./mongodb";
import Review from "../models/Review";
import ReviewSyncState from "../models/ReviewSyncState";
import { createGoogleReviewSync } from "./googleReviewSync";
import { googleReviewsConfiguration } from "./googleReviews";

export const syncGoogleReviews = createGoogleReviewSync({
  connect: connectToDatabase, Review, SyncState: ReviewSyncState,
});

export async function getGoogleReviewSyncStatus() {
  const config = googleReviewsConfiguration();
  if (!config.configured) return config;
  await connectToDatabase();
  const state = await ReviewSyncState.findById(config.locationName).lean();
  return {
    ...config,
    lastSuccessfulAt: state?.lastSuccessfulAt?.toISOString() || null,
    lastError: state?.lastError || "",
  };
}
