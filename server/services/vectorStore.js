const { Pinecone } = require('@pinecone-database/pinecone');

let pineconeClient = null;

const initPinecone = () => {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }
  return pineconeClient;
};

const upsertChunks = async (docId, chunks, vectors) => {
  try {
    const pc = initPinecone();
    const index = pc.index(process.env.PINECONE_INDEX);

    // Format for pinecone: array of { id, values, metadata }
    const records = chunks.map((chunkText, i) => ({
      id: `${docId}-chunk-${i}`,
      values: vectors[i],
      metadata: {
        docId: docId.toString(),
        chunkIndex: i,
        text: chunkText
      }
    }));

    await index.upsert({ records: records });
    return true;
  } catch (error) {
    console.error("Pinecone Upsert Error:", error);
    throw new Error("Failed to store vectors in Pinecone");
  }
};

const queryByDocId = async (docId, queryVector, topK = 5) => {
  try {
    const pc = initPinecone();
    const index = pc.index(process.env.PINECONE_INDEX);

    const queryResponse = await index.query({
      vector: queryVector,
      topK,
      includeMetadata: true,
      filter: {
        docId: { $eq: docId.toString() }
      }
    });

    return queryResponse.matches;
  } catch (error) {
    console.error("Pinecone Query Error:", error);
    throw new Error("Failed to search Pinecone vectors");
  }
};

module.exports = {
  upsertChunks,
  queryByDocId
};
