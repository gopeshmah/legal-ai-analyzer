const express = require('express');
const { protect } = require('../middleware/auth');
const Document = require('../models/Document');

const router = express.Router();

// @route   GET /api/documents
// @desc    Get all documents for the logged in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Return all documents belonging to this user, newest first
    const documents = await Document.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    console.error('Fetch Documents Error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

module.exports = router;
