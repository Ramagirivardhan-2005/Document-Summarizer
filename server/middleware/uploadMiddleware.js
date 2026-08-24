import multer from 'multer';
import path from 'path';

// Use memory storage for clean handling without disk persistence / cleanup issues
const storage = multer.memoryStorage();

// Allowed MIME types and extensions
const allowedMimeTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
];

const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(mime)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only PDF and Image files (JPG, JPEG, PNG) are supported.'
      ),
      false
    );
  }
};

// 10MB maximum file size limit
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter,
});
