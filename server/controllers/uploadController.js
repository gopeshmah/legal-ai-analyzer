const Document = require('../models/Document');
const { parsePDF } = require('../services/pdfParser');
const { chunkText } = require('../services/chunker');
const { generateEmbeddings } = require('../services/embedder');
const { upsertChunks } = require('../services/vectorStore');
const { generateDocumentSummary } = require('../services/gemini');

const uploadDocument = async (req, res) => {
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
    
    if (chunks.length === 0) {
      newDoc.status = 'error';
      await newDoc.save();
      return res.status(400).json({ error: 'No text could be extracted from this PDF, even using AI OCR fallback. The document might be blank or corrupted.' });
    }
    
    await newDoc.save(); // Save as processing status

    // Phase 4: Embed chunks and upsert to Pinecone
    try {
      const chunkTexts = chunks.map(c => c.text);
      const vectors = await generateEmbeddings(chunkTexts);
      await upsertChunks(newDoc._id, chunks, vectors);

      // If embedding successful, generate a TL;DR summary
      let summary = '';
      try {
        summary = await generateDocumentSummary(chunks);
      } catch (summaryError) {
        console.error('Summary generation failed (non-blocking):', summaryError);
      }

      // Mark as ready and save summary
      newDoc.status = 'ready';
      newDoc.summary = summary;
      await newDoc.save();
    } catch (embedError) {
      console.error('=== Embedding/Pinecone Error Details ===');
      console.error('Error name:', embedError.name);
      console.error('Error message:', embedError.message);
      console.error('Error stack:', embedError.stack);
      
      const fs = require('fs');
      let logMsg = `[${new Date().toISOString()}] Embedding/Pinecone Error:\n`;
      logMsg += `Name: ${embedError.name}\n`;
      logMsg += `Message: ${embedError.message}\n`;
      logMsg += `Stack: ${embedError.stack}\n`;
      
      if (embedError.response) {
        console.error('Response status:', embedError.response.status);
        console.error('Response data:', JSON.stringify(embedError.response.data));
        logMsg += `Response Status: ${embedError.response.status}\n`;
        logMsg += `Response Data: ${JSON.stringify(embedError.response.data)}\n`;
      }
      console.error('Full error:', JSON.stringify(embedError, Object.getOwnPropertyNames(embedError), 2));
      logMsg += `Full error: ${JSON.stringify(embedError, Object.getOwnPropertyNames(embedError), 2)}\n\n`;
      fs.appendFileSync('error.log', logMsg);
      
      newDoc.status = 'error';
      await newDoc.save();
      return res.status(500).json({ error: 'File parsed but failed during AI embedding' });
    }

    // 5. Return success and a small preview to verify chunking works!
    res.status(200).json({ 
      message: 'File processed successfully',
      documentId: newDoc._id,
      pageCount: newDoc.pageCount,
      chunkCount: newDoc.chunkCount,
      firstChunkPreview: chunks[0].text.substring(0, 200) + '...' 
    });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: error.message || 'Server error during PDF upload' });
  }
};

module.exports = {
  uploadDocument
};
