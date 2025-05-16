import fetch from "node-fetch";
import dotenv from "dotenv";
import Booking from "../models/BookingSchema.js";
import crypto from "crypto";
import Cart from "../models/CartModel.js";
import { TimeSlotInstance } from "../models/TimeSlotInstance.js";
import { generateQRCode } from "../controllers/BookingController.js";
import mongoose from "mongoose";

dotenv.config();
const apiSecretKey = process.env.CHARGILY_API_KEY;

const generateTicketCode = () => {
  return "FA-" + crypto.randomBytes(3).toString("hex").toUpperCase();
};


const CreateCheckout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId, status: "pending" })
    .populate({
      path: "bookings.timeSlotInstance",
      model: "TimeSlotInstance", // Optional but helps sometimes
      populate: {
        path: "templateId",
        model: "TimeSlotTemplate"
      }
    })
    .session(session);

    if (!cart || cart.bookings.length === 0) {
      await session.endSession();
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }
    // Validate availability
    for (const booking of cart.bookings) {
      const instance = await TimeSlotInstance.findById(booking.timeSlotInstance._id)
        .session(session);

      if (!instance || instance.availableTickets < booking.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Not enough tickets available for ${booking.date}`
        });
      }
    }
    // Create booking documents
    const bookingDocs = cart.bookings.map((booking) => ({
      user: userId,
      pricing: booking.pricing,
      park: booking.park,
      timeSlotInstance: booking.timeSlotInstance._id,
      date: booking.date,
      cartId: cart._id,
      TicketCode: generateTicketCode(),
      quantity: booking.quantity,
      totalPrice: booking.totalPrice,
      paymentStatus: "pending",
      status: "pending",
      startTime: booking.timeSlotInstance.templateId.startTime,
      endTime: booking.timeSlotInstance.templateId.endTime
    }));

    const savedBookings = await Booking.insertMany(bookingDocs, { session });

    // Generate QR codes
    await Promise.all(savedBookings.map(async (booking) => {
      const qrContent = JSON.stringify({
        bookingId: booking._id,
        instanceId: booking.timeSlotInstance,
        quantity: booking.quantity
      });
      booking.QrCode = await generateQRCode(qrContent);
      await booking.save({ session });
    }));

    // Calculate total amount
    const totalAmount = cart.bookings.reduce((sum, b) => sum + b.totalPrice, 0);

    // Payment API Request
    const successUrl = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/payment-success`
      : "http://localhost:3000/payment-success";

    const response = await fetch("https://pay.chargily.net/test/api/v2/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: totalAmount * 100,
        currency: "dzd",
        success_url: successUrl,
      }),
    });
    console.log(response)

    const responseData = await response.json();

    if (!responseData.id) {
      await session.abortTransaction();
      return res.status(500).json({ success: false, message: "Payment gateway error" });
    }

    // Update bookings with payment ID
    await Booking.updateMany(
      { _id: { $in: savedBookings.map(b => b._id) } },
      { $set: { paymentId: responseData.id } },
      { session }
    );

    await session.commitTransaction();
    res.status(200).json(responseData);

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: "Checkout failed", error: error.message });
  } finally {
    session.endSession();
  }
};

const WebhookHandler = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const signature = req.headers["signature"] || req.headers["Signature"];
    const rawBody = req.rawBody || req.body.toString("utf8");

    // Verify signature
    const computedSignature = crypto
      .createHmac("sha256", apiSecretKey)
      .update(rawBody)
      .digest("hex");

    if (computedSignature !== signature) {
      return res.status(403).json({ error: "Invalid signature" });
    }

    const event = JSON.parse(rawBody);
    const paymentId = event.data?.id;
    console.log("Received event:", event);
    
    if (!paymentId) {
      return res.status(400).json({ error: "Invalid event data" });
    }

    // Update bookings
    const updateFields = event.type === "checkout.paid" ? {
      paymentStatus: "paid",
      status: "confirmed",
      payment_method: event.data.payment_method,
      currency: event.data.currency
    } : {
      paymentStatus: "failed",
      status: "cancelled"
    };

    const bookings = await Booking.find({ paymentId }).session(session);
    
    if (event.type === "checkout.paid") {
      // Update instances
      await Promise.all(bookings.map(async (booking) => {
        await TimeSlotInstance.findByIdAndUpdate(
          booking.timeSlotInstance,
          { $inc: { availableTickets: -booking.quantity } },
          { session }
        );
      }));
    }

    await Booking.updateMany(
      { paymentId },
      { $set: updateFields },
      { session }
    );

    // Update cart status
    const cartId = bookings[0]?.cartId;
    if (cartId) {
      await Cart.findByIdAndUpdate(
        cartId,
        { $set: { status: updateFields.status } },
        { session }
      );
    }

    await session.commitTransaction();
    res.status(200).json({ message: "Webhook processed" });

  } catch (error) {
    await session.abortTransaction();
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    session.endSession();
  }
};

export { CreateCheckout, WebhookHandler };