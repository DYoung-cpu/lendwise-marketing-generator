/**
 * Test Nano-Optimized Strategies One at a Time
 * Interactive testing with manual review between each video
 */

import { generateVideo } from './runway-service.js';
import { optimizedPromptsForVeo } from './veo-prompt-optimizer.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

const strategies = [
  {
    name: 'Container-Based',
    description: 'Most like Nano success - structured 3-container layout',
    prompt: optimizedPromptsForVeo.rateAlert,
    recommended: true
  },
  {
    name: 'Repetitive Reinforcement',
    description: 'Multiple verification passes with spell checks',
    prompt: optimizedPromptsForVeo.comprehensiveRateAlert
  },
  {
    name: 'Word-by-Word',
    description: 'Explicit specification of each word',
    prompt: optimizedPromptsForVeo.rateAlertWordByWord
  },
  {
    name: 'Ultra-Explicit',
    description: 'Letter-by-letter spelling verification',
    prompt: optimizedPromptsForVeo.rateAlertUltraExplicit
  }
];

async function testStrategy(strategy, index, model = 'veo3.1_fast', duration = 4) {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log(`║   TEST ${index + 1}/4: ${strategy.name.toUpperCase().padEnd(47)} ║`);
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  if (strategy.recommended) {
    console.log('⭐ RECOMMENDED STARTING STRATEGY ⭐\n');
  }

  console.log(`📋 Description: ${strategy.description}`);
  console.log(`🎬 Model: ${model}`);
  console.log(`⏱️  Duration: ${duration}s`);

  const cost = duration * (model === 'veo3.1_fast' ? 20 : 40) * 0.01;
  console.log(`💰 Cost: $${cost.toFixed(2)} (${duration * (model === 'veo3.1_fast' ? 20 : 40)} credits)\n`);

  console.log('━'.repeat(60));
  console.log('PROMPT PREVIEW (first 200 chars):');
  console.log('━'.repeat(60));
  console.log(strategy.prompt.substring(0, 200) + '...\n');

  const proceed = await question('Generate this video? (y/n): ');

  if (proceed.toLowerCase() !== 'y') {
    console.log('⏭️  Skipped.\n');
    return { skipped: true };
  }

  console.log('\n🎬 Generating video...\n');

  try {
    const result = await generateVideo(
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1920&h=1080&fit=crop',
      strategy.prompt,
      {
        model: model,
        ratio: '1080:1920',
        duration: duration,
        watermark: false
      }
    );

    if (result.success) {
      console.log('\n✅ VIDEO GENERATED SUCCESSFULLY!\n');
      console.log('═'.repeat(60));
      console.log('VIDEO URL:');
      console.log('═'.repeat(60));
      console.log(result.videoUrl);
      console.log('═'.repeat(60));
      console.log('\n💡 COPY THE URL ABOVE AND OPEN IT IN YOUR BROWSER!\n');
      console.log('📝 Check for these things:');
      console.log('   ✓ "30-Year Fixed" spelled correctly (not "Firted")');
      console.log('   ✓ "LENDWISE MORTGAGE" spelled correctly');
      console.log('   ✓ "6.25%" formatted correctly');
      console.log('   ✓ Gold metallic text styling');
      console.log('   ✓ Professional animation quality\n');

      return { success: true, videoUrl: result.videoUrl, cost };
    } else {
      console.log('\n❌ VIDEO GENERATION FAILED!\n');
      console.log(`Error: ${result.error}\n`);
      return { success: false, error: result.error };
    }

  } catch (error) {
    console.log('\n❌ ERROR DURING GENERATION!\n');
    console.log(`Error: ${error.message}\n`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   🎯 NANO-OPTIMIZED VEO 3.1 TESTING                        ║');
  console.log('║   Interactive One-at-a-Time Strategy Testing               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('💰 Budget: 2000 credits ($20.00)');
  console.log('🎬 Available Strategies: 4');
  console.log('📊 Estimated Cost: $0.80 - $1.60 per test\n');

  console.log('═'.repeat(60));
  console.log('TESTING PLAN:');
  console.log('═'.repeat(60));
  strategies.forEach((s, i) => {
    console.log(`${i + 1}. ${s.name}${s.recommended ? ' ⭐ (RECOMMENDED)' : ''}`);
    console.log(`   ${s.description}`);
  });
  console.log('═'.repeat(60));
  console.log('\n💡 TIP: Start with Container-Based (most like Nano)\n');

  const start = await question('Ready to start testing? (y/n): ');
  if (start.toLowerCase() !== 'y') {
    console.log('\nExiting...\n');
    rl.close();
    return;
  }

  let totalSpent = 0;
  const results = [];

  for (let i = 0; i < strategies.length; i++) {
    const result = await testStrategy(strategies[i], i);
    results.push({ strategy: strategies[i].name, ...result });

    if (result.skipped) {
      continue;
    }

    if (result.success) {
      totalSpent += result.cost;
      console.log(`\n💰 Total spent so far: $${totalSpent.toFixed(2)}\n`);
      console.log(`💳 Remaining credits: ${(2000 - (totalSpent * 100)).toFixed(0)}\n`);
    }

    if (i < strategies.length - 1) {
      console.log('\n' + '═'.repeat(60));
      console.log('REVIEW THE VIDEO ABOVE BEFORE CONTINUING');
      console.log('═'.repeat(60));

      const response = await question('\nWhat do you want to do?\n  (c) Continue to next strategy\n  (r) Retry this strategy\n  (s) Stop testing\nChoice: ');

      if (response.toLowerCase() === 's') {
        console.log('\n⏹️  Stopping tests...\n');
        break;
      } else if (response.toLowerCase() === 'r') {
        console.log('\n🔄 Retrying same strategy...\n');
        i--; // Retry same strategy
      }
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   📊 TESTING SUMMARY                                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('RESULTS:');
  results.forEach((r, i) => {
    const status = r.skipped ? '⏭️  Skipped' : r.success ? '✅ Success' : '❌ Failed';
    console.log(`${i + 1}. ${r.strategy}: ${status}`);
    if (r.success) {
      console.log(`   Cost: $${r.cost.toFixed(2)}`);
    }
  });

  console.log(`\n💰 Total Spent: $${totalSpent.toFixed(2)}`);
  console.log(`💳 Remaining Budget: $${(20 - totalSpent).toFixed(2)}\n`);

  rl.close();
}

runTests().catch(error => {
  console.error('💥 Fatal error:', error);
  rl.close();
  process.exit(1);
});
