import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    source: { type: String, enum: ["manual", "google"], default: "manual" },
    googleReviewId: { type: String },
    googleResourceName: { type: String },
    googleLocationName: { type: String },
    googleSyncedAt: { type: Date },
    reviewedAt: { type: Date },
    name: {
      type: String,
      required: [true, "Please provide a name"],
    },
    avatar: {
      type: String,
    },
    rating: {
      type: Number,
      required: [true, "Please provide a rating"],
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: [function () { return this.source !== "google"; }, "Please provide a review"],
    },
    date: {
      type: String,
    },
    order: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ googleResourceName: 1 }, {
  unique: true,
  partialFilterExpression: { googleResourceName: { $type: "string" } },
});
// Google's Business Profile policy limits cached content to 30 days.
// Manual reviews have no googleSyncedAt and are unaffected by this TTL index.
reviewSchema.index({ googleSyncedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);
