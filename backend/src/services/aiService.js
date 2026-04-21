const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. EMBEDDING FUNCTION (Vector banane ke liye)
async function generateEmbedding(text) {
  try {
    // 🔥 Wahi exact model name jo aapke system par perfectly chala tha
    const model = genAI.getGenerativeModel({
      model: 'models/gemini-embedding-001',
    });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Embedding Error:', error);
    throw new Error('Failed to generate embedding');
  }
}

// 2. CHAT FUNCTION (Answer dene ke liye)
async function generateChatStream(query, contextChunks) {
  try {
    // 🔥 FIX: Using the universally available 'gemini-pro' model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
        You are OpsMind AI, a highly accurate Enterprise SOP Assistant.
        Read the provided CONTEXT below carefully to answer the USER QUESTION.

        USER QUESTION: ${query}

        STRICT INSTRUCTIONS:
        1. Answer ONLY what the user is asking. If they ask for "Scope", do not provide "Aim".
        2. DO NOT put references or source names in the middle of your text. 
        3. Write your answer beautifully using Markdown (bold headings, bullet points).
        4. If you see isolated numbers at the bottom of the text (like 8, 9, 14), treat them as Page Numbers.
        5. AT THE VERY END of your response, you MUST add a horizontal line and list the exact references.

        REQUIRED OUTPUT FORMAT:
        [Your detailed, nicely formatted answer here]

        ---
        **References:**
        * **Document:** [Source Filename]
        * **Section:** [Mention the Heading/Section name, e.g., 'Scope and Limitation']
        * **Page:** [Mention Page number if found, else write 'N/A']

        CONTEXT:
        ${contextChunks.map((c) => `[File: ${c.fileName}]\n${c.text}`).join('\n\n-----\n\n')}
        `;

    const result = await model.generateContentStream(prompt);
    return result.stream;
  } catch (error) {
    console.error('Chat Generation Error:', error);
    throw new Error('Failed to generate AI response');
  }
}

module.exports = { generateEmbedding, generateChatStream };
