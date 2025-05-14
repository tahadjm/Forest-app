import mongoose from "mongoose";
import Joi from "joi";

const FeatureSchema = new mongoose.Schema({
  feature: { type: String, required: true },
  description: { type: String, required: true },
  available: { type: Boolean, default: false },
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  ageRequirement: { type: String, required: true },
  heightRequirement: { type: String, required: true },
  durationEstimated: { type: String, required: true },
  descriptionofCategory: { type: String, required: true },
  images: [{ type: String }], // Optional images
  video: { type: String ,default: null,required:false}, // Optional video
});

const SubParcourSchema = new mongoose.Schema({
  name: { type: String, required: false },
  numberOfWorkshops: { type: Number },
  tyroliennes: { type: Number },
  durationEstimated: { type: String, required: true },
  description: { type: String },
  images: [{ type: String }], // Optional images
  video: { type: String }, // Optional video
});

export const ActivitySchema = new mongoose.Schema({
  parkId: { type: mongoose.Schema.Types.ObjectId, ref: "Park", required: true },
  HeaderImage: { type: String, required: true },
  HeaderVideo: { type: String, required: false },
  images: [{ type: String }],
  name: { type: String, required: true },
  isParcours: { type: Boolean, required: true }, // Determines if it's a parcours
  description: { type: String },
  features: [FeatureSchema],
  details: {
    déroulement: { type: String, required: true },
    duration: { type: String, required: true },
    features: [{ type: String }],
  },
  difficulty: {
    level: { type: String, enum: ["easy", "medium", "hard"] },
    description: { type: String },
  },
  categories: {
    type: [CategorySchema],
    required: function () {
      return !this.isParcours; // Required if it's NOT a parcours
    },
  },
  subParcours: {
    type: [SubParcourSchema],
    required: function () {
      return this.isParcours; // Required if it's a parcours
    },
  },
});

// Ensure `name` is unique per `parkId`
ActivitySchema.index({ parkId: 1, name: 1 }, { unique: true });
const Activity = mongoose.model("Activity", ActivitySchema);
export default Activity;