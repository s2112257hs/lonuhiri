import mongoose from "mongoose";

const homeSchema = new mongoose.Schema(
  {
    banner: {
      type: {
        type: String,
        required: true,
        enum: ["image", "video"],
      },
      url: {
        type: String,
      },
    },
    heroTitle: {
      type: String,
    },
    heroDescription: {
      type: String,
    },
    aboutSectionImage: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Home || mongoose.model("Home", homeSchema);
