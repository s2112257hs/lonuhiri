import mongoose from "mongoose";

const schema = new mongoose.Schema({
  _id: String,
  lockedUntil: { type: Date, default: () => new Date(0) },
  lockId: String,
  nextAttemptAt: { type: Date, default: () => new Date(0) },
  lastSuccessfulAt: Date,
  lastError: { type: String, default: "" },
});

export default mongoose.models.ReviewSyncState || mongoose.model("ReviewSyncState", schema);
