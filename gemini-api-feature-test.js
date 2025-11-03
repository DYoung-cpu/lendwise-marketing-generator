#!/usr/bin/env node

/**
 * Gemini API Feature Testing Script
 *
 * Tests different generationConfig parameters to optimize:
 * - Text accuracy (spelling errors, quotations)
 * - Design quality (white box issues)
 * - Generation speed and consistency
 *
 * API Features Tested:
 * - temperature (0, 0.1, 0.2)
 * - topP (0.5, 0.7, 0.95)
 * - topK (20, 40)
 * - candidateCount (1, 2, 3) - if supported
 * - seed parameter for reproducibility
 */

import GeminiClient from './gemini-client.js';
import VisionAnalyzer from './vision-analyzer.js';
import { getMarketData, buildDailyRateUpdatePrompt } from './prompt-builder.js';
import fs from 'fs/promises';
import path from 'path';

// Test configurations to evaluate
const TEST_CONFIGURATIONS = [
    {
        name: 'Test A: Current Baseline',
        config: { temperature: 0, topP: 0.95, topK: 40 },
        description: 'Current production settings'
    },
    {
        name: 'Test B: Stricter topP',
        config: { temperature: 0, topP: 0.7, topK: 40 },
        description: 'Reduce topP to limit token selection'
    },
    {
        name: 'Test C: Even Stricter',
        config: { temperature: 0, topP: 0.5, topK: 20 },
        description: 'Most conservative settings'
    },
    {
        name: 'Test D: Slightly Higher Temp',
        config: { temperature: 0.1, topP: 0.95, topK: 40 },
        description: 'Tiny temperature increase for variety'
    },
    {
        name: 'Test E: Moderate Temp',
        config: { temperature: 0.2, topP: 0.8, topK: 30 },
        description: 'Balanced approach'
    },
    {
        name: 'Test F: Ultra Conservative',
        config: { temperature: 0, topP: 0.3, topK: 10 },
        description: 'Extreme precision mode'
    }
];

// Results tracking
const results = {
    testRuns: [],
    summary: {
        bestConfiguration: null,
        bestScore: 0,
        fastestToSuccess: null,
        totalTestTime: 0,
        apiCallsUsed: 0
    }
};

class GeminiFeatureTester {
    constructor() {
        this.gemini = new GeminiClient();
        this.vision = new VisionAnalyzer();
        this.testDir = '/tmp/gemini-feature-tests';
    }

    /**
     * Initialize test environment
     */
    async initialize() {
        await fs.mkdir(this.testDir, { recursive: true });
        console.log('\n' + '='.repeat(80));
        console.log('🧪 GEMINI API FEATURE TESTING SUITE');
        console.log('='.repeat(80));
        console.log('\n📋 Test Objective: Optimize generation config for fewer errors');
        console.log('🎯 Target: Eliminate spelling errors, quotation errors, white box issues');
        console.log('📊 Method: 3 generations per config, tracked via Claude Vision\n');
    }

    /**
     * Test if candidateCount parameter is supported
     */
    async testCandidateCountSupport() {
        console.log('\n🔍 Testing candidateCount parameter support...');

        const testPrompt = 'Generate a simple test image with text "HELLO WORLD" in bold letters';
        const testPath = path.join(this.testDir, 'candidate-count-test.png');

        try {
            // Attempt to use candidateCount in the generation
            const response = await this.gemini.ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: [{ parts: [{ text: testPrompt }] }],
                generationConfig: {
                    temperature: 0,
                    topK: 40,
                    topP: 0.95,
                    candidateCount: 2  // Try to get 2 candidates
                }
            });

            console.log('✅ candidateCount parameter accepted by API');
            console.log(`   Candidates returned: ${response.candidates?.length || 1}`);

