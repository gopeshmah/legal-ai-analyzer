const pdfParse = require('pdf-parse');

/**
 * Extracts raw text from a PDF buffer in memory
 * @param {Buffer} pdfBuffer - The PDF file buffered in memory by Multer
 * @returns {Promise<Object>} { text: String, pageCount: Number }
 */
const parsePDF = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer);
    
    // Clean up the text: replace multiple empty lines with a single newline
    const cleanText = data.text
      .replace(/\n\s*\n/g, '\n') 
      .trim();

    return {
      text: cleanText,
      pageCount: data.numpages
    };
  } catch (error) {
    console.error('PDF Parsing Error:', error);
    throw new Error('Failed to extract text from PDF file');
  }
};

module.exports = { parsePDF };
