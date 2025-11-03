/**
 * Comprehensive Veo 3.1 Test Suite
 * Tests multiple scenarios optimized for different social media platforms
 *
 * Run: node comprehensive-veo-test.js
 */

import { generateVideo, estimateCost } from './runway-service.js';

// Test image URL (replace with actual LendWise branded image)
const TEST_IMAGE = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1920&h=1080&fit=crop';

// Comprehensive test scenarios
const TEST_SCENARIOS = [
  {
    id: 1,
    name: 'Rate Alert - Vertical (Instagram Reels)',
    model: 'veo3.1',
    ratio: '1080:1920',
    duration: 6,
    platform: 'Instagram Reels, TikTok, YouTube Shorts',
    prompt: `LENDWISE MORTGAGE gold metallic logo at top. Large bold white text displays "RATES DROPPED!" in center. Below shows "6.25%" in huge glowing gold numbers. Small text underneath: "30-Year Fixed" spelled correctly F-I-X-E-D. Background: dark navy blue gradient with floating gold sparkle particles. Smooth cinematic zoom pushing toward the 6.25% rate. Text stays perfectly sharp and static. Shallow depth of field with bokeh effects. Professional broadcast lighting. Premium financial news aesthetic. Dramatic lens flares. High-end corporate presentation quality. Attention-grabbing for social media scrolling.`,
  },

  {
    id: 2,
    name: 'Rate Alert - Horizontal (Facebook/LinkedIn)',
    model: 'veo3.1',
    ratio: '1280:720',
    duration: 8,
    platform: 'Facebook, LinkedIn, Twitter/X',
    prompt: `Professional financial presentation. LENDWISE MORTGAGE gold branding prominent at top left. Center displays large crisp white text: "MORTGAGE RATES AT 5-YEAR LOW". Below shows "6.25%" in massive gold metallic numbers. Subtext: "30-Year Fixed | Lock In Today". All text perfectly sharp and readable. Background: sophisticated dark blue to black gradient. Floating gold particle effects creating depth. Smooth horizontal camera pan with parallax. Professional parallax between foreground text and background. Cinematic lighting with subtle lens flares. High-end financial broadcast aesthetic. Trust and authority visual language.`,
  },

  {
    id: 3,
    name: 'Market Intelligence - Premium HD',
    model: 'veo3.1',
    ratio: '1920:1080',
    duration: 8,
    platform: 'YouTube, Premium LinkedIn',
    prompt: `Premium market intelligence update. LENDWISE MORTGAGE gold logo top right. Main headline in bold white: "MARKET UPDATE: RATES TRENDING DOWN". Three data points displayed as clean white cards with gold accents: "30-Yr: 6.25%", "15-Yr: 5.75%", "FHA: 6.0%". Small date stamp: "October 2025". All text ultra-sharp, crisp, perfectly readable. Background: sophisticated animated financial graph subtle in background, dark blue atmospheric. Smooth dolly camera push forward. Professional depth separation between text layers. Soft bokeh particles floating. Premium business intelligence aesthetic. TV broadcast quality lighting. Authority and expertise visual style.`,
  },

  {
    id: 4,
    name: 'Educational - Down Payment Myths',
    model: 'veo3.1',
    ratio: '1080:1920',
    duration: 6,
    platform: 'Instagram Reels, Stories',
    prompt: `Educational mortgage content. LENDWISE MORTGAGE branding at top. Large bold text at center: "MYTH: You Need 20% Down". Below in contrasting style: "TRUTH: As Low As 3% Down". All text crystal clear and readable. Background: modern gradient from deep blue to purple. Animated light particles rising upward suggesting revelation. Text remains completely static and sharp. Gentle camera tilt upward with depth. Professional educational design. Apple keynote presentation aesthetic. Clean modern typography. Approachable expert authority. Trustworthy educational tone. Premium instructional quality. Social media optimized for vertical viewing.`,
  },

  {
    id: 5,
    name: 'Client Testimonial - Success Story',
    model: 'veo3.1',
    ratio: '1080:1920',
    duration: 8,
    platform: 'Instagram Reels, TikTok',
    prompt: `Client success story. LENDWISE MORTGAGE gold branding subtle at top. Centered white text quote: "David helped us buy our dream home with only 5% down". Attribution below: "- The Johnsons, San Diego". All text perfectly crisp. Background: warm golden hour bokeh blur, suggesting home/happiness. Soft glowing light particles. Slow intimate camera push in toward text. Shallow depth of field creating warmth. Text stays sharp while background blurs. Emotional yet professional aesthetic. Netflix documentary quality. Cinematic warmth with premium feel. Trust and authenticity. Celebration and joy visual language.`,
  },

  {
    id: 6,
    name: 'Quick Alert - Twitter Format',
    model: 'veo3.1',
    ratio: '1280:720',
    duration: 4,
    platform: 'Twitter/X, Quick Social',
    prompt: `Urgent rate alert. LENDWISE MORTGAGE branding. Bold white text: "BREAKING: Fed Cuts Rates". Prominent gold "6.25%" below. Text ultra-sharp. Dark professional background. Quick attention-grabbing zoom. Gold sparkles. Broadcast news aesthetic. Fast-paced professional. Text static and readable. High impact for scrolling feeds.`,
  },

  {
    id: 7,
    name: 'Premium Branding - Vertical 720p',
    model: 'veo3.1',
    ratio: '720:1280',
    duration: 8,
    platform: 'Instagram Stories (optimized)',
    prompt: `Premium personal branding. LENDWISE MORTGAGE gold metallic branding center top. Main message: "Your Trusted Mortgage Expert" in elegant serif font. Subtext: "30+ Years Combined Experience". Bottom: "David Young | NMLS #12345". All text crystal clear, perfectly readable. Background: luxury real estate atmosphere, dark with gold accent lighting. Elegant subtle motion, slow confident camera movement. Shallow depth creating sophistication. Professional yet approachable. Executive presentation quality. Premium luxury real estate aesthetic. LinkedIn optimized personal brand. High-end professional authority. Trust and expertise visual language.`,
  },

  {
    id: 8,
    name: 'FAST Model Test - Rate Alert Vertical',
    model: 'veo3.1_fast',
    ratio: '1080:1920',
    duration: 6,
    platform: 'Instagram Reels (Fast comparison)',
    prompt: `LENDWISE MORTGAGE gold metallic logo at top. Large bold white text displays "RATES DROPPED!" in center. Below shows "6.25%" in huge glowing gold numbers. Small text underneath: "30-Year Fixed" spelled correctly F-I-X-E-D. Background: dark navy blue gradient with floating gold sparkle particles. Smooth cinematic zoom pushing toward the 6.25% rate. Text stays perfectly sharp and static. Shallow depth of field with bokeh effects. Professional broadcast lighting. Premium financial news aesthetic. Dramatic lens flares. High-end corporate presentation quality. Attention-grabbing for social media scrolling.`,
    note: 'SAME AS TEST #1 but using veo3.1_fast - Compare quality vs cost savings'
  }
];

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

