import connectToDatabase from "../lib/mongodb";
import Booking from "../models/Booking";
import Accommodation from "../models/Accommodation";
import Package from "../models/Package";
import Excursion from "../models/Excursion";

// Get all bookings with pagination and filtering
export const getBookings = async (req, res) => {
  try {
    await connectToDatabase();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skipIndex = (page - 1) * limit;

    const query = {};

    // Filter by booking type
    if (req.query.bookingType) {
      query.bookingType = req.query.bookingType;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by accommodation
    if (req.query.accommodation) {
      query.accommodation = req.query.accommodation;
    }

    // Filter by package
    if (req.query.package) {
      query.package = req.query.package;
    }

    // Filter by excursion
    if (req.query.excursion) {
      query.excursion = req.query.excursion;
    }

    // Search by customer name or email
    if (req.query.search) {
      query.$or = [
        { customerName: { $regex: req.query.search, $options: "i" } },
        { customerEmail: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate("accommodation", "title")
      .populate("package", "title")
      .populate("excursion", "title")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skipIndex);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
      },
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get single booking
export const getBooking = async (req, res) => {
  try {
    await connectToDatabase();

    const booking = await Booking.findById(req.query.id)
      .populate("accommodation")
      .populate("package")
      .populate("excursion");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Create new booking
export const createBooking = async (req, res) => {
  try {
    await connectToDatabase();

    const {
      bookingType,
      accommodation,
      package: packageId,
      excursion,
      customerName,
      customerEmail,
      customerPhone,
      checkIn,
      checkOut,
      bookingDate,
      numberOfGuests,
      totalPrice,
      specialRequests,
    } = req.body;

    // Validate booking type and related ID
    if (bookingType === "accommodation" && !accommodation) {
      return res.status(400).json({
        success: false,
        message: "Accommodation ID is required",
      });
    }

    if (bookingType === "package" && !packageId) {
      return res.status(400).json({
        success: false,
        message: "Package ID is required",
      });
    }

    if (bookingType === "excursion" && !excursion) {
      return res.status(400).json({
        success: false,
        message: "Excursion ID is required",
      });
    }

    // Verify the referenced item exists
    if (bookingType === "accommodation") {
      const acc = await Accommodation.findById(accommodation);
      if (!acc) {
        return res.status(404).json({
          success: false,
          message: "Accommodation not found",
        });
      }
    }

    if (bookingType === "package") {
      const pkg = await Package.findById(packageId);
      if (!pkg) {
        return res.status(404).json({
          success: false,
          message: "Package not found",
        });
      }
    }

    if (bookingType === "excursion") {
      const exc = await Excursion.findById(excursion);
      if (!exc) {
        return res.status(404).json({
          success: false,
          message: "Excursion not found",
        });
      }
    }

    const booking = await Booking.create({
      bookingType,
      accommodation: bookingType === "accommodation" ? accommodation : undefined,
      package: bookingType === "package" ? packageId : undefined,
      excursion: bookingType === "excursion" ? excursion : undefined,
      customerName,
      customerEmail,
      customerPhone,
      checkIn: checkIn ? new Date(checkIn) : undefined,
      checkOut: checkOut ? new Date(checkOut) : undefined,
      bookingDate: bookingDate ? new Date(bookingDate) : undefined,
      numberOfGuests,
      totalPrice,
      specialRequests,
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Update booking
export const updateBooking = async (req, res) => {
  try {
    await connectToDatabase();

    const booking = await Booking.findByIdAndUpdate(
      req.query.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("accommodation", "title")
      .populate("package", "title")
      .populate("excursion", "title");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Delete booking
export const deleteBooking = async (req, res) => {
  try {
    await connectToDatabase();

    const booking = await Booking.findByIdAndDelete(req.query.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

