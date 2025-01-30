import multer from 'multer';
import path from 'path';

// Set up storage engine for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/uploads/'); // Save files in the 'public/uploads' folder
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext); // Generate a unique filename
    },
});

// Initialize multer with the storage engine
const upload = multer({ storage });

export default upload;