// Results storage
const results = [];

/**
 * Run a single test scenario
 */
async function runTest(scenario) {
  console.log(`\n${colors.cyan}${'═'.repeat(80)}${colors.reset}`);
  console.log(`${colors.bright}TEST ${scenario.id}: ${scenario.name}${colors.reset}`);
  console.log(`${colors.cyan}${'═'.repeat(80)}${colors.reset}`);

  console.log(`\n${colors.blue}📱 Platform:${colors.reset} ${scenario.platform}`);
  console.log(`${colors.blue}🎥 Model:${colors.reset} ${scenario.model}`);
  console.log(`${colors.blue}📐 Ratio:${colors.reset} ${scenario.ratio}`);
  console.log(`${colors.blue}⏱️  Duration:${colors.reset} ${scenario.duration} seconds`);

  if (scenario.note) {
    console.log(`${colors.yellow}📝 Note:${colors.reset} ${scenario.note}`);
  }

  // Calculate cost
  const cost = estimateCost(scenario.duration, scenario.model);
  console.log(`\n${colors.yellow}💰 Cost:${colors.reset} ${cost.formatted} (${cost.credits} credits)`);

  console.log(`\n${colors.blue}📝 Prompt (${scenario.prompt.length} chars):${colors.reset}`);
  console.log(`   "${scenario.prompt.substring(0, 150)}..."\n`);

  console.log(`${colors.cyan}🎬 Generating video...${colors.reset}`);
  const startTime = Date.now();

  try {
    const result = await generateVideo(
      TEST_IMAGE,
      scenario.prompt,
      {
        model: scenario.model,
        duration: scenario.duration,
        ratio: scenario.ratio,
        watermark: false
      }
    );

    const elapsedTime = Math.round((Date.now() - startTime) / 1000);

    if (result.success) {
      console.log(`\n${colors.green}✅ SUCCESS!${colors.reset} Generated in ${elapsedTime}s`);
      console.log(`${colors.green}🎬 Video URL:${colors.reset}`);
      console.log(`   ${result.videoUrl}\n`);

      results.push({
        ...scenario,
        success: true,
        videoUrl: result.videoUrl,
        generationTime: elapsedTime,
        cost: cost.cost
      });

    } else {
      console.log(`\n${colors.red}❌ FAILED${colors.reset}`);
      console.log(`${colors.red}Error:${colors.reset} ${result.error}\n`);

      results.push({
        ...scenario,
        success: false,
        error: result.error,
        generationTime: elapsedTime
      });
    }

  } catch (error) {
    const elapsedTime = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n${colors.red}❌ EXCEPTION${colors.reset}`);
    console.log(`${colors.red}Error:${colors.reset} ${error.message}\n`);

    results.push({
      ...scenario,
      success: false,
      error: error.message,
      generationTime: elapsedTime
    });
  }
}

/**
 * Display final summary
 */
function displaySummary() {
  console.log(`\n${colors.cyan}${'═'.repeat(80)}${colors.reset}`);
  console.log(`${colors.bright}📊 COMPREHENSIVE TEST RESULTS SUMMARY${colors.reset}`);
  console.log(`${colors.cyan}${'═'.repeat(80)}${colors.reset}\n`);

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`${colors.green}✅ Successful:${colors.reset} ${successful.length}/${results.length}`);
  console.log(`${colors.red}❌ Failed:${colors.reset} ${failed.length}/${results.length}\n`);

  if (successful.length > 0) {
    const totalCost = successful.reduce((sum, r) => sum + r.cost, 0);
    const avgTime = Math.round(successful.reduce((sum, r) => sum + r.generationTime, 0) / successful.length);

    console.log(`${colors.yellow}💰 Total Cost:${colors.reset} $${totalCost.toFixed(2)}`);
    console.log(`${colors.blue}⏱️  Avg Generation Time:${colors.reset} ${avgTime} seconds\n`);

    console.log(`${colors.bright}Successful Tests:${colors.reset}\n`);
    successful.forEach(r => {
      console.log(`${colors.green}[${r.id}]${colors.reset} ${r.name}`);
      console.log(`    Platform: ${r.platform}`);
      console.log(`    Model: ${r.model} | Ratio: ${r.ratio} | Duration: ${r.duration}s`);
      console.log(`    Cost: $${r.cost.toFixed(2)} | Time: ${r.generationTime}s`);
      console.log(`    ${colors.cyan}Video:${colors.reset} ${r.videoUrl}`);
      console.log();
    });
  }

  if (failed.length > 0) {
    console.log(`${colors.red}${colors.bright}Failed Tests:${colors.reset}\n`);
    failed.forEach(r => {
      console.log(`${colors.red}[${r.id}]${colors.reset} ${r.name}`);
      console.log(`    Error: ${r.error}\n`);
    });
  }

  console.log(`${colors.cyan}${'═'.repeat(80)}${colors.reset}`);
  console.log(`${colors.bright}💡 COMPARISON NOTES${colors.reset}`);
  console.log(`${colors.cyan}${'═'.repeat(80)}${colors.reset}\n`);

  const test1 = results.find(r => r.id === 1);
  const test8 = results.find(r => r.id === 8);

  if (test1?.success && test8?.success) {
    console.log(`${colors.yellow}🔄 Veo 3.1 vs Veo 3.1 Fast Comparison:${colors.reset}`);
    console.log(`   Test #1 (veo3.1):      $${test1.cost.toFixed(2)} in ${test1.generationTime}s`);
    console.log(`   Test #8 (veo3.1_fast): $${test8.cost.toFixed(2)} in ${test8.generationTime}s`);
    console.log(`   ${colors.green}Savings: $${(test1.cost - test8.cost).toFixed(2)} (${Math.round((1 - test8.cost/test1.cost) * 100)}%)${colors.reset}`);
    console.log(`\n   ${colors.bright}👁️  Review both videos to assess if quality difference justifies price${colors.reset}\n`);
  }

  console.log(`${colors.cyan}${'═'.repeat(80)}${colors.reset}\n`);
  console.log(`${colors.bright}📋 NEXT STEPS:${colors.reset}\n`);
  console.log(`1. Review all generated videos for quality`);
  console.log(`2. Check text clarity and readability`);
  console.log(`3. Verify motion and visual effects`);
  console.log(`4. Compare Veo 3.1 vs Veo 3.1 Fast quality`);
  console.log(`5. Select best configurations for each platform`);
  console.log(`6. Integrate winners into WISR AI generator\n`);
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log(`${colors.bright}${colors.cyan}`);
  console.log(`╔${'═'.repeat(78)}╗`);
  console.log(`║${' '.repeat(20)}COMPREHENSIVE VEO 3.1 TEST SUITE${' '.repeat(25)}║`);
  console.log(`║${' '.repeat(23)}Testing 8 Different Scenarios${' '.repeat(26)}║`);
  console.log(`╚${'═'.repeat(78)}╝`);
  console.log(`${colors.reset}\n`);

  console.log(`${colors.yellow}⚠️  This will generate 8 videos and may take 10-20 minutes${colors.reset}`);
  console.log(`${colors.yellow}💰 Estimated total cost: $${TEST_SCENARIOS.reduce((sum, s) => sum + estimateCost(s.duration, s.model).cost, 0).toFixed(2)}${colors.reset}\n`);

  // Run all tests sequentially
  for (const scenario of TEST_SCENARIOS) {
    await runTest(scenario);

    // Add a small delay between tests
    if (scenario.id < TEST_SCENARIOS.length) {
      console.log(`${colors.blue}⏳ Waiting 3 seconds before next test...${colors.reset}`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Display summary
  displaySummary();
}

// Run the test suite
console.log(`\n${colors.bright}Starting comprehensive Veo 3.1 test suite...${colors.reset}\n`);
runAllTests().catch(error => {
  console.error(`\n${colors.red}${colors.bright}FATAL ERROR:${colors.reset}`);
  console.error(error);
  process.exit(1);
});
