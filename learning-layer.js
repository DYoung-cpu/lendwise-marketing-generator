#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * Learning Layer for Quality-Backend
 * Tracks errors, detects patterns, and automatically fixes prompts
 *
 * Requirements:
 * - 90% success rate (9/10 generations perfect)
 * - After 2 identical errors, adjust prompt automatically
 * - Test fix 2 times for confidence before confirming
 * - 100% text accuracy on generated images
 */

class LearningLayer {
    constructor() {
        this.dbPath = '/mnt/c/Users/dyoun/Active Projects/manual-learning-database.json';
        this.learningData = null;
        this.initialized = false;
    }

    /**
     * Initialize learning database
     */
    async initialize() {
        if (this.initialized) return;

        try {
            const data = await fs.readFile(this.dbPath, 'utf8');
            this.learningData = JSON.parse(data);
            console.log('📚 Learning database loaded');
        } catch (error) {
            // Create new database
            this.learningData = {
                templates: {
                    'Daily Rate Update': {
                        errorPatterns: {},
                        promptModifications: {},
                        successRate: 0,
                        totalGenerations: 0,
                        perfectGenerations: 0
                    },
                    'Market Report': {
                        errorPatterns: {},
                        promptModifications: {},
                        successRate: 0,
                        totalGenerations: 0,
                        perfectGenerations: 0
                    },
                    'Rate Trends': {
                        errorPatterns: {},
                        promptModifications: {},
                        successRate: 0,
                        totalGenerations: 0,
                        perfectGenerations: 0
                    },
                    'Economic Outlook': {
                        errorPatterns: {},
                        promptModifications: {},
                        successRate: 0,
                        totalGenerations: 0,
                        perfectGenerations: 0
                    }
                },
                globalStats: {
                    totalGenerations: 0,
                    perfectGenerations: 0,
                    currentSuccessRate: 0
                },
                lastUpdated: new Date().toISOString()
            };
            await this.save();
            console.log('📚 New learning database created');
        }

        this.initialized = true;
    }

    /**
     * Save learning database
     */
    async save() {
        this.learningData.lastUpdated = new Date().toISOString();
        await fs.writeFile(this.dbPath, JSON.stringify(this.learningData, null, 2));
    }

    /**
     * Record intermediate error (from attempts that eventually succeed)
     * @param {string} templateName - Template name
     * @param {object} error - Error object {type, issue}
     */
    async recordIntermediateError(templateName, error) {
        await this.initialize();

        const template = this.learningData.templates[templateName];
        if (!template) return;

        const errorKey = `${error.type}:${error.issue}`;

        if (!template.errorPatterns[errorKey]) {
            template.errorPatterns[errorKey] = {
                count: 0,
                firstSeen: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
                errorType: error.type,
                errorIssue: error.issue,
                fixAttempted: false,
                fixConfirmed: false,
                fixTestCount: 0
            };
        }

        const pattern = template.errorPatterns[errorKey];
        pattern.count++;
        pattern.lastSeen = new Date().toISOString();

        console.log(`📝 Error tracked: [${error.type}] ${error.issue} (count: ${pattern.count})`);

        await this.save();
    }

    /**
     * Record generation result
     * @param {string} templateName - Template name
     * @param {object} result - Generation result from quality-backend
     */
    async recordGeneration(templateName, result) {
        await this.initialize();

        const template = this.learningData.templates[templateName];
        if (!template) return;

        // Update generation counts
        template.totalGenerations++;
        this.learningData.globalStats.totalGenerations++;

        if (result.success && result.score === 100) {
            template.perfectGenerations++;
            this.learningData.globalStats.perfectGenerations++;
        }

        // Update success rates
        template.successRate = (template.perfectGenerations / template.totalGenerations) * 100;
        this.learningData.globalStats.currentSuccessRate =
            (this.learningData.globalStats.perfectGenerations / this.learningData.globalStats.totalGenerations) * 100;

        // Track error patterns
        if (result.errors && result.errors.length > 0) {
            for (const error of result.errors) {
                const errorKey = `${error.type}:${error.issue}`;

                if (!template.errorPatterns[errorKey]) {
                    template.errorPatterns[errorKey] = {
                        count: 0,
                        firstSeen: new Date().toISOString(),
                        lastSeen: new Date().toISOString(),
                        errorType: error.type,
                        errorIssue: error.issue,
                        fixAttempted: false,
                        fixConfirmed: false,
                        fixTestCount: 0
                    };
                }

                const pattern = template.errorPatterns[errorKey];
                pattern.count++;
                pattern.lastSeen = new Date().toISOString();
            }
        }

        await this.save();

        // Log current performance
        console.log(`\n📊 LEARNING STATS - ${templateName}:`);
        console.log(`   Success Rate: ${template.successRate.toFixed(1)}% (${template.perfectGenerations}/${template.totalGenerations})`);
        console.log(`   Global Success Rate: ${this.learningData.globalStats.currentSuccessRate.toFixed(1)}%`);
        console.log(`   Target: 90%`);
    }

