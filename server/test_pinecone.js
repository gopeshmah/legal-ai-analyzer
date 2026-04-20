require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

async function testPinecone() {
  try {
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    
    console.log("Fetching index details...");
    const indexDescription = await pc.describeIndex('legal-docs');
    console.log(`Index Dimension: ${indexDescription.dimension}`);
    
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testPinecone();
