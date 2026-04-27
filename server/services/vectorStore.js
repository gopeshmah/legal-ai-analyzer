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

    await index.upsert({ records });
    return true;
  } catch (error) {
    console.error("Pinecone Upsert Error:", error);
    throw error;
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

const deleteByDocId = async (docId) => {
  try {
    const pc = initPinecone();
    const index = pc.index(process.env.PINECONE_INDEX);

    // List all vector IDs that belong to this document (they follow the pattern: docId-chunk-0, docId-chunk-1, etc.)
    const listResponse = await index.listPaginated({ prefix: `${docId}-chunk-` });
    
    if (listResponse.vectors && listResponse.vectors.length > 0) {
      const idsToDelete = listResponse.vectors.map(v => v.id);
      await index.deleteMany(idsToDelete);
      console.log(`🗑️ Deleted ${idsToDelete.length} vectors for doc ${docId}`);
    }

    return true;
  } catch (error) {
    console.error("Pinecone Delete Error:", error);
    throw new Error("Failed to delete vectors from Pinecone");
  }
};

const fetchChunksByDocId = async (docId) => {
  try {
    const pc = initPinecone();
    const index = pc.index(process.env.PINECONE_INDEX);

    // List all vector IDs for this document
    const listResponse = await index.listPaginated({ prefix: `${docId}-chunk-` });
    
    if (!listResponse.vectors || listResponse.vectors.length === 0) {
      return [];
    }

    const ids = listResponse.vectors.map(v => v.id);
    
    // Fetch the full vectors with metadata (which contains the text)
    const fetchResponse = await index.fetch(ids);
    
    // Extract text from metadata, sorted by chunk index
    const chunks = Object.values(fetchResponse.records)
      .sort((a, b) => a.metadata.chunkIndex - b.metadata.chunkIndex)
      .map(record => record.metadata.text);

    return chunks;
  } catch (error) {
    console.error("Pinecone Fetch Chunks Error:", error);
    throw new Error("Failed to fetch chunks from Pinecone");
  }
};

module.exports = {
  upsertChunks,
  queryByDocId,
  deleteByDocId,
  fetchChunksByDocId
};