    /**
     * Check if prompt modification is needed
     * @param {string} templateName - Template name
     * @returns {object|null} Modification strategy or null
     */
    async checkForPromptModification(templateName) {
        await this.initialize();

        const template = this.learningData.templates[templateName];
        if (!template) return null;

        // Find errors that occurred 2+ times and need fixing
        for (const [errorKey, pattern] of Object.entries(template.errorPatterns)) {
            if (pattern.count >= 2 && !pattern.fixAttempted) {
                console.log(`\n🔍 PATTERN DETECTED:`);
                console.log(`   Error: [${pattern.errorType}] ${pattern.errorIssue}`);
                console.log(`   Occurrences: ${pattern.count}`);
                console.log(`   🔧 TRIGGERING AUTOMATIC FIX...`);

                // Mark as fix attempted
                pattern.fixAttempted = true;
                pattern.fixStarted = new Date().toISOString();
                await this.save();

                // Return modification strategy
                return {
                    errorKey,
                    errorType: pattern.errorType,
                    errorIssue: pattern.errorIssue,
                    strategy: this.getFixStrategy(pattern.errorType, pattern.errorIssue)
                };
            }
        }

        return null;
    }

    /**
     * Get fix strategy for error type
     * @param {string} errorType - Error type (typo, missing_content, etc.)
     * @param {string} errorIssue - Error description
     * @returns {object} Fix strategy
     */
    getFixStrategy(errorType, errorIssue) {
        const issue = errorIssue.toLowerCase();

        // Typo/spelling fixes
        if (errorType === 'typo' || issue.includes('spell') || issue.includes('typo')) {
            return {
                type: 'simplify_text',
                description: 'Replace complex words with simple alternatives',
                action: 'Remove words longer than 10 characters, use CAPS for emphasis'
            };
        }

        // Missing quote marks
        if (issue.includes('quote') || issue.includes('"')) {
            return {
                type: 'force_quotes',
                description: 'Add explicit quote mark instructions',
                action: 'Add "CRITICAL: Use BOTH opening \" and closing \" quotation marks"'
            };
        }

        // Missing percentage signs
        if (issue.includes('%') || issue.includes('percent')) {
            return {
                type: 'add_percent',
                description: 'Explicitly add % sign to all rates',
                action: 'Change "6.38" to "6.38%" in prompt'
            };
        }

        // Background color issues
        if (issue.includes('background') || issue.includes('color') || issue.includes('blue') || issue.includes('green')) {
            return {
                type: 'fix_background',
                description: 'Explicitly state forest green background',
                action: 'Add "DESIGN: Forest green gradient background (NOT blue, NOT navy)"'
            };
        }

        // Missing content/data
        if (issue.includes('missing') || issue.includes('absent') || issue.includes('not present')) {
            return {
                type: 'reduce_sections',
                description: 'Simplify prompt to 15-word sections',
                action: 'Break complex sections into 15-word chunks'
            };
        }

        // Default strategy
        return {
            type: 'simplify_overall',
            description: 'Simplify entire prompt',
            action: 'Reduce word count, use CAPS, explicit instructions'
        };
    }

    /**
     * Record fix test result
     * @param {string} templateName - Template name
     * @param {string} errorKey - Error key that was fixed
     * @param {boolean} success - Whether test was successful (100% score)
     */
    async recordFixTest(templateName, errorKey, success) {
        await this.initialize();

        const template = this.learningData.templates[templateName];
        if (!template || !template.errorPatterns[errorKey]) return;

        const pattern = template.errorPatterns[errorKey];
        pattern.fixTestCount++;

        if (success) {
            pattern.consecutiveSuccesses = (pattern.consecutiveSuccesses || 0) + 1;
        } else {
            pattern.consecutiveSuccesses = 0;
        }

        // Confirm fix after 2 consecutive successes
        if (pattern.consecutiveSuccesses >= 2) {
            pattern.fixConfirmed = true;
            pattern.fixConfirmedAt = new Date().toISOString();
            console.log(`\n✅ FIX CONFIRMED for ${templateName}:`);
            console.log(`   Error: [${pattern.errorType}] ${pattern.errorIssue}`);
            console.log(`   Fix tested successfully 2 times`);
        }

        await this.save();
    }

    /**
     * Get performance summary
     */
    async getPerformanceSummary() {
        await this.initialize();

        const summary = {
            globalSuccessRate: this.learningData.globalStats.currentSuccessRate,
            target: 90,
            meetsTarget: this.learningData.globalStats.currentSuccessRate >= 90,
            templates: {}
        };

        for (const [name, template] of Object.entries(this.learningData.templates)) {
            summary.templates[name] = {
                successRate: template.successRate,
                generations: template.totalGenerations,
                perfect: template.perfectGenerations,
                errorPatterns: Object.keys(template.errorPatterns).length,
                fixesConfirmed: Object.values(template.errorPatterns).filter(p => p.fixConfirmed).length
            };
        }

        return summary;
    }
}

export default LearningLayer;
