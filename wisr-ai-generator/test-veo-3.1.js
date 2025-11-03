/**
 * Test Google Veo 3.1 Video Generation
 * Generates a mortgage rate alert video to test quality and text accuracy
 */

import { generateVideo, estimateCost } from './runway-service.js';
import { buildRunwayPrompt } from './runway-prompts.js';

// Test configuration
const TEST_CONFIG = {
  // Use a sample rate alert image (you can replace with actual image URL)
  imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1280&h=720&fit=crop',

  // Model to test
  model: 'veo3.1', // Options: 'veo3.1', 'veo3.1_fast', 'veo3'

  // Video settings
  duration: 8, // seconds (Veo 3.1 supports 4, 6, or 8)
  ratio: '1280:720', // horizontal format for social media

  // Prompt type
  templateType: 'rateAlert'
};

async function testVeo31() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🎬 TESTING GOOGLE VEO 3.1 - MORTGAGE RATE ALERT');
  console.log('═══════════════════════════════════════════════════\n');

  // Show cost estimate
  const costEstimate = estimateCost(TEST_CONFIG.duration, TEST_CONFIG.model);
  console.log('💰 COST ESTIMATE:');
  console.log(`   Model: ${costEstimate.model}`);
  console.log(`   Duration: ${costEstimate.duration} seconds`);
  console.log(`   Credits: ${costEstimate.credits}`);
  console.log(`   Cost: ${costEstimate.formatted}\n`);

  // Build prompt
  const prompt = buildRunwayPrompt(TEST_CONFIG.templateType,
    'Show mortgage rate dropping from 7.5% to 6.25%. Numbers must be crystal clear and readable.'
  );

  console.log('📝 PROMPT:');
  console.log(`   "${prompt}"\n`);

  console.log('🎥 GENERATING VIDEO...');
  console.log(`   This may take 1-3 minutes for Veo 3.1\n`);

  try {
    const result = await generateVideo(
      TEST_CONFIG.imageUrl,
      prompt,
      {
        model: TEST_CONFIG.model,
        duration: TEST_CONFIG.duration,
        ratio: TEST_CONFIG.ratio,
        watermark: false
      }
    );

    if (result.success) {
      console.log('\n✅ VIDEO GENERATED SUCCESSFULLY!\n');
      console.log('═══════════════════════════════════════════════════');
      console.log('📊 RESULTS:');
      console.log('═══════════════════════════════════════════════════');
      console.log(`Task ID: ${result.taskId}`);
      console.log(`Status: ${result.status}`);
      console.log(`Time Elapsed: ${result.timeElapsed}`);
      console.log(`Attempts: ${result.attempts}`);
      console.log(`\n🎬 VIDEO URL:\n${result.videoUrl}`);
      console.log('\n💡 Copy the URL above and paste into your browser to view\n');

      // Show comparison with current direct Veo subscription
      console.log('═══════════════════════════════════════════════════');
      console.log('💰 COST COMPARISON (45 videos/month):');
      console.log('═══════════════════════════════════════════════════');
      console.log(`Current Direct Veo Subscription: $250.00/month`);
      console.log(`Runway Veo 3.1:                  $${(costEstimate.cost * 45).toFixed(2)}/month`);
      console.log(`Runway Veo 3.1 Fast:             $${(estimateCost(TEST_CONFIG.duration, 'veo3.1_fast').cost * 45).toFixed(2)}/month`);
      console.log(`Runway Gen-4 Turbo:              $${(estimateCost(TEST_CONFIG.duration, 'gen4_turbo').cost * 45).toFixed(2)}/month`);

      const savings = 250 - (costEstimate.cost * 45);
      if (savings > 0) {
        console.log(`\n💵 POTENTIAL SAVINGS: $${savings.toFixed(2)}/month with Runway API`);
      }
      console.log('\n');

    } else {
      console.error('\n❌ VIDEO GENERATION FAILED\n');
      console.error('Error:', result.error);
      if (result.failureCode) {
        console.error('Failure Code:', result.failureCode);
      }
      console.error('\n');
    }

  } catch (error) {
    console.error('\n❌ UNEXPECTED ERROR:\n');
    console.error(error);
    console.error('\n');
  }
}

// Run test
console.log('\nStarting Veo 3.1 test...\n');
testVeo31();
