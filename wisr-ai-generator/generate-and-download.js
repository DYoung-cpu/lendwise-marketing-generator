/**
 * Generate Video and Download Immediately
 */

import { generateVideo } from './runway-service.js';
import { optimizedPromptsForVeo } from './veo-prompt-optimizer.js';
import https from 'https';
import fs from 'fs';
import path from 'path';

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

function downloadVideo(url, filename) {
  return new Promise((resolve, reject) => {
    console.log(`\n📥 Downloading video to: ${filename}...`);

    const file = fs.createWriteStream(filename);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`✅ Video downloaded successfully!`);
        resolve(filename);
      });
    }).on('error', (err) => {
      fs.unlink(filename, () => {});
      reject(err);
    });
  });
}

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log(`║   🎬 GENERATING: ${strategy.name.toUpperCase().padEnd(42)} ║`);
console.log('╚═══════════════════════════════════════════════════════════╝\n');

const cost = duration * (model === 'veo3.1_fast' ? 20 : 40) * 0.01;

console.log(`📊 Configuration:`);
console.log(`   Strategy: ${strategy.name}`);
console.log(`   Model: ${model}`);
console.log(`   Duration: ${duration}s`);
console.log(`   Cost: $${cost.toFixed(2)}\n`);

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
).then(async result => {
  const elapsed = Math.round((Date.now() - startTime) / 1000);

  if (result.success) {
    console.log(`\n✅ VIDEO GENERATED! (${elapsed}s)\n`);

    // Download immediately
    const timestamp = Date.now();
    const downloadsPath = '/mnt/c/Users/dyoun/Downloads';
    const filename = path.join(downloadsPath, `veo-test-${strategyName}-${timestamp}.mp4`);

    try {
      await downloadVideo(result.videoUrl, filename);

      console.log('\n════════════════════════════════════════════════════════════');
      console.log('✅ SUCCESS! VIDEO SAVED TO YOUR DOWNLOADS FOLDER');
      console.log('════════════════════════════════════════════════════════════');
      console.log(`\n📁 File Location:\n   ${filename}\n`);
      console.log('💡 INSTRUCTIONS:');
      console.log('   1. Open your Downloads folder');
      console.log(`   2. Find: veo-test-${strategyName}-${timestamp}.mp4`);
      console.log('   3. Double-click to watch\n');
      console.log('✅ CHECK FOR:');
      console.log('   • "30-Year Fixed" - spelled F-I-X-E-D (not "Firted")?');
      console.log('   • "LENDWISE MORTGAGE" - spelled correctly?');
      console.log('   • "6.25%" - formatted correctly?');
      console.log('   • Gold metallic text styling?');
      console.log('   • Professional animation quality?\n');
      console.log(`💰 Cost: $${cost.toFixed(2)}\n`);

    } catch (downloadError) {
      console.error('\n❌ DOWNLOAD FAILED:', downloadError.message);
      console.log('\n📹 But video URL is:');
      console.log(result.videoUrl);
      console.log('\n⚠️  Try copying this URL quickly before it expires!\n');
    }

  } else {
    console.log('\n❌ VIDEO GENERATION FAILED!\n');
    console.log(`Error: ${result.error}\n`);
  }
}).catch(error => {
  console.error('\n💥 ERROR:', error.message, '\n');
  process.exit(1);
});
