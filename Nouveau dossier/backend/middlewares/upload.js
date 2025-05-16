import multer, { diskStorage } from 'multer';
import path from 'path';

// Set storage engine
const storage = diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save files in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});



const upload = multer({ storage });

export default upload;