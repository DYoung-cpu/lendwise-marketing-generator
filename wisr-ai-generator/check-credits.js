/**
 * Check Runway API Credit Balance
 */

import RunwayML from '@runwayml/sdk';

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET,
  timeout: 60 * 1000
});

async function checkCredits() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   💰 RUNWAY API CREDIT BALANCE CHECK        ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  try {
    console.log('🔍 Fetching organization info...\n');

    const orgInfo = await client.organizations.retrieve();

    console.log('═══════════════════════════════════════════════');
    console.log('ACCOUNT INFORMATION:');
    console.log('═══════════════════════════════════════════════');
    console.log(`Organization ID: ${orgInfo.id || 'N/A'}`);
    console.log(`Tier: ${orgInfo.tier || 'N/A'}`);

    if (orgInfo.credits !== undefined) {
      console.log(`\n💰 Credits Remaining: ${orgInfo.credits.toLocaleString()}`);
      console.log(`   (Worth: $${(orgInfo.credits * 0.01).toFixed(2)})`);
    } else {
      console.log('\n⚠️  Credit balance not available through API');
      console.log('   Please check: https://dev.runwayml.com/account');
    }

    console.log('═══════════════════════════════════════════════\n');

    // Calculate how much we've used today
    console.log('📊 ESTIMATED USAGE TODAY:');
    console.log('   Test 1 (veo3.1, 4s):      160 credits ($1.60)');
    console.log('   Test 2 (veo3.1_fast, 4s):  80 credits ($0.80)');
    console.log('   Previous test (veo3.1, 8s): 320 credits ($3.20)');
    console.log('   ─────────────────────────────────────────');
    console.log('   Total used:                560 credits ($5.60)');
    console.log('');

    // Provide guidance
    console.log('💡 NEXT STEPS:');
    console.log('   1. Check credit balance at: https://dev.runwayml.com/account');
    console.log('   2. Add credits if needed: https://dev.runwayml.com/account/billing');
    console.log('   3. Credits are pay-as-you-go ($0.01 per credit)');
    console.log('   4. No monthly subscription required!\n');

  } catch (error) {
    console.error('❌ Error fetching account info:', error.message);
    console.error('\nPossible reasons:');
    console.error('  - API key may not have permission to view account info');
    console.error('  - Need to check manually at: https://dev.runwayml.com/account');
    console.error('\nError details:', error);
  }

  console.log('════════════════════════════════════════════════\n');
}

checkCredits();
