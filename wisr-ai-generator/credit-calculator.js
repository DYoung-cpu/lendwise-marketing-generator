/**
 * Credit Calculator - See what you can afford with remaining credits
 */

const CURRENT_CREDITS = 195;
const CREDIT_COST = 0.01;

const models = {
  'veo3.1': 40,        // credits per second
  'veo3.1_fast': 20,   // credits per second
  'gen4_turbo': 5      // credits per second
};

console.log('\n╔═══════════════════════════════════════════════╗');
console.log('║   💰 CREDIT CALCULATOR                        ║');
console.log('╚═══════════════════════════════════════════════╝\n');

console.log(`Current Balance: ${CURRENT_CREDITS} credits ($${(CURRENT_CREDITS * CREDIT_COST).toFixed(2)})\n`);

console.log('═══════════════════════════════════════════════');
console.log('WHAT YOU CAN STILL GENERATE:');
console.log('═══════════════════════════════════════════════\n');

// Calculate for each model
for (const [model, creditsPerSecond] of Object.entries(models)) {
  console.log(`${model.toUpperCase()}:`);

  for (const duration of [4, 6, 8]) {
    const totalCredits = duration * creditsPerSecond;
    const canAfford = Math.floor(CURRENT_CREDITS / totalCredits);
    const cost = totalCredits * CREDIT_COST;

    if (canAfford > 0) {
      console.log(`  ✅ ${duration}s videos: ${canAfford} video(s) @ $${cost.toFixed(2)} each (${totalCredits} credits)`);
    } else {
      console.log(`  ❌ ${duration}s videos: NOT ENOUGH (need ${totalCredits} credits, have ${CURRENT_CREDITS})`);
    }
  }
  console.log('');
}

console.log('═══════════════════════════════════════════════');
console.log('💡 RECOMMENDED STRATEGY:');
console.log('═══════════════════════════════════════════════\n');

console.log('Option 1: Test veo3.1_fast quality (BEST VALUE)');
console.log('  • Generate 2 videos at 4s each ($1.60 total)');
console.log('  • Or 1 video at 8s ($1.60 total)');
console.log('  • See if quality is good enough vs full veo3.1\n');

console.log('Option 2: One more veo3.1 comparison');
console.log('  • Generate 1 video at 4s ($1.60)');
console.log('  • Direct comparison with your earlier veo3.1_fast\n');

console.log('Option 3: Save credits and add more');
console.log('  • Add $25-50 in credits');
console.log('  • Run full 8-video test suite');
console.log('  • Make comprehensive decision\n');

console.log('═══════════════════════════════════════════════\n');
