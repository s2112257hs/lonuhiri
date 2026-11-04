import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingType: {
      type: String,
      required: [true, "Please provide a booking type"],
      enum: ["accommodation", "package", "excursion"],
    },
    accommodation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accommodation",
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
    },
    excursion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Excursion",
    },
    // Customer information
    customerName: {
      type: String,
      required: [true, "Please provide customer name"],
    },
    customerEmail: {
      type: String,
      required: [true, "Please provide customer email"],
    },
    customerPhone: {
      type: String,
      required: [true, "Please provide customer phone"],
    },
    // Booking details
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    bookingDate: {
      type: Date,
    },
    numberOfGuests: {
      type: Number,
      required: [true, "Please provide number of guests"],
      min: [1, "Number of guests must be at least 1"],
    },
    totalPrice: {
      type: Number,
      required: [true, "Please provide total price"],
    },
    // Status
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    // Additional notes
    specialRequests: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

