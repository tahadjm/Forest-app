import mongoose from "mongoose";

const securitySectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  iconName: {
    type: String,
    required: true,
    enum: ['Shield', 'Clipboard', 'HardHat', 'Link', 'BookOpen', 'Siren', 'TreePine']
  },
  imageUrl: {
    type: String,
    required: true,
    default: '/image/image.jpg'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update the updatedAt field before saving
securitySectionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});


const SecuritySection = mongoose.model("SecuritySection", securitySectionSchema);
export { SecuritySection };  
export default SecuritySection;