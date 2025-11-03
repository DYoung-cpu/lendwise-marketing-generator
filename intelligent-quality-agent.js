#!/usr/bin/env node

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

/**
 * Intelligent Quality Agent
 * Uses Claude AI for intelligent error analysis, strategy selection, and learning
 */

class IntelligentQualityAgent {
    constructor(learningDBPath, strategyLibPath) {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY environment variable not set');
        }

        this.client = new Anthropic({ apiKey });
        this.learningDBPath = learningDBPath;
        this.strategyLibPath = strategyLibPath;
        this.learningDB = null;
        this.strategyLib = null;
    }

    /**
     * Initialize agent - load learning database and strategy library
     */
    async initialize() {
        console.log('\n🤖 Initializing Intelligent Quality Agent...');

        // Load learning database
        try {
            const dbContent = await fs.readFile(this.learningDBPath, 'utf-8');
            this.learningDB = JSON.parse(dbContent);
            console.log(`✅ Loaded learning database with ${Object.keys(this.learningDB.patterns || {}).length} patterns`);
        } catch (error) {
            console.log('⚠️  Learning database not found - creating new one');
            this.learningDB = {
                patterns: {},
                template_specific: {},
                global_learnings: [],
                strategy_success_rates: {},
                gemini_insights: {
                    perfect: ['single_words_under_8_chars', 'numbers_with_decimals', 'dates', 'short_phrases_under_6_words'],
                    excellent: ['structured_lists', 'table_data', 'boxed_content', 'bold_headers'],
                    good: ['sentences_under_12_words', 'simple_vocabulary', 'quoted_text_in_boxes'],
                    problematic: ['complex_words_over_10_chars', 'sentences_over_15_words', 'words_like_weave_leave_breathe']
                },
                last_updated: new Date().toISOString()
            };
        }

        // Load strategy library
        try {
            const {default: strategyLib} = await import(this.strategyLibPath);
            this.strategyLib = strategyLib;
            console.log(`✅ Loaded strategy library with ${this.strategyLib.categories.length} categories`);
        } catch (error) {
            console.error(`❌ Failed to load strategy library: ${error.message}`);
            throw error;
        }

        console.log('✅ Agent initialization complete\n');
    }

    /**
     * Analyze errors using Claude AI to understand root causes
     * @param {Array} errors - Errors from vision analysis
     * @param {string} templateName - Template being tested
     * @param {number} attempt - Current attempt number
     * @param {Array} previousStrategies - Strategies tried before
     * @returns {Promise<Object>} Analysis with root causes and recommendations
     */
    async analyzeErrors(errors, templateName, attempt, previousStrategies) {
        console.log(`\n🧠 Claude AI analyzing ${errors.length} error(s)...`);

        const errorContext = errors.map((e, i) =>
            `${i + 1}. [${e.type}] ${e.issue}${e.severity ? ` (severity: ${e.severity})` : ''}`
        ).join('\n');

        const previousContext = previousStrategies.length > 0
            ? `\n\nPrevious strategies tried (all failed):\n${previousStrategies.map((s, i) => `${i + 1}. ${s.name} (category: ${s.category})`).join('\n')}`
            : '';

        const learningContext = this.buildLearningContext(templateName);

        const prompt = `You are an expert in debugging AI-generated marketing images created by Gemini 2.5 Flash.

**Current Situation:**
- Template: ${templateName}
- Attempt: ${attempt}
- Errors detected:
${errorContext}
${previousContext}

**Your Knowledge Base:**
${learningContext}

**Task:**
Analyze these errors deeply and provide:
1. Root cause analysis - WHY is Gemini failing?
2. Pattern recognition - Have we seen this before?
3. Specific recommendations - What strategy should we try next?
4. Confidence level - How confident are you this will work?

Return ONLY valid JSON in this format:
{
  "root_cause": "explanation of why errors occurred",
  "error_category": "typo|formatting|missing_element|rendering|other",
  "pattern_match": "name of similar pattern from knowledge base, or 'new_pattern'",
  "recommended_strategies": [
    {"name": "strategy name", "reasoning": "why this will work", "confidence": 0-100}
  ],
  "gemini_insights": "specific insights about Gemini's behavior"
}`;

        try {
            const response = await this.client.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 2000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            });

            const analysisText = response.content[0].text;
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                const analysis = JSON.parse(jsonMatch[0]);
                console.log('✅ Analysis complete');
                console.log(`   Root cause: ${analysis.root_cause.substring(0, 80)}...`);
                console.log(`   Category: ${analysis.error_category}`);
                console.log(`   Top recommendation: ${analysis.recommended_strategies[0]?.name}`);
                return analysis;
            }

            throw new Error('Could not parse Claude response as JSON');

        } catch (error) {
            console.error(`❌ Error in AI analysis: ${error.message}`);
            // Fallback to simple analysis
            return {
                root_cause: 'Analysis failed - using fallback logic',
                error_category: 'unknown',
                pattern_match: 'new_pattern',
                recommended_strategies: [
                    {name: 'shorten_text', reasoning: 'Generic fallback', confidence: 50}
                ],
                gemini_insights: 'Unable to get AI insights'
            };
        }
    }

    /**
     * Build learning context from database for Claude
     */
    buildLearningContext(templateName) {
        const patterns = Object.entries(this.learningDB.patterns || {})
            .slice(0, 5) // Top 5 patterns
            .map(([name, data]) =>
                `- ${name}: ${data.occurrences} times, best fix: ${data.successful_fixes?.[0]?.fix || 'none'}`
            ).join('\n');

        const templateLearnings = this.learningDB.template_specific?.[templateName] || {};
        const templateContext = templateLearnings.best_solutions
            ? `\nTemplate-specific: ${templateLearnings.best_solutions.join(', ')}`
            : '';

        const globalLearnings = (this.learningDB.global_learnings || [])
            .slice(0, 3)
            .map(l => `- ${l}`)
            .join('\n');

        return `**Knowledge Base:**
Top Patterns:
${patterns || 'No patterns yet'}
${templateContext}

Global Learnings:
${globalLearnings || 'No global learnings yet'}

Gemini Strengths: ${this.learningDB.gemini_insights.perfect.join(', ')}
Gemini Weaknesses: ${this.learningDB.gemini_insights.problematic.join(', ')}`;
    }

    /**
     * Select best strategy based on AI analysis and success rates
     * @param {Object} analysis - AI analysis from Claude
     * @param {number} attempt - Current attempt number
     * @returns {Object} Selected strategy with full details
     */
    async selectStrategy(analysis, attempt) {
        console.log(`\n📋 Selecting strategy for attempt ${attempt}...`);

        // Get recommended strategies from AI
        const aiRecommendations = analysis.recommended_strategies || [];

        // Get strategies from library based on attempt number and category
        const categoryToUse = this.determineCategoryForAttempt(attempt, analysis.error_category);
        const libraryStrategies = this.strategyLib.getStrategiesForCategory(categoryToUse);

        // Match AI recommendations with library strategies
        let selectedStrategy = null;
        let highestScore = 0;

        for (const aiRec of aiRecommendations) {
            for (const libStrat of libraryStrategies) {
                // Calculate matching score
                const nameMatch = this.fuzzyMatch(aiRec.name, libStrat.name);
                const successRate = this.learningDB.strategy_success_rates[libStrat.name] || 0.5;
                const confidenceScore = aiRec.confidence / 100;

                const totalScore = (nameMatch * 0.3) + (successRate * 0.4) + (confidenceScore * 0.3);

                if (totalScore > highestScore) {
                    highestScore = totalScore;
                    selectedStrategy = {
                        ...libStrat,
                        ai_reasoning: aiRec.reasoning,
                        confidence: aiRec.confidence,
                        score: totalScore
                    };
                }
            }
        }

        // Fallback to highest success rate strategy if no good match
        if (!selectedStrategy || highestScore < 0.4) {
            const fallback = libraryStrategies.reduce((best, strat) => {
                const rate = this.learningDB.strategy_success_rates[strat.name] || 0.3;
                return rate > (this.learningDB.strategy_success_rates[best?.name] || 0) ? strat : best;
            }, libraryStrategies[0]);

            selectedStrategy = {
                ...fallback,
                ai_reasoning: 'Fallback to highest success rate strategy',
                confidence: 60,
                score: 0.6
            };
        }

        console.log(`✅ Selected: ${selectedStrategy.name}`);
        console.log(`   Category: ${selectedStrategy.category}`);
        console.log(`   Confidence: ${selectedStrategy.confidence}%`);
        console.log(`   Reasoning: ${selectedStrategy.ai_reasoning.substring(0, 80)}...`);

        return selectedStrategy;
    }

    /**
     * Determine which strategy category to use based on attempt number
     */
    determineCategoryForAttempt(attempt, errorCategory) {
        if (attempt <= 3) {
            return 'Text Optimization';
        } else if (attempt <= 6) {
            return 'Visual Formatting';
        } else if (attempt <= 9) {
            return 'Gemini Exploitation';
        } else {
            return 'Innovation';
        }
    }

    /**
     * Fuzzy string matching for strategy names
     */
    fuzzyMatch(str1, str2) {
        str1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
        str2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (str1 === str2) return 1.0;
        if (str1.includes(str2) || str2.includes(str1)) return 0.8;

        // Simple character overlap
        const set1 = new Set(str1);
        const set2 = new Set(str2);
        const intersection = [...set1].filter(c => set2.has(c)).length;
        const union = new Set([...set1, ...set2]).size;
        return intersection / union;
    }

    /**
     * Learn from generation result - update learning database
     * @param {Object} result - Generation result with success/failure
     * @param {Object} strategy - Strategy that was used
     * @param {string} templateName - Template name
     */
    async learn(result, strategy, templateName) {
        console.log('\n📚 Learning from result...');

        const success = result.score === 100;
        const patternKey = this.identifyPattern(result.errors);

        // Update pattern database
        if (!this.learningDB.patterns[patternKey]) {
            this.learningDB.patterns[patternKey] = {
                identified: new Date().toISOString(),
                occurrences: 0,
                successful_fixes: []
            };
        }

        this.learningDB.patterns[patternKey].occurrences++;

        if (success) {
            // Add successful fix
            const fixes = this.learningDB.patterns[patternKey].successful_fixes;
            const existing = fixes.find(f => f.fix === strategy.name);

            if (existing) {
                existing.success_count++;
                existing.success_rate = existing.success_count / (existing.success_count + (existing.fail_count || 0));
            } else {
                fixes.push({
                    fix: strategy.name,
                    category: strategy.category,
                    success_count: 1,
                    fail_count: 0,
                    success_rate: 1.0,
                    first_success: new Date().toISOString()
                });
            }

            // Sort by success rate
            fixes.sort((a, b) => b.success_rate - a.success_rate);

            console.log(`✅ Learned: ${strategy.name} works for ${patternKey}`);
        } else {
            // Record failure
            const fixes = this.learningDB.patterns[patternKey].successful_fixes;
            const existing = fixes.find(f => f.fix === strategy.name);

            if (existing) {
                existing.fail_count = (existing.fail_count || 0) + 1;
                existing.success_rate = existing.success_count / (existing.success_count + existing.fail_count);
            }
        }

        // Update template-specific learnings
        if (!this.learningDB.template_specific[templateName]) {
            this.learningDB.template_specific[templateName] = {
                common_issues: [],
                best_solutions: []
            };
        }

        if (success) {
            const bestSolutions = this.learningDB.template_specific[templateName].best_solutions;
            if (!bestSolutions.includes(strategy.name)) {
                bestSolutions.push(strategy.name);
            }
        }

        // Update strategy success rates
        if (!this.learningDB.strategy_success_rates[strategy.name]) {
            this.learningDB.strategy_success_rates[strategy.name] = 0.5;
        }

        const currentRate = this.learningDB.strategy_success_rates[strategy.name];
        const alpha = 0.3; // Learning rate
        this.learningDB.strategy_success_rates[strategy.name] =
            success ? currentRate + alpha * (1 - currentRate) : currentRate * (1 - alpha);

        // Update timestamp
        this.learningDB.last_updated = new Date().toISOString();

        // Save to disk
        await this.saveLearningDB();

        console.log('💾 Learning database updated');
    }

    /**
     * Identify pattern from errors
     */
    identifyPattern(errors) {
        if (!errors || errors.length === 0) return 'no_errors';

        const types = errors.map(e => e.type).join('_');
        const issues = errors.map(e => {
            const lower = e.issue.toLowerCase();
            if (lower.includes('typo')) return 'typo';
            if (lower.includes('quote')) return 'quote';
            if (lower.includes('missing')) return 'missing';
            if (lower.includes('long') || lower.includes('commentary')) return 'long_text';
            return 'other';
        }).join('_');

        return `${types}_${issues}`;
    }

    /**
     * Save learning database to disk
     */
    async saveLearningDB() {
        try {
            await fs.writeFile(
                this.learningDBPath,
                JSON.stringify(this.learningDB, null, 2),
                'utf-8'
            );
        } catch (error) {
            console.error(`❌ Failed to save learning database: ${error.message}`);
        }
    }

    /**
     * Get summary of learnings for reporting
     */
    getSummary() {
        const patternCount = Object.keys(this.learningDB.patterns || {}).length;
        const strategiesLearned = Object.keys(this.learningDB.strategy_success_rates || {}).length;
        const templateCount = Object.keys(this.learningDB.template_specific || {}).length;

        return {
            patterns_identified: patternCount,
            strategies_evaluated: strategiesLearned,
            templates_learned: templateCount,
            top_strategies: Object.entries(this.learningDB.strategy_success_rates || {})
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, rate]) => ({name, success_rate: Math.round(rate * 100) + '%'})),
            last_updated: this.learningDB.last_updated
        };
    }
}

export default IntelligentQualityAgent;
