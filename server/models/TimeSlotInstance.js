// models/TimeSlotInstance.js
import mongoose from "mongoose";

const instanceSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TimeSlotTemplate",
    required: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  availableTickets: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(v) {
        return v <= this.ticketLimit;
      },
      message: "Available tickets cannot exceed ticket limit"
    }
  },
  ticketLimit: {
    type: Number,
    required: true
  }
}, { timestamps: true });

instanceSchema.index({ templateId: 1, date: 1 }, { unique: true });

export const TimeSlotInstance = mongoose.models.TimeSlotInstance || 
  mongoose.model("TimeSlotInstance", instanceSchema);