import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema(
  {
    heroTitle: {
      type: String,
    },
    heroDescription: {
      type: String,
    },
    heroImage: {
      type: String,
    },
    storyTitle: {
      type: String,
    },
    storyContent: {
      type: String,
    },
    storyImage: {
      type: String,
    },
    valuesTitle: {
      type: String,
    },
    valuesDescription: {
      type: String,
    },
    values: [
      {
        icon: String,
        title: String,
        description: String,
      },
    ],
    ctaTitle: {
      type: String,
    },
    ctaDescription: {
      type: String,
    },
    ctaButtonText: {
      type: String,
    },
    ctaButtonLink: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.About || mongoose.model("About", aboutSchema);

