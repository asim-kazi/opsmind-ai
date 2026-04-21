const fs = require('fs');
const pdf = require('pdf-parse');

async function extractPDFText(filePath) {
  try {
    // 1. File ko buffer (raw data) mein read karo
    const dataBuffer = fs.readFileSync(filePath);

    // 2. pdf-parse library se text extract karo
    const data = await pdf(dataBuffer);

    // 3. Text return karo
    return data.text;
  } catch (error) {
    console.error('🔥 PDF Extraction Error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

module.exports = extractPDFText;
