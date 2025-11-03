#!/usr/bin/env node

/**
 * Strategy Library
 * Multi-category strategy system for fixing image generation issues
 */

class StrategyLibrary {
    constructor() {
        this.categories = [
            {
                name: 'Text Optimization',
                description: 'Strategies for fixing text rendering issues',
                strategies: [
                    {
                        name: 'shorten_commentary',
                        description: 'Reduce commentary to 8-10 words',
                        action: 'commentary_word_limit',
                        params: { max_words: 10 }
                    },
                    {
                        name: 'simplify_vocabulary',
                        description: 'Replace complex words with simpler alternatives',
                        action: 'vocabulary_simplification',
                        params: { max_word_length: 10 }
                    },
                    {
                        name: 'split_long_sentences',
                        description: 'Break sentences over 12 words into shorter ones',
                        action: 'sentence_splitting',
                        params: { max_sentence_words: 12 }
                    },
                    {
                        name: 'avoid_problem_words',
                        description: 'Replace words known to cause typos (weave, leave, breathe)',
                        action: 'word_replacement',
                        params: {
                            replacements: {
                                'weave': 'create',
                                'leave': 'exit',
                                'breathe': 'pause',
                                'achieve': 'reach',
                                'believe': 'think'
                            }
                        }
                    }
                ]
            },
            {
                name: 'Visual Formatting',
                description: 'Strategies using visual formatting to improve rendering',
                strategies: [
                    {
                        name: 'box_formatting',
                        description: 'Put commentary in a distinct box/card with border',
                        action: 'add_box',
                        params: { element: 'commentary', style: 'border' }
                    },
                    {
                        name: 'shadow_box',
                        description: 'Add shadow box around problematic text',
                        action: 'add_box',
                        params: { element: 'commentary', style: 'shadow' }
                    },
                    {
                        name: 'all_caps_format',
                        description: 'Format commentary in ALL CAPS for better rendering',
                        action: 'text_transform',
                        params: { element: 'commentary', transform: 'uppercase' }
                    },
                    {
                        name: 'increase_spacing',
                        description: 'Add more spacing between text elements',
                        action: 'adjust_spacing',
                        params: { spacing: 'increased' }
                    },
                    {
                        name: 'bold_headers',
                        description: 'Make headers bold for clearer rendering',
                        action: 'text_weight',
                        params: { element: 'headers', weight: 'bold' }
                    }
                ]
            },
            {
                name: 'Gemini Exploitation',
                description: 'Strategies that exploit Gemini strengths',
                strategies: [
                    {
                        name: 'use_structured_list',
                        description: 'Format content as numbered/bulleted list',
                        action: 'format_as_list',
                        params: { style: 'numbered' }
                    },
                    {
                        name: 'table_format',
                        description: 'Present data in table format',
                        action: 'format_as_table',
                        params: { style: 'grid' }
                    },
                    {
                        name: 'short_phrases_only',
                        description: 'Use only phrases under 6 words',
                        action: 'phrase_limit',
                        params: { max_words: 6 }
                    },
                    {
                        name: 'emphasize_numbers',
                        description: 'Focus on numerical data (Gemini renders perfectly)',
                        action: 'number_emphasis',
                        params: { priority: 'high' }
                    },
                    {
                        name: 'minimal_text_visual_heavy',
                        description: 'Reduce text, increase visual elements',
                        action: 'text_visual_balance',
                        params: { text_ratio: 0.3 }
                    }
                ]
            },
            {
                name: 'Innovation',
                description: 'Creative solutions when standard approaches fail',
                strategies: [
                    {
                        name: 'complete_redesign',
                        description: 'Completely different layout approach',
                        action: 'redesign',
                        params: { approach: 'radical' }
                    },
                    {
                        name: 'minimalist_approach',
                        description: 'Strip to bare essentials, maximum clarity',
                        action: 'minimalism',
                        params: { elements: 'essential_only' }
                    },
                    {
                        name: 'hybrid_format',
                        description: 'Combine multiple successful strategies',
                        action: 'strategy_combination',
                        params: { strategies: ['box_formatting', 'shorten_commentary'] }
                    },
                    {
                        name: 'ai_suggested_solution',
                        description: 'Let Claude propose creative solution',
                        action: 'claude_creative',
                        params: { mode: 'innovative' }
                    }
                ]
            }
        ];
    }

    /**
     * Get strategies for a specific category
     */
    getStrategiesForCategory(categoryName) {
        const category = this.categories.find(c => c.name === categoryName);
        if (!category) {
            console.warn(`Category not found: ${categoryName}, using first category`);
            return this.categories[0].strategies;
        }
        return category.strategies.map(s => ({ ...s, category: categoryName }));
    }

