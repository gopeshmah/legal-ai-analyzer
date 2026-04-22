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
    
    // If adding this paragraph exceeds the max word limit...
    if (currentWords.length + paraWords.length > maxWords && currentWords.length > 0) {
      // Save the current chunk
      chunks.push(currentWords.join(' '));
      
      // Overlap: take the last `overlapWords` from our current bucket to start the new chunk
      const overlapSlice = currentWords.slice(-overlapWords);
      currentWords = [...overlapSlice];
    }
    
    // If a SINGLE paragraph is insanely large (more than maxWords), we must split it by sentences
    if (paraWords.length > maxWords) {
      // Regex splits on punctuation marks keeping the punctuation attached to the sentence
      const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
      
      for (const sentence of sentences) {
        const sentenceWords = sentence.split(/\s+/).filter(Boolean);
        
        if (currentWords.length + sentenceWords.length > maxWords && currentWords.length > 0) {
          chunks.push(currentWords.join(' '));
          currentWords = currentWords.slice(-overlapWords);
        }
        currentWords.push(...sentenceWords);
      }
    } else {
      // Normal paragraph fits nicely
      currentWords.push(...paraWords);
    }
  }
  
  // Push the final chunk
  if (currentWords.length > 0) {
    chunks.push(currentWords.join(' '));
  }

  return chunks;
};

module.exports = { chunkText };
