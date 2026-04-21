require('dotenv').config();

async function checkModels() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    );
    const data = await response.json();

    console.log('✅ AAPKI API KEY PAR YE MODELS ALLOWED HAIN:\n');
    data.models.forEach((m) => {
      // Sirf wo models dikhayenge jo text generate kar sakte hain
      if (m.supportedGenerationMethods.includes('generateContent')) {
        console.log(`➡️ Model Name: ${m.name.replace('models/', '')}`);
      }
    });
    console.log(
      '\nUpar di gayi list mein se koi ek naam copy karo aur aiService.js mein daal do!',
    );
  } catch (error) {
    console.log('Error checking models:', error);
  }
}

checkModels();