    /**
     * Get all strategies
     */
    getAllStrategies() {
        const all = [];
        for (const category of this.categories) {
            for (const strategy of category.strategies) {
                all.push({ ...strategy, category: category.name });
            }
        }
        return all;
    }

    /**
     * Get strategy by name
     */
    getStrategy(name) {
        for (const category of this.categories) {
            const strategy = category.strategies.find(s => s.name === name);
            if (strategy) {
                return { ...strategy, category: category.name };
            }
        }
        return null;
    }

    /**
     * Apply strategy to prompt
     * Returns modified prompt based on strategy
     */
    applyStrategyToPrompt(prompt, strategy, marketData) {
        console.log(`\n🔧 Applying strategy: ${strategy.name}`);
        console.log(`   Category: ${strategy.category}`);
        console.log(`   Action: ${strategy.action}`);

        switch (strategy.action) {
            case 'commentary_word_limit':
                return this.shortenCommentary(prompt, strategy.params.max_words, marketData);

            case 'vocabulary_simplification':
                return this.simplifyVocabulary(prompt, strategy.params);

            case 'add_box':
                return this.addBoxFormatting(prompt, strategy.params);

            case 'text_transform':
                return this.transformText(prompt, strategy.params);

            case 'format_as_list':
                return this.formatAsList(prompt, strategy.params);

            case 'phrase_limit':
                return this.limitPhraseLength(prompt, strategy.params.max_words);

            default:
                console.log(`   ⚠️  Action ${strategy.action} not implemented yet`);
                return prompt;
        }
    }

    /**
     * Shorten commentary to max words
     */
    shortenCommentary(prompt, maxWords, marketData) {
        // Extract commentary from market data
        let commentary = marketData.commentary || marketData.trend || '';

        const words = commentary.split(/\s+/);
        if (words.length > maxWords) {
            commentary = words.slice(0, maxWords).join(' ');
            console.log(`   ✂️  Shortened commentary: ${words.length} → ${maxWords} words`);
        }

        // Replace in prompt
        const commentaryRegex = /Expert (?:Insight|Commentary|note).*?:[\s\S]*?\$\{commentary.*?\}/i;
        const replacement = `Expert Insight - Display quoted text with BOTH opening " and closing " marks:\n"${commentary.toUpperCase()}"`;

        return prompt.replace(commentaryRegex, replacement);
    }

    /**
     * Simplify vocabulary
     */
    simplifyVocabulary(prompt, params) {
        const replacements = params.replacements || {};
        let modified = prompt;

        for (const [complex, simple] of Object.entries(replacements)) {
            const regex = new RegExp(complex, 'gi');
            modified = modified.replace(regex, simple);
        }

        return modified;
    }

    /**
     * Add box formatting instruction
     */
    addBoxFormatting(prompt, params) {
        const element = params.element || 'commentary';
        const style = params.style || 'border';

        console.log(`   📦 Adding ${style} box for ${element}`);

        // Add box instruction before element
        const boxInstruction = `\n\nIMPORTANT: Display ${element} in a distinct ${style} box/card for better rendering.\n`;

        // Insert before the element section
        const elementRegex = new RegExp(`(${element}.*?:)`, 'i');
        return prompt.replace(elementRegex, boxInstruction + '$1');
    }

    /**
     * Transform text (uppercase, lowercase, etc.)
     */
    transformText(prompt, params) {
        const element = params.element;
        const transform = params.transform;

        console.log(`   🔄 Transforming ${element} to ${transform}`);

        if (transform === 'uppercase') {
            // Find commentary section and add ALL CAPS instruction
            const instruction = '\n\nFormat commentary in ALL CAPS for better rendering:\n';
            return prompt.replace(/(commentary.*?:)/i, instruction + '$1');
        }

        return prompt;
    }

    /**
     * Format as list
     */
    formatAsList(prompt, params) {
        const style = params.style || 'numbered';
        console.log(`   📋 Formatting as ${style} list`);

        // Add list formatting instruction
        const listInstruction = `\n\nFormat all text elements as a ${style} list for clarity.\n`;
        return listInstruction + prompt;
    }

    /**
     * Limit phrase length
     */
    limitPhraseLength(prompt, maxWords) {
        console.log(`   ✂️  Limiting all phrases to ${maxWords} words`);

        const instruction = `\n\nCRITICAL: All text phrases must be ${maxWords} words or less. Break longer sentences.\n`;
        return instruction + prompt;
    }
}

export default new StrategyLibrary();
