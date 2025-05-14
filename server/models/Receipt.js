import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const receiptSchema = new mongoose.Schema({
  paymentId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true }],
  totalAmount: { type: Number, required: true },
  customerEmail: { type: String },
  customerName: { type: String },
  paymentMethod: { type: String, default: 'Chargily' },
  status: {
    type: String,
    enum: ['paid', 'pending', 'failed'],
    required: true,
  },
});

export default model("Receipt", receiptSchema);
