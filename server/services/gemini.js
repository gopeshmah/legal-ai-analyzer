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

module.exports = {
  generateRagAnswer
};
