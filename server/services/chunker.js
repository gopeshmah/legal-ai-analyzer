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

  const chunks = [];
  
  // Split the text by [PAGE_X] markers
  // The regex captures the number, so the split array will look like:
  // ["pre-text", "1", "page 1 text", "2", "page 2 text"]
  const pageBlocks = text.split(/\[PAGE_(\d+)\]/i);

  // Default to page 1 if no markers found at the start
  let currentPage = 1;

  for (let b = 0; b < pageBlocks.length; b++) {
    const block = pageBlocks[b].trim();
    if (!block) continue;

    // If this block is just digits and the next block exists, it's the page number marker
    if (/^\d+$/.test(block) && b % 2 === 1) {
      currentPage = parseInt(block, 10);
      continue;
    }

    // Process the text block with the current page number
    const paragraphs = block.split(/\n\s*\n/);
    let currentWords = [];

    for (const paragraph of paragraphs) {
      const paraWords = paragraph.split(/\s+/).filter(Boolean);
      
      if (paraWords.length > maxWords) {
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
        
        for (const sentence of sentences) {
          const sentenceWords = sentence.split(/\s+/).filter(Boolean);
          
          if (sentenceWords.length > maxWords) {
            for (let i = 0; i < sentenceWords.length; i += (maxWords - overlapWords)) {
              const slice = sentenceWords.slice(i, i + maxWords);
              if (currentWords.length + slice.length > maxWords && currentWords.length > 0) {
                chunks.push({ text: currentWords.join(' '), page: currentPage });
                currentWords = currentWords.slice(-overlapWords);
              }
              currentWords.push(...slice);
            }
          } else {
            if (currentWords.length + sentenceWords.length > maxWords && currentWords.length > 0) {
              chunks.push({ text: currentWords.join(' '), page: currentPage });
              currentWords = currentWords.slice(-overlapWords);
            }
            currentWords.push(...sentenceWords);
          }
        }
      } else {
        if (currentWords.length + paraWords.length > maxWords && currentWords.length > 0) {
          chunks.push({ text: currentWords.join(' '), page: currentPage });
          const overlapSlice = currentWords.slice(-overlapWords);
          currentWords = [...overlapSlice];
        }
        currentWords.push(...paraWords);
      }
    }
    
    if (currentWords.length > 0) {
      chunks.push({ text: currentWords.join(' '), page: currentPage });
    }
  }

  // Safety cap limit to Pinecone max metadata size (30,000 chars)
  return chunks.map(chunkObj => {
     if (chunkObj.text.length > 30000) {
       return { ...chunkObj, text: chunkObj.text.substring(0, 30000) };
     }
     return chunkObj;
  }).filter(c => c.text.trim().length > 0);
};

module.exports = { chunkText };
