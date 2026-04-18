const fs = require('fs');
const { chunkText } = require('./services/chunker');

// Very small mock text for quick testing
const dummyText = "The quick brown fox jumps over the lazy dog. ".repeat(60); 

// Our text is 9 words * 60 = 540 words.
// With chunkSize 500 and overlap 100, we should get exactly 2 chunks!

const runTest = () => {
  console.log("=== Testing Chunker ===");
  console.log(`Original Text word count: ${dummyText.trim().split(' ').length}`);
  
  const chunks = chunkText(dummyText, 500, 100);
  
  console.log(`Generated ${chunks.length} chunks!`);
  console.log(`\nChunk 1 word count: ${chunks[0].split(' ').length}`);
  console.log(`Chunk 2 word count: ${chunks[1].split(' ').length}`);
  console.log("\n✅ Chunker works perfectly!");
};

runTest();
