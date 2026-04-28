require('dotenv').config();
const mongoose = require('mongoose');
const Document = require('./models/Document');

async function inspect() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const docId = '69f0fc62526dd3141e086fb5';
  const doc = await Document.findById(docId);
  if (!doc) {
    console.log('Error: Document not found');
    process.exit(0);
  }
  
  console.log('Document found:', doc._id);
  console.log('User ID on document:', doc.userId.toString());
  
  process.exit(0);
}
inspect();
