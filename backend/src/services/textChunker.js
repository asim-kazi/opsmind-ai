function chunkText(text, chunkSize = 1000, chunkOverlap = 100) {
  const chunks = [];
  let i = 0;

  while (i < text.length) {
    // Get a chunk of text
    const chunk = text.slice(i, i + chunkSize);
    chunks.push(chunk);

    // Move forward, but step back by the overlap amount
    i += chunkSize - chunkOverlap;
  }

  return chunks;
}

module.exports = { chunkText };
