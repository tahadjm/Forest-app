import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema({
  parkId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Park", 
    required: true 
  },
  pricingIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Pricing", 
    required: true 
  }],
  startTime: { 
    type: String,   // Format: "HH:mm"
    required: true 
  },
  endTime: { 
    type: String,   // Format: "HH:mm"
    required: true 
  },
  ticketLimit: { 
    type: Number, 
    required: true 
  },
  availableTickets: { 
    type: Number, 
    required: true 
  },
  priceAdjustment: { 
    type: Number, 
    default: 0 
  },
  daysOfWeek: {
    type: [Number],
    required: true,
    validate: {
      validator: (days) => 
        Array.isArray(days) && 
        days.length > 0 &&
        days.every(day => day >= 0 && day <= 6),
      message: "Days must be array of 0-6 (Sunday-Saturday)"
    }
  },
// In your TimeSlot model
  validFrom: {
    type: Date,
    validate: {
      validator: function(v) {
        return !this.validUntil || v <= this.validUntil;
      },
      message: "validFrom must be before validUntil"
    }
  },
  validUntil: {    // Optional end date for recurrence
    type: Date,
    default: null
  }
});

// Prevent duplicate weekly slots
timeSlotSchema.index({
  parkId: 1,
  daysOfWeek: 1,
  startTime: 1,
  endTime: 1
}, { unique: true });

;

// Prevent overwriting the model if it's already defined
const TimeSlot = mongoose.models.TimeSlot || mongoose.model("TimeSlot", timeSlotSchema);
timeSlotSchema.index({ date: 1, startTime: 1, endTime: 1 }, { unique: true });

export default TimeSlot;
