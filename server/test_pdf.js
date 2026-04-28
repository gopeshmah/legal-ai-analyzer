require('dotenv').config();
const mongoose = require('mongoose');
const Document = require('./models/Document');
const PDFDocument = require('pdfkit');
const fs = require('fs');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const docId = '69f0fc62526dd3141e086fb5';
  const doc = await Document.findById(docId);
  if (!doc) {
    console.log('Document not found');
    process.exit(1);
  }
  console.log('Testing with doc:', doc._id);

  try {
    const pdf = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream('test_export.pdf');
    pdf.pipe(writeStream);

    pdf.fontSize(24).font('Helvetica-Bold').text('AI Legal Brief', { align: 'center' });
    pdf.moveDown();
    pdf.fontSize(14).font('Helvetica').text(`Document: ${doc.fileName}`, { align: 'center' });
    pdf.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    pdf.moveDown(2);

    if (doc.summary) {
      pdf.fontSize(16).font('Helvetica-Bold').text('AI Document Summary');
      pdf.moveDown(0.5);
      pdf.fontSize(11).font('Helvetica').text(doc.summary, { align: 'justify' });
      pdf.moveDown(2);
    }

    if (doc.chatHistory && doc.chatHistory.length > 0) {
      pdf.fontSize(16).font('Helvetica-Bold').text('Q&A Analysis');
      pdf.moveDown(1);

      doc.chatHistory.forEach((msg) => {
        if (msg.role === 'user') {
          pdf.fontSize(12).font('Helvetica-Bold').fillColor('#4B0082').text(`Q: ${msg.text}`);
          pdf.moveDown(0.5);
        } else {
          pdf.fontSize(11).font('Helvetica').fillColor('#000000').text(`A: ${msg.text.replace(/\*\*/g, '').replace(/\*/g, '')}`, { align: 'justify' });
          pdf.moveDown(1);
        }
      });
    }

    pdf.end();

    writeStream.on('finish', () => {
      console.log('PDF generated successfully');
      process.exit(0);
    });
  } catch (err) {
    console.error('PDF Generation Error:', err);
    process.exit(1);
  }
}

test();
