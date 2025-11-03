#!/usr/bin/env node

/**
 * TEMPERATURE 0.8 VALIDATION TEST
 *
 * This script runs 10 COMPLETE generations with temperature 0.8 using the FULL
 * retry logic from quality-backend.js to validate that temp 0.8 achieves 100%
 * success rate within 5 attempts per generation.
 *
 * Test Parameters:
 * - Temperature: 0.8
 * - Top-P: 0.95
 * - Top-K: 40
 * - Max Attempts: 5
 * - Template: Daily Rate Update
 * - Uses REAL market data
 *
 * Success Criteria:
 * - 10/10 generations must reach 100% within 5 attempts
 * - Average attempts should be 2-3
 * - No complete failures allowed
 */

import GeminiClient from './gemini-client.js';
import VisionAnalyzer from './vision-analyzer.js';
import LearningLayer from './learning-layer.js';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to load env file
async function loadEnvFile(filepath) {
    try {
        const envContent = await fs.readFile(filepath, 'utf-8');
        const lines = envContent.split('\n');
        for (const line of lines) {
            if (line.trim() && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=').trim();
                if (key && value && value !== 'YOUR_KEY_HERE') {
                    // Only set if not already set (don't override existing)
                    if (!process.env[key.trim()]) {
                        process.env[key.trim()] = value;
                    }
                }
            }
        }
        return true;
    } catch (error) {
        return false;
    }
}

// Try to load .env from root directory first (GEMINI_API_KEY)
const rootEnvPath = path.join(__dirname, '.env');
await loadEnvFile(rootEnvPath);

// Then load .env from CampaignCreator/backend (ANTHROPIC/CLAUDE_API_KEY)
const backendEnvPath = path.join(__dirname, 'CampaignCreator', 'backend', '.env');
await loadEnvFile(backendEnvPath);

// Set ANTHROPIC_API_KEY from CLAUDE_API_KEY if needed
if (!process.env.ANTHROPIC_API_KEY && process.env.CLAUDE_API_KEY) {
    process.env.ANTHROPIC_API_KEY = process.env.CLAUDE_API_KEY;
}

// Validate required keys
if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
    console.log('\n❌ GEMINI_API_KEY not found!');
    console.log('\n📋 SETUP INSTRUCTIONS:');
    console.log('   1. Get your Gemini API key from: https://aistudio.google.com/app/apikey');
    console.log('   2. Edit the .env file in the project root:');
    console.log(`      ${rootEnvPath}`);
    console.log('   3. Replace YOUR_KEY_HERE with your actual API key');
    console.log('   4. Run this script again\n');
    process.exit(1);
}

if (!process.env.ANTHROPIC_API_KEY) {
    console.log('\n❌ ANTHROPIC_API_KEY not found!');
    console.log('   This key is needed for Claude Vision analysis');
    console.log('   It should be in CampaignCreator/backend/.env as CLAUDE_API_KEY\n');
    process.exit(1);
}

console.log('✅ All API keys loaded successfully');

// Test configuration
const TEST_CONFIG = {
    temperature: 0.8,
    topP: 0.95,
    topK: 40,
    maxAttempts: 5,
    totalGenerations: 10,
    templateName: 'Daily Rate Update'
};

// Initialize clients
const gemini = new GeminiClient();
const vision = new VisionAnalyzer();
const learning = new LearningLayer();

// Results tracking
const testResults = {
    generations: [],
    summary: {
        totalGenerations: 0,
        perfectGenerations: 0,
        failedGenerations: 0,
        totalAttempts: 0,
        totalTime: 0,
        totalCost: 0,
        errorsByType: {}
    }
};

/**
 * Fetch live market data for prompts
 */
async function fetchMarketData() {
    console.log('\n🔄 Fetching live market data...');

    try {
        const response = await fetch('https://www.mortgagenewsdaily.com/mortgage-rates');
        const html = await response.text();

        // Use Gemini Flash for data extraction
        const aiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        const ai = new GoogleGenAI({ apiKey: aiKey });

        const pageText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 3000);

        const geminiResponse = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: [{
                parts: [{
                    text: `Extract mortgage rate data from this text. Return ONLY JSON:

${pageText}

{
  "rates": {
    "30yr": "rate like 6.38%"
  },
  "changes": {
    "30yr": "change like +0.02% or —"
  },
  "trend": "brief market trend",
  "commentary": "main market commentary",
  "economicFactors": [
    {"factor": "factor 1", "impact": "positive/negative"},
    {"factor": "factor 2", "impact": "positive/negative"},
    {"factor": "factor 3", "impact": "positive/negative"}
  ],
  "lockRecommendation": "lock strategy"
}`
                }]
            }]
        });

        const geminiText = geminiResponse.candidates[0].content.parts[0].text;
        const jsonMatch = geminiText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            console.log('✅ Market data fetched successfully');
            console.log(`   30-Year: ${data.rates['30yr']} ${data.changes['30yr']}`);
            return {
                ...data,
                date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            };
        }
    } catch (error) {
        console.log('⚠️  Using fallback market data');
    }

    // Fallback data
    return {
        rates: { '30yr': '6.38%' },
        changes: { '30yr': '+0.02%' },
        trend: 'RATES STABLE THIS WEEK',
        commentary: 'RATES STABLE NEAR RECENT LOWS',
        economicFactors: [
            { factor: 'Fed Chair Powell suggests potential continued cuts through end of year', impact: 'positive' },
            { factor: 'Inflation expectations rising according to New York Federal Reserve survey data', impact: 'negative' },
            { factor: 'Markets hovering near multi-week lows showing cautious optimism from investors', impact: 'positive' }
        ],
        lockRecommendation: 'Near recent lows - favorable time to lock today',
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
}

/**
 * Build Daily Rate Update prompt
 */
function buildPrompt(marketData) {
    const changeIndicator = marketData.changes['30yr'] === '—' ? '—' :
                          marketData.changes['30yr'].startsWith('+') ? '▲' : '▼';

    return `Create a professional mortgage rate update graphic with this EXACT information:

HEADER:
"Daily Rate Update ${marketData.date}"

LARGE 30-YEAR RATE DISPLAY:
${marketData.rates['30yr']}
${changeIndicator} ${marketData.changes['30yr']}

ECONOMIC FACTORS (3 bullets):
${marketData.economicFactors.map(f => `• ${f.factor}`).join('\n')}

LOCK STRATEGY:
${marketData.lockRecommendation}

EXPERT INSIGHT (with quotation marks):
"${marketData.commentary}"

CONTACT INFO:
David Young NMLS 62043 Phone 310-954-7771

DESIGN REQUIREMENTS:
- Forest green gradient background (NOT blue, NOT navy)
- Metallic gold accents
- LendWise logo (gold owl) visible
- Premium depth (not flat)
- Dark green text boxes with subtle transparency (NO white boxes)
- All text must be complete and readable
- Proper quotation marks around expert insight

CRITICAL RULES:
1. Spell OUTLOOK correctly (O-U-T-L-O-O-K, NOT "OUTLOK")
2. Use BOTH opening " and closing " quotes
3. Include ALL percentages with % symbols
4. All text must be complete (no cut-off words)
5. Use dark green gradient boxes (NOT white/light gray)`;
}

/**
 * Run a single generation with retry logic (exactly like quality-backend.js)
 */
async function runSingleGeneration(generationNumber, marketData, tempDir) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`GENERATION ${generationNumber}/${TEST_CONFIG.totalGenerations}`);
    console.log(`${'='.repeat(70)}`);

    const startTime = Date.now();
    const prompt = buildPrompt(marketData);

    let bestAttempt = null;
    let bestScore = 0;
    let previousErrors = [];
    let allErrors = []; // Track ALL errors from all attempts
    let attemptDetails = [];

    for (let attempt = 1; attempt <= TEST_CONFIG.maxAttempts; attempt++) {
        console.log(`\n--- Attempt ${attempt}/${TEST_CONFIG.maxAttempts} ---`);

        // Build enhanced prompt with error feedback (like quality-backend.js line 122-125)
        let enhancedPrompt = prompt;
        if (previousErrors.length > 0) {
            const feedbackSection = `\n\n⚠️ CRITICAL CORRECTIONS NEEDED (Previous attempt had errors):\n${previousErrors.map((err, i) => `${i + 1}. ${err}`).join('\n')}\n\nYou MUST fix these specific issues in this generation. Double-check these exact areas.`;
            enhancedPrompt = prompt + feedbackSection;
            console.log(`🔄 Adding feedback from ${previousErrors.length} previous error(s)`);
        }

        // Generate with temperature 0.8
        const tempPath = path.join(tempDir, `gen${generationNumber}-attempt${attempt}-${Date.now()}.png`);
        const genResult = await gemini.generateImage(enhancedPrompt, tempPath, {
            temperature: TEST_CONFIG.temperature,
            topK: TEST_CONFIG.topK,
            topP: TEST_CONFIG.topP
        });

        if (!genResult.success) {
            console.log(`❌ Generation failed: ${genResult.error}`);
            attemptDetails.push({
                attempt,
                success: false,
                error: genResult.error
            });
            continue;
        }

        // Analyze quality (like quality-backend.js line 144-148)
        console.log('\n🔍 Analyzing quality...');
        const analysis = await vision.analyzeImage(genResult.imagePath, TEST_CONFIG.templateName, {
            imageBuffer: genResult.imageBuffer,
            mediaType: 'image/png'
        });

        console.log(`📊 Score: ${analysis.score}%`);

        // Track errors from this attempt
        if (analysis.errors.length > 0) {
            console.log('⚠️  Errors found:');
            analysis.errors.forEach((err, i) => {
                console.log(`   ${i + 1}. [${err.type}] ${err.issue}`);
                allErrors.push({
                    attempt,
                    type: err.type,
                    issue: err.issue
                });
            });

            // Update error feedback for next attempt (like quality-backend.js line 164-166)
            previousErrors = analysis.errors.map(err =>
                `[${err.type.toUpperCase()}] ${err.issue}`
            );
        }

        attemptDetails.push({
            attempt,
            success: true,
            score: analysis.score,
            errors: analysis.errors.length,
            errorDetails: analysis.errors
        });

        // Track best attempt
        if (analysis.score > bestScore) {
            bestScore = analysis.score;
            bestAttempt = {
                imagePath: genResult.imagePath,
                imageBase64: genResult.imageBase64,
                analysis: analysis,
                attempt: attempt
            };
        }

        // If perfect, return immediately (like quality-backend.js line 181)
        if (analysis.success && analysis.score === 100) {
            const elapsed = Date.now() - startTime;
            console.log(`\n✅ PERFECT! 100% quality on attempt ${attempt}`);
            console.log(`⏱️  Time: ${(elapsed / 1000).toFixed(1)}s`);

            // Save the perfect image
            const finalPath = path.join(tempDir, `PERFECT-gen${generationNumber}-${Date.now()}.png`);
            await fs.rename(genResult.imagePath, finalPath);

            return {
                success: true,
                generationNumber,
                attempts: attempt,
                score: 100,
                errors: allErrors,
                time: elapsed,
                imagePath: finalPath,
                attemptDetails
            };
        }
    }

    // Max attempts reached without 100% (like quality-backend.js line 214-246)
    const elapsed = Date.now() - startTime;
    console.log(`\n⚠️  Max attempts reached. Best score: ${bestScore}%`);
    console.log(`⏱️  Time: ${(elapsed / 1000).toFixed(1)}s`);

    // Save best attempt
    const finalPath = path.join(tempDir, `BEST-gen${generationNumber}-score${bestScore}-${Date.now()}.png`);
    await fs.rename(bestAttempt.imagePath, finalPath);

    return {
        success: false,
        generationNumber,
        attempts: TEST_CONFIG.maxAttempts,
        score: bestScore,
        errors: allErrors,
        time: elapsed,
        imagePath: finalPath,
        attemptDetails
    };
}

/**
 * Run the complete validation test
 */
