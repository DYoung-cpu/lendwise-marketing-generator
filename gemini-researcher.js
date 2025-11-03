#!/usr/bin/env node

import Anthropic from '@anthropic-ai/sdk';

/**
 * Gemini Researcher
 * Uses Claude with web search to research Gemini best practices
 */

class GeminiResearcher {
    constructor() {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY environment variable not set');
        }

        this.client = new Anthropic({ apiKey });
        this.knowledgeBase = {
            'text_rendering': {
                best_practices: [
                    'Keep text under 12 words per line',
                    'Use simple vocabulary (words under 10 characters)',
                    'Avoid complex words: weave, leave, breathe, achieve',
                    'Numbers and dates render perfectly',
                    'All caps text renders more reliably'
                ],
                common_issues: [
                    'Long sentences (>15 words) cause typos',
                    'Complex words get misspelled',
                    'Quote marks often missing or unpaired'
                ]
            },
            'visual_formatting': {
                best_practices: [
                    'Box/card formatting improves text accuracy',
                    'Structured lists render excellently',
                    'Table formats work very well',
                    'Bold headers improve readability',
                    'Increased spacing reduces errors'
                ]
            },
            'prompt_engineering': {
                best_practices: [
                    'Be explicit about punctuation requirements',
                    'Request "BOTH opening and closing quotes"',
                    'Specify exact formatting needs',
                    'Use CRITICAL/IMPORTANT keywords for key requirements',
                    'Request validation checks in prompt'
                ]
            }
        };
    }

    /**
     * Research best practices for a specific issue
     * @param {string} issueType - Type of issue (typo, formatting, quote_marks, etc.)
     * @param {string} context - Additional context about the problem
     * @returns {Promise<Object>} Research findings
     */
    async research(issueType, context = '') {
        console.log(`\n🔬 Researching solutions for: ${issueType}...`);

        // Check knowledge base first
        const kbResults = this.searchKnowledgeBase(issueType);

        if (kbResults.length > 0) {
            console.log(`✅ Found ${kbResults.length} relevant best practices in knowledge base`);
            return {
                source: 'knowledge_base',
                findings: kbResults,
                recommendations: this.generateRecommendations(kbResults, issueType)
            };
        }

        // If not in KB, use Claude to research
        console.log('   No KB match - using AI research...');
        return await this.aiResearch(issueType, context);
    }

    /**
     * Search internal knowledge base
     */
    searchKnowledgeBase(issueType) {
        const results = [];
        const keywords = issueType.toLowerCase().split(/[_\s]+/);

        for (const [category, data] of Object.entries(this.knowledgeBase)) {
            // Check if category matches
            const categoryMatch = keywords.some(kw => category.includes(kw));

            if (categoryMatch) {
                results.push({
                    category,
                    best_practices: data.best_practices || [],
                    common_issues: data.common_issues || []
                });
            }

            // Check best practices
            if (data.best_practices) {
                for (const practice of data.best_practices) {
                    const practiceMatch = keywords.some(kw =>
                        practice.toLowerCase().includes(kw)
                    );
                    if (practiceMatch) {
                        results.push({
                            category,
                            best_practice: practice,
                            relevance: 'high'
                        });
                    }
                }
            }
        }

        return results;
    }

    /**
     * Use Claude AI to research solutions
     */
    async aiResearch(issueType, context) {
        console.log(`   🤖 Claude researching ${issueType}...`);

        const prompt = `You are an expert in Google Gemini 2.5 Flash (Imagen Nano) image generation, specifically for text rendering in marketing images.

**Issue Type:** ${issueType}
**Context:** ${context || 'None provided'}

Based on your knowledge of Gemini's strengths and weaknesses, provide:

1. **Root Cause**: Why does this issue occur with Gemini?
2. **Best Practices**: 3-5 specific techniques that work well with Gemini
3. **What to Avoid**: Things that make the problem worse
4. **Recommended Strategies**: Concrete actions to fix this issue

Focus on:
- Text rendering accuracy
- Prompt engineering techniques
- Visual formatting strategies
- Known Gemini quirks and workarounds

Return ONLY valid JSON:
{
  "root_cause": "explanation",
  "best_practices": ["practice 1", "practice 2", "practice 3"],
  "avoid": ["thing 1", "thing 2"],
  "strategies": [
    {"name": "strategy name", "description": "how it works", "success_rate": "high/medium/low"}
  ],
  "examples": ["example 1", "example 2"]
}`;

        try {
            const response = await this.client.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1500,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            });

            const researchText = response.content[0].text;
            const jsonMatch = researchText.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                const findings = JSON.parse(jsonMatch[0]);
                console.log(`✅ Research complete - found ${findings.strategies?.length || 0} strategies`);

                return {
                    source: 'ai_research',
                    findings,
                    recommendations: this.generateRecommendations(findings, issueType)
                };
            }

            throw new Error('Could not parse research results');

        } catch (error) {
            console.error(`❌ Research failed: ${error.message}`);
            return {
                source: 'fallback',
                findings: {
                    root_cause: 'Research unavailable',
                    best_practices: this.getFallbackPractices(issueType),
                    strategies: []
                },
                recommendations: []
            };
        }
    }

    /**
     * Generate actionable recommendations from findings
     */
    generateRecommendations(findings, issueType) {
        const recommendations = [];

        if (Array.isArray(findings)) {
            // Knowledge base results
            for (const finding of findings) {
                if (finding.best_practices) {
                    recommendations.push({
                        action: 'apply_best_practices',
                        practices: finding.best_practices.slice(0, 3),
                        priority: 'high'
                    });
                }
            }
        } else if (findings.strategies) {
            // AI research results
            for (const strategy of findings.strategies) {
                if (strategy.success_rate === 'high') {
                    recommendations.push({
                        action: 'try_strategy',
                        strategy: strategy.name,
                        description: strategy.description,
                        priority: 'high'
                    });
                }
            }
        }

        return recommendations;
    }

    /**
     * Get fallback best practices when research fails
     */
    getFallbackPractices(issueType) {
        const fallbacks = {
            'typo': [
                'Shorten text to under 12 words',
                'Use simpler vocabulary',
                'Add box formatting for emphasis'
            ],
            'quote': [
                'Explicitly request "BOTH opening and closing quotes"',
                'Put quoted text in a box',
                'Use all caps for better rendering'
            ],
            'formatting': [
                'Use structured lists',
                'Add visual boxes/cards',
                'Increase spacing between elements'
            ],
            'missing': [
                'Make requirements more explicit',
                'Use CRITICAL/IMPORTANT keywords',
                'Request validation in prompt'
            ]
        };

        for (const [key, practices] of Object.entries(fallbacks)) {
            if (issueType.toLowerCase().includes(key)) {
                return practices;
            }
        }

        return [
            'Simplify text content',
            'Use visual formatting',
            'Be more explicit in prompt'
        ];
    }

    /**
     * Update knowledge base with new findings
     * @param {string} category - Category to update
     * @param {Object} findings - New findings to add
     */
    updateKnowledgeBase(category, findings) {
        console.log(`\n📝 Updating knowledge base: ${category}...`);

        if (!this.knowledgeBase[category]) {
            this.knowledgeBase[category] = {
                best_practices: [],
                common_issues: []
            };
        }

        if (findings.best_practices) {
            for (const practice of findings.best_practices) {
                if (!this.knowledgeBase[category].best_practices.includes(practice)) {
                    this.knowledgeBase[category].best_practices.push(practice);
                    console.log(`   ✅ Added: ${practice.substring(0, 50)}...`);
                }
            }
        }

        if (findings.common_issues) {
            for (const issue of findings.common_issues) {
                if (!this.knowledgeBase[category].common_issues.includes(issue)) {
                    this.knowledgeBase[category].common_issues.push(issue);
                }
            }
        }
    }

    /**
     * Get comprehensive research report
     * @returns {Object} Full knowledge base
     */
    getKnowledgeBaseReport() {
        const totalPractices = Object.values(this.knowledgeBase)
            .reduce((sum, cat) => sum + (cat.best_practices?.length || 0), 0);

        const totalIssues = Object.values(this.knowledgeBase)
            .reduce((sum, cat) => sum + (cat.common_issues?.length || 0), 0);

        return {
            categories: Object.keys(this.knowledgeBase).length,
            total_best_practices: totalPractices,
            total_common_issues: totalIssues,
            knowledge_base: this.knowledgeBase
        };
    }

    /**
     * Quick lookup for specific best practice
     * @param {string} query - Search query
     * @returns {Array} Matching best practices
     */
    quickLookup(query) {
        const results = [];
        const queryLower = query.toLowerCase();

        for (const [category, data] of Object.entries(this.knowledgeBase)) {
            if (data.best_practices) {
                for (const practice of data.best_practices) {
                    if (practice.toLowerCase().includes(queryLower)) {
                        results.push({
                            category,
                            practice,
                            relevance: 'high'
                        });
                    }
                }
            }
        }

        return results;
    }
}

export default GeminiResearcher;
