import express from 'express';
import multer from 'multer';
import upload from '../middlewares/upload.js';
import { deleteFile, getFile, uploadFile } from '../controllers/UploadController.js';

const router = express.Router(); // تعريف router

router.post('/', upload.single('image'), uploadFile);
router.get("/:filename", getFile);
router.delete("/delete/:filename", deleteFile);

export const UploadRouter = router;
