#!/usr/bin/env node

/**
 * COMPREHENSIVE CREATIVITY SWEET SPOT TESTING
 *
 * Tests 5 configurations with 10 generations each to find optimal creativity/accuracy balance
 * Analyzes which safeguards are necessary at each creativity level
 */

import GeminiClient from './gemini-client.js';
import VisionAnalyzer from './vision-analyzer.js';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const CONFIGS = [
    {
        name: 'Config A: Proven Winner',
        temperature: 0.2,
        topP: 0.8,
        topK: 30,
        hypothesis: 'Baseline - known to work well'
    },
    {
        name: 'Config B: More Creative',
        temperature: 0.4,
        topP: 0.85,
        topK: 35,
        hypothesis: 'More design variety, still accurate text'
    },
    {
        name: 'Config C: High Creativity',
        temperature: 0.6,
        topP: 0.9,
        topK: 40,
        hypothesis: 'Very creative designs, may have more text errors'
    },
    {
        name: 'Config D: Maximum Creativity',
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        hypothesis: 'Wildly creative, testing upper limits'
    },
    {
        name: 'Config E: Extreme Creativity',
        temperature: 1.0,
        topP: 1.0,
        topK: 50,
        hypothesis: 'Maximum randomness, likely breaks text accuracy'
    }
];

const GENERATIONS_PER_CONFIG = 10;
const TEMPLATE_NAME = 'Daily Rate Update';

class CreativityTester {
    constructor() {
        this.gemini = new GeminiClient();
        this.vision = new VisionAnalyzer();
        this.results = [];
        this.outputDir = '/tmp/creativity-test';
    }

    async initialize() {
        await fs.mkdir(this.outputDir, { recursive: true });
        await fs.mkdir(`${this.outputDir}/images`, { recursive: true });
        console.log(`\n${'='.repeat(80)}`);
        console.log(`🧪 CREATIVITY SWEET SPOT TESTING - ${CONFIGS.length} CONFIGS x ${GENERATIONS_PER_CONFIG} IMAGES`);
        console.log(`${'='.repeat(80)}\n`);
    }

