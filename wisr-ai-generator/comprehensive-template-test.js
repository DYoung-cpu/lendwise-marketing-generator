#!/usr/bin/env node

/**
 * Comprehensive Template Test
 *
 * - Runs 3 generations per template (21 templates = 63 generations)
 * - Uses Firecrawl to scrape LIVE market data
 * - Varies prompts to keep them fresh and creative
 * - Tests autonomous learning system
 * - Monitors memory-guided retry strategies
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const BACKEND_URL = 'http://localhost:3001';
const RESULTS_DIR = './test-results';
const MAX_GENERATIONS_PER_TEMPLATE = 3;

// All 21 templates from nano-test.html
const TEMPLATES = [
  {
    id: 'daily-rate-update',
    name: 'Daily Rate Update',
    requiresMarketData: true,
    variations: [
      'economic factors driving rates today',
      'market trends and outlook',
      'expert analysis and recommendations'
    ]
  },
  {
    id: 'market-update',
    name: 'Market Report',
    requiresMarketData: true,
    variations: [
      'comprehensive rate comparison',
      'loan type breakdown with trends',
      'market snapshot with insights'
    ]
  },
  {
    id: 'rate-drop-alert',
    name: 'Rate Drop Alert',
    requiresMarketData: true,
    variations: [
      'urgent rate drop notification',
      'limited time opportunity alert',
      'breaking news rate decrease'
    ]
  },
  {
    id: 'rate-trends',
    name: 'Rate Trends',
    requiresMarketData: true,
    variations: [
      '7-day rate movement analysis',
      'weekly trend breakdown',
      'rate trajectory overview'
    ]
  },
  {
    id: 'testimonial',
    name: 'Client Success Story',
    requiresMarketData: false,
    variations: [
      'first-time homebuyer success',
      'refinance savings story',
      'dream home achievement'
    ]
  },
  {
    id: 'tips-advice',
    name: 'Tips & Advice',
    requiresMarketData: false,
    variations: [
      'credit score improvement tips',
      'down payment strategies',
      'mortgage process guidance'
    ]
  },
  {
    id: 'personal-branding',
    name: 'Personal Branding',
    requiresMarketData: false,
    variations: [
      'professional introduction',
      'expertise highlight',
      'community commitment'
    ]
  },
  {
    id: 'lock-strategy',
    name: 'Lock Strategy Recommendation',
    requiresMarketData: true,
    variations: [
      'timing recommendation',
      'market outlook guidance',
      'strategic lock advice'
    ]
  },
  {
    id: 'comparison',
    name: 'Rate Comparison',
    requiresMarketData: true,
    variations: [
      '15-year vs 30-year comparison',
      'conventional vs FHA analysis',
      'loan program breakdown'
    ]
  },
  {
    id: 'seasonal',
    name: 'Seasonal Insight',
    requiresMarketData: false,
    variations: [
      'spring buying season tips',
      'year-end refinance strategy',
      'summer market outlook'
    ]
  },
  {
    id: 'faq',
    name: 'FAQ Post',
    requiresMarketData: false,
    variations: [
      'common mortgage questions',
      'rate lock explained',
      'closing cost breakdown'
    ]
  },
  {
    id: 'motivational',
    name: 'Motivational Quote',
    requiresMarketData: false,
    variations: [
      'homeownership dream inspiration',
      'financial freedom motivation',
      'achievement encouragement'
    ]
  },
  {
    id: 'did-you-know',
    name: 'Did You Know',
    requiresMarketData: false,
    variations: [
      'mortgage industry facts',
      'homeownership statistics',
      'rate history insights'
    ]
  },
  {
    id: 'process-guide',
    name: 'Process Guide',
    requiresMarketData: false,
    variations: [
      'pre-approval steps',
      'application checklist',
      'closing process timeline'
    ]
  },
  {
    id: 'announcement',
    name: 'Announcement',
    requiresMarketData: false,
    variations: [
      'new service offering',
      'office hours update',
      'special program launch'
    ]
  },
  {
    id: 'calculator-promo',
    name: 'Calculator Promo',
    requiresMarketData: false,
    variations: [
      'affordability calculator',
      'refinance savings estimator',
      'payment comparison tool'
    ]
  },
  {
    id: 'milestone',
    name: 'Milestone Celebration',
    requiresMarketData: false,
    variations: [
      'client milestone achieved',
      'company anniversary',
      'community impact celebration'
    ]
  },
  {
    id: 'holiday',
    name: 'Holiday Greeting',
    requiresMarketData: false,
    variations: [
      'seasonal wishes',
      'gratitude message',
      'festive greeting'
    ]
  },
  {
    id: 'call-to-action',
    name: 'Call to Action',
    requiresMarketData: false,
    variations: [
      'rate quote request',
      'consultation booking',
      'pre-approval invitation'
    ]
  },
  {
    id: 'educational',
    name: 'Educational Content',
    requiresMarketData: false,
    variations: [
      'mortgage terms explained',
      'rate factors breakdown',
      'loan types overview'
    ]
  },
  {
    id: 'behind-scenes',
    name: 'Behind the Scenes',
    requiresMarketData: false,
    variations: [
      'day in the life',
      'team introduction',
      'office culture showcase'
    ]
  }
];

// Prompt variation strategies
const CREATIVE_STYLES = [
  { name: 'dramatic', temp: 0.15, topK: 40, topP: 0.95 },
  { name: 'elegant', temp: 0.20, topK: 35, topP: 0.90 },
  { name: 'modern', temp: 0.25, topK: 30, topP: 0.85 }
];

const EMPHASIS_VARIATIONS = [
  'with strong visual hierarchy',
  'with bold typography',
  'with subtle elegance',
  'with modern minimalism',
  'with professional polish'
];

/**
 * Fetch LIVE market data using Firecrawl MCP
 */
