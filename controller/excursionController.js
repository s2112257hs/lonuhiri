import connectToDatabase from "../lib/mongodb";
import Excursion from "../models/Excursion";

// Get all excursions with pagination and filtering
export const getExcursions = async (req, res) => {
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

    // Search by title or description
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
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
    }

    const total = await Excursion.countDocuments(query);
    const excursions = await Excursion.find(query)
      .sort(sortBy)
      .limit(limit)
      .skip(skipIndex);

    res.status(200).json({
      success: true,
      count: excursions.length,
      total,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
      },
      data: excursions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get single excursion
export const getExcursion = async (req, res) => {
  try {
    await connectToDatabase();

    // Try to find by ID first, then by slug
    let excursion;
    if (req.query.id && req.query.id.match(/^[0-9a-fA-F]{24}$/)) {
      // It's a MongoDB ObjectId
      excursion = await Excursion.findById(req.query.id);
    } else {
      // It's a slug
      excursion = await Excursion.findOne({ slug: req.query.id });
    }

    if (!excursion) {
      return res.status(404).json({
        success: false,
        message: "Excursion not found",
      });
    }

    res.status(200).json({
      success: true,
      data: excursion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Create new excursion
export const createExcursion = async (req, res) => {
  try {
    await connectToDatabase();

    const excursion = await Excursion.create(req.body);

    res.status(201).json({
      success: true,
      data: excursion,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Excursion with this slug already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Update excursion
export const updateExcursion = async (req, res) => {
  try {
    await connectToDatabase();

    const excursion = await Excursion.findByIdAndUpdate(
      req.query.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!excursion) {
      return res.status(404).json({
        success: false,
        message: "Excursion not found",
      });
    }

    res.status(200).json({
      success: true,
      data: excursion,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Excursion with this slug already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Delete excursion
export const deleteExcursion = async (req, res) => {
  try {
    await connectToDatabase();

    const excursion = await Excursion.findByIdAndDelete(req.query.id);

    if (!excursion) {
      return res.status(404).json({
        success: false,
        message: "Excursion not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Excursion deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

