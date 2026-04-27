/**
 * Splits extracted text into semantic chunks while preserving paragraph/sentence boundaries.
 * This ensures legal clauses are not split arbitrarily down the middle.
 * 
 * @param {String} text - Full document text
 * @param {Number} maxWords - Max words per chunk (default 500)
 * @param {Number} overlapWords - Overlap words (default 100)
 * @returns {Array<String>} Array of semantic text chunks
 */
const chunkText = (text, maxWords = 500, overlapWords = 100) => {
  if (!text) return [];

  // Attempt to split by paragraph first (\n\n)
  const paragraphs = text.split(/\n\s*\n/);
  const chunks = [];
  let currentWords = [];
  
  for (const paragraph of paragraphs) {
    const paraWords = paragraph.split(/\s+/).filter(Boolean);
    
    // If a SINGLE paragraph is insanely large (more than maxWords), we must split it by sentences
    if (paraWords.length > maxWords) {
      // Regex splits on punctuation marks keeping the punctuation attached to the sentence
      const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
      
      for (const sentence of sentences) {
        const sentenceWords = sentence.split(/\s+/).filter(Boolean);
        
        // If a SINGLE sentence is STILL larger than maxWords (e.g. table of contents, missing punctuation)
        // We must hard-split the sentence into maxWords chunks to avoid API crashes
        if (sentenceWords.length > maxWords) {
          for (let i = 0; i < sentenceWords.length; i += (maxWords - overlapWords)) {
            const slice = sentenceWords.slice(i, i + maxWords);
            if (currentWords.length + slice.length > maxWords && currentWords.length > 0) {
              chunks.push(currentWords.join(' '));
              currentWords = currentWords.slice(-overlapWords);
            }
            currentWords.push(...slice);
          }
        } else {
          // Normal sentence fits
          if (currentWords.length + sentenceWords.length > maxWords && currentWords.length > 0) {
            chunks.push(currentWords.join(' '));
            currentWords = currentWords.slice(-overlapWords);
          }
          currentWords.push(...sentenceWords);
        }
      }
    } else {
      // Normal paragraph fits nicely
      if (currentWords.length + paraWords.length > maxWords && currentWords.length > 0) {
        // Save the current chunk
        chunks.push(currentWords.join(' '));
        
        // Overlap: take the last `overlapWords` from our current bucket to start the new chunk
        const overlapSlice = currentWords.slice(-overlapWords);
        currentWords = [...overlapSlice];
      }
      currentWords.push(...paraWords);
    }
  }
  
  // Push the final chunk
  if (currentWords.length > 0) {
    chunks.push(currentWords.join(' '));
  }

  // Final safety check: ensuring no chunk accidentally exceeds Gemini/Pinecone limits.
  // We'll enforce a strict text-length cut-off just to be completely safe against weird edge cases.
  return chunks.map(chunk => {
     // Gemini max is ~2048 tokens (approx 6-8k characters). Pinecone text metadata max is 40KB.
     // We cap at ~30,000 characters just in case, though 500 words shouldn't exceed 4,000 chars.
     if (chunk.length > 30000) {
       return chunk.substring(0, 30000);
     }
     return chunk;
  }).filter(c => c.trim().length > 0);
};

module.exports = { chunkText };
