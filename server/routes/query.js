const express = require('express');
const { protect } = require('../middleware/auth');
const { askQuestion, getChatHistory } = require('../controllers/queryController');

const router = express.Router();

// @route   POST /api/query
// @desc    Ask a RAG question about a specific document
// @access  Private
router.post('/', protect, askQuestion);

// @route   GET /api/query/history/:documentId
// @desc    Get chat history for a specific document
// @access  Private
router.get('/history/:documentId', protect, getChatHistory);

module.exports = router;
