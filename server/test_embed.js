require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

async function debugPineconeSpecific() {
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pc.index(process.env.PINECONE_INDEX);
  
  const dummyVector = new Array(3072).fill(0.1);
  const query = await index.query({
    vector: dummyVector,
    topK: 10,
    includeMetadata: true,
    filter: {
      docId: { $eq: "69e50c18ba8374cc78a11635" }
    }
  });
  
  console.log("Found matching records for 69e50c...:", query.matches.length);
}

debugPineconeSpecific();
