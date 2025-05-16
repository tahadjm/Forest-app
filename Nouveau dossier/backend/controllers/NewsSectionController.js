import { isValidObjectId } from 'mongoose';
import {newsSchema} from '../middlewares/Validator.js'

import News from "../models/News.js";
//Create News
export const createNews = async (req, res) => {
    try {
        const { error, value } = newsSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const news = new News(value);
        await news.save();
        return res.status(201).json(news);
    } catch (error) {
        if (error.code === 11000) {
            // MongoDB duplicate key error
            return res.status(400).json({ success: false, message: "Title must be unique" });
        }
        res.status(500).json({ message: error.message });
    }
};

// Get All News
export const getAllNews = async (req, res) => {
    try {
        const news = await News.find();
        res.status(200).json(news);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete News (Admin Only)
export const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedNews = await News.findByIdAndDelete(id);
        if (!deletedNews) {
            return res.status(404).json({ message: "News not found" });
        }
        res.status(200).json({ message: "News deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update News (Admin Only)
export const updateNews = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid News ID" });
        }

        const updatedNews = await News.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updatedNews) {
            return res.status(404).json({ message: "News not found" });
        }

        res.status(200).json(updatedNews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
