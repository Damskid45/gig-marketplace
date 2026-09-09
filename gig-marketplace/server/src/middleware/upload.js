const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function makeStorage(subfolder) {
  const dest = path.join(__dirname, '..', '..', 'uploads', subfolder);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, unique);
    },
  });
}

function fileFilter(req, file, cb) {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new Error('Only JPEG, PNG, or WEBP images are allowed'));
  }
  cb(null, true);
}

const uploadGigImage = multer({
  storage: makeStorage('gigs'),
  fileFilter,
  limits: { fileSize: MAX_SIZE_BYTES },
}).single('image');

const uploadAvatar = multer({
  storage: makeStorage('avatars'),
  fileFilter,
  limits: { fileSize: MAX_SIZE_BYTES },
}).single('avatar');

// Wraps multer's callback-style middleware so errors reach the Express error handler
function handleUpload(uploader) {
  return (req, res, next) => {
    uploader(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      }
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
}

module.exports = {
  uploadGigImage: handleUpload(uploadGigImage),
  uploadAvatar: handleUpload(uploadAvatar),
};
