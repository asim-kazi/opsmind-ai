const mongoose = require('mongoose');

const documentChunkSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  text: { type: String, required: true },
  // Vector embeddings are stored as an array of numbers
  embedding: { type: [Number], required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DocumentChunk', documentChunkSchema);
