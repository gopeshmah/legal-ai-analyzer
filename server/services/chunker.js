/**
 * Splits extracted text into smaller chunks with overlap.
 * This ensures that if a concept spans across two chunks, context isn't lost.
 * 
 * @param {String} text - Full document text
 * @param {Number} chunkSize - Number of words per chunk (default 500)
 * @param {Number} overlap - Number of overlapping words (default 100)
 * @returns {Array<String>} Array of text chunks
 */
const chunkText = (text, chunkSize = 500, overlap = 100) => {
  if (!text) return [];

  // Split text into an array of words
  const words = text.split(/\s+/);
  const chunks = [];

  // If the document is small, return it as one single chunk
  if (words.length <= chunkSize) {
    return [text];
  }

  // Slide through the words array taking chunks
  let i = 0;
  while (i < words.length) {
    // Slice a chunk of exactly chunkSize words
    const chunkWords = words.slice(i, i + chunkSize);
    chunks.push(chunkWords.join(' '));

    // Move forward by (chunkSize - overlap)
    // Example: 500 chunk size, 100 overlap -> move forward by 400
    i += (chunkSize - overlap);
  }

  return chunks;
};

module.exports = { chunkText };
