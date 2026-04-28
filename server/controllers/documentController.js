const Document = require('../models/Document');
const { deleteByDocId, fetchChunksByDocId } = require('../services/vectorStore');
const { generateDocumentSummary } = require('../services/gemini');

const PDFDocument = require('pdfkit');

const getDocuments = async (req, res) => {
  try {
    // Return all documents belonging to this user, newest first
    const documents = await Document.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    console.error('Fetch Documents Error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const docId = req.params.id;

    // Find the document and verify it belongs to the logged-in user
    const doc = await Document.findById(docId);

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (doc.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this document' });
    }

    // 1. Delete vectors from Pinecone (clean up AI data)
    try {
      await deleteByDocId(docId);
    } catch (pineconeError) {
      console.error('Pinecone cleanup failed (continuing with DB delete):', pineconeError);
      // We still proceed to delete from MongoDB even if Pinecone fails
    }

    // 2. Delete the document record from MongoDB
    await Document.findByIdAndDelete(docId);

    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete Document Error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};

// Generate (or regenerate) a summary for an existing document
const generateSummary = async (req, res) => {
  try {
    const docId = req.params.id;

    const doc = await Document.findById(docId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (doc.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Fetch the text chunks from Pinecone
    const chunks = await fetchChunksByDocId(docId);

    if (!chunks || chunks.length === 0) {
      return res.status(400).json({ error: 'No chunks found in Pinecone for this document' });
    }

    // Generate summary using Gemini
    const summary = await generateDocumentSummary(chunks);

    // Save to database
    doc.summary = summary;
    await doc.save();

    res.status(200).json({ summary });
  } catch (error) {
    console.error('Generate Summary Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate summary' });
  }
};

// Export the document summary and chat history as a PDF
const exportDocumentPDF = async (req, res) => {
  try {
    const docId = req.params.id;

    const doc = await Document.findById(docId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (doc.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Initialize PDF document
    const pdf = new PDFDocument({ margin: 50 });

    // Set headers to trigger a download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Legal_Brief_${doc.fileName}.pdf"`);

    // Pipe the PDF directly to the response
    pdf.pipe(res);

    // Title
    pdf.fontSize(24).font('Helvetica-Bold').text('AI Legal Brief', { align: 'center' });
    pdf.moveDown();
    pdf.fontSize(14).font('Helvetica').text(`Document: ${doc.fileName}`, { align: 'center' });
    pdf.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    pdf.moveDown(2);

    // Summary Section
    if (doc.summary) {
      pdf.fontSize(16).font('Helvetica-Bold').text('AI Document Summary');
      pdf.moveDown(0.5);
      pdf.fontSize(11).font('Helvetica').text(doc.summary, { align: 'justify' });
      pdf.moveDown(2);
    }

    // Chat History Section
    if (doc.chatHistory && doc.chatHistory.length > 0) {
      pdf.fontSize(16).font('Helvetica-Bold').text('Q&A Analysis');
      pdf.moveDown(1);

      doc.chatHistory.forEach((msg) => {
        if (msg.role === 'user') {
          // Add a subtle background color for the user question (if possible, or just bold)
          pdf.fontSize(12).font('Helvetica-Bold').fillColor('#4B0082').text(`Q: ${msg.text}`);
          pdf.moveDown(0.5);
        } else {
          pdf.fontSize(11).font('Helvetica').fillColor('#000000').text(`A: ${msg.text.replace(/\*\*/g, '').replace(/\*/g, '')}`, { align: 'justify' });
          pdf.moveDown(1);
        }
      });
    }

    // Finalize the PDF
    pdf.end();
  } catch (error) {
    console.error('PDF Export Error:', error);
    // Note: If headers are already sent, sending JSON will fail. But we catch early errors here.
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  }
};

module.exports = {
  getDocuments,
  deleteDocument,
  generateSummary,
  exportDocumentPDF
};
