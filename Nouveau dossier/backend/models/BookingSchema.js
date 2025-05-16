import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pricing: { type: mongoose.Schema.Types.ObjectId, ref: "Pricing", required: true },
    park: { type: mongoose.Schema.Types.ObjectId, ref: "Park", required: true },
    timeSlotInstance: {type: mongoose.Schema.Types.ObjectId, ref: "TimeSlotInstance",required: true},
    startTime: {type: String, required: true },
    endTime: {type: String, required: true },
    date: { type: Date, required: false },
    TicketCode: { type: String, required: true, unique: true },
    QrCode: { type: String, required: false, unique: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], },
    paymentId: { type: String, default: null },
    payment_method: { type: String, default: null },
    currency: { type: String, default: null },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    cartId: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" } ,// 🔹 Link to Cart
    used: { type: Boolean, default: false }, // Indicates whether the ticket has been used
    usedAt: { type: Date, default: null }, // Timestamp for when the ticket was used

});

export default mongoose.model("Booking", BookingSchema);