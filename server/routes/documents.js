const express = require('express');
const { protect } = require('../middleware/auth');
const { getDocuments, deleteDocument, generateSummary, exportDocumentPDF } = require('../controllers/documentController');

const router = express.Router();

// @route   GET /api/documents
// @desc    Get all documents for the logged in user
// @access  Private
router.get('/', protect, getDocuments);

// @route   POST /api/documents/:id/summary
// @desc    Generate AI summary for an existing document
// @access  Private
router.post('/:id/summary', protect, generateSummary);

// @route   GET /api/documents/:id/export
// @desc    Export document summary and chat history as a PDF
// @access  Private
router.get('/:id/export', protect, exportDocumentPDF);

// @route   DELETE /api/documents/:id
// @desc    Delete a document and its Pinecone vectors
// @access  Private
router.delete('/:id', protect, deleteDocument);

module.exports = router;
