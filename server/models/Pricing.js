import mongoose from "mongoose";
import dotenv from "dotenv";

const PricingSchema = mongoose.Schema({
  parkId: { type: mongoose.Schema.Types.ObjectId, ref: "Park", required: true },
  relatedId: {
    type: [mongoose.Schema.Types.ObjectId], // Changed to array to support multiple related activities/parcours
    required: true,
    refPath: "type" // Dynamic reference
  },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  image: { type: String, required: false },
  price: { type: Number, required: true },
  additionalCharge: { type: Number, default: 0 },
});




const Pricing = mongoose.model("Pricing", PricingSchema);
export default Pricing;