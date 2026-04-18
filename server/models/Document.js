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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
