const express = require('express');
const { protect } = require('../middleware/auth');
const { getDocuments } = require('../controllers/documentController');

const router = express.Router();

// @route   GET /api/documents
// @desc    Get all documents for the logged in user
// @access  Private
router.get('/', protect, getDocuments);

module.exports = router;
