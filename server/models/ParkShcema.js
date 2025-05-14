import mongoose from "mongoose";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ParkSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  workingHours: {
    type: Map,
    of: {
      from: { type: String },
      to: { type: String },
      closed: { type: Boolean, default: false },
    },
    default: {},
  },
  maxBookingDays: { type: Number, default: 30 },
  description: { type: String },
  headerMedia:{ type: String, required: true }, // New field for storing park header media
  imageUrl: { type: String, required: true }, // New field for storing park image URL
  galleryImages: { type: [String], default: [] }, // Array for additional images
  facilities: [String], // ["Restrooms", "Picnic Areas", etc.]
  rules: [
    {
      ruleNumber: {Number},
      description: String,
    }
  ]

});

// Middleware to ensure consistency when a day is closed
ParkSchema.pre("save", function (next) {
  const park = this;

  // If a day is marked as closed, remove its working hours
  for (const day of daysOfWeek) {
    const schedule = park.workingHours.get(day);
    if (schedule?.closed) {
      schedule.from = undefined;
      schedule.to = undefined;
      park.workingHours.set(day, schedule);
    }
  }

  next();
});

const Park = mongoose.model("Park", ParkSchema);
export default Park;
