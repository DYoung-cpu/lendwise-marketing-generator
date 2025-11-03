#!/usr/bin/env node

import GeminiClient from './gemini-client.js';
import VisionAnalyzer from './vision-analyzer.js';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

/**
 * Multi-Temperature Validation Test
 * Tests 4 temperature settings (0.2, 0.4, 0.6, 0.8) with 10 complete generations each
 * Uses full retry logic (up to 5 attempts per generation) with error feedback
 */

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

console.log('✅ All API keys loaded successfully\n');

const TEMPERATURES = [0.2, 0.4, 0.6, 0.8];
const GENERATIONS_PER_TEMP = 10;
const MAX_ATTEMPTS = 5;
const TEMPLATE_NAME = 'Daily Rate Update';
const OUTPUT_DIR = '/tmp/multi-temp-test';

class MultiTempValidator {
    constructor() {
        this.gemini = new GeminiClient();
        this.vision = new VisionAnalyzer();
        this.results = [];
    }

    /**
     * Fetch live market data from Mortgage News Daily
     */
    async fetchMarketData() {
        try {
            console.log('\n🔄 Fetching live market data from Mortgage News Daily...');

            const pageResponse = await fetch('https://www.mortgagenewsdaily.com/mortgage-rates');
            const html = await pageResponse.text();

            const $ = cheerio.load(html);
            const pageText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 3000);

            // Use Gemini Flash for data extraction
            const aiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
            const ai = new GoogleGenAI({ apiKey: aiKey });

            const geminiResponse = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: [{
                    parts: [{
                        text: `Analyze this Mortgage News Daily text and extract data. Return ONLY valid JSON:

${pageText}

Return structure:
{
  "rates": {"30yr": "6.38%"},
  "changes": {"30yr": "+0.02%"},
  "trend": "one sentence trend",
  "commentary": "market commentary",
  "economicFactors": [
    {"factor": "factor 1", "impact": "positive"},
    {"factor": "factor 2", "impact": "negative"},
    {"factor": "factor 3", "impact": "positive"}
  ],
  "lockRecommendation": "lock strategy"
}

Return ONLY JSON, no other text.`
                    }]
                }]
            });

            const geminiText = geminiResponse.candidates[0].content.parts[0].text;
            const semanticMatch = geminiText.match(/\{[\s\S]*\}/);

            let geminiData = {};
            if (semanticMatch) {
                geminiData = JSON.parse(semanticMatch[0]);
            }

            const marketData = {
                rate30yr: geminiData.rates?.['30yr'] || '6.38%',
                change30yr: geminiData.changes?.['30yr'] || '+0.02%',
                trend: geminiData.trend || 'RATES STABLE THIS WEEK',
                commentary: geminiData.commentary || 'RATES STABLE NEAR RECENT LOWS',
                economicFactors: geminiData.economicFactors || [
                    { factor: 'Fed policy expectations', impact: 'positive' },
                    { factor: 'Inflation data', impact: 'negative' },
                    { factor: 'Market sentiment', impact: 'positive' }
                ],
                lockRecommendation: geminiData.lockRecommendation || 'Consult with loan officer for personalized strategy',
                date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            };

            console.log(`✅ Market data fetched: ${marketData.rate30yr} ${marketData.change30yr}`);
            return marketData;

        } catch (error) {
            console.error('❌ Error fetching market data:', error.message);

            // Fallback data
            return {
                rate30yr: '6.38%',
                change30yr: '+0.02%',
                trend: 'RATES STABLE THIS WEEK',
                commentary: 'RATES STABLE NEAR RECENT LOWS',
                date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                economicFactors: [
                    { factor: 'Fed Chair Powell suggests potential continued cuts through end of year', impact: 'positive' },
                    { factor: 'Inflation expectations rising according to New York Federal Reserve survey data', impact: 'negative' },
                    { factor: 'Markets hovering near multi-week lows showing cautious optimism from investors', impact: 'positive' }
                ],
                lockRecommendation: 'Near recent lows - favorable time to lock today'
            };
        }
    }

    /**
     * Build Daily Rate Update prompt
     */
    buildPrompt(marketData) {
        const changeSymbol = marketData.change30yr.startsWith('+') ? '↑' :
                            marketData.change30yr.startsWith('-') ? '↓' : '—';

        const factors = marketData.economicFactors.map(f =>
            `${f.impact === 'positive' ? '↑' : '↓'} ${f.factor}`
        ).join('\n');

        return `Generate a sophisticated mortgage rate update template with this EXACT content:

HEADER:
"Daily Rate Update ${marketData.date}"

MAIN RATE DISPLAY (Extra Large, centered):
${marketData.rate30yr}
30-Year Fixed
${changeSymbol} ${marketData.change30yr}

ECONOMIC FACTORS SECTION:
Title: "What's Moving Rates Today"
${factors}

LOCK STRATEGY:
"Lock Strategy: ${marketData.lockRecommendation}"

EXPERT INSIGHT (Quote format with quotation marks):
"${marketData.commentary}"

FOOTER:
"David Young NMLS 62043 Phone 310-954-7771"

DESIGN REQUIREMENTS:
- Forest green gradient background (dark to light, top to bottom)
- Metallic gold accents and borders
- Professional financial design with depth
- Clear typography hierarchy
- Modern, trustworthy aesthetic

CRITICAL TEXT ACCURACY:
- Use BOTH opening " and closing " quotation marks
- Spell "OUTLOOK" correctly (not "OUTLOK")
- Include all percent signs (%)
- Display all rates with proper decimals`;
    }

    /**
     * Test a single generation with retry logic
     */
    async testGeneration(temperature, generationNum, prompt, outputDir) {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`🌡️  Temperature ${temperature} - Generation ${generationNum}/${GENERATIONS_PER_TEMP}`);
        console.log(`${'='.repeat(70)}`);

        const startTime = Date.now();
        let previousErrors = [];
        let allAttempts = [];

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            console.log(`\n--- Attempt ${attempt}/${MAX_ATTEMPTS} ---`);

            // Build enhanced prompt with feedback from previous attempts
            let enhancedPrompt = prompt;
            if (previousErrors.length > 0) {
                const feedbackSection = `\n\n⚠️ CRITICAL CORRECTIONS NEEDED (Previous attempt had errors):\n${previousErrors.map((err, i) => `${i + 1}. ${err}`).join('\n')}\n\nYou MUST fix these specific issues in this generation. Double-check these exact areas.`;
                enhancedPrompt = prompt + feedbackSection;
                console.log(`🔄 Adding feedback from ${previousErrors.length} previous error(s)`);
            }

            // Generate image
            const tempPath = path.join(outputDir, `gen-${generationNum}-attempt-${attempt}.png`);
            const genResult = await this.gemini.generateImage(enhancedPrompt, tempPath, {
                temperature: temperature,
                topK: 40,
                topP: 0.95
            });

            if (!genResult.success) {
                console.log(`❌ Generation failed: ${genResult.error}`);
                allAttempts.push({
                    attempt,
                    success: false,
                    error: genResult.error,
                    score: 0
                });
                continue;
            }

            // Analyze quality
            const analysis = await this.vision.analyzeImage(genResult.imagePath, TEMPLATE_NAME, {
                imageBuffer: genResult.imageBuffer,
                mediaType: 'image/png'
            });

            console.log(`📊 Score: ${analysis.score}%`);

            // Record attempt
            allAttempts.push({
                attempt,
                success: analysis.success,
                score: analysis.score,
                errors: analysis.errors,
                imagePath: genResult.imagePath
            });

            if (analysis.errors.length > 0) {
                console.log('⚠️  Errors found:');
                analysis.errors.forEach((err, i) => {
                    console.log(`   ${i + 1}. [${err.type}] ${err.issue}`);
                });

                // Update feedback for next attempt
                previousErrors = analysis.errors.map(err =>
                    `[${err.type.toUpperCase()}] ${err.issue}`
                );
            }

            // If perfect, success!
            if (analysis.success && analysis.score === 100) {
                const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                console.log(`\n✅ PERFECT! Achieved 100% on attempt ${attempt} (${duration}s)`);

                // Save successful image with descriptive name
                const successPath = path.join(outputDir, `SUCCESS-gen-${generationNum}.png`);
                await fs.copyFile(genResult.imagePath, successPath);

                return {
                    success: true,
                    score: 100,
                    attempts: attempt,
                    duration: parseFloat(duration),
                    allAttempts,
                    finalImagePath: successPath
                };
            }

            // Cleanup temp file if not last attempt
            if (attempt < MAX_ATTEMPTS) {
                await fs.unlink(genResult.imagePath).catch(() => {});
            }
        }

        // Failed to reach 100%
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        const bestAttempt = allAttempts.reduce((best, curr) =>
            curr.score > best.score ? curr : best, allAttempts[0]);

        console.log(`\n❌ Failed to reach 100%. Best score: ${bestAttempt.score}% (${duration}s)`);

        return {
            success: false,
            score: bestAttempt.score,
            attempts: MAX_ATTEMPTS,
            duration: parseFloat(duration),
            allAttempts,
            errors: bestAttempt.errors || []
        };
    }

    /**
     * Test a single temperature setting
     */
    async testTemperature(temperature, marketData, basePrompt) {
        console.log(`\n${'█'.repeat(80)}`);
        console.log(`🌡️  TESTING TEMPERATURE: ${temperature}`);
        console.log(`${'█'.repeat(80)}`);

        const tempDir = path.join(OUTPUT_DIR, `temp-${temperature}`);
        await fs.mkdir(tempDir, { recursive: true });

        const tempStartTime = Date.now();
        const generations = [];

        // Run 10 generations
        for (let i = 1; i <= GENERATIONS_PER_TEMP; i++) {
            const result = await this.testGeneration(temperature, i, basePrompt, tempDir);
            generations.push(result);

            // Brief pause between generations
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const tempDuration = ((Date.now() - tempStartTime) / 1000).toFixed(1);

        // Calculate metrics
        const successCount = generations.filter(g => g.success).length;
        const successRate = (successCount / GENERATIONS_PER_TEMP) * 100;
        const avgAttempts = generations.reduce((sum, g) => sum + g.attempts, 0) / GENERATIONS_PER_TEMP;
        const avgTime = generations.reduce((sum, g) => sum + g.duration, 0) / GENERATIONS_PER_TEMP;
        const avgScore = generations.reduce((sum, g) => sum + g.score, 0) / GENERATIONS_PER_TEMP;

        // Collect all errors
        const errorCounts = {};
        generations.forEach(gen => {
            gen.allAttempts.forEach(att => {
                if (att.errors) {
                    att.errors.forEach(err => {
                        const key = `${err.type}: ${err.issue}`;
                        errorCounts[key] = (errorCounts[key] || 0) + 1;
                    });
                }
            });
        });

        const topErrors = Object.entries(errorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([error, count]) => ({ error, count }));

        // Estimate cost (rough estimate based on Gemini pricing)
        const totalAttempts = generations.reduce((sum, g) => sum + g.attempts, 0);
        const costPerGeneration = 0.0025; // Approximate cost per image generation
        const costPerAnalysis = 0.003;    // Approximate cost per vision analysis
        const totalCost = (totalAttempts * costPerGeneration) + (totalAttempts * costPerAnalysis);
        const costPerPerfect = successCount > 0 ? totalCost / successCount : 0;

        const tempResult = {
            temperature,
            successCount,
            successRate,
            avgAttempts,
            avgTime,
            avgScore,
            totalDuration: parseFloat(tempDuration),
            topErrors,
            totalCost,
            costPerPerfect,
            generations
        };

        this.results.push(tempResult);

        console.log(`\n${'='.repeat(80)}`);
        console.log(`📊 TEMPERATURE ${temperature} SUMMARY`);
        console.log(`${'='.repeat(80)}`);
        console.log(`✅ Success Rate: ${successCount}/${GENERATIONS_PER_TEMP} (${successRate.toFixed(1)}%)`);
        console.log(`📈 Average Score: ${avgScore.toFixed(1)}%`);
        console.log(`🔄 Average Attempts: ${avgAttempts.toFixed(2)}`);
        console.log(`⏱️  Average Time: ${avgTime.toFixed(1)}s`);
        console.log(`💰 Cost: $${totalCost.toFixed(4)} total, $${costPerPerfect.toFixed(4)} per perfect`);
        console.log('\n🔝 Top Errors:');
        topErrors.forEach((e, i) => {
            console.log(`   ${i + 1}. ${e.error} (${e.count}x)`);
        });

        return tempResult;
    }

    /**
     * Run complete validation test
     */
    async runValidation() {
        console.log(`\n${'█'.repeat(80)}`);
        console.log('🧪 MULTI-TEMPERATURE VALIDATION TEST');
        console.log(`${'█'.repeat(80)}`);
        console.log('\n📋 Configuration:');
        console.log(`   Temperatures: ${TEMPERATURES.join(', ')}`);
        console.log(`   Generations per temp: ${GENERATIONS_PER_TEMP}`);
        console.log(`   Max attempts per gen: ${MAX_ATTEMPTS}`);
        console.log(`   Total generations: ${TEMPERATURES.length * GENERATIONS_PER_TEMP}`);
        console.log(`   Template: ${TEMPLATE_NAME}`);
        console.log('');

        // Setup
        await fs.mkdir(OUTPUT_DIR, { recursive: true });

        // Fetch market data once
        const marketData = await this.fetchMarketData();
        const basePrompt = this.buildPrompt(marketData);

        // Test each temperature
        for (const temperature of TEMPERATURES) {
            await this.testTemperature(temperature, marketData, basePrompt);

            // Brief pause between temperature tests
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Generate final report
        await this.generateReport();
    }

    /**
     * Generate comprehensive report
     */
    async generateReport() {
        console.log(`\n\n${'█'.repeat(80)}`);
        console.log('📊 FINAL COMPARISON REPORT');
        console.log(`${'█'.repeat(80)}`);

        let report = `MULTI-TEMPERATURE VALIDATION TEST RESULTS
${'='.repeat(80)}

Test Configuration:
- Temperatures Tested: ${TEMPERATURES.join(', ')}
- Generations Per Temperature: ${GENERATIONS_PER_TEMP}
- Max Attempts Per Generation: ${MAX_ATTEMPTS}
- Total Generations: ${TEMPERATURES.length * GENERATIONS_PER_TEMP}
- Template: ${TEMPLATE_NAME}
- Test Date: ${new Date().toISOString()}

${'='.repeat(80)}

`;

        // Individual temperature results
        this.results.forEach(result => {
            const passed = result.successRate === 100 && result.avgAttempts <= 3;
            const statusIcon = passed ? '✅' : '❌';

            report += `
${statusIcon} TEMPERATURE ${result.temperature}
${'─'.repeat(80)}
Success Rate:      ${result.successCount}/${GENERATIONS_PER_TEMP} (${result.successRate.toFixed(1)}%)
Average Score:     ${result.avgScore.toFixed(1)}%
Average Attempts:  ${result.avgAttempts.toFixed(2)}
Average Time:      ${result.avgTime.toFixed(1)}s
Total Duration:    ${result.totalDuration.toFixed(1)}s
Total Cost:        $${result.totalCost.toFixed(4)}
Cost Per Perfect:  $${result.costPerPerfect > 0 ? result.costPerPerfect.toFixed(4) : 'N/A'}

Top Errors:
`;
            result.topErrors.forEach((e, i) => {
                report += `  ${i + 1}. ${e.error} (${e.count}x)\n`;
            });

            if (result.topErrors.length === 0) {
                report += '  None - All generations perfect!\n';
            }

            report += '\n';
        });

        // Find winner
        const winners = this.results.filter(r => r.successRate === 100);
        let winner = null;

        if (winners.length > 0) {
            // Among perfect ones, choose lowest avg attempts
            winner = winners.reduce((best, curr) =>
                curr.avgAttempts < best.avgAttempts ? curr : best
            );
        } else {
            // No perfect one, choose highest success rate
            winner = this.results.reduce((best, curr) =>
                curr.successRate > best.successRate ? curr : best
            );
        }

        report += `
${'='.repeat(80)}
🏆 WINNER: TEMPERATURE ${winner.temperature}
${'='.repeat(80)}

Performance:
- Success Rate: ${winner.successRate.toFixed(1)}% (${winner.successCount}/${GENERATIONS_PER_TEMP} perfect)
- Average Attempts: ${winner.avgAttempts.toFixed(2)}
- Average Score: ${winner.avgScore.toFixed(1)}%
- Average Time: ${winner.avgTime.toFixed(1)}s per generation
- Cost Efficiency: $${winner.costPerPerfect > 0 ? winner.costPerPerfect.toFixed(4) : 'N/A'} per perfect image

RECOMMENDATION:
`;

        if (winner.successRate === 100) {
            report += `✅ Temperature ${winner.temperature} is PRODUCTION READY!
- Achieved 100% success rate (${winner.successCount}/${GENERATIONS_PER_TEMP} perfect generations)
- Average ${winner.avgAttempts.toFixed(2)} attempts per perfect image
- Consistent, reliable quality
- ${winner.avgAttempts <= 3 ? 'Excellent efficiency' : 'Acceptable efficiency'}

This temperature setting should be used in production for the ${TEMPLATE_NAME} template.
`;
        } else {
            report += `⚠️  Temperature ${winner.temperature} is the BEST OPTION but not perfect:
- Success Rate: ${winner.successRate.toFixed(1)}% (${winner.successCount}/${GENERATIONS_PER_TEMP} perfect)
- Average Score: ${winner.avgScore.toFixed(1)}%
- Average Attempts: ${winner.avgAttempts.toFixed(2)}

Recommendation:
`;
            if (winner.successRate >= 80) {
                report += `- Acceptable for production with monitoring
- Most generations reach high quality
- Continue iterating on prompt engineering
`;
            } else {
                report += `- NOT recommended for production yet
- Success rate too low (${winner.successRate.toFixed(1)}%)
- Need further prompt refinement or safeguard adjustments
`;
            }
        }

        report += `
${'='.repeat(80)}

DETAILED BREAKDOWN:
`;

        // Add detailed breakdown table
        report += `
Temperature | Success | Avg Score | Avg Attempts | Avg Time | Cost/Perfect
------------|---------|-----------|--------------|----------|-------------
`;
        this.results.forEach(r => {
            report += `${r.temperature.toFixed(1)}         | ${r.successCount}/${GENERATIONS_PER_TEMP}     | ${r.avgScore.toFixed(1)}%     | ${r.avgAttempts.toFixed(2)}         | ${r.avgTime.toFixed(1)}s     | $${r.costPerPerfect > 0 ? r.costPerPerfect.toFixed(4) : 'N/A'}\n`;
        });

        report += `
${'='.repeat(80)}

Test completed: ${new Date().toLocaleString()}
Output directory: ${OUTPUT_DIR}
`;

        // Print to console
        console.log(report);

        // Save to file
        const reportPath = path.join(OUTPUT_DIR, 'validation-report.txt');
        await fs.writeFile(reportPath, report);
        console.log(`\n📄 Report saved to: ${reportPath}`);

        // Save JSON data
        const jsonPath = path.join(OUTPUT_DIR, 'validation-results.json');
        await fs.writeFile(jsonPath, JSON.stringify({
            testConfig: {
                temperatures: TEMPERATURES,
                generationsPerTemp: GENERATIONS_PER_TEMP,
                maxAttempts: MAX_ATTEMPTS,
                templateName: TEMPLATE_NAME
            },
            results: this.results,
            winner: {
                temperature: winner.temperature,
                successRate: winner.successRate,
                avgAttempts: winner.avgAttempts,
                avgScore: winner.avgScore
            },
            timestamp: new Date().toISOString()
        }, null, 2));
        console.log(`📊 JSON data saved to: ${jsonPath}`);
    }
}

// Run the validation
const validator = new MultiTempValidator();
validator.runValidation().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
