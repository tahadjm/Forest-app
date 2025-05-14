import express from 'express';
import multer from 'multer';
import path from "path";
import fs from "fs";
import mime from "mime-types";


const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    // Prepend timestamp to avoid filename conflicts
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// File filter to allow images and videos
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Only image and video files are permitted.'), false);
  }
};

// Create the multer instance with our storage and fileFilter
const upload = multer({ storage, fileFilter });

// Controller function to retrieve files (image or video)
export const getFile = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), "uploads", filename);
  
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }
  
    const contentType = mime.lookup(filePath) || "application/octet-stream";
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
  
    if (range) {
      // Parse Range header for partial content
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
  
      const fileStream = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": contentType,
      });
      fileStream.pipe(res);
    } else {
      // No Range header present, serve entire file
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": contentType,
      });
      fs.createReadStream(filePath).pipe(res);
    }
  };
  

// Controller function to handle file uploads
export const uploadFile = (req, res) => {

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(200).json({ message: 'File uploaded successfully', imageUrl });
};

export const deleteFile = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(process.cwd(), "uploads", filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  // Delete the file
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to delete file" });
    }
    res.status(200).json({ message: "File deleted successfully" });
  });
};

