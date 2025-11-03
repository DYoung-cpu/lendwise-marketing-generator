/**
 * Test Google AI API Key
 * Validates key and checks Veo access
 */

import { testGoogleAPIKey, generateVideoWithGoogle, estimateGoogleCost } from './google-veo-service.js';

async function runTests() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   🔑 GOOGLE AI API KEY VALIDATION                  ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  // Test 1: Validate API Key
  console.log('TEST 1: Validating API Key...\n');
  const keyTest = await testGoogleAPIKey();

  console.log('\n═══════════════════════════════════════════════════');
  console.log('RESULTS:');
  console.log('═══════════════════════════════════════════════════');
  console.log(`API Key Valid: ${keyTest.valid ? '✅' : '❌'}`);
  console.log(`Veo Access: ${keyTest.hasVeoAccess ? '✅' : '❌'}`);
  console.log(`Message: ${keyTest.message}`);
  console.log('═══════════════════════════════════════════════════\n');

  if (!keyTest.valid) {
    console.log('❌ API key is invalid. Please check your key and try again.\n');
    return;
  }

  if (!keyTest.hasVeoAccess) {
    console.log('⚠️  API key works but Veo access requires billing.\n');
    console.log('💡 OPTIONS:');
    console.log('   1. Enable billing at: https://console.cloud.google.com/billing');
    console.log('   2. Use free $300 Google Cloud credits if available');
    console.log('   3. Continue with Runway (cheaper anyway: $0.40/sec vs $0.75/sec)\n');
    return;
  }

  // Test 2: Try generating a test video
  console.log('\nTEST 2: Attempting video generation...\n');

  const testPrompt = `Professional financial video with large gold text displaying "TEST" in center. Dark blue background. 4 seconds. Text stays static, camera zooms forward.`;

  console.log('🎬 Generating test video with Veo 3.1...');
  console.log(`📝 Prompt: ${testPrompt}\n`);

  const result = await generateVideoWithGoogle(testPrompt, {
    model: 'veo-3.1',
    duration: 4,
    aspectRatio: '1080:1920'
  });

  console.log('\n═══════════════════════════════════════════════════');
  console.log('VIDEO GENERATION RESULT:');
  console.log('═══════════════════════════════════════════════════');

  if (result.success) {
    console.log('✅ SUCCESS! Video generated via Google API!');
    console.log(`📹 Video URL: ${result.videoUrl}`);
    console.log(`💰 Cost: $${result.cost.toFixed(2)}`);
    console.log(`⏱️  Duration: ${result.duration}s`);
    console.log(`📐 Aspect Ratio: ${result.aspectRatio}`);
  } else {
    console.log('❌ FAILED to generate video');
    console.log(`Error: ${result.error}`);
  }

  console.log('═══════════════════════════════════════════════════\n');

  // Test 3: Cost comparison
  console.log('\n═══════════════════════════════════════════════════');
  console.log('💰 COST COMPARISON:');
  console.log('═══════════════════════════════════════════════════');

  const googleCost = estimateGoogleCost(4, 'veo-3.1');
  const runwayCost = 4 * 0.40; // Runway veo3.1
  const runwayFastCost = 4 * 0.20; // Runway veo3.1_fast

  console.log(`Google Veo 3.1 (4s):     $${googleCost.totalCost.toFixed(2)}`);
  console.log(`Runway Veo 3.1 (4s):     $${runwayCost.toFixed(2)} ⭐ (47% cheaper!)`);
  console.log(`Runway Veo 3.1 Fast (4s): $${runwayFastCost.toFixed(2)} ⭐⭐ (73% cheaper!)\n`);

  // Final recommendations
  console.log('═══════════════════════════════════════════════════');
  console.log('💡 RECOMMENDATIONS:');
  console.log('═══════════════════════════════════════════════════');

  if (keyTest.hasVeoAccess && result.success) {
    console.log('✅ Google API works with Veo!');
    console.log('\n📊 STRATEGY:');
    console.log('   Option A: Use Google for free tier/trial credits');
    console.log('   Option B: Use Runway for better pricing ($0.20-0.40/sec)');
    console.log('   Option C: I can create dual-provider system (Google first, Runway fallback)');
  } else if (keyTest.valid && !keyTest.hasVeoAccess) {
    console.log('⚠️  Google key works but Veo needs billing');
    console.log('\n📊 STRATEGY:');
    console.log('   RECOMMENDED: Stick with Runway (47% cheaper)');
    console.log('   - You have 195 Runway credits ($1.95) ready to use');
    console.log('   - Runway pricing beats Google direct pricing');
    console.log('   - Everything already set up and working');
  } else {
    console.log('❌ Key validation failed');
    console.log('\n📊 STRATEGY:');
    console.log('   - Continue with Runway (proven working)');
    console.log('   - Better pricing anyway');
  }

  console.log('═══════════════════════════════════════════════════\n');
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test script error:', error);
  process.exit(1);
});
