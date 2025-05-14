import { isValidObjectId } from 'mongoose';
import Faq from '../models/FAQ.js';
import {faqItemSchema, faqPageSchema} from '../middlewares/Validator.js'
import FAQ from '../models/FAQ.js';

export const getFaqs = async (req, res) => {
  try {
    const faqs = await Faq.findOne();
    if (!faqs) return res.status(404).json({ message: 'FAQ section not found' });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const createFaq = async (req, res) => {
  try {
    const {error} = faqPageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    // Check if a FAQ section already exists
    const existingFaq = await Faq.findOne();
    if (existingFaq) {
      return res.status(400).json({ message: 'FAQ section already exists' });
    }
    // Create a new FAQ section
    const newFaq = new Faq(req.body);
    const savedFaq = await newFaq.save();
    res.status(201).json({success:true,data:savedFaq});
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Validation error' });
  }
};

export const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    if(!id || !isValidObjectId(id))
        return res.status(400).json({ message: 'Invalid or messing FAQ section ID' });
    const updatedFaq = await Faq.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedFaq) return res.status(404).json({ message: 'FAQ section not found' });
    res.json(updatedFaq);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Validation error' });
  }
};

export const addFaqItem = async (req, res) => {
  try {
    const { id } = req.params;
    if(!id || !isValidObjectId(id))
        return res.status(400).json({ message: 'Invalid or messing FAQ section ID' });    const updatedFaq = await Faq.findByIdAndUpdate(
      id,
      { $push: { faqs: req.body } },
      { new: true, runValidators: true }
    );
    const {error} = faqItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    if (!updatedFaq) return res.status(404).json({ message: 'FAQ section not found' });
    res.json(updatedFaq);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Validation error' });
  }
};

export const deleteFaqItem = async (req, res) => {
  try {
    const { id, faqId } = req.params;
    if(!id || !isValidObjectId(id))
        return res.status(400).json({ message: 'Invalid or messing FAQ section ID' });
    if(!faqId || !isValidObjectId(faqId))
        return res.status(400).json({ message: 'Invalid or messing FAQ item ID' });
    const updatedFaq = await Faq.findByIdAndUpdate(
      id,
      { $pull: { faqs: { _id: faqId } } },
      { new: true }
    );
    if (!updatedFaq) return res.status(404).json({ message: 'FAQ section not found' });
    res.json(updatedFaq);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Validation error' });
  }
};

export const deleteFaq = async (req, res) => {
    try {
        const { id } = req.params;
        if(!id || !isValidObjectId(id))
            return res.status(400).json({ message: 'Invalid or messing FAQ section ID' });
        const deletedFaq = await Faq.findByIdAndDelete(id);
        if (!deletedFaq) return res.status(404).json({ message: 'FAQ section not found' });
        res.json({ message: 'FAQ section deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error instanceof Error ? error.message : 'Validation error' });
    }
    }