import mongoose from "mongoose";

const templateSchema = new mongoose.Schema({
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
    type: String,
    required: true,
    match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
  },
  daysOfWeek: {
    type: [Number],
    required: true,
    validate: {
      validator: v => v.length > 0 && v.every(d => d >= 0 && d <= 6),
      message: "At least one valid day (0-6) required"
    }
  },
  validFrom: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v instanceof Date && !isNaN(v.getTime());
      },
      message: "validFrom must be a valid date"
    }
  },
  validUntil: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || (v instanceof Date && !isNaN(v.getTime()));
      },
      message: "validUntil must be a valid date"
    }
  },
  ticketLimit: {
    type: Number,
    required: true,
    min: 1
  },
  priceAdjustment: {
    type: Number,
    default: 0
  }
});

templateSchema.index({ parkId: 1, daysOfWeek: 1, startTime: 1, endTime: 1 }, { unique: true });

export const TimeSlotTemplate = mongoose.models.TimeSlotTemplate || 
  mongoose.model("TimeSlotTemplate", templateSchema);