// API Configuration Template
// Copy this file to 'config.js' and add your API keys

const API_KEYS = {
    // Get your Gemini API key from: https://makersuite.google.com/app/apikey
    GEMINI: 'YOUR_GEMINI_API_KEY_HERE',

    // Get your Ideogram API key from: https://ideogram.ai/
    IDEOGRAM: 'YOUR_IDEOGRAM_API_KEY_HERE',

    // Get your OpenAI API key from: https://platform.openai.com/api-keys
    OPENAI: 'YOUR_OPENAI_API_KEY_HERE'
};

// Don't modify below this line
if (typeof window !== 'undefined') {
    window.API_KEYS = API_KEYS;
}
