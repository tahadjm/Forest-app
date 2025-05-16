import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  ageRequirement: { type: String, required: true },
  heightRequirement: { type: String, required: true },
  durationEstimated: { type: String, required: true },
  descriptionofCategory: { type: String, required: true },
  // You can also add other properties depending on the category specifics
});

const Category = mongoose.model("Category", CategorySchema);
export default Category;