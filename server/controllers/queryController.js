const { generateEmbeddings } = require('../services/embedder');
const { queryByDocId } = require('../services/vectorStore');
const { generateRagAnswer } = require('../services/gemini');
const Document = require('../models/Document');

const askQuestion = async (req, res) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({ error: 'Please provide both documentId and question.' });
    }

    // 1. Embed the question
    const questionVectorArray = await generateEmbeddings([question]);
    const questionVector = questionVectorArray[0];

    if (!questionVector) {
      return res.status(500).json({ error: 'Failed to generate embedding for the question.' });
    }

    // 2. Query Pinecone for top 5 most similar chunks
    const matches = await queryByDocId(documentId, questionVector, 5);
    
    if (!matches || matches.length === 0) {
      return res.status(200).json({ 
        answer: "Your document is still syncing in the AI database. Please wait 5-10 seconds and ask your question again!",
        sources: [] 
      });
    }

    // Extract the text content from the pinecone matches metadata
    const contextChunks = matches.map(match => match.metadata.text);

    // 3. Send question and context chunks to Gemini to generate the answer
    const answer = await generateRagAnswer(question, contextChunks);

    // 4. Save to chat history
    await Document.findByIdAndUpdate(documentId, {
      $push: {
        chatHistory: {
          $each: [
            { role: 'user', text: question },
            { role: 'assistant', text: answer, sources: contextChunks }
          ]
        }
      }
    });

    // Return the answer and the actual chunks used (for reference if needed)
    res.status(200).json({
      answer,
      sources: contextChunks
    });

  } catch (error) {
    console.error('Query Error:', error);
    res.status(500).json({ error: error.message || 'Server error during query generation' });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const { documentId } = req.params;
    
    const doc = await Document.findOne({ _id: documentId, userId: req.user.id });
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.status(200).json(doc.chatHistory || []);
  } catch (error) {
    console.error('Fetch Chat History Error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};

module.exports = {
  askQuestion,
  getChatHistory
};