async function runValidationTest() {
    console.log('\n' + '='.repeat(80));
    console.log('TEMPERATURE 0.8 VALIDATION TEST');
    console.log('='.repeat(80));
    console.log('\nTest Configuration:');
    console.log(`  Temperature: ${TEST_CONFIG.temperature}`);
    console.log(`  Top-P: ${TEST_CONFIG.topP}`);
    console.log(`  Top-K: ${TEST_CONFIG.topK}`);
    console.log(`  Max Attempts per Generation: ${TEST_CONFIG.maxAttempts}`);
    console.log(`  Total Generations: ${TEST_CONFIG.totalGenerations}`);
    console.log(`  Template: ${TEST_CONFIG.templateName}`);
    console.log('\nSuccess Criteria:');
    console.log('  - All 10 generations must reach 100% within 5 attempts');
    console.log('  - No complete failures allowed');
    console.log('  - Average attempts should be 2-3');

    // Create temp directory
    const tempDir = '/tmp/temp-0.8-validation-test';
    await fs.mkdir(tempDir, { recursive: true });
    console.log(`\n📁 Output directory: ${tempDir}`);

    // Fetch market data once for all generations
    const marketData = await fetchMarketData();

    // Run 10 generations
    const overallStartTime = Date.now();

    for (let i = 1; i <= TEST_CONFIG.totalGenerations; i++) {
        const result = await runSingleGeneration(i, marketData, tempDir);
        testResults.generations.push(result);

        // Update summary stats
        testResults.summary.totalGenerations++;
        testResults.summary.totalAttempts += result.attempts;
        testResults.summary.totalTime += result.time;

        if (result.success) {
            testResults.summary.perfectGenerations++;
        } else {
            testResults.summary.failedGenerations++;
        }

        // Track errors by type
        result.errors.forEach(err => {
            const key = err.type;
            testResults.summary.errorsByType[key] = (testResults.summary.errorsByType[key] || 0) + 1;
        });

        // Small delay between generations
        if (i < TEST_CONFIG.totalGenerations) {
            console.log('\n⏳ Waiting 3 seconds before next generation...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    const totalTestTime = Date.now() - overallStartTime;

    // Calculate statistics
    const avgAttempts = testResults.summary.totalAttempts / testResults.summary.totalGenerations;
    const avgTime = testResults.summary.totalTime / testResults.summary.totalGenerations;
    const successRate = (testResults.summary.perfectGenerations / testResults.summary.totalGenerations) * 100;

    // Cost calculation (rough estimates)
    // Gemini Flash Image: ~$0.04 per image
    // Claude Vision: ~$0.01 per analysis
    const costPerAttempt = 0.04 + 0.01; // $0.05 per attempt
    const totalCost = testResults.summary.totalAttempts * costPerAttempt;
    const avgCostPerPerfect = testResults.summary.perfectGenerations > 0 ?
        totalCost / testResults.summary.perfectGenerations : 0;

    testResults.summary.totalCost = totalCost;
    testResults.summary.avgCostPerPerfect = avgCostPerPerfect;
    testResults.summary.avgAttempts = avgAttempts;
    testResults.summary.avgTime = avgTime;
    testResults.summary.successRate = successRate;
    testResults.summary.totalTestTime = totalTestTime;

    // Print detailed results
    printResults();

    // Save results to JSON
    const resultsPath = path.join(tempDir, 'test-results.json');
    await fs.writeFile(resultsPath, JSON.stringify(testResults, null, 2));
    console.log(`\n💾 Detailed results saved to: ${resultsPath}`);

    // Compare to baseline (temp 0.2 data from manual-learning-database.json)
    printComparison();

    return testResults;
}

/**
 * Print detailed test results
 */
function printResults() {
    console.log('\n\n' + '='.repeat(80));
    console.log('TEST RESULTS SUMMARY');
    console.log('='.repeat(80));

    console.log('\n📊 Generation Results:');
    console.log('━'.repeat(80));

    testResults.generations.forEach((gen, idx) => {
        const status = gen.success ? '✅ PERFECT' : '⚠️  INCOMPLETE';
        const emoji = gen.success ? '✅' : '❌';

        console.log(`\nGen ${gen.generationNumber}: ${status} on attempt ${gen.attempts}`);
        console.log(`   Score: ${gen.score}%`);
        console.log(`   Time: ${(gen.time / 1000).toFixed(1)}s`);
        console.log(`   Image: ${path.basename(gen.imagePath)}`);

        if (gen.errors.length > 0) {
            console.log('   Errors encountered:');
            const errorsByAttempt = {};
            gen.errors.forEach(err => {
                if (!errorsByAttempt[err.attempt]) {
                    errorsByAttempt[err.attempt] = [];
                }
                errorsByAttempt[err.attempt].push(`[${err.type}] ${err.issue}`);
            });

            Object.keys(errorsByAttempt).sort().forEach(attempt => {
                console.log(`     Attempt ${attempt}:`);
                errorsByAttempt[attempt].forEach(err => {
                    console.log(`       - ${err}`);
                });
            });
        } else {
            console.log(`   ${emoji} Perfect first try!`);
        }
    });

    console.log('\n\n' + '='.repeat(80));
    console.log('OVERALL STATISTICS');
    console.log('='.repeat(80));

    const { summary } = testResults;

    console.log(`\n✅ Perfect Generations: ${summary.perfectGenerations}/${summary.totalGenerations} (${summary.successRate.toFixed(1)}%)`);
    console.log(`❌ Failed Generations: ${summary.failedGenerations}/${summary.totalGenerations}`);
    console.log(`📊 Average Attempts: ${summary.avgAttempts.toFixed(2)}`);
    console.log(`⏱️  Average Time per Perfect: ${(summary.avgTime / 1000).toFixed(1)}s`);
    console.log(`💰 Total Cost: $${summary.totalCost.toFixed(2)}`);
    console.log(`💵 Average Cost per Perfect: $${summary.avgCostPerPerfect.toFixed(2)}`);
    console.log(`⏰ Total Test Time: ${(summary.totalTestTime / 1000 / 60).toFixed(1)} minutes`);

    if (Object.keys(summary.errorsByType).length > 0) {
        console.log('\n⚠️  Most Common Error Types:');
        const sortedErrors = Object.entries(summary.errorsByType)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        sortedErrors.forEach(([type, count]) => {
            console.log(`   - ${type}: ${count} occurrences`);
        });
    }

    // Test Pass/Fail verdict
    console.log('\n\n' + '='.repeat(80));
    console.log('TEST VERDICT');
    console.log('='.repeat(80));

    const testPassed = summary.successRate === 100 && summary.avgAttempts <= 3.5;

    if (testPassed) {
        console.log('\n✅ TEST PASSED!');
        console.log('   - All 10 generations reached 100% quality');
        console.log(`   - Average attempts (${summary.avgAttempts.toFixed(2)}) is acceptable`);
        console.log('   - Temperature 0.8 is VALIDATED for production use');
    } else {
        console.log('\n❌ TEST FAILED!');
        if (summary.successRate < 100) {
            console.log(`   - Only ${summary.perfectGenerations}/10 generations reached 100%`);
            console.log('   - Temperature 0.8 does NOT guarantee 100% success');
        }
        if (summary.avgAttempts > 3.5) {
            console.log(`   - Average attempts (${summary.avgAttempts.toFixed(2)}) is too high`);
            console.log('   - Retry penalty makes temp 0.8 less efficient');
        }
    }
}

/**
 * Compare to baseline (temp 0.2 from manual-learning-database.json)
 */
function printComparison() {
    console.log('\n\n' + '='.repeat(80));
    console.log('COMPARISON TO BASELINE (Temperature 0.2)');
    console.log('='.repeat(80));

    // Baseline data from manual-learning-database.json for Daily Rate Update
    const baseline = {
        temperature: 0.2,
        successRate: 88.89, // 8/9 perfect
        avgAttempts: 1.0,  // Most succeed on first try
        errorRate: 11.11   // 1/9 failed
    };

    const { summary } = testResults;

    console.log('\n📊 Success Rate:');
    console.log(`   Baseline (temp 0.2): ${baseline.successRate.toFixed(1)}%`);
    console.log(`   Temp 0.8:           ${summary.successRate.toFixed(1)}%`);
    console.log(`   Difference:         ${(summary.successRate - baseline.successRate).toFixed(1)}%`);

    console.log('\n📊 Average Attempts:');
    console.log(`   Baseline (temp 0.2): ${baseline.avgAttempts.toFixed(2)}`);
    console.log(`   Temp 0.8:           ${summary.avgAttempts.toFixed(2)}`);
    console.log(`   Difference:         +${(summary.avgAttempts - baseline.avgAttempts).toFixed(2)}`);

    console.log('\n💰 Cost Analysis:');
    console.log(`   Baseline (temp 0.2): ~$${(baseline.avgAttempts * 0.05).toFixed(2)} per attempt`);
    console.log(`   Temp 0.8:           $${summary.avgCostPerPerfect.toFixed(2)} per perfect`);

    console.log('\n🎯 Key Insights:');
    if (summary.successRate >= baseline.successRate) {
        console.log('   ✅ Temp 0.8 matches or exceeds baseline success rate');
    } else {
        console.log('   ⚠️  Temp 0.8 has lower success rate than baseline');
    }

    if (summary.avgAttempts <= baseline.avgAttempts + 1.5) {
        console.log('   ✅ Retry penalty is acceptable (within 1.5 attempts)');
    } else {
        console.log('   ⚠️  Retry penalty is significant (requires many retries)');
    }

    const creativityBonus = summary.successRate >= 100 && summary.avgAttempts <= 3;
    if (creativityBonus) {
        console.log('   ✅ Higher creativity achieved without quality penalty!');
        console.log('   💡 Temp 0.8 recommended for production deployment');
    } else {
        console.log('   ⚠️  Higher creativity comes with quality/efficiency tradeoffs');
        console.log('   💡 Stick with temp 0.2 for maximum reliability');
    }
}

// Run the test
runValidationTest().catch(error => {
    console.error('\n❌ Test failed with error:', error);
    process.exit(1);
});
