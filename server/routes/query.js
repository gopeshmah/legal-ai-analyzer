const express = require('express');
const { protect } = require('../middleware/auth');
const { askQuestion } = require('../controllers/queryController');

const router = express.Router();

// @route   POST /api/query
// @desc    Ask a RAG question about a specific document
// @access  Private
router.post('/', protect, askQuestion);

module.exports = router;