async function fetchLiveMarketData() {
  console.log('\n🔥 FIRECRAWL: Scraping LIVE market data...');

  try {
    // Use the existing market-data endpoint which uses Firecrawl
    const response = await fetch(`${BACKEND_URL}/api/market-data`);
    const result = await response.json();

    if (result.success && result.data) {
      const data = result.data;
      console.log(`✅ LIVE data scraped:`);
      console.log(`   30-Year Fixed: ${data.rates['30yr']}`);
      console.log(`   Data from: ${data.date} ${data.timestamp}`);
      console.log(`   Cached: ${result.cached || data.cached ? 'Yes' : 'No (fresh scrape)'}`);
      return data;
    } else {
      throw new Error('Market data fetch failed');
    }
  } catch (error) {
    console.error('❌ Firecrawl scraping failed:', error.message);
    // Fallback to static data if scraping fails
    return {
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      timestamp: new Date().toISOString(),
      rates: { '30yr': '6.28%' },
      changes: { '30yr': '-0.05%' },
      cached: false
    };
  }
}

/**
 * Build fresh, varied prompt for template
 */
async function buildFreshPrompt(template, variationIndex, marketData) {
  const variation = template.variations[variationIndex % template.variations.length];
  const style = CREATIVE_STYLES[variationIndex % CREATIVE_STYLES.length];
  const emphasis = EMPHASIS_VARIATIONS[variationIndex % EMPHASIS_VARIATIONS.length];

  let prompt = '';

  if (template.requiresMarketData && marketData) {
    // Market-driven templates with LIVE data
    prompt = `${template.name} ${marketData.date}
30-Year Fixed: ${marketData.rates['30yr']} ${marketData.changes['30yr'] || ''}
Focus: ${variation}
Style: ${emphasis}
Contact: David Young NMLS 62043 310-954-7771
Portrait 1080x1350. Professional mortgage marketing, forest green gradient, metallic gold accents.`;
  } else {
    // Non-market templates
    prompt = `${template.name}
Focus: ${variation}
Style: ${emphasis}
Professional mortgage marketing for David Young NMLS 62043
Contact: 310-954-7771
Portrait 1080x1350. Forest green gradient background, gold text, LendWise branding.`;
  }

  console.log(`\n📝 Fresh prompt (variation ${variationIndex + 1}):`);
  console.log(`   Template: ${template.name}`);
  console.log(`   Focus: ${variation}`);
  console.log(`   Style: ${style.name}`);
  console.log(`   Emphasis: ${emphasis}`);

  return { prompt, style };
}

/**
 * Generate image with backend API
 */
