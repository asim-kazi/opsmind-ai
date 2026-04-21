const extractPDFText = require('../services/pdfParser');
const { generateEmbedding } = require('../services/aiService'); // your embedding.js
const { chunkText } = require('../services/textChunker');
const DocumentChunk = require('../models/DocumentChunk');

exports.processUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // 1. Extract Text
    const fullText = await extractPDFText(filePath);

    // 2. Chunk the text (1000 chars, 100 overlap)
    const chunks = chunkText(fullText, 1000, 100);
    console.log(`PDF divided into ${chunks.length} chunks.`);

    let savedChunksCount = 0;

    // 3. Loop through chunks, embed, and save to MongoDB
    for (const textChunk of chunks) {
      // Skip empty or very small chunks
      if (textChunk.trim().length < 10) continue;

      // Generate vector embedding for this specific chunk
      const embedding = await generateEmbedding(textChunk);

      // Save to Database
      await DocumentChunk.create({
        fileName: fileName,
        text: textChunk,
        embedding: embedding,
      });

      savedChunksCount++;
    }

    res.json({
      success: true,
      message: `Successfully processed and stored ${savedChunksCount} chunks in the database.`,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
};
