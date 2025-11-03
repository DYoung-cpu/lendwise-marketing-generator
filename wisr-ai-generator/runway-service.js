/**
 * Runway API Service
 * Handles video generation using multiple AI models
 *
 * Model Costs (1 credit = $0.01):
 * - gen4_turbo: 5 credits/sec = $0.50 per 10-sec video
 * - veo3: 40 credits/sec = $4.00 per 10-sec video
 * - veo3.1: 40 credits/sec = $4.00 per 10-sec video
 * - veo3.1_fast: 20 credits/sec = $2.00 per 10-sec video
 */

import RunwayML from '@runwayml/sdk';
import fs from 'fs';
import path from 'path';

// Lazy-initialize Runway client (only when first used)
let client = null;

function getClient() {
  if (!client) {
    client = new RunwayML({
      apiKey: process.env.RUNWAYML_API_SECRET,
      timeout: 60 * 1000 // 1 minute timeout for each request
    });
  }
  return client;
}

/**
 * Convert local file path to base64 data URI
 */
function fileToDataUri(filePath) {
  // If it's already a URL or data URI, return as-is
  if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('data:')) {
    return filePath;
  }

  // Read local file and convert to base64
  if (fs.existsSync(filePath)) {
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase().substring(1);
    const mimeType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
    const base64 = fileBuffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  }

  throw new Error(`File not found: ${filePath}`);
}

/**
 * Generate video from image using Runway API
 *
 * @param {string} imageUrl - URL of the branded image to animate
 * @param {string} promptText - Motion description (max 512 characters)
 * @param {Object} options - Video generation options
 * @returns {Promise<Object>} - Result with videoUrl or error
 */
export async function generateVideo(imageUrl, promptText, options = {}) {
  const {
    model = 'gen4_turbo', // Options: 'gen4_turbo', 'gen3a_turbo', 'veo3', 'veo3.1', 'veo3.1_fast'
    ratio = '1280:720',   // Options: '1280:720' (horizontal), '768:1280' (vertical)
    duration = 10,        // Options: Gen-4: 5 or 10 seconds | Veo: 4, 6, or 8 seconds
    watermark = false,    // Set to false (requires "Powered by Runway" badge elsewhere)
    seed = undefined      // Optional: for reproducible results
  } = options;

  console.log(`[Runway] Starting video generation...`);
  console.log(`[Runway] Model: ${model}, Ratio: ${ratio}, Duration: ${duration}s`);
  console.log(`[Runway] Prompt: ${promptText.substring(0, 100)}...`);

  try {
    // Convert local file paths to data URIs
    const promptImageData = fileToDataUri(imageUrl);
    console.log(`[Runway] Image converted to data URI (${promptImageData.substring(0, 50)}...)`);

    // Create image-to-video task
    const task = await getClient().imageToVideo.create({
      model,
      promptImage: promptImageData,
      promptText: promptText.substring(0, 512), // Enforce 512 char limit
      ratio,
      duration,
      watermark,
      ...(seed && { seed })
    });

    console.log(`[Runway] Task created: ${task.id}`);
    console.log(`[Runway] Status: ${task.status}`);

    // Poll for completion
    const result = await pollTaskCompletion(task.id);

    if (result.success) {
      console.log(`[Runway] ✅ Video generated successfully!`);
      console.log(`[Runway] Video URL: ${result.videoUrl}`);
    } else {
      console.error(`[Runway] ❌ Video generation failed: ${result.error}`);
    }

    return result;

  } catch (error) {
    console.error(`[Runway] ❌ API Error:`, error);

    if (error instanceof RunwayML.APIError) {
      return {
        success: false,
        error: `API Error: ${error.message}`,
        status: error.status,
        details: error.headers
      };
    }

    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Poll Runway task until completion
 *
 * @param {string} taskId - Runway task ID
 * @returns {Promise<Object>} - Result with videoUrl or error
 */
async function pollTaskCompletion(taskId) {
  const maxAttempts = 60;        // 60 attempts
  const pollInterval = 5000;     // 5 seconds between polls
  const maxWaitTime = maxAttempts * pollInterval / 1000; // 5 minutes total

  console.log(`[Runway] Polling task ${taskId}...`);
  console.log(`[Runway] Max wait time: ${maxWaitTime / 60} minutes`);

  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    try {
      const task = await getClient().tasks.retrieve(taskId);

      console.log(`[Runway] Poll ${attempts}/${maxAttempts} - Status: ${task.status}`);

      // Check if task succeeded
      if (task.status === 'SUCCEEDED') {
        // task.output is an array of video URLs
        const videoUrl = task.output && task.output[0];

        if (!videoUrl) {
          return {
            success: false,
            error: 'No video URL in successful task output',
            taskId
          };
        }

        return {
          success: true,
          videoUrl: videoUrl,
          taskId: task.id,
          status: task.status,
          attempts: attempts,
          timeElapsed: `${attempts * pollInterval / 1000}s`
        };
      }

      // Check if task failed
      if (task.status === 'FAILED') {
        return {
          success: false,
          error: task.failure || 'Task failed without error message',
          failureCode: task.failureCode,
          taskId: task.id,
          status: task.status,
          attempts: attempts
        };
      }

      // Task still in progress (PENDING, RUNNING, etc.)
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));

    } catch (error) {
      console.error(`[Runway] Error polling task:`, error);

      // If it's just a network error, keep trying
      if (attempts < maxAttempts) {
        console.log(`[Runway] Retrying in ${pollInterval / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        continue;
      }

      return {
        success: false,
        error: `Polling error: ${error.message}`,
        taskId,
        attempts: attempts
      };
    }
  }

  // Timeout reached
  return {
    success: false,
    error: `Timeout: Video generation exceeded ${maxWaitTime / 60} minutes`,
    taskId,
    attempts: attempts
  };
}

/**
 * Get task status (useful for async operations)
 *
 * @param {string} taskId - Runway task ID
 * @returns {Promise<Object>} - Task details
 */
export async function getTaskStatus(taskId) {
  try {
    const task = await getClient().tasks.retrieve(taskId);
    return {
      success: true,
      task: {
        id: task.id,
        status: task.status,
        progress: task.progress,
        output: task.output,
        failure: task.failure,
        failureCode: task.failureCode
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Estimate cost for video generation
 *
 * @param {number} durationSeconds - Video duration in seconds
 * @param {string} model - Model name (default: 'gen4_turbo')
 * @returns {Object} - Cost breakdown
 */
export function estimateCost(durationSeconds, model = 'gen4_turbo') {
  // Credits per second by model
  const modelPricing = {
    'gen4_turbo': 5,
    'gen3a_turbo': 5,
    'veo3': 40,
    'veo3.1': 40,
    'veo3.1_fast': 20
  };

  const creditsPerSecond = modelPricing[model] || 5;
  const creditCost = 0.01; // $0.01 per credit

  const totalCredits = durationSeconds * creditsPerSecond;
  const totalCost = totalCredits * creditCost;

  return {
    model: model,
    duration: durationSeconds,
    credits: totalCredits,
    cost: totalCost,
    formatted: `$${totalCost.toFixed(2)}`
  };
}

// Export default object with all functions
export default {
  generateVideo,
  getTaskStatus,
  estimateCost
};