async function generateImage(template, prompt, style, attemptNumber) {
  console.log(`\n🎨 Generation ${attemptNumber}/${MAX_GENERATIONS_PER_TEMPLATE} - ${template.name}`);
  console.log(`   Temperature: ${style.temp}, TopK: ${style.topK}, TopP: ${style.topP}`);

  const startTime = Date.now();

  try {
    const response = await fetch(`${BACKEND_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        template: template.name,
        temperature: style.temp,
        topK: style.topK,
        topP: style.topP
      })
    });

    const data = await response.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (data.success) {
      console.log(`✅ Generation successful! (${duration}s)`);
      console.log(`   Image: ${data.imageUrl}`);
      console.log(`   Validation: ${data.validation?.passed ? 'PASSED ✓' : 'FAILED ✗'}`);

      if (data.validation?.spellingCheck) {
        console.log(`   Spelling: ${data.validation.spellingCheck.passed ? 'Perfect ✓' : `${data.validation.spellingCheck.errors.length} error(s) ✗`}`);
      }

      return {
        success: true,
        duration,
        validation: data.validation,
        imageUrl: data.imageUrl,
        retries: data.retries || 0
      };
    } else {
      console.error(`❌ Generation failed: ${data.error}`);
      return {
        success: false,
        error: data.error,
        duration
      };
    }
  } catch (error) {
    console.error(`❌ API error: ${error.message}`);
    return {
      success: false,
      error: error.message,
      duration: ((Date.now() - startTime) / 1000).toFixed(2)
    };
  }
}

/**
 * Run comprehensive test on all templates
 */
async function runComprehensiveTest() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  COMPREHENSIVE TEMPLATE TEST                           ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`\n📊 Test Plan:`);
  console.log(`   Templates: ${TEMPLATES.length}`);
  console.log(`   Generations per template: ${MAX_GENERATIONS_PER_TEMPLATE}`);
  console.log(`   Total generations: ${TEMPLATES.length * MAX_GENERATIONS_PER_TEMPLATE}`);
  console.log(`   Firecrawl: Enabled (live market data)`);
  console.log(`   Prompt variations: Enabled (fresh prompts each time)`);

  // Create results directory
  await fs.mkdir(RESULTS_DIR, { recursive: true });

  const results = {
    testDate: new Date().toISOString(),
    totalTemplates: TEMPLATES.length,
    generationsPerTemplate: MAX_GENERATIONS_PER_TEMPLATE,
    totalGenerations: 0,
    successfulGenerations: 0,
    failedGenerations: 0,
    totalRetries: 0,
    totalDuration: 0,
    templates: []
  };

  // Fetch live market data once at start
  const marketData = await fetchLiveMarketData();

  // Test each template
  for (let i = 0; i < TEMPLATES.length; i++) {
    const template = TEMPLATES[i];
    console.log(`\n\n${'='.repeat(60)}`);
    console.log(`📋 TEMPLATE ${i + 1}/${TEMPLATES.length}: ${template.name}`);
    console.log('='.repeat(60));

    const templateResults = {
      id: template.id,
      name: template.name,
      requiresMarketData: template.requiresMarketData,
      generations: []
    };

    // Generate 3 times with variations
    for (let j = 0; j < MAX_GENERATIONS_PER_TEMPLATE; j++) {
      // Re-fetch market data every 3rd generation to ensure freshness
      const currentMarketData = (j % 3 === 0 && template.requiresMarketData)
        ? await fetchLiveMarketData()
        : marketData;

      // Build fresh, varied prompt
      const { prompt, style } = await buildFreshPrompt(template, j, currentMarketData);

      // Generate with backend
      const result = await generateImage(template, prompt, style, j + 1);

      templateResults.generations.push({
        attempt: j + 1,
        prompt: prompt.substring(0, 100) + '...',
        style: style.name,
        result
      });

      results.totalGenerations++;
      if (result.success) {
        results.successfulGenerations++;
        results.totalRetries += result.retries || 0;
      } else {
        results.failedGenerations++;
      }
      results.totalDuration += parseFloat(result.duration);

      // Small delay between generations to avoid rate limits
      if (j < MAX_GENERATIONS_PER_TEMPLATE - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    results.templates.push(templateResults);

    // Progress update
    const progress = ((i + 1) / TEMPLATES.length * 100).toFixed(1);
    console.log(`\n📊 Progress: ${i + 1}/${TEMPLATES.length} templates (${progress}%)`);
    console.log(`   Successful: ${results.successfulGenerations}/${results.totalGenerations}`);
    console.log(`   Failed: ${results.failedGenerations}/${results.totalGenerations}`);
    console.log(`   Success rate: ${(results.successfulGenerations / results.totalGenerations * 100).toFixed(1)}%`);

    // Delay between templates
    if (i < TEMPLATES.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Final report
  console.log('\n\n╔════════════════════════════════════════════════════════╗');
  console.log('║  TEST COMPLETE - FINAL RESULTS                         ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`\n📊 Summary:`);
  console.log(`   Total generations: ${results.totalGenerations}`);
  console.log(`   ✅ Successful: ${results.successfulGenerations} (${(results.successfulGenerations / results.totalGenerations * 100).toFixed(1)}%)`);
  console.log(`   ❌ Failed: ${results.failedGenerations} (${(results.failedGenerations / results.totalGenerations * 100).toFixed(1)}%)`);
  console.log(`   🔄 Total retries: ${results.totalRetries}`);
  console.log(`   ⏱️  Total duration: ${(results.totalDuration / 60).toFixed(1)} minutes`);
  console.log(`   ⚡ Average per generation: ${(results.totalDuration / results.totalGenerations).toFixed(1)}s`);

  // Save results
  const resultsPath = path.join(RESULTS_DIR, `test-results-${Date.now()}.json`);
  await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Results saved: ${resultsPath}`);

  // Template performance breakdown
  console.log(`\n📋 Template Performance:`);
  results.templates.forEach((tmpl, idx) => {
    const successes = tmpl.generations.filter(g => g.result.success).length;
    const rate = (successes / tmpl.generations.length * 100).toFixed(0);
    console.log(`   ${idx + 1}. ${tmpl.name}: ${successes}/${tmpl.generations.length} (${rate}%)`);
  });

  return results;
}

// Run the test
runComprehensiveTest()
  .then(() => {
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
