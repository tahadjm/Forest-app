import express from "express";
import {
  createBooking,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
  getBookingByparkId,
  getBookingByPaymentId,
  getQrCodeByBookingId,
  getMyBookings,
  CancelBooking,
  getBookingById,
  FilterOutatedBooking,
  markBookingAsUsed,
} from "../controllers/BookingController.js";
import { identifier } from "../middlewares/identifier.js";

const router = express.Router();

// Create a new booking (Public or Authenticated Users)
router.post("/", identifier, createBooking);

// Get all bookings (Admin only)
router.get("/", identifier, getAllBookings);

// Get booking for a specific user
router.get("/user", identifier, getMyBookings);

// Get a booking by ID (User or Admin)
router.get("/:id", identifier, getBookingById);

// Get booking by payment ID (Admin only)
router.get("/by-payment/:paymentId", identifier, getBookingByPaymentId);

// Get booking for a specefic park
router.get("/pakrs/:parkId", identifier, getBookingByparkId);

//Get qr for a specific payment
router.get("/qr/:BookingId/", identifier, getQrCodeByBookingId);


//mark booking as used
router.put("/:bookingId/used", identifier, markBookingAsUsed);


// Cancel a booking (User or Admin)
router.delete("/:id/cancel", identifier, CancelBooking);

// Update booking status (Admin only)
router.put("/:id/status", identifier, updateBookingStatus);


// Delete a booking (Admin only)
router.delete("/:id/admin", identifier, deleteBooking);

// Filter Outated Booking
router.get("/filter/outated/", FilterOutatedBooking);

export const BookingRouter =  router;