const { GoogleGenerativeAI } = require('@google/generative-ai');

// Function to generate embeddings for an array of text chunks
// We use batchEmbedContents to avoid hitting the 15 RPM limit on free tier.
const generateEmbeddings = async (texts) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined in .env");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Explicitly define the embedding model
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

    // Format the requests array for batching
    const requests = texts.map((text) => ({
      content: { parts: [{ text }] }
    }));

    // The free API limit might restrict batch size to 100, so we slice if needed.
    // For smaller documents, a single batch is usually enough.
    const batchSize = 100;
    let allEmbeddings = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batchRequests = requests.slice(i, i + batchSize);
      
      const result = await model.batchEmbedContents({
        requests: batchRequests,
      });

      // result.embeddings is an array of objects: { values: [float, float, ...] }
      const vectors = result.embeddings.map((e) => e.values);
      allEmbeddings.push(...vectors);
    }

    return allEmbeddings;
  } catch (error) {
    console.error("Embedding Error:", error);
    throw new Error("Failed to generate embeddings from Gemini API.");
  }
};

module.exports = {
  generateEmbeddings
};
