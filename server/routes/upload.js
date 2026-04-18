const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const Document = require('../models/Document');
const { parsePDF } = require('../services/pdfParser');
const { chunkText } = require('../services/chunker');

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
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided. Did you attach the file as "file" key in formdata?' });
    }

    // 1. Create a Document record in MongoDB (marked as processing)
    const newDoc = await Document.create({
      userId: req.user.id,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      status: 'processing'
    });

    // 2. Extract plain text from PDF buffer
    const parsedData = await parsePDF(req.file.buffer);
    
    // 3. Chunk the text into 500 word pieces with 100 overlap
    const chunks = chunkText(parsedData.text, 500, 100);

    // 4. Update the DB metadata Document with stats
    newDoc.pageCount = parsedData.pageCount;
    newDoc.chunkCount = chunks.length;
    
    // [TEMPORARY FOR PHASE 3]: Mark 'ready' immediately. 
    // In Phase 4, we will embed these chunks into Pinecone BEFORE marking it ready.
    newDoc.status = 'ready';
    await newDoc.save();

    // 5. Return success and a small preview to verify chunking works!
    res.status(200).json({ 
      message: 'File processed successfully',
      documentId: newDoc._id,
      pageCount: newDoc.pageCount,
      chunkCount: newDoc.chunkCount,
      firstChunkPreview: chunks[0].substring(0, 200) + '...' 
    });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: error.message || 'Server error during PDF upload' });
  }
});

module.exports = router;
