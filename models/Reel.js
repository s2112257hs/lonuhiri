import mongoose from "mongoose";

const reelSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
    },
    thumbnail: {
      type: String,
      required: [true, "Please provide a thumbnail"],
    },
    video: {
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

export default mongoose.models.Reel || mongoose.model("Reel", reelSchema);
