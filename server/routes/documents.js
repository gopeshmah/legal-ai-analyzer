const express = require('express');
const { protect } = require('../middleware/auth');
const { getDocuments, deleteDocument } = require('../controllers/documentController');

const router = express.Router();

// @route   GET /api/documents
// @desc    Get all documents for the logged in user
// @access  Private
router.get('/', protect, getDocuments);

// @route   DELETE /api/documents/:id
// @desc    Delete a document and its Pinecone vectors
// @access  Private
router.delete('/:id', protect, deleteDocument);

module.exports = router;
