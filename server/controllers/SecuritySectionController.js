// controllers/securitySectionController.js
import { SecuritySectionSchema } from '../middlewares/Validator.js';
import SecuritySection from '../models/security.js';

export const createSection = async (req, res) => {
    try {
        const {error, value} = SecuritySectionSchema.validate(req.body);
        if(error){
            return res.status(400).json({
                status: 'fail',
                message: error.details[0].message
            });
        }

        const newSection = await SecuritySection.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                section: newSection
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                status: 'fail',
                message: error.message
            });
        }
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

export const getAllSections = async (req, res) => {
    try {
        const sections = await SecuritySection.find().sort({ order: 1 });

        if(!sections.length) {
            return res.status(404).json({
                status: 'fail',
                message: 'No sections found'
            });
        }
        if (sections.length > 0) {
            res.status(200).json({
                status: 'success',
                results: sections.length,
                data: {
                    sections
                }
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

export const getSection = async (req, res) => {
    try {
        const section = await SecuritySection.findById(req.params.id);

        if (!section) {
            return res.status(404).json({
                status: 'fail',
                message: 'Section not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                section
            }
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid ID format'
            });
        }
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

export const updateSection = async (req, res) => {
    try {
        const section = await SecuritySection.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!section) {
            return res.status(404).json({
                status: 'fail',
                message: 'Section not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                section
            }
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid ID format'
            });
        } else if (error.name === 'ValidationError') {
            return res.status(400).json({
                status: 'fail',
                message: error.message
            });
        }
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

export const deleteSection = async (req, res) => {
    try {
        let section;
        if (req.query.id) {
            section = await SecuritySection.findByIdAndDelete(req.query.id);
        } else{
            section = await SecuritySection.deleteMany();
        }

        if (!section) {
            return res.status(404).json({
                status: 'fail',
                message: 'Section not found'
            });
        }

        res.status(204).end();
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid ID format'
            });
        }
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};