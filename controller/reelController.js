import connectToDatabase from "../lib/mongodb";
import Reel from "../models/Reel";

// Get all reels with pagination and filtering
export const getReels = async (req, res) => {
  try {
    await connectToDatabase();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;

    const query = {};

    // Filter by active status if provided
    if (req.query.isActive !== undefined) {
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

    // Search by title
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: "i" };
    }

    // Determine sort order
    let sortBy = { order: 1, createdAt: -1 };
    if (req.query.sortBy === "order") {
      sortBy = { order: 1, createdAt: -1 };
    } else if (req.query.sortBy === "featured") {
      sortBy = { featured: -1, order: 1, createdAt: -1 };
    } else if (req.query.sortBy === "popular") {
      sortBy = { popular: -1, order: 1, createdAt: -1 };
    }

    const total = await Reel.countDocuments(query);
    const reels = await Reel.find(query)
      .sort(sortBy)
      .limit(limit)
      .skip(skipIndex);

    res.status(200).json({
      success: true,
      count: reels.length,
      total,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
      },
      data: reels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get single reel
export const getReel = async (req, res) => {
  try {
    await connectToDatabase();

    const reel = await Reel.findById(req.query.id);

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: "Reel not found",
      });
    }

    res.status(200).json({
      success: true,
      data: reel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Create new reel
export const createReel = async (req, res) => {
  try {
    await connectToDatabase();

    const reel = await Reel.create(req.body);

    res.status(201).json({
      success: true,
      data: reel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Update reel
export const updateReel = async (req, res) => {
  try {
    await connectToDatabase();

    const reel = await Reel.findByIdAndUpdate(req.query.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: "Reel not found",
      });
    }

    res.status(200).json({
      success: true,
      data: reel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Delete reel
export const deleteReel = async (req, res) => {
  try {
    await connectToDatabase();

    const reel = await Reel.findByIdAndDelete(req.query.id);

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: "Reel not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reel deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

