const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateRagAnswer = async (question, contextChunks) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-2.5-flash for fast and cost-effective text generation
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are a highly analytical legal assistant. Your task is to accurately answer the user's question based strictly on the provided document context.

CONTEXT:
${contextChunks.join('\n\n---\n\n')}

USER QUESTION:
${question}

INSTRUCTIONS:
1. Answer the question using ONLY the provided context. If the answer is not contained in the context, explicitly state "This information is not explicitly covered in the provided document context."
2. Be direct and clear. Use bullet points if applicable.
3. If the context contains any potential legal risks, obligations, or liabilities related to the user's question, you must highlight them clearly using the EXACT tag [RISK] immediately before describing the risk. 
   Example: [RISK] The user is liable for damages if...

ANSWER:
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate answer from Gemini API.");
  }
};

// Generate a short TL;DR summary of the document from its chunks
const generateDocumentSummary = async (chunks) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Use up to the first 5 chunks to keep it fast and cost-effective
    const sampleText = chunks.slice(0, 5).join('\n\n---\n\n');

    const prompt = `
You are a legal document analyst. Read the following excerpts from a legal document and generate a concise summary.

DOCUMENT EXCERPTS:
${sampleText}

INSTRUCTIONS:
1. Write a 2-3 sentence summary of what this document is about (type of agreement, parties involved, key purpose).
2. Follow with 3-5 bullet points of the most important terms, clauses, or obligations.
3. Keep the entire summary under 200 words.
4. Write in plain English that a non-lawyer can understand.
5. Do NOT use markdown headers. Use bullet points (•) for the key points.

SUMMARY:
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    // Return a fallback — summary failure should NOT block the upload
    return '';
  }
};

module.exports = {
  generateRagAnswer,
  generateDocumentSummary
};
