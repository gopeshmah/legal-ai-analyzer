const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { uploadDocument } = require('../controllers/uploadController');

const router = express.Router();

// Multer config: stores uploaded file temporarily in RAM (memoryStorage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB strict limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

// @route   POST /api/upload
// @desc    Upload a PDF, extract plain text, and chunk it
// @access  Private (Needs JWT)
router.post('/', protect, upload.single('file'), uploadDocument);

module.exports = router;
