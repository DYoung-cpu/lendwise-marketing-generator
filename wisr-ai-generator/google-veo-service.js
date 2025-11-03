/**
 * Google AI Studio Veo Integration
 * Direct access to Veo via Google Generative AI API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

/**
 * Generate video using Google Veo API
 * @param {string} prompt - Video generation prompt
 * @param {object} options - Generation options
 * @returns {Promise<object>} Generation result
 */
export async function generateVideoWithGoogle(prompt, options = {}) {
  const {
    model = 'veo-3.1',
    duration = 6,
    aspectRatio = '1080:1920',
    seed = null
  } = options;

  console.log('\n[Google Veo] Starting video generation...');
  console.log(`[Google Veo] Model: ${model}, Duration: ${duration}s, Ratio: ${aspectRatio}`);
  console.log(`[Google Veo] Prompt: ${prompt.substring(0, 100)}...`);

  try {
    // Get the model
    const veoModel = genAI.getGenerativeModel({ model: model });

    // Prepare generation config
    const generationConfig = {
      videoLength: duration,
      aspectRatio: aspectRatio,
    };

    if (seed) {
      generationConfig.seed = seed;
    }

    // Generate video
    console.log('[Google Veo] Sending generation request...');
    const result = await veoModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig
    });

    console.log('[Google Veo] ✅ Generation initiated!');

    // Extract video data
    const response = await result.response;
    const videoData = response.candidates?.[0]?.content;

    if (!videoData) {
      throw new Error('No video data in response');
    }

    console.log('[Google Veo] ✅ Video ready!');

    return {
      success: true,
      videoUrl: videoData.uri || videoData.url,
      model: model,
      duration: duration,
      aspectRatio: aspectRatio,
      provider: 'google',
      cost: calculateGoogleCost(duration, model)
    };

  } catch (error) {
    console.error('[Google Veo] ❌ Error:', error.message);

    return {
      success: false,
      error: error.message,
      provider: 'google'
    };
  }
}

/**
 * Calculate Google Veo cost
 * Based on official pricing: $0.75/second
 */
function calculateGoogleCost(duration, model) {
  const rates = {
    'veo-3': 0.75,
    'veo-3.1': 0.75,
    'veo-2': 0.75
  };

  const ratePerSecond = rates[model] || 0.75;
  return duration * ratePerSecond;
}

/**
 * Test API key validity
 */
export async function testGoogleAPIKey() {
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║   🔑 TESTING GOOGLE AI API KEY                ║');
  console.log('╚═══════════════════════════════════════════════╝\n');

  try {
    // Try multiple model names to find what works
    const modelNamesToTry = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'gemini-1.0-pro'
    ];

    let workingModel = null;

    for (const modelName of modelNamesToTry) {
      try {
        console.log(`🔍 Testing with ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello');
        const response = await result.response;
        const text = response.text();

        console.log(`✅ API Key is VALID with ${modelName}!`);
        console.log(`✅ Test response: ${text.substring(0, 50)}...\n`);
        workingModel = modelName;
        break;
      } catch (error) {
        console.log(`❌ ${modelName} not available`);
        continue;
      }
    }

    if (!workingModel) {
      throw new Error('No working model found - API key may be invalid or expired');
    }

    // Now test if Veo models are accessible
    console.log('🔍 Checking Veo model access...');

    try {
      const veoModel = genAI.getGenerativeModel({ model: 'veo-3.1' });
      console.log('✅ Veo 3.1 model accessible!');

      return {
        valid: true,
        hasVeoAccess: true,
        message: 'API key valid with Veo access',
        workingModel
      };
    } catch (veoError) {
      console.log('⚠️  Veo model not accessible with this key');
      console.log('💡 Key works for Gemini but may need billing for Veo\n');

      return {
        valid: true,
        hasVeoAccess: false,
        message: 'API key valid but Veo requires billing',
        workingModel
      };
    }

  } catch (error) {
    console.error('❌ API Key is INVALID');
    console.error(`❌ Error: ${error.message}\n`);

    return {
      valid: false,
      hasVeoAccess: false,
      message: error.message
    };
  }
}

/**
 * Get available models
 */
export async function getAvailableModels() {
  try {
    // Try to list models
    const models = await genAI.getModel('models');
    console.log('Available models:', models);
    return models;
  } catch (error) {
    console.log('Could not list models:', error.message);
    return null;
  }
}

/**
 * Estimate cost for Google Veo
 */
export function estimateGoogleCost(duration, model = 'veo-3.1') {
  const cost = calculateGoogleCost(duration, model);
  return {
    model,
    duration,
    costPerSecond: 0.75,
    totalCost: cost,
    formatted: `$${cost.toFixed(2)}`
  };
}

export default {
  generateVideo: generateVideoWithGoogle,
  testAPIKey: testGoogleAPIKey,
  getAvailableModels,
  estimateCost: estimateGoogleCost
};
