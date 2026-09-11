const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { slugify } = require('./productStore');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'images', 'products');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = ALLOWED[file.mimetype] || path.extname(file.originalname) || '.jpg';
    const base = slugify(path.basename(file.originalname, path.extname(file.originalname))) || 'anh';
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (ALLOWED[file.mimetype]) return cb(null, true);
  cb(new Error('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.'));
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 4 * 1024 * 1024 },
});

function removeImage(filename) {
  if (!filename) return;
  const full = path.join(UPLOAD_DIR, filename);
  fs.unlink(full, () => {});
}

module.exports = { upload, removeImage };