    async fetchMarketData() {
        try {
            const aiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
            const ai = new GoogleGenAI({ apiKey: aiKey });

            console.log('📊 Fetching live market data...');
            const pageResponse = await fetch('https://www.mortgagenewsdaily.com/mortgage-rates');
            const pageText = await pageResponse.text();
            const textContent = pageText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 3000);

            const geminiResponse = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: [{
                    parts: [{
                        text: `Extract market data from this text. Return ONLY JSON:
${textContent}

{
  "rate30yr": "X.XX%",
  "change30yr": "+/-X.XX% or —",
  "commentary": "brief expert quote or market summary",
  "economicFactors": [
    {"factor": "factor 1", "impact": "positive/negative"},
    {"factor": "factor 2", "impact": "positive/negative"},
    {"factor": "factor 3", "impact": "positive/negative"}
  ],
  "lockStrategy": "brief recommendation"
}`
                    }]
                }]
            });

            const jsonMatch = geminiResponse.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/);
            const data = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

            if (data) {
                console.log(`✅ Live data: ${data.rate30yr} (${data.change30yr})`);
                return data;
            }
        } catch (error) {
            console.log(`⚠️  Using fallback data (fetch error: ${error.message})`);
        }

        return {
            rate30yr: '6.38%',
            change30yr: '+0.02%',
            commentary: 'Rates stable near recent lows as markets digest Fed commentary',
            economicFactors: [
                { factor: 'Fed policy expectations', impact: 'positive' },
                { factor: 'Inflation data trending higher', impact: 'negative' },
                { factor: 'Market sentiment cautiously optimistic', impact: 'positive' }
            ],
            lockStrategy: 'Near recent lows - favorable time to lock'
        };
    }

    buildPrompt(marketData) {
        const date = new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        // Ensure we have at least 3 economic factors with defaults
        const factors = marketData.economicFactors || [];
        while (factors.length < 3) {
            factors.push({ factor: 'Market conditions stable', impact: 'positive' });
        }

        return `Create a professional mortgage marketing template with these EXACT specifications:

**LAYOUT & DESIGN:**
- Deep forest green gradient background (#1B4D3E to #2C5F4F)
- Premium metallic gold accents (#D4AF37)
- LendWise logo (gold owl) in top left corner
- Subtle depth with soft shadows and layering
- Clean, modern, luxurious aesthetic

**HEADER:**
Daily Rate Update
${date}

**MAIN RATE DISPLAY (Large, centered):**
${marketData.rate30yr}
30-Year Fixed
${marketData.change30yr} from yesterday

**3 ECONOMIC FACTORS (with icons/indicators):**
• ${factors[0].factor}
• ${factors[1].factor}
• ${factors[2].factor}

**LOCK STRATEGY BOX:**
${marketData.lockStrategy}

**EXPERT INSIGHT (quoted):**
"${marketData.commentary}"

**FOOTER (small text):**
David Young NMLS 62043
Phone 310-954-7771

CRITICAL TEXT REQUIREMENTS:
- Use BOTH opening " and closing " quotation marks for quoted text
- All text must be complete (no truncations)
- All rates must show percent signs (%)
- Verify spelling: OUTLOOK, MARKET, ECONOMIC, MORTGAGE, STRATEGY, COMMENTARY
- Premium design: NO white boxes, use dark green transparent overlays
- Ensure all text is clearly readable against background`;
    }

    async testConfiguration(config, configIndex) {
        console.log(`\n${'─'.repeat(80)}`);
        console.log(`📊 TESTING: ${config.name}`);
        console.log(`   Temperature: ${config.temperature}, topP: ${config.topP}, topK: ${config.topK}`);
        console.log(`   Hypothesis: ${config.hypothesis}`);
        console.log(`${'─'.repeat(80)}\n`);

        const marketData = await this.fetchMarketData();
        const prompt = this.buildPrompt(marketData);

        const configResults = {
            config: config,
            generations: [],
            successRate: 0,
            avgScore: 0,
            avgAttempts: 0,
            errorBreakdown: {
                spelling: 0,
                grammar: 0,
                quotation: 0,
                design: 0,
                completeness: 0,
                data: 0,
                visual: 0,
                other: 0
            },
            safeguardTriggers: {
                letterByLetterSpelling: 0,
                grammarApostrophe: 0,
                designQuality: 0,
                quotationCount: 0,
                textCompleteness: 0,
                dataAccuracy: 0
            }
        };

        for (let gen = 1; gen <= GENERATIONS_PER_CONFIG; gen++) {
            console.log(`\n--- Generation ${gen}/${GENERATIONS_PER_CONFIG} ---`);

            const imagePath = path.join(
                this.outputDir,
                'images',
                `config-${String.fromCharCode(65 + configIndex)}-gen-${gen}.png`
            );

            // Generate image
            const genResult = await this.gemini.generateImage(prompt, imagePath, {
                temperature: config.temperature,
                topP: config.topP,
                topK: config.topK
            });

            if (!genResult.success) {
                console.log(`❌ Generation failed: ${genResult.error}`);
                configResults.generations.push({
                    success: false,
                    error: genResult.error
                });
                continue;
            }

            // Analyze with vision
            const analysis = await this.vision.analyzeImage(genResult.imagePath, TEMPLATE_NAME, {
                imageBuffer: genResult.imageBuffer,
                mediaType: 'image/png'
            });

            // Track which safeguards would have triggered
            this.analyzeSafeguardTriggers(analysis, configResults.safeguardTriggers);

            // Categorize errors
            if (analysis.errors && analysis.errors.length > 0) {
                for (const error of analysis.errors) {
                    const errorType = this.categorizeError(error);
                    configResults.errorBreakdown[errorType]++;
                }
            }

            const result = {
                generation: gen,
                success: analysis.success && analysis.score === 100,
                score: analysis.score,
                errors: analysis.errors || [],
                imagePath: imagePath,
                analysis: analysis.analysis
            };

            configResults.generations.push(result);

            console.log(`   Score: ${result.score}%${result.success ? ' ✅ PERFECT' : ''}`);
            if (result.errors.length > 0) {
                console.log(`   Errors: ${result.errors.map(e => e.type).join(', ')}`);
            }

            // Small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Calculate statistics
        const successfulGens = configResults.generations.filter(g => g.success).length;
        configResults.successRate = (successfulGens / GENERATIONS_PER_CONFIG) * 100;
        configResults.avgScore = configResults.generations.reduce((sum, g) => sum + (g.score || 0), 0) / GENERATIONS_PER_CONFIG;

        // For successful attempts, how many tries would it take on average?
        configResults.avgAttempts = successfulGens > 0 ?
            Math.ceil(GENERATIONS_PER_CONFIG / successfulGens) :
            999;

        console.log(`\n📈 ${config.name} Results:`);
        console.log(`   Success Rate: ${configResults.successRate.toFixed(1)}% (${successfulGens}/${GENERATIONS_PER_CONFIG})`);
        console.log(`   Average Score: ${configResults.avgScore.toFixed(1)}%`);
        console.log(`   Avg Attempts to Perfect: ${configResults.avgAttempts}`);

        this.results.push(configResults);
        return configResults;
    }

    categorizeError(error) {
        const type = error.type?.toLowerCase() || '';
        const issue = error.issue?.toLowerCase() || '';

        if (type.includes('spell') || type.includes('typo')) return 'spelling';
        if (type.includes('grammar') || issue.includes('apostrophe')) return 'grammar';
        if (type.includes('quotation') || issue.includes('quote')) return 'quotation';
        if (type.includes('design') || issue.includes('white box') || issue.includes('light gray')) return 'design';
        if (issue.includes('truncat') || issue.includes('cut off') || issue.includes('incomplete')) return 'completeness';
        if (issue.includes('rate') || issue.includes('percent') || issue.includes('%')) return 'data';
        if (type.includes('visual') || issue.includes('logo') || issue.includes('background')) return 'visual';
        return 'other';
    }

    analyzeSafeguardTriggers(analysis, triggers) {
        if (!analysis.errors) return;

        for (const error of analysis.errors) {
            const issue = error.issue?.toLowerCase() || '';
            const type = error.type?.toLowerCase() || '';

            // Letter-by-letter spelling verification
            if (type.includes('spell') || type.includes('typo') ||
                issue.includes('outlook') || issue.includes('market') ||
                issue.includes('economic') || issue.includes('mortgage')) {
                triggers.letterByLetterSpelling++;
            }

            // Grammar/apostrophe checking
            if (issue.includes('apostrophe') || issue.includes("low's") || issue.includes("week's")) {
                triggers.grammarApostrophe++;
            }

            // Design quality (white box detection)
            if (issue.includes('white') || issue.includes('light gray') || issue.includes('box')) {
                triggers.designQuality++;
            }

            // Quotation mark counting
            if (issue.includes('quotation') || issue.includes('quote') || issue.includes('"')) {
                triggers.quotationCount++;
            }

            // Text completeness
            if (issue.includes('truncat') || issue.includes('cut off') || issue.includes('incomplete')) {
                triggers.textCompleteness++;
            }

            // Data accuracy
            if (issue.includes('rate') || issue.includes('percent') || issue.includes('%')) {
                triggers.dataAccuracy++;
            }
        }
    }

    generateReport() {
        console.log(`\n\n${'='.repeat(80)}`);
        console.log('📊 COMPREHENSIVE TEST RESULTS');
        console.log(`${'='.repeat(80)}\n`);

        // Table 1: Success Rates
        console.log('\n📈 SUCCESS RATE COMPARISON:\n');
        console.log('Config                    | Temp | TopP | TopK | Success | Avg Score | Avg Attempts');
        console.log(`${'-'.repeat(85)}`);

        for (const result of this.results) {
            const cfg = result.config;
            console.log(
                `${cfg.name.padEnd(24)} | ${cfg.temperature.toFixed(1)}  | ${cfg.topP.toFixed(2)} | ${String(cfg.topK).padEnd(4)} | ` +
                `${result.successRate.toFixed(1).padStart(5)}%  | ${result.avgScore.toFixed(1).padStart(7)}%  | ${String(result.avgAttempts).padStart(12)}`
            );
        }

        // Table 2: Error Breakdown
        console.log('\n\n⚠️  ERROR BREAKDOWN BY TYPE:\n');
        console.log('Config                    | Spell | Grammar | Quote | Design | Complete | Data | Visual | Other');
        console.log(`${'-'.repeat(95)}`);

        for (const result of this.results) {
            const e = result.errorBreakdown;
            console.log(
                `${result.config.name.padEnd(24)} | ${String(e.spelling).padStart(5)} | ${String(e.grammar).padStart(7)} | ` +
                `${String(e.quotation).padStart(5)} | ${String(e.design).padStart(6)} | ${String(e.completeness).padStart(8)} | ` +
                `${String(e.data).padStart(4)} | ${String(e.visual).padStart(6)} | ${String(e.other).padStart(5)}`
            );
        }

        // Table 3: Safeguard Analysis
        console.log('\n\n🛡️  SAFEGUARD TRIGGER ANALYSIS:\n');
        console.log('Config                    | Spelling | Grammar | Design | Quotation | Complete | Data');
        console.log(`${'-'.repeat(90)}`);

        for (const result of this.results) {
            const s = result.safeguardTriggers;
            console.log(
                `${result.config.name.padEnd(24)} | ${String(s.letterByLetterSpelling).padStart(8)} | ${String(s.grammarApostrophe).padStart(7)} | ` +
                `${String(s.designQuality).padStart(6)} | ${String(s.quotationCount).padStart(9)} | ${String(s.textCompleteness).padStart(8)} | ${String(s.dataAccuracy).padStart(4)}`
            );
        }

        // Find sweet spot
        console.log('\n\n🎯 SWEET SPOT ANALYSIS:\n');

        const highSuccess = this.results.filter(r => r.successRate >= 80);
        if (highSuccess.length > 0) {
            // Find highest creativity among successful configs
            const sweetSpot = highSuccess.reduce((best, current) =>
                current.config.temperature > best.config.temperature ? current : best
            );

            console.log(`✅ RECOMMENDED CONFIGURATION: ${sweetSpot.config.name}`);
            console.log(`   Temperature: ${sweetSpot.config.temperature}`);
            console.log(`   TopP: ${sweetSpot.config.topP}`);
            console.log(`   TopK: ${sweetSpot.config.topK}`);
            console.log(`   Success Rate: ${sweetSpot.successRate.toFixed(1)}%`);
            console.log(`   Average Score: ${sweetSpot.avgScore.toFixed(1)}%`);
            console.log(`   Expected Attempts: ${sweetSpot.avgAttempts}`);
        } else {
            console.log('⚠️  No configuration achieved 80%+ success rate');
            const best = this.results.reduce((best, current) =>
                current.successRate > best.successRate ? current : best
            );
            console.log(`📊 Best performing: ${best.config.name} (${best.successRate.toFixed(1)}% success)`);
        }

        // Safeguard recommendations
        console.log('\n\n🔧 SAFEGUARD RECOMMENDATIONS:\n');

        const totalTriggers = this.results.reduce((sum, r) => {
            return sum + Object.values(r.safeguardTriggers).reduce((s, v) => s + v, 0);
        }, 0);

        const safeguardImportance = {
            letterByLetterSpelling: this.results.reduce((s, r) => s + r.safeguardTriggers.letterByLetterSpelling, 0),
            grammarApostrophe: this.results.reduce((s, r) => s + r.safeguardTriggers.grammarApostrophe, 0),
            designQuality: this.results.reduce((s, r) => s + r.safeguardTriggers.designQuality, 0),
            quotationCount: this.results.reduce((s, r) => s + r.safeguardTriggers.quotationCount, 0),
            textCompleteness: this.results.reduce((s, r) => s + r.safeguardTriggers.textCompleteness, 0),
            dataAccuracy: this.results.reduce((s, r) => s + r.safeguardTriggers.dataAccuracy, 0)
        };

        const ranked = Object.entries(safeguardImportance)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => ({
                name,
                count,
                percentage: totalTriggers > 0 ? (count / totalTriggers * 100).toFixed(1) : 0
            }));

        console.log('Safeguard Priority Ranking (based on trigger frequency):\n');
        ranked.forEach((s, i) => {
            const importance = s.count > 5 ? '🔴 CRITICAL' : s.count > 2 ? '🟡 IMPORTANT' : '🟢 OPTIONAL';
            console.log(`${i + 1}. ${s.name.padEnd(25)} - ${String(s.count).padStart(3)} triggers (${s.percentage}%) ${importance}`);
        });

        // Safeguards to remove
        const removable = ranked.filter(s => s.count <= 1);
        if (removable.length > 0) {
            console.log('\n✂️  SAFEGUARDS THAT CAN BE REMOVED (≤1 trigger):');
            removable.forEach(s => {
                console.log(`   - ${s.name} (only ${s.count} trigger${s.count !== 1 ? 's' : ''})`);
            });
        }

        // Cost analysis
        console.log('\n\n💰 COST ANALYSIS:\n');
        const totalImages = this.results.length * GENERATIONS_PER_CONFIG;
        const costPerImage = 0.039; // Current Gemini pricing
        const totalCost = totalImages * costPerImage;

        console.log(`Total Images Generated: ${totalImages}`);
        console.log(`Cost per Image: $${costPerImage.toFixed(3)}`);
        console.log(`Total Test Cost: $${totalCost.toFixed(2)}`);

        for (const result of this.results) {
            const costToSuccess = result.avgAttempts * costPerImage;
            console.log(`${result.config.name}: $${costToSuccess.toFixed(3)} per perfect image (${result.avgAttempts} avg attempts)`);
        }
    }

    async saveResults() {
        const reportPath = path.join(this.outputDir, 'test-report.json');
        const report = {
            timestamp: new Date().toISOString(),
            totalGenerations: this.results.length * GENERATIONS_PER_CONFIG,
            results: this.results,
            summary: {
                bestConfig: this.results.reduce((best, current) =>
                    current.successRate > best.successRate ? current : best
                ).config.name,
                avgSuccessRate: this.results.reduce((sum, r) => sum + r.successRate, 0) / this.results.length,
                totalErrors: this.results.reduce((sum, r) =>
                    sum + Object.values(r.errorBreakdown).reduce((s, v) => s + v, 0), 0
                )
            }
        };

        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n\n💾 Full results saved to: ${reportPath}`);
        console.log(`📁 Images saved to: ${this.outputDir}/images/`);
    }

    async run() {
        await this.initialize();

        for (let i = 0; i < CONFIGS.length; i++) {
            await this.testConfiguration(CONFIGS[i], i);
        }

        this.generateReport();
        await this.saveResults();

        console.log(`\n${'='.repeat(80)}`);
        console.log('✅ TESTING COMPLETE');
        console.log(`${'='.repeat(80)}\n`);
    }
}

// Run the test
const tester = new CreativityTester();
tester.run().catch(error => {
    console.error(`\n❌ Test failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
});
