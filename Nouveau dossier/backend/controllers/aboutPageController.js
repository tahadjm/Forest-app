import { isValidObjectId } from 'mongoose';
import AboutPage from '../models/AboutPage.js';
import {aboutSectionSchema} from "../middlewares/Validator.js";

export const getAboutPage = async (req, res) => {
  try {
    const aboutPage = await AboutPage.findOne();
    if (!aboutPage) return res.status(404).json({ message: 'About page not found' });
    res.json({ data: aboutPage, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAboutPage = async (req, res) => {
try {
    // Validate the request body against the schema
    const { error } = aboutSectionSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map(err => err.message),
        });
    }
    const existingPage = await AboutPage.findOne();
    if (existingPage) {
    return res.status(400).json({ message: 'About page already exists' });
    }
    // Create a new instance of the AboutPage model
    const newAboutPage = new AboutPage(req.body);
    // and save it to the database
    const savedAboutPage = await newAboutPage.save();
    res.status(201).json({data:savedAboutPage,success:true});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAboutPage = async (req, res) => {
  try {
    const { id } = req.params;
    if(!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid Or missing id.' });
    }

    const updatedPage = await AboutPage.findByIdAndUpdate(
      id,
      
      { $set: req.body },
      { new: true, runValidators: true }
    );
    res.json({ data: updatedPage, success: true });
  } catch (error) {
    console.error('Error updating about page:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteAboutPage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid or missing id.' });
    }

    const deletedPage = await AboutPage.findByIdAndDelete(id);
    if (!deletedPage) {
      return res.status(404).json({ message: 'About page not found.' });
    }

    res.status(200).json({ message: 'About page deleted successfully.', success: true });
  } catch (error) {
    console.error('Error deleting about page:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
