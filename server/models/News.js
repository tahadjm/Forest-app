import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    image: { type: String, required: true },
    categories: { type: [String], required: true },
    locations: { type: [String], required: true },
  },
  { timestamps: true } // Add timestamps option here
);

// Add an index
newsSchema.index({ title: 1, date: -1 });

const News = mongoose.model("News", newsSchema);
export default News;