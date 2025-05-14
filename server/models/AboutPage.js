import mongoose
 from "mongoose";
const aboutPageSchema = new mongoose.Schema({
  heroSection: {
    title: String,
    description: String
  },
  aboutSection: {
    title: String,
    content: {
      paragraph: String,
      history: String,
      commitment: String
    },
    mainImage: String,
    yearsExperience: Number
  },
  stats: [{
    value: String,
    label: String
  }],
  teamMembers: [{
    name: String,
    role: String,
    image: String
  }],
  values: [{
    title: String,
    description: String,
    icon: String
  }],
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

aboutPageSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

const AboutPage = mongoose.model("AboutPage", aboutPageSchema);
export default AboutPage;