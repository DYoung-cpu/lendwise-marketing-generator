/**
 * TopP & TopK Optimization Test Runner
 *
 * Now that we know temp=0.15 is optimal, test different topP/topK combinations
 * to find the absolute best parameter set for Market Intelligence templates.
 */

import fetch from 'node-fetch';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';

// Backend API configuration
const API_BASE = 'http://localhost:3001';
const DELAY_BETWEEN_TESTS = 10000; // 10 seconds between generations

// Market Intelligence templates (using best performers from previous test)
const TEMPLATES = [
  {
    id: 'daily-rate-update',
    name: 'Daily Rate Update',
    prompt: 'Daily Rate Update October 30, 2025. 30-Year Fixed: 6.33% (+0.05%). Market Drivers: Fed policy expectations, Bond market activity, Economic data influence. Lock Strategy: Consult with loan officer for personalized strategy. Expert Insight: "RATES SHOWING MOVEMENT TODAY". Contact: David Young NMLS 62043 310-954-7771. Include LendWise logo. Portrait 1080x1350. Professional mortgage market design, forest green gradient, gold text.'
  },
  {
    id: 'rate-trends',
    name: 'Rate Trends',
    prompt: 'Rate Trends Analysis October 2025. 30-Year: 6.33%, 15-Year: 5.75%, Jumbo: 6.25%. Trending higher on Fed policy. Market moving on economic data. Strategic timing important. Expert Analysis: "MARKET OPPORTUNITIES EMERGING TODAY". David Young NMLS 62043 310-954-7771. Include LendWise logo. Portrait 1080x1350. Professional mortgage design, forest green gradient, gold accents.'
  }
];

// Parameter configurations to test - systematically vary topP and topK
const PARAMETER_CONFIGS = [
  {
    id: 'baseline-0.15',
    name: 'Baseline (temp=0.15, current topP/topK)',
    temperature: 0.15,
    topP: 0.95,
    topK: 40,
    description: 'Current winner from temp testing'
  },
  {
    id: 'lower-topP',
    name: 'Lower TopP (0.90)',
    temperature: 0.15,
    topP: 0.90,
    topK: 40,
    description: 'More focused sampling - less diversity'
  },
  {
    id: 'higher-topP',
    name: 'Higher TopP (0.97)',
    temperature: 0.15,
    topP: 0.97,
    topK: 40,
    description: 'Broader sampling - more diversity'
  },
  {
    id: 'lower-topK',
    name: 'Lower TopK (20)',
    temperature: 0.15,
    topP: 0.95,
    topK: 20,
    description: 'Fewer token choices - more deterministic'
  },
  {
    id: 'higher-topK',
    name: 'Higher TopK (60)',
    temperature: 0.15,
    topP: 0.95,
    topK: 60,
    description: 'More token choices - more variety'
  },
  {
    id: 'optimal-combo-1',
    name: 'Combo 1: Low TopP + Low TopK',
    temperature: 0.15,
    topP: 0.90,
    topK: 20,
    description: 'Maximum text accuracy focus'
  },
  {
    id: 'optimal-combo-2',
    name: 'Combo 2: High TopP + High TopK',
    temperature: 0.15,
    topP: 0.97,
    topK: 60,
    description: 'Maximum creative freedom'
  },
  {
    id: 'optimal-combo-3',
    name: 'Combo 3: Low TopP + High TopK',
    temperature: 0.15,
    topP: 0.90,
    topK: 60,
    description: 'Focused but with options'
  }
];

// Test results storage
const testResults = [];
let testsCompleted = 0;
let testsSucceeded = 0;
let testsFailed = 0;

/**
 * Generate a market intelligence image with specified parameters
 */
async function generateImage(template, paramConfig, testNumber) {
  const startTime = Date.now();

  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 TEST ${testNumber}/${TEMPLATES.length * PARAMETER_CONFIGS.length}`);
  console.log(`Template: ${template.name}`);
  console.log(`Config: ${paramConfig.name}`);
  console.log(`Params: temp=${paramConfig.temperature}, topP=${paramConfig.topP}, topK=${paramConfig.topK}`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    // Prepare generation request
    const requestBody = {
      prompt: template.prompt,
      template: template.id,
      temperature: paramConfig.temperature,
      topP: paramConfig.topP,
      topK: paramConfig.topK
    };

    // Call backend API
    const response = await fetch(`${API_BASE}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    // Parse results
    const result = {
      testNumber,
      timestamp: new Date().toISOString(),
      template: template.id,
      templateName: template.name,
      config: paramConfig.id,
      configName: paramConfig.name,
      parameters: {
        temperature: paramConfig.temperature,
        topP: paramConfig.topP,
        topK: paramConfig.topK
      },
      success: response.ok && data.success,
      duration,
      statusCode: response.status,
      validation: data.validation || {},
      imagePath: data.imagePath || null,
      ocrText: data.validation?.ocrText || null,
      spellingErrors: data.validation?.spellingErrors || [],
      issues: data.validation?.issues || [],
      attempts: data.attempts || 1,
      error: data.error || null
    };

    // Update counters
    testsCompleted++;
    if (result.success) {
      testsSucceeded++;
      console.log(`✅ SUCCESS`);
    } else {
      testsFailed++;
      console.log(`❌ FAILED`);
    }

    // Log key details
    console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`Attempts: ${result.attempts}`);
    console.log(`Status: ${result.statusCode}`);

    if (result.spellingErrors && result.spellingErrors.length > 0) {
      console.log(`Spelling Errors: ${result.spellingErrors.length}`);
      result.spellingErrors.forEach(err => {
        console.log(`  - ${err.word} → ${err.expected || 'unknown'}`);
      });
    }

    if (result.issues && result.issues.length > 0) {
      console.log(`Issues: ${result.issues.length}`);
      result.issues.slice(0, 3).forEach(issue => {
        console.log(`  - ${issue.message || issue.type}`);
      });
    }

    testResults.push(result);
    return result;

  } catch (error) {
    const duration = Date.now() - startTime;

    console.log(`❌ EXCEPTION: ${error.message}`);

    testsCompleted++;
    testsFailed++;

    const result = {
      testNumber,
      timestamp: new Date().toISOString(),
      template: template.id,
      templateName: template.name,
      config: paramConfig.id,
      configName: paramConfig.name,
      parameters: {
        temperature: paramConfig.temperature,
        topP: paramConfig.topP,
        topK: paramConfig.topK
      },
      success: false,
      duration,
      error: error.message,
      exception: true
    };

    testResults.push(result);
    return result;
  }
}

/**
 * Delay execution
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Run complete test battery
 */
async function runTests() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  TOPP & TOPK OPTIMIZATION TEST BATTERY                           ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log(`\nStarted: ${new Date().toLocaleString()}`);
  console.log(`Temperature: FIXED at 0.15 (optimal from previous testing)`);
  console.log(`Total tests: ${TEMPLATES.length * PARAMETER_CONFIGS.length} (${TEMPLATES.length} templates × ${PARAMETER_CONFIGS.length} configs)`);
  console.log(`Delay between tests: ${DELAY_BETWEEN_TESTS / 1000}s\n`);

  let testNumber = 0;

  // Test each template with each parameter configuration
  for (const template of TEMPLATES) {
    for (const paramConfig of PARAMETER_CONFIGS) {
      testNumber++;

      await generateImage(template, paramConfig, testNumber);

      // Delay between tests (except after last test)
      if (testNumber < TEMPLATES.length * PARAMETER_CONFIGS.length) {
        console.log(`\n⏱️  Waiting ${DELAY_BETWEEN_TESTS / 1000}s before next test...`);
        await delay(DELAY_BETWEEN_TESTS);
      }
    }
  }

  // Save results to file
  const resultsFile = resolve('./test-results-topP-topK-optimization.json');
  await writeFile(resultsFile, JSON.stringify({
    metadata: {
      testDate: new Date().toISOString(),
      fixedTemperature: 0.15,
      totalTests: testsCompleted,
      succeeded: testsSucceeded,
      failed: testsFailed,
      successRate: ((testsSucceeded / testsCompleted) * 100).toFixed(1) + '%'
    },
    results: testResults
  }, null, 2));

  console.log(`\n\n${'='.repeat(80)}`);
  console.log('📊 TEST BATTERY COMPLETE');
  console.log(`${'='.repeat(80)}\n`);
  console.log(`Total Tests: ${testsCompleted}`);
  console.log(`✅ Succeeded: ${testsSucceeded} (${((testsSucceeded / testsCompleted) * 100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${testsFailed} (${((testsFailed / testsCompleted) * 100).toFixed(1)}%)`);
  console.log(`\nResults saved to: ${resultsFile}\n`);

  // Quick analysis
  analyzeResults();
}

/**
 * Quick analysis of results
 */
function analyzeResults() {
  console.log(`\n${'='.repeat(80)}`);
  console.log('📈 QUICK ANALYSIS');
  console.log(`${'='.repeat(80)}\n`);

  // Success by configuration
  console.log('Success Rate by Parameter Configuration:');
  PARAMETER_CONFIGS.forEach(config => {
    const configResults = testResults.filter(r => r.config === config.id);
    const configSuccesses = configResults.filter(r => r.success).length;
    const successRate = ((configSuccesses / configResults.length) * 100).toFixed(1);
    console.log(`  ${config.name}: ${configSuccesses}/${configResults.length} (${successRate}%)`);
    console.log(`    topP=${config.topP}, topK=${config.topK}`);
  });

  // Success by template
  console.log('\nSuccess Rate by Template:');
  TEMPLATES.forEach(template => {
    const templateResults = testResults.filter(r => r.template === template.id);
    const templateSuccesses = templateResults.filter(r => r.success).length;
    const successRate = ((templateSuccesses / templateResults.length) * 100).toFixed(1);
    console.log(`  ${template.name}: ${templateSuccesses}/${templateResults.length} (${successRate}%)`);
  });

  // Find optimal configuration
  const configStats = PARAMETER_CONFIGS.map(config => {
    const configResults = testResults.filter(r => r.config === config.id);
    const successes = configResults.filter(r => r.success).length;
    const successRate = (successes / configResults.length) * 100;
    const avgDuration = configResults.reduce((sum, r) => sum + r.duration, 0) / configResults.length;

    return {
      name: config.name,
      topP: config.topP,
      topK: config.topK,
      successes,
      total: configResults.length,
      successRate,
      avgDuration
    };
  });

  // Sort by success rate
  configStats.sort((a, b) => b.successRate - a.successRate);

  console.log('\n🏆 OPTIMAL CONFIGURATION:');
  const winner = configStats[0];
  console.log(`  Config: ${winner.name}`);
  console.log(`  Parameters: temp=0.15, topP=${winner.topP}, topK=${winner.topK}`);
  console.log(`  Success Rate: ${winner.successRate.toFixed(1)}%`);
  console.log(`  Avg Duration: ${(winner.avgDuration / 1000).toFixed(2)}s`);

  console.log('\n📊 RANKINGS (Best to Worst):');
  configStats.forEach((stat, index) => {
    console.log(`  ${index + 1}. ${stat.name}: ${stat.successRate.toFixed(1)}% (topP=${stat.topP}, topK=${stat.topK})`);
  });

  console.log(`\n${'='.repeat(80)}\n`);
}

// Run the test battery
runTests().catch(error => {
  console.error('\n❌ Fatal error running test battery:', error);
  process.exit(1);
});
