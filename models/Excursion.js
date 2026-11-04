import mongoose from "mongoose";

// Helper function to generate slug
function generateSlug(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

// Helper function to make slug unique
async function makeSlugUnique(Model, slug, excludeId = null) {
  let uniqueSlug = slug;
  let counter = 1;
  const query = { slug: uniqueSlug };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  while (await Model.findOne(query)) {
    uniqueSlug = `${slug}-${counter}`;
    query.slug = uniqueSlug;
    counter++;
  }
  
  return uniqueSlug;
}

const excursionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
    },
    longDescription: {
      type: String,
    },
    image: {
      type: String,
      required: [true, "Please provide an image"],
    },
    duration: {
      type: String,
      required: [true, "Please provide a duration"],
    },
    location: {
      type: String,
      required: [true, "Please provide a location"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
    },
    maxGuests: {
      type: Number,
      default: 10,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Moderate", "Hard"],
      default: "Easy",
    },
    highlights: [
      {
        type: String,
      },
    ],
    includes: [
      {
        type: String,
      },
    ],
    schedule: {
      departure: String,
      return: String,
      availability: String,
    },
    whatToBring: [
      {
        type: String,
      },
    ],
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

// Pre-save hook to auto-generate slug from title
excursionSchema.pre("save", async function (next) {
  // Only generate slug if title is modified or slug doesn't exist
  if (this.isModified("title") || !this.slug) {
    const baseSlug = generateSlug(this.title);
    this.slug = await makeSlugUnique(
      this.constructor,
      baseSlug,
      this._id
    );
  }
  next();
});

// Pre-update hook for findOneAndUpdate, findByIdAndUpdate, etc.
excursionSchema.pre(["findOneAndUpdate", "updateOne"], async function (next) {
  const update = this.getUpdate();
  const title = update.$set?.title || update.title;
  
  if (title) {
    const baseSlug = generateSlug(title);
    const doc = await this.model.findOne(this.getQuery());
    const excludeId = doc ? doc._id : null;
    const uniqueSlug = await makeSlugUnique(
      this.model,
      baseSlug,
      excludeId
    );
    
    // Handle both $set and direct update
    if (update.$set) {
      update.$set.slug = uniqueSlug;
    } else {
      update.slug = uniqueSlug;
    }
  }
  next();
});

export default mongoose.models.Excursion ||
  mongoose.model("Excursion", excursionSchema);

