import fs from 'fs/promises';

/**
 * Automated Fixer
 * Analyzes errors and applies fixes to prompt functions
 */

class AutoFixer {
    constructor() {
        this.learningDatabase = {
            problematic_words: {
                'OUTLOOK': { alternative: 'FORECAST', failure_rate: 100 },
                'LOAN': { alternative: 'FINANCING', failure_rate: 50 }
                // Note: MARKET removed - too broad, affects function names
            },
            fixes_applied: []
        };
    }

    /**
     * Analyze errors and determine fix strategy
     * @param {Array} errors - Array of error objects
     * @param {string} templateName - Template name
     * @returns {object} Fix strategy
     */
    analyzePatternsAndPlan(errors, templateName) {
        console.log(`\n🔧 Analyzing ${errors.length} errors for ${templateName}...`);

        const strategy = {
            template: templateName,
            fixes: [],
            confidence: 0
        };

        // Categorize errors
        const typos = errors.filter(e => e.type === 'typo');
        const missingData = errors.filter(e => e.type === 'missing_data');
        const formatting = errors.filter(e => e.type === 'formatting');

        // Handle typos - often problematic words
        typos.forEach(error => {
            const issue = error.issue.toLowerCase();

            // Check for known problematic words
            for (const [word, data] of Object.entries(this.learningDatabase.problematic_words)) {
                if (issue.includes(word.toLowerCase())) {
                    strategy.fixes.push({
                        type: 'word_replacement',
                        original: word,
                        replacement: data.alternative,
                        reason: `${word} has ${data.failure_rate}% failure rate`,
                        confidence: 95
                    });
                }
            }
        });

        // Handle missing data - simplify format
        missingData.forEach(error => {
            const issue = error.issue.toLowerCase();

            if (issue.includes('percent') || issue.includes('%')) {
                strategy.fixes.push({
                    type: 'format_simplification',
                    target: 'percent signs',
                    action: 'Add explicit spacing around % symbols',
                    reason: 'Percent signs often get dropped in complex formatting',
                    confidence: 80
                });
            }

            if (issue.includes('quote') || issue.includes('quotation')) {
                strategy.fixes.push({
                    type: 'quote_enforcement',
                    action: 'Add explicit reminder for closing quote',
                    reason: 'Quote marks frequently missing',
                    confidence: 85
                });
            }
        });

        // Handle formatting issues
        formatting.forEach(error => {
            strategy.fixes.push({
                type: 'format_simplification',
                target: error.issue,
                action: 'Reduce complexity, simplify structure',
                confidence: 70
            });
        });

        // Calculate overall confidence
        if (strategy.fixes.length > 0) {
            strategy.confidence = Math.round(
                strategy.fixes.reduce((sum, fix) => sum + fix.confidence, 0) / strategy.fixes.length
            );
        }

        console.log('\n📋 Fix Strategy:');
        console.log(`   Fixes planned: ${strategy.fixes.length}`);
        console.log(`   Confidence: ${strategy.confidence}%`);

        return strategy;
    }

    /**
     * Apply fixes to prompt-builder.js
     * @param {object} strategy - Fix strategy from analyzePatternsAndPlan
     * @returns {Promise<boolean>} Success status
     */
    async applyFixes(strategy) {
        try {
            console.log(`\n🔧 Applying fixes to ${strategy.template}...`);

            const promptFile = '/mnt/c/Users/dyoun/Active Projects/prompt-builder.js';
            let content = await fs.readFile(promptFile, 'utf-8');
            let modified = false;

            // Apply each fix
            for (const fix of strategy.fixes) {
                if (fix.type === 'word_replacement') {
                    // Replace problematic word
                    const regex = new RegExp(fix.original, 'gi');
                    if (content.match(regex)) {
                        content = content.replace(regex, fix.replacement);
                        modified = true;
                        console.log(`   ✅ Replaced "${fix.original}" with "${fix.replacement}"`);

                        // Log fix
                        this.learningDatabase.fixes_applied.push({
                            timestamp: new Date().toISOString(),
                            template: strategy.template,
                            fix: `${fix.original} → ${fix.replacement}`,
                            reason: fix.reason
                        });
                    }
                }

                if (fix.type === 'quote_enforcement') {
                    // Add more explicit quote instructions
                    const quotePattern = /Display quoted text with BOTH opening " and closing " marks:/g;
                    if (content.match(quotePattern)) {
                        content = content.replace(
                            quotePattern,
                            'Display quoted text - MUST have opening " and MUST have closing " - both required:'
                        );
                        modified = true;
                        console.log('   ✅ Enhanced quote mark instructions');
                    }
                }
            }

            // Write back if modified
            if (modified) {
                await fs.writeFile(promptFile, content, 'utf-8');
                console.log(`\n✅ Fixes applied successfully to ${promptFile}`);

                // Save learning database
                await this.saveLearningDatabase();

                return true;
            } else {
                console.log('\n⚠️ No fixes could be applied to file');
                return false;
            }

        } catch (error) {
            console.error(`❌ Error applying fixes: ${error.message}`);
            return false;
        }
    }

    /**
     * Save learning database to file
     */
    async saveLearningDatabase() {
        try {
            const dbPath = '/mnt/c/Users/dyoun/Active Projects/agent-learning.json';
            await fs.writeFile(dbPath, JSON.stringify(this.learningDatabase, null, 2), 'utf-8');
            console.log(`\n💾 Learning database updated: ${dbPath}`);
        } catch (error) {
            console.error(`❌ Error saving learning database: ${error.message}`);
        }
    }

    /**
     * Load learning database from file
     */
    async loadLearningDatabase() {
        try {
            const dbPath = '/mnt/c/Users/dyoun/Active Projects/agent-learning.json';
            const content = await fs.readFile(dbPath, 'utf-8');
            const loaded = JSON.parse(content);

            // Merge loaded data with defaults to ensure all properties exist
            this.learningDatabase = {
                problematic_words: loaded.problematic_words || this.learningDatabase.problematic_words,
                fixes_applied: loaded.fixes_applied || []
            };

            console.log('\n📚 Learning database loaded');
        } catch (error) {
            console.log('\n📚 Creating new learning database');
            // Use default database if file doesn't exist (already initialized in constructor)
        }
    }
}

export default AutoFixer;
