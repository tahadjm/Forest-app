import Booking from "../models/BookingSchema.js";
import Pricing from "../models/Pricing.js";
import { TimeSlotInstance } from "../models/TimeSlotInstance.js";
import Cart from "../models/CartModel.js";
import User from "../models/UserModel.js";
import mongoose from "mongoose";
import QRCode from "qrcode";

/**
 * @desc Create bookings from cart with TimeSlotInstance
 * @route POST /api/bookings
 * @access Private
 */
export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId, status: 'pending' })
      .populate({
        path: 'bookings.timeSlotInstance',
        populate: { path: 'templateId' }
      })
      .session(session);

    if (!cart || cart.bookings.length === 0) {
      await session.endSession();
      return res.status(400).json({ success: false, message: "Empty cart" });
    }

    const bookings = [];
    const instancesToUpdate = [];

    // Validate and prepare bookings
    for (const item of cart.bookings) {
      const instance = await TimeSlotInstance.findById(item.timeSlotInstance._id)
        .session(session);

      // Validate availability
      if (!instance || instance.availableTickets < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Not enough tickets for ${item.date}`
        });
      }

      // Create booking
      bookings.push({
        user: userId,
        park: item.park,
        pricing: item.pricing,
        timeSlotInstance: item.timeSlotInstance._id,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        date: item.date,
        startTime: item.timeSlotInstance.templateId.startTime,
        endTime: item.timeSlotInstance.templateId.endTime,
        status: 'confirmed',
        paymentStatus: 'paid'
      });

      // Update instance
      instance.availableTickets -= item.quantity;
      instancesToUpdate.push(instance.save({ session }));
    }

    // Generate QR Codes
    const bookingDocs = await Booking.insertMany(bookings, { session });
    await Promise.all(bookingDocs.map(async (booking) => {
      const qrData = {
        bookingId: booking._id,
        date: booking.date,
        tickets: booking.quantity
      };
      booking.qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
      await booking.save({ session });
    }));

    // Update cart and instances
    cart.status = 'completed';
    await Promise.all([
      ...instancesToUpdate,
      cart.save({ session }),
      session.commitTransaction()
    ]);

    res.status(201).json({
      success: true,
      bookings: bookingDocs,
      message: 'Bookings created successfully'
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Booking error:', error);
    res.status(500).json({ success: false, message: 'Booking failed' });
  } finally {
    session.endSession();
  }
};

/**
 * @desc Cancel booking and restore tickets
 * @route DELETE /api/bookings/:id
 * @access Private
 */
export const cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(req.params.id)
      .populate('timeSlotInstance')
      .session(session);

    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Restore tickets
    booking.timeSlotInstance.availableTickets += booking.quantity;
    await booking.timeSlotInstance.save({ session });

    // Update booking status
    booking.status = 'cancelled';
    await booking.save({ session });

    await session.commitTransaction();
    res.json({ success: true, message: 'Booking cancelled' });

  } catch (error) {
    await session.abortTransaction();
    console.error('Cancel error:', error);
    res.status(500).json({ success: false, message: 'Cancellation failed' });
  } finally {
    session.endSession();
  }
};

// Updated get methods with instance population
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
      path: 'timeSlotInstance',
      populate: { path: 'templateId' }
      })
      .populate('pricing')
      .populate({
      path: 'park',
      select: '_id name location'
      })

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ success: false, message: 'Failed to get bookings' });
  }
};

// Updated admin endpoints
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: 'timeSlotInstance',
        populate: { path: 'templateId' }
      })
      .populate('user', 'name email')
      .populate('pricing');

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Admin get error:', error);
    res.status(500).json({ success: false, message: 'Failed to get bookings' });
  }
};



/**
 * @desc Get booking by ID
 * @route GET /api/bookings/:id
 * @access Private (User/Admin)
 */
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email")
      .populate("pricing", "name finalPrice");

    if (!booking) {
      return res.status(404).json({ success: false, message: "❌ Booking not found." });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error("🔴 Error fetching booking:", error);
    res.status(500).json({ success: false, message: "🚨 Internal server error." });
  }
};

export const getBookingByPaymentId = async (req, res) => {
  try {
    const {paymentId} = req.params
    if(!paymentId)
      return res.status(400).json({status: false,message:"payment Id is required."})
    const booking = await Booking.find({paymentId:paymentId})
      .populate("user", "name email")
      .populate("pricing", "name finalPrice");

    if (!booking) {
      return res.status(404).json({ success: false, message: "❌ Booking not found." });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error("🔴 Error fetching booking:", error);
    res.status(500).json({ success: false, message: "🚨 Internal server error." });
  }
};
export const getBookingByparkId = async (req, res) => {
  try {
    const {parkId} = req.params;
    if(!parkId || !mongoose.Types.ObjectId.isValid(parkId)){
      return res.status(400).json({success:false,message:"Invalid or missing park ID"})
    }
    const booking = await Booking.find({park:parkId}).populate("user", "username email")

    if (!booking) {
      return res.status(404).json({ success: false, message: "❌ Booking not found." });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error("🔴 Error fetching booking:", error);
    res.status(500).json({ success: false, message: "🚨 Internal server error." });
  }
};

export const markBookingAsUsed = async (req, res) => {
  try {
    const {bookingId} = req.params;

    if(!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ status: false, message: "Invalid or missing booking ID" });
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Validate payment status transition
    const allowedStatuses = ['paid', 'confirmed'];
    if (!allowedStatuses.includes(booking.status)) {
      throw new Error(`Cannot mark booking as used from status ${booking.status}`);
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        used: true,
        status: 'confirmed', // Ensure this matches your enum
        usedAt: new Date() 
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Booking marked as used successfully.",
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error marking booking as used:', error);
    throw error;
  }
};

//Generate Qr Code 
export const generateQRCode = async (text) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(text); // Base64 PNG
    return qrCodeDataUrl;
  } catch (error) {
    console.error("QR Code generation error:", error);
    return null;
  }
};
//Retrive the Qr Code from the database
export const getQrCodeByBookingId = async (req ,res) =>{
  try {
    const {BookingId} = req.params
    if(!BookingId)
      return res.status(400).json({status: false,message:"Booking Id is required."})
    else if(!mongoose.Types.ObjectId.isValid(BookingId))
      return res.status(400).json({status: false,message:"Invalid Booking Id."})
    //fetching booknig from database
    const result = await Booking.findById(BookingId);
    if(!result)
      return res.status(404).json({status: false,message:"Booking not found."})
    const qrCode = result.QrCode;
    if(!qrCode)
      return res.status(404).json({status: false,message:"Qr Code not found."})
    // returning the qr code
    return res.status(200).json({status: true,message:"Qr Code found.",data:result.QrCode})
  } catch (error) {
    console.error("🔴 Error fetching QR code:", error);
    return res.status(500).json({ success: false, message: "🚨 Internal server error." });
  }
}


//cancel booking 
export const CancelBooking = async (req,res) =>{
  try {
    const {id} = req.params.id;
    if(!id || !isValidObjectId(id))
      return res.status(500).json({status: false,message:"Invalid or missing booking ID"})
    const booking = await Booking.findById({id})
    if (!booking) {
      return res.status(404).json({ success: false, message: "❌ Booking not found." });
    }
    return res.status(200).json({status: true,message:"Booking found.",data:booking})
  } catch (error) {
    return res.status
  }
}
/**
 * @desc Update booking status
 * 
 * @route PUT /api/bookings/:id/status
 * @access Admin
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "❌ Booking not found." });
    }

    // Update status & payment status if provided
    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;

    await booking.save();
    res.status(200).json({ success: true, message: "✅ Booking updated successfully.", booking });
  } catch (error) {
    console.error("🔴 Error updating booking:", error);
    res.status(500).json({ success: false, message: "🚨 Internal server error." });
  }
};


/**
 * @desc Delete a booking (Admin Only)
 * @route DELETE /api/bookings/:id/admin
 * @access Admin
 */
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "❌ Booking not found." });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "✅ Booking deleted successfully." });
  } catch (error) {
    console.error("🔴 Error deleting booking:", error);
    res.status(500).json({ success: false, message: "🚨 Internal server error." });
  }
};

export const FilterOutatedBooking = async (req,res) =>{
  try {
    const { id } = req.query;
    let booking = null;
    const today = new Date().setHours(0, 0, 0, 0);

    if (id && !isValidObjectId(id)) {
      return res.status(500).json({ status: false, message: "Invalid or missing user ID" });
    }

    if (id) {
      booking = await Booking.find({ user: id, date: { $gte: today } });
      if (!booking || booking.length === 0) {
        return res.status(404).json({ status: false, message: "No upcoming bookings found for this user." });
      }
    } else {
      booking = await Booking.find({ date: { $gte: today } });
    }
    return res.json({booking})
  } catch (error) {
    console.error("🔴 Error filtering outdated bookings:", error);
    res.status(500).json({ success: false, message: "🚨 Internal server error." });
  }
}