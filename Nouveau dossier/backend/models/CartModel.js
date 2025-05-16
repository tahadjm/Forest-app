import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  bookings: [
    {
      park: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Park", 
        required: true
      },
      pricing: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Pricing", 
        required: true 
      },
      pricingName: {
        type: String,
        required: true
      },
      timeSlotInstance: {  // Changed to camelCase
        type: mongoose.Schema.Types.ObjectId, 
        ref: "TimeSlotInstance",
        required: true
      },
      quantity: { 
        type: Number, 
        required: true, 
        min: 1 
      },
      totalPrice: { 
        type: Number, 
        required: true,
        min: 0
      },
      date: { 
        type: Date, 
        required: true 
      },
      startTime: { 
        type: String, 
        required: true,
        match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
      },
      endTime: { 
        type: String, 
        required: true,
        match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
      },
    }
  ],
  status: { 
    type: String, 
    enum: ["pending", "confirmed", "cancelled"], 
    default: "pending" 
  },
  paymentStatus: { 
    type: String, 
    enum: ["pending", "paid", "failed", "refunded"],  // Added refunded
    default: "pending" 
  },
  paymentMethod: { 
    type: String,
    enum: ["credit_card", "paypal", "crypto"],  // Added enum
    required: function() {
      return this.paymentStatus === "paid";
    }
  }
}, {
  timestamps: true, // Added for TTL index
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true } 
});

// Virtual field
CartSchema.virtual("totalAmount").get(function () {
  return this.bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
});

// TTL index (now works with timestamps)
CartSchema.index({ 
  createdAt: 1 
}, { 
  expireAfterSeconds: 604800, // 7 days
  partialFilterExpression: { 
    status: "pending",
    paymentStatus: { $ne: "paid" }
  } 
});

const Cart = mongoose.model("Cart", CartSchema);
export default Cart;