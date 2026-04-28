const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Extracts raw text from a PDF buffer in memory
 * @param {Buffer} pdfBuffer - The PDF file buffered in memory by Multer
 * @returns {Promise<Object>} { text: String, pageCount: Number }
 */
const render_page = async (pageData) => {
  const render_options = { normalizeWhitespace: false, disableCombineTextItems: false };
  let textContent = await pageData.getTextContent(render_options);
  let lastY, text = '';
  for (let item of textContent.items) {
    if (lastY == item.transform[5] || !lastY) {
      text += item.str;
    } else {
      text += '\n' + item.str;
    }
    lastY = item.transform[5];
  }
  // Only inject page marker if there's actual text on this page
  if (text.trim().length > 0) {
    return `\n\n[PAGE_${pageData.pageIndex + 1}]\n\n` + text;
  }
  return '';
};

const parsePDF = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer, { pagerender: render_page });
    
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
      
      const prompt = "Please act as an advanced OCR system. Transcribe all the text from this document exactly as it is written, preserving original paragraphs, line breaks, and bullet points. IMPORTANT: Before transcribing each visual page, output the exact string '[PAGE_X]' where X is the page number (e.g., [PAGE_1]). Do not include any other annotations.";
      
      const pdfPart = {
        inlineData: {
          data: pdfBuffer.toString("base64"),
          mimeType: "application/pdf"
        }
      };
      
      const result = await model.generateContent([prompt, pdfPart]);
      cleanText = result.response.text().trim();
      
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
