const { GoogleGenerativeAI } = require('@google/generative-ai');

// Helper: wait for a given number of milliseconds
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to generate embeddings for an array of text chunks
// Handles Gemini free-tier rate limits (100 RPM) with retry + backoff.
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

    // Use smaller batches (50) to stay safely under the 100 RPM free-tier limit
    const batchSize = 50;
    let allEmbeddings = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batchRequests = requests.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(texts.length / batchSize);

      console.log(`📊 Embedding batch ${batchNum}/${totalBatches} (${batchRequests.length} chunks)...`);

      // Retry logic with exponential backoff for rate limiting
      let retries = 0;
      const maxRetries = 3;

      while (retries <= maxRetries) {
        try {
          const result = await model.batchEmbedContents({
            requests: batchRequests,
          });

          // result.embeddings is an array of objects: { values: [float, float, ...] }
          const vectors = result.embeddings.map((e) => e.values);
          allEmbeddings.push(...vectors);
          break; // Success — exit the retry loop
        } catch (batchError) {
          // Check if it's a rate limit error (429)
          if (batchError.status === 429 || batchError.message?.includes('429') || batchError.message?.includes('Too Many Requests')) {
            retries++;
            if (retries > maxRetries) {
              console.error(`❌ Batch ${batchNum} failed after ${maxRetries} retries.`);
              throw batchError;
            }
            // Exponential backoff: 30s, 60s, 120s
            const waitTime = 30000 * Math.pow(2, retries - 1);
            console.log(`⏳ Rate limited. Waiting ${waitTime / 1000}s before retry ${retries}/${maxRetries}...`);
            await sleep(waitTime);
          } else {
            // Non-rate-limit error — throw immediately
            throw batchError;
          }
        }
      }

      // Add a small delay between successful batches to avoid hitting the limit
      if (i + batchSize < texts.length) {
        await sleep(2000); // 2 second cooldown between batches
      }
    }

    console.log(`✅ All embeddings generated: ${allEmbeddings.length} vectors`);
    return allEmbeddings;
  } catch (error) {
    console.error("Embedding Error:", error.message || error);
    throw new Error(`Failed to generate embeddings: ${error.message}`);
  }
};

module.exports = {
  generateEmbeddings
};
