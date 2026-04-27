const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Extracts raw text from a PDF buffer in memory
 * @param {Buffer} pdfBuffer - The PDF file buffered in memory by Multer
 * @returns {Promise<Object>} { text: String, pageCount: Number }
 */
const parsePDF = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer);
    
    // Clean up the text: collapse 3+ blank lines into double newlines (preserve paragraph breaks)
    let cleanText = data.text
      .replace(/\n{3,}/g, '\n\n') 
      .trim();

    // If text extraction failed (e.g., scanned PDF image), fallback to Gemini OCR
    if (cleanText.length < 50) {
      console.log('📄 PDF seems to be an image (scanned document). Falling back to AI OCR transcription...');
      
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      // gemini-2.5-flash is extremely fast and handles document OCR natively
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = "Please act as an OCR system. Transcribe all the text from this document exactly as it is written. Do not summarize or omit anything. Only return the transcribed text.";
      
      const pdfPart = {
        inlineData: {
          data: pdfBuffer.toString("base64"),
          mimeType: "application/pdf"
        }
      };
      
      const result = await model.generateContent([prompt, pdfPart]);
      cleanText = result.response.text();
      
      console.log('✅ AI OCR transcription completed successfully!');
    }

    return {
      text: cleanText,
      pageCount: data.numpages || 0
    };
  } catch (error) {
    console.error('PDF Parsing/OCR Error:', error);
    throw new Error('Failed to extract text from PDF file');
  }
};

module.exports = { parsePDF };
