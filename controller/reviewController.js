import connectToDatabase from "../lib/mongodb";
import Review from "../models/Review";
import { syncGoogleReviews } from "../lib/googleReviewService";

// Get all reviews with pagination and filtering
export const getReviews = async (req, res) => {
  try {
    await connectToDatabase();
    // Cached reviews stay available when Google is temporarily unavailable.
    await syncGoogleReviews().catch(() => null);

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skipIndex = (page - 1) * limit;

    const query = {};
    if (!req.isReviewAdmin) {
      query.isActive = true;
      query.$and = [{ $or: [
        { source: { $ne: "google" } },
        { googleSyncedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      ] }];
    }
    if (["manual", "google"].includes(req.query.source)) {
      query.source = req.query.source === "manual"
        ? { $ne: "google" } : "google";
    }

    // Filter by active status if provided
    if (req.isReviewAdmin && req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === "true";
    }

    // Filter by featured if provided
    if (req.query.featured !== undefined) {
      query.featured = req.query.featured === "true";
    }

    // Filter by popular if provided
    if (req.query.popular !== undefined) {
      query.popular = req.query.popular === "true";
    }

    // Search by name or review
    if (req.query.search) {
      query.$or = [
        { name: { $regex: String(req.query.search).slice(0, 200).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
        { review: { $regex: String(req.query.search).slice(0, 200).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
      ];
    }

    // Determine sort order
    let sortBy = { order: 1, createdAt: -1 };
    if (req.query.sortBy === "order") {
      sortBy = { order: 1, createdAt: -1 };
    } else if (req.query.sortBy === "featured") {
      sortBy = { featured: -1, order: 1, createdAt: -1 };
    } else if (req.query.sortBy === "popular") {
      sortBy = { popular: -1, order: 1, createdAt: -1 };
    } else if (req.query.sortBy === "rating-high") {
      sortBy = { rating: -1, createdAt: -1 };
    } else if (req.query.sortBy === "rating-low") {
      sortBy = { rating: 1, createdAt: -1 };
    } else if (req.query.sortBy === "newest") {
      sortBy = { reviewedAt: -1, createdAt: -1 };
    } else if (req.query.sortBy === "oldest") {
      sortBy = { reviewedAt: 1, createdAt: 1 };
    }

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .sort(sortBy)
      .limit(limit)
      .skip(skipIndex);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      pagination: {
        current: page,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get single review
export const getReview = async (req, res) => {
  try {
    await connectToDatabase();

    const review = await Review.findById(req.query.id);

    const staleGoogleReview = review?.source === "google" &&
      (!review.googleSyncedAt || new Date(review.googleSyncedAt).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (!review || (!req.isReviewAdmin && (!review.isActive || staleGoogleReview))) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Create new review
export const createReview = async (req, res) => {
  try {
    await connectToDatabase();

    const fields = ["name", "avatar", "rating", "review", "date", "order", "featured", "popular", "isActive"];
    const body = Object.fromEntries(fields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
    const review = await Review.create({ ...body, source: "manual" });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Update review
export const updateReview = async (req, res) => {
  try {
    await connectToDatabase();

    const review = await Review.findById(req.query.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const fields = review.source === "google"
      ? ["order", "featured", "popular", "isActive"]
      : ["name", "avatar", "rating", "review", "date", "order", "featured", "popular", "isActive"];
    for (const field of fields) {
      if (req.body[field] !== undefined) review[field] = req.body[field];
    }
    await review.save();

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    await connectToDatabase();

    const review = await Review.findByIdAndDelete(req.query.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

