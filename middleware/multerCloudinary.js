const multer = require('multer');
const cloudinary = require('../config/cloudinaryConfig');
const { v4: uuidv4 } = require('uuid');

// ✅ Memory storage so files are available as buffers in req.file.buffer
const storage = multer.memoryStorage();

// ✅ File filter to allow only specific image formats
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const isMimeTypeAllowed = allowedTypes.test(file.mimetype);
  const isExtNameAllowed = allowedTypes.test(file.originalname.toLowerCase());

  if (isMimeTypeAllowed && isExtNameAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed'), false);
  }
};

// ✅ Multer middleware setup
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB max size
  fileFilter
});

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: uuidv4(),
        resource_type: 'image' 
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    stream.end(buffer); 
  });
};

module.exports = { upload, uploadToCloudinary };
