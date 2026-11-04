import connectToDatabase from "../lib/mongodb";
import Package from "../models/Package";

// Get all packages with pagination and filtering
export const getPackages = async (req, res) => {
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

    const total = await Package.countDocuments(query);
    const packages = await Package.find(query)
      .sort(sortBy)
      .limit(limit)
      .skip(skipIndex);

    res.status(200).json({
      success: true,
      count: packages.length,
      total,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
      },
      data: packages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get single package
export const getPackage = async (req, res) => {
  try {
    await connectToDatabase();

    // Try to find by ID first, then by slug
    let packageItem;
    if (req.query.id && req.query.id.match(/^[0-9a-fA-F]{24}$/)) {
      // It's a MongoDB ObjectId
      packageItem = await Package.findById(req.query.id);
    } else {
      // It's a slug
      packageItem = await Package.findOne({ slug: req.query.id });
    }

    if (!packageItem) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    res.status(200).json({
      success: true,
      data: packageItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Create new package
export const createPackage = async (req, res) => {
  try {
    await connectToDatabase();

    const packageItem = await Package.create(req.body);

    res.status(201).json({
      success: true,
      data: packageItem,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Package with this slug already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Update package
export const updatePackage = async (req, res) => {
  try {
    await connectToDatabase();

    const packageItem = await Package.findByIdAndUpdate(
      req.query.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!packageItem) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    res.status(200).json({
      success: true,
      data: packageItem,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Package with this slug already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Delete package
export const deletePackage = async (req, res) => {
  try {
    await connectToDatabase();

    const packageItem = await Package.findByIdAndDelete(req.query.id);

    if (!packageItem) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

