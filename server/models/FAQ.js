import mongoose from 'mongoose';

const FaqSchema = new mongoose.Schema({
  heroSection: {
    title: { type: String, required: true },
    description: { type: String, required: true }
  },
  faqs: [{
    question: { type: String, required: true },
    answer: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],
  contactSection: {
    title: { type: String, required: true },
    description: { type: String, required: true }
  }
}, { timestamps: true });

const FAQ = mongoose.model('FAQ', FaqSchema);
export { FaqSchema }; // Export the schema separately for nested usage
export default FAQ;