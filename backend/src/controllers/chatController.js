const {
  generateEmbedding,
  generateChatStream,
} = require('../services/aiService');
const DocumentChunk = require('../models/DocumentChunk');

exports.handleChat = async (req, res) => {
  try {
    const {
      message,

      uploadedFiles = [],
    } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    // 1. User ke message ka vector banao
    const queryEmbedding = await generateEmbedding(message);

    // 2. MongoDB Vector Search
    let searchResults = await DocumentChunk.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',

          path: 'embedding',

          queryVector: queryEmbedding,

          numCandidates: 100,

          limit: 15,
        },
      },

      {
        $project: {
          _id: 0,

          fileName: 1,

          text: 1,
        },
      },
    ]);

    // 🔥 Session file filter

    if (uploadedFiles.length > 0) {
      searchResults = searchResults.filter((doc) =>
        uploadedFiles.includes(doc.fileName),
      );
    }

    // 3. SSE Headers Set karo (Streaming ke liye zaroori hai)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (uploadedFiles.length === 0) {
      const stream = await generateChatStream(
        message,

        [],
      );

      for await (const chunk of stream) {
        res.write(
          `data: ${JSON.stringify({
            text: chunk.text(),
          })}\n\n`,
        );
      }

      res.write(`data: [DONE]\n\n`);

      return res.end();
    }

    if (searchResults.length === 0) {
      res.write(
        `data:${JSON.stringify({
          text: 'No relevant information found in uploaded PDFs.',
        })}\n\n`,
      );

      res.write(`data:[DONE]\n\n`);

      return res.end();
    }

    // 4. Pehle Source Files bhej do
    const uniqueSources = [...new Set(searchResults.map((s) => s.fileName))];
    res.write(`data: ${JSON.stringify({ sources: uniqueSources })}\n\n`);

    // 5. Stream the AI response
    let stream;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        stream = await generateChatStream(
          message,

          searchResults,
        );

        break;
      } catch (error) {
        console.log(`Retry ${attempt}`);

        if (attempt === 3) {
          throw error;
        }

        await new Promise((resolve) =>
          setTimeout(
            resolve,

            2000,
          ),
        );
      }
    }

    for await (const chunk of stream) {
      const chunkText = chunk.text();
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    // Signal that streaming is done
    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error) {
    console.error('Chat Error:', error);
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
