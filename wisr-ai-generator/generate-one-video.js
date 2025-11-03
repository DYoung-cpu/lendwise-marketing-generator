/**
 * Generate Single Video - Manual Testing
 */

import { generateVideo } from './runway-service.js';
import { optimizedPromptsForVeo } from './veo-prompt-optimizer.js';

const strategyName = process.argv[2] || 'container';
const model = process.argv[3] || 'veo3.1_fast';
const duration = parseInt(process.argv[4]) || 4;

const strategies = {
  container: {
    name: 'Container-Based',
    prompt: optimizedPromptsForVeo.rateAlert
  },
  repetitive: {
    name: 'Repetitive Reinforcement',
    prompt: optimizedPromptsForVeo.comprehensiveRateAlert
  },
  wordbyword: {
    name: 'Word-by-Word',
    prompt: optimizedPromptsForVeo.rateAlertWordByWord
  },
  ultraexplicit: {
    name: 'Ultra-Explicit',
    prompt: optimizedPromptsForVeo.rateAlertUltraExplicit
  }
};

const strategy = strategies[strategyName];

if (!strategy) {
  console.error('❌ Unknown strategy. Use: container, repetitive, wordbyword, or ultraexplicit');
  process.exit(1);
}

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log(`║   🎬 GENERATING: ${strategy.name.toUpperCase().padEnd(42)} ║`);
console.log('╚═══════════════════════════════════════════════════════════╝\n');

const cost = duration * (model === 'veo3.1_fast' ? 20 : 40) * 0.01;

console.log(`📊 Configuration:`);
console.log(`   Strategy: ${strategy.name}`);
console.log(`   Model: ${model}`);
console.log(`   Duration: ${duration}s`);
console.log(`   Cost: $${cost.toFixed(2)} (${duration * (model === 'veo3.1_fast' ? 20 : 40)} credits)\n`);

console.log('━'.repeat(60));
console.log('PROMPT (first 300 chars):');
console.log('━'.repeat(60));
console.log(strategy.prompt.substring(0, 300) + '...\n');

console.log('🎬 Starting generation...\n');

const startTime = Date.now();

generateVideo(
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1920&h=1080&fit=crop',
  strategy.prompt,
  {
    model: model,
    ratio: '1080:1920',
    duration: duration,
    watermark: false
  }
).then(result => {
  const elapsed = Math.round((Date.now() - startTime) / 1000);

  if (result.success) {
    console.log(`\n✅ VIDEO GENERATED SUCCESSFULLY! (${elapsed}s)\n`);
    console.log('═'.repeat(60));
    console.log('📹 VIDEO URL:');
    console.log('═'.repeat(60));
    console.log(result.videoUrl);
    console.log('═'.repeat(60));
    console.log('\n💡 INSTRUCTIONS:');
    console.log('   1. Copy the URL above');
    console.log('   2. Paste it in your browser');
    console.log('   3. Watch the video\n');
    console.log('✅ CHECK FOR:');
    console.log('   • "30-Year Fixed" - spelled correctly (F-I-X-E-D)?');
    console.log('   • "LENDWISE MORTGAGE" - spelled correctly?');
    console.log('   • "6.25%" - formatted correctly?');
    console.log('   • Gold metallic text styling?');
    console.log('   • Professional animation quality?\n');
    console.log(`💰 Cost: $${cost.toFixed(2)}\n`);
  } else {
    console.log('\n❌ VIDEO GENERATION FAILED!\n');
    console.log(`Error: ${result.error}\n`);
  }
}).catch(error => {
  console.error('\n💥 ERROR:', error.message, '\n');
  process.exit(1);
});
