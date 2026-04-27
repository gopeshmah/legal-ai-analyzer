const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  fileName: { 
    type: String, 
    required: true 
  },
  fileSize: { 
    type: Number, // In bytes
    required: true 
  },
  pageCount: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ['processing', 'ready', 'error'], 
    default: 'processing' 
  },
  chunkCount: { 
    type: Number, 
    default: 0 
  },
  summary: {
    type: String,
    default: '' // Auto-generated TL;DR of the document
  },
  chatHistory: [{
    role: { type: String, enum: ['user', 'assistant'] },
    text: { type: String },
    sources: [String],
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
