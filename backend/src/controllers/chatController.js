const {
  generateEmbedding,
  generateChatStream,
} = require('../services/aiService');
const DocumentChunk = require('../models/DocumentChunk');

exports.handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    // 1. User ke message ka vector banao
    const queryEmbedding = await generateEmbedding(message);

    // 2. MongoDB Vector Search
    const searchResults = await DocumentChunk.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 10,
        },
      },
      {
        $project: { _id: 0, fileName: 1, text: 1 },
      },
    ]);

    // 3. SSE Headers Set karo (Streaming ke liye zaroori hai)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (searchResults.length === 0) {
      res.write(
        `data: ${JSON.stringify({ text: "I couldn't find any relevant documents." })}\n\n`,
      );
      return res.end();
    }

    // 4. Pehle Source Files bhej do
    const uniqueSources = [...new Set(searchResults.map((s) => s.fileName))];
    res.write(`data: ${JSON.stringify({ sources: uniqueSources })}\n\n`);

    // 5. Stream the AI response
    const stream = await generateChatStream(message, searchResults);

    for await (const chunk of stream) {
      const chunkText = chunk.text();
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    // Signal that streaming is done
    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error) {
    console.error('Chat Error:', error);
    // 🔥 FIX: Agar streaming start nahi hui thi, tabhi JSON error bhejo
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process chat' });
    } else {
      // Agar streaming ke beech mein AI fail ho jaye, toh frontend ko bata do
      res.write(
        `data: ${JSON.stringify({ text: '\n\n[AI Response Failed. Please try again.]' })}\n\n`,
      );
      res.write(`data: [DONE]\n\n`);
      res.end();
    }
  }
};