            return {
                supported: true,
                candidatesReturned: response.candidates?.length || 1
            };
        } catch (error) {
            if (error.message.includes('candidateCount') || error.message.includes('invalid')) {
                console.log('❌ candidateCount parameter NOT supported for image generation');
                return { supported: false, error: error.message };
            }
            console.log(`⚠️  Test inconclusive: ${error.message}`);
            return { supported: false, error: error.message };
        }
    }

    /**
     * Test if seed parameter is supported
     */
    async testSeedSupport() {
        console.log('\n🔍 Testing seed parameter support...');

        const testPrompt = 'Generate a simple test image with text "TEST 123"';

        try {
            // Attempt generation with seed parameter
            const response = await this.gemini.ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: [{ parts: [{ text: testPrompt }] }],
                generationConfig: {
                    temperature: 0,
                    topK: 40,
                    topP: 0.95,
                    seed: 42  // Test with seed value
                }
            });

            console.log('✅ seed parameter accepted by API');

            // Generate again with same seed to test reproducibility
            const response2 = await this.gemini.ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: [{ parts: [{ text: testPrompt }] }],
                generationConfig: {
                    temperature: 0,
                    topK: 40,
                    topP: 0.95,
                    seed: 42  // Same seed
                }
            });

            console.log('✅ Reproducibility test completed (manual verification needed)');

            return { supported: true };
        } catch (error) {
            if (error.message.includes('seed') || error.message.includes('invalid')) {
                console.log('❌ seed parameter NOT supported for image generation');
                return { supported: false, error: error.message };
            }
            console.log(`⚠️  Test inconclusive: ${error.message}`);
            return { supported: false, error: error.message };
        }
    }

    /**
     * Generate image with specific configuration
     */
    async generateWithConfig(prompt, config, testName, attemptNum) {
        const timestamp = Date.now();
        const filename = `${testName.replace(/[^a-z0-9]/gi, '-')}-attempt-${attemptNum}-${timestamp}.png`;
        const outputPath = path.join(this.testDir, filename);

        const startTime = Date.now();
        const result = await this.gemini.generateImage(prompt, outputPath, config);
        const generationTime = Date.now() - startTime;

        return {
            ...result,
            generationTime,
            filename
        };
    }

    /**
     * Run a single test configuration
     */
    async runTestConfiguration(testConfig, marketData, prompt) {
        console.log('\n' + '─'.repeat(80));
        console.log(`🧪 ${testConfig.name}`);
        console.log(`📝 ${testConfig.description}`);
        console.log(`⚙️  Config: temp=${testConfig.config.temperature}, topP=${testConfig.config.topP}, topK=${testConfig.config.topK}`);
        console.log('─'.repeat(80));

        const testResult = {
            configName: testConfig.name,
            config: testConfig.config,
            attempts: [],
            perfectAttempt: null,
            totalErrors: 0,
            totalTime: 0,
            successRate: 0
        };

        // Generate 3 images with this configuration
        for (let i = 1; i <= 3; i++) {
            console.log(`\n📸 Generation ${i}/3...`);

            const genResult = await this.generateWithConfig(
                prompt,
                testConfig.config,
                testConfig.name,
                i
            );

            if (!genResult.success) {
                console.log(`❌ Generation failed: ${genResult.error}`);
                testResult.attempts.push({
                    attemptNum: i,
                    success: false,
                    error: genResult.error
                });
                continue;
            }

            // Analyze quality with Claude Vision
            console.log('🔍 Analyzing quality...');
            const analysis = await this.vision.analyzeImage(
                genResult.imagePath,
                'Daily Rate Update',
                {
                    imageBuffer: genResult.imageBuffer,
                    mediaType: 'image/png'
                }
            );

            const attemptData = {
                attemptNum: i,
                success: genResult.success,
                filename: genResult.filename,
                generationTime: genResult.generationTime,
                score: analysis.score,
                errors: analysis.errors,
                errorCount: analysis.errors.length,
                isPerfect: analysis.score === 100
            };

            testResult.attempts.push(attemptData);
            testResult.totalErrors += analysis.errors.length;
            testResult.totalTime += genResult.generationTime;

            // Track first perfect generation
            if (analysis.score === 100 && !testResult.perfectAttempt) {
                testResult.perfectAttempt = i;
                console.log(`✅ PERFECT on attempt ${i}!`);
            }

            console.log(`📊 Score: ${analysis.score}% (${analysis.errors.length} errors)`);

            if (analysis.errors.length > 0) {
                console.log('⚠️  Errors found:');
                analysis.errors.forEach((err, idx) => {
                    console.log(`   ${idx + 1}. [${err.type}] ${err.issue}`);
                });
            }

            // Small delay between generations
            if (i < 3) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Calculate success rate
        const perfectCount = testResult.attempts.filter(a => a.isPerfect).length;
        testResult.successRate = (perfectCount / testResult.attempts.length) * 100;
        testResult.averageScore = testResult.attempts.reduce((sum, a) => sum + (a.score || 0), 0) / testResult.attempts.length;

        console.log('\n📊 Test Summary:');
        console.log(`   Perfect generations: ${perfectCount}/3 (${testResult.successRate.toFixed(1)}%)`);
        console.log(`   Average score: ${testResult.averageScore.toFixed(1)}%`);
        console.log(`   Total errors: ${testResult.totalErrors}`);
        console.log(`   Total time: ${(testResult.totalTime / 1000).toFixed(2)}s`);
        console.log(`   First perfect: ${testResult.perfectAttempt ? `Attempt ${testResult.perfectAttempt}` : 'None'}`);

        return testResult;
    }

    /**
     * Run all test configurations
     */
    async runAllTests() {
        await this.initialize();

        // Test API feature support
        console.log('\n' + '='.repeat(80));
        console.log('📡 API FEATURE DETECTION');
        console.log('='.repeat(80));

        const candidateCountSupport = await this.testCandidateCountSupport();
        const seedSupport = await this.testSeedSupport();

        results.apiFeatures = {
            candidateCount: candidateCountSupport,
            seed: seedSupport
        };

        // Get market data and build prompt
        const marketData = getMarketData();
        const prompt = buildDailyRateUpdatePrompt(marketData, false);

        console.log('\n' + '='.repeat(80));
        console.log('🧪 CONFIGURATION TESTING');
        console.log('='.repeat(80));
        console.log('\n📝 Using "Daily Rate Update" template');
        console.log(`📏 Prompt length: ${prompt.length} characters`);

        // Run each test configuration
        const overallStartTime = Date.now();

        for (const testConfig of TEST_CONFIGURATIONS) {
            const testResult = await this.runTestConfiguration(testConfig, marketData, prompt);
            results.testRuns.push(testResult);

            // Track best performing config
            if (testResult.successRate > results.summary.bestScore) {
                results.summary.bestScore = testResult.successRate;
                results.summary.bestConfiguration = testConfig.name;
            }

            // Track fastest to perfect
            if (testResult.perfectAttempt &&
                (!results.summary.fastestToSuccess || testResult.perfectAttempt < results.summary.fastestAttempt)) {
                results.summary.fastestToSuccess = testConfig.name;
                results.summary.fastestAttempt = testResult.perfectAttempt;
            }

            results.summary.apiCallsUsed += testResult.attempts.length;
        }

        results.summary.totalTestTime = Date.now() - overallStartTime;

        // Generate final report
        await this.generateReport();
    }

    /**
     * Generate comprehensive test report
     */
    async generateReport() {
        console.log('\n\n' + '='.repeat(80));
        console.log('📊 COMPREHENSIVE TEST REPORT');
        console.log('='.repeat(80));

        // API Features Section
        console.log('\n1️⃣  API FEATURES DISCOVERED\n');
        console.log('┌─────────────────────────────────────────────────────────┐');
        console.log('│ Feature          │ Supported │ Notes                   │');
        console.log('├─────────────────────────────────────────────────────────┤');
        console.log(`│ candidateCount   │ ${results.apiFeatures.candidateCount.supported ? '    ✅    ' : '    ❌    '} │ ${results.apiFeatures.candidateCount.supported ? 'Can generate multiple' : 'Not available'} │`);
        console.log(`│ seed             │ ${results.apiFeatures.seed.supported ? '    ✅    ' : '    ❌    '} │ ${results.apiFeatures.seed.supported ? 'Reproducible results' : 'Not available'}  │`);
        console.log('└─────────────────────────────────────────────────────────┘');

        // Test Results Comparison Table
        console.log('\n2️⃣  CONFIGURATION COMPARISON TABLE\n');
        console.log('┌─────────────────────────────┬──────────┬─────────┬────────┬─────────────┬──────────┐');
        console.log('│ Configuration               │ Success  │ Avg     │ Total  │ First       │ Avg Time │');
        console.log('│                             │ Rate     │ Score   │ Errors │ Perfect     │ (sec)    │');
        console.log('├─────────────────────────────┼──────────┼─────────┼────────┼─────────────┼──────────┤');

        for (const testRun of results.testRuns) {
            const configName = testRun.configName.padEnd(27);
            const successRate = `${testRun.successRate.toFixed(0)}%`.padStart(6);
            const avgScore = `${testRun.averageScore.toFixed(1)}%`.padStart(7);
            const totalErrors = testRun.totalErrors.toString().padStart(6);
            const firstPerfect = (testRun.perfectAttempt ? `Attempt ${testRun.perfectAttempt}` : 'None').padEnd(11);
            const avgTime = (testRun.totalTime / testRun.attempts.length / 1000).toFixed(2).padStart(8);

            console.log(`│ ${configName} │ ${successRate} │ ${avgScore} │ ${totalErrors} │ ${firstPerfect} │ ${avgTime} │`);
        }
        console.log('└─────────────────────────────┴──────────┴─────────┴────────┴─────────────┴──────────┘');

        // Error Type Breakdown
        console.log('\n3️⃣  ERROR TYPE ANALYSIS\n');
        const errorTypes = {};
        for (const testRun of results.testRuns) {
            for (const attempt of testRun.attempts) {
                if (attempt.errors) {
                    for (const error of attempt.errors) {
                        errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
                    }
                }
            }
        }

        console.log('Error Type Frequency:');
        Object.entries(errorTypes)
            .sort((a, b) => b[1] - a[1])
            .forEach(([type, count]) => {
                console.log(`  • ${type}: ${count} occurrences`);
            });

        // Winner Announcement
        console.log('\n4️⃣  OPTIMAL CONFIGURATION RECOMMENDATION\n');
        console.log('┌────────────────────────────────────────────────────────────────────┐');

        const bestConfig = results.testRuns.find(t => t.configName === results.summary.bestConfiguration);
        if (bestConfig) {
            console.log(`│ 🏆 WINNER: ${bestConfig.configName}`);
            console.log('│');
            console.log('│    Configuration:');
            console.log(`│      temperature: ${bestConfig.config.temperature}`);
            console.log(`│      topP: ${bestConfig.config.topP}`);
            console.log(`│      topK: ${bestConfig.config.topK}`);
            console.log('│');
            console.log('│    Performance:');
            console.log(`│      Success rate: ${bestConfig.successRate.toFixed(1)}%`);
            console.log(`│      Average score: ${bestConfig.averageScore.toFixed(1)}%`);
            console.log(`│      Total errors: ${bestConfig.totalErrors}`);
            console.log(`│      First perfect: ${bestConfig.perfectAttempt ? `Attempt ${bestConfig.perfectAttempt}` : 'None'}`);
        }
        console.log('└────────────────────────────────────────────────────────────────────┘');

        // Cost Analysis
        console.log('\n5️⃣  COST ANALYSIS\n');
        const costPerImage = 0.039; // $0.039 per image for gemini-2.5-flash-image
        const totalCost = results.summary.apiCallsUsed * costPerImage;
        console.log(`Total API calls: ${results.summary.apiCallsUsed}`);
        console.log(`Cost per image: $${costPerImage.toFixed(3)}`);
        console.log(`Total test cost: $${totalCost.toFixed(2)}`);

        if (bestConfig && bestConfig.perfectAttempt) {
            const avgAttemptsNeeded = bestConfig.perfectAttempt;
            const costPerPerfect = avgAttemptsNeeded * costPerImage;
            console.log(`\nProjected cost per perfect image (best config): $${costPerPerfect.toFixed(3)}`);
            console.log(`  (Based on first perfect at attempt ${avgAttemptsNeeded})`);
        }

        // Recommendations
        console.log('\n6️⃣  PRODUCTION RECOMMENDATIONS\n');

        if (bestConfig) {
            if (bestConfig.successRate >= 66.7) {
                console.log('✅ RECOMMENDED: Use winning configuration in production');
                console.log(`   Success rate of ${bestConfig.successRate.toFixed(0)}% is acceptable (≥67%)`);
            } else {
                console.log('⚠️  CAUTION: Even best config has <67% success rate');
                console.log('   Consider prompt engineering improvements alongside config tuning');
            }

            // Compare to baseline
            const baseline = results.testRuns.find(t => t.configName.includes('Baseline'));
            if (baseline && bestConfig.configName !== baseline.configName) {
                const improvement = bestConfig.successRate - baseline.successRate;
                console.log(`\n📈 Improvement over baseline: ${improvement >= 0 ? '+' : ''}${improvement.toFixed(1)}%`);
            }
        }

        console.log('\n7️⃣  IMPLEMENTATION CODE\n');
        console.log('Replace the generationConfig in gemini-client.js (line 79-83) with:\n');
        if (bestConfig) {
            console.log('```javascript');
            console.log('generationConfig: {');
            console.log(`    temperature: ${bestConfig.config.temperature},`);
            console.log(`    topK: ${bestConfig.config.topK},`);
            console.log(`    topP: ${bestConfig.config.topP}`);
            console.log('}');
            console.log('```');
        }

        // Save detailed JSON report
        const reportPath = path.join(this.testDir, 'test-report.json');
        await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
        console.log(`\n📄 Detailed JSON report saved: ${reportPath}`);

        console.log('\n' + '='.repeat(80));
        console.log('✅ TESTING COMPLETE');
        console.log('='.repeat(80) + '\n');
    }
}

// Run the test suite
const tester = new GeminiFeatureTester();
tester.runAllTests().catch(error => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
});
