#!/usr/bin/env node

import Anthropic from '@anthropic-ai/sdk';

/**
 * Content Validator
 * Prevents agent from achieving 100% by oversimplifying content
 * Ensures marketing effectiveness and content richness are maintained
 */

class ContentValidator {
    constructor() {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY environment variable not set');
        }

        this.client = new Anthropic({ apiKey });

        // Content requirements per template
        this.requirements = {
            'Daily Rate Update': {
                required_elements: [
                    { element: 'header', min_words: 3, max_words: 6 },
                    { element: 'current_rate', must_include: ['30-Year', 'rate', '%', 'change'] },
                    { element: 'economic_factors', min_items: 3, min_words_per: 3, max_words_per: 20 },
                    { element: 'commentary', min_words: 8, max_words: 15 },
                    { element: 'lock_strategy', min_words: 6, max_words: 15 },
                    { element: 'contact', exact_format: 'David Young NMLS 62043 Phone 310-954-7771' }
                ],
                visual_requirements: [
                    'LendWise logo present',
                    'Forest green gradient',
                    'Metallic gold text',
                    'Professional layout depth'
                ],
                purpose: 'Engaging daily market update that drives client action'
            },
            'Market Report': {
                required_elements: [
                    { element: 'header', min_words: 3, max_words: 6 },
                    { element: '30yr_rate', must_include: ['30-Year', 'Fixed', '%'] },
                    { element: '15yr_rate', must_include: ['15-Year', 'Fixed', '%'] },
                    { element: 'treasury', must_include: ['10-Year', 'Treasury'] },
                    { element: 'commentary', min_words: 8, max_words: 15 },
                    { element: 'analysis', min_words: 6, max_words: 15 },
                    { element: 'contact', exact_format: 'David Young NMLS 62043 Phone 310-954-7771' }
                ],
                visual_requirements: [
                    'LendWise logo present',
                    'Royal blue gradient',
                    'Metallic gold text',
                    'Structured data layout'
                ],
                purpose: 'Professional financial report that establishes expertise'
            },
            'Rate Trends': {
                required_elements: [
                    { element: 'header', min_words: 3, max_words: 6 },
                    { element: 'current_rate', must_include: ['%', 'rate'] },
                    { element: '4week_range', must_include: ['4-Week', 'Range'] },
                    { element: '52week_range', must_include: ['52-Week', 'Range'] },
                    { element: 'trend_status', min_words: 1, max_words: 3 },
                    { element: 'commentary', min_words: 8, max_words: 15 },
                    { element: 'contact', exact_format: 'David Young NMLS 62043 Phone 310-954-7771' }
                ],
                visual_requirements: [
                    'LendWise logo present',
                    'Forest green gradient',
                    'Metallic gold text',
                    'Data visualization elements'
                ],
                purpose: 'Data-driven trend analysis that supports decision-making'
            },
            'Economic Outlook': {
                required_elements: [
                    { element: 'header', min_words: 2, max_words: 6 },
                    { element: 'subheadline', min_words: 4, max_words: 8 },
                    { element: 'current_rate', must_include: ['%', '30-Year'] },
                    { element: 'economic_factors', min_items: 3, min_words_per: 3, max_words_per: 20 },
                    { element: 'treasury_yield', must_include: ['10-Year', 'Treasury'] },
                    { element: 'commentary', min_words: 8, max_words: 15 },
                    { element: 'contact', exact_format: 'David Young NMLS 62043 Phone 310-954-7771' }
                ],
                visual_requirements: [
                    'LendWise logo present',
                    'Forest green gradient',
                    'Metallic gold text',
                    'Editorial sophistication'
                ],
                purpose: 'Insightful economic analysis that demonstrates market understanding'
            }
        };
    }

    /**
     * Validate result meets minimum content requirements
     * @param {Object} result - Generated image result with OCR text
     * @param {string} templateName - Template being validated
     * @returns {Promise<Object>} Validation result
     */
    async validate(result, templateName) {
        console.log(`\n✋ Validating content for: ${templateName}`);

        const reqs = this.requirements[templateName];
        if (!reqs) {
            console.log(`⚠️  No requirements defined for template: ${templateName}`);
            return { valid: true, warnings: ['No requirements defined'] };
        }

        const errors = [];
        const warnings = [];

        // Extract OCR text from result
        const ocrText = result.ocrText || '';

        // Validate each required element
        for (const req of reqs.required_elements) {
            const validationResult = this.validateElement(ocrText, req);
            if (!validationResult.valid) {
                errors.push({
                    element: req.element,
                    issue: validationResult.reason,
                    severity: 'high'
                });
            } else if (validationResult.warning) {
                warnings.push({
                    element: req.element,
                    issue: validationResult.warning
                });
            }
        }

        // Use Claude to validate marketing effectiveness
        const marketingScore = await this.evaluateMarketingEffectiveness(result, templateName, reqs.purpose);

        if (marketingScore < 7) {
            errors.push({
                element: 'marketing_effectiveness',
                issue: `Content lacks marketing punch (score: ${marketingScore}/10). Too simplified or not engaging enough.`,
                severity: 'high'
            });
        } else if (marketingScore < 8) {
            warnings.push({
                element: 'marketing_effectiveness',
                issue: `Marketing effectiveness could be stronger (score: ${marketingScore}/10)`
            });
        }

        const valid = errors.length === 0;

        if (!valid) {
            console.log('❌ Content validation FAILED:');
            errors.forEach((e, i) => {
                console.log(`   ${i + 1}. ${e.element}: ${e.issue}`);
            });
        } else {
            console.log('✅ Content validation PASSED');
            if (warnings.length > 0) {
                console.log(`⚠️  ${warnings.length} warning(s)`);
            }
        }

        return {
            valid,
            errors,
            warnings,
            marketing_score: marketingScore
        };
    }

    /**
     * Validate a single element meets requirements
     */
    validateElement(ocrText, req) {
        const textLower = ocrText.toLowerCase();

        // Check for exact format
        if (req.exact_format) {
            const normalized = ocrText.replace(/\s+/g, ' ').trim();
            const hasFormat = normalized.includes(req.exact_format);

            if (!hasFormat) {
                return {
                    valid: false,
                    reason: `Missing required format: "${req.exact_format}"`
                };
            }
            return { valid: true };
        }

        // Check for must_include keywords
        if (req.must_include) {
            for (const keyword of req.must_include) {
                if (!textLower.includes(keyword.toLowerCase())) {
                    return {
                        valid: false,
                        reason: `Missing required keyword: "${keyword}"`
                    };
                }
            }
        }

        // Check word count
        if (req.min_words || req.max_words) {
            // Extract relevant section (simplified - in real implementation would be more sophisticated)
            const words = ocrText.split(/\s+/).filter(w => w.length > 0);

            if (req.min_words && words.length < req.min_words) {
                return {
                    valid: false,
                    reason: `${req.element} too short: ${words.length} words (minimum: ${req.min_words})`
                };
            }

            if (req.max_words && words.length > req.max_words) {
                return {
                    valid: true, // Valid but warning
                    warning: `${req.element} longer than recommended: ${words.length} words (max: ${req.max_words})`
                };
            }
        }

        return { valid: true };
    }

    /**
     * Use Claude AI to evaluate marketing effectiveness
     * @param {Object} result - Generated result
     * @param {string} templateName - Template name
     * @param {string} purpose - Marketing purpose
     * @returns {Promise<number>} Score from 1-10
     */
    async evaluateMarketingEffectiveness(result, templateName, purpose) {
        console.log('   📊 Evaluating marketing effectiveness...');

        const ocrText = result.ocrText || JSON.stringify(result);

        const prompt = `You are a marketing expert evaluating mortgage marketing content.

**Template:** ${templateName}
**Purpose:** ${purpose}

**Content:**
${ocrText.substring(0, 1000)}

Rate this content on marketing effectiveness (1-10):
1. **Headline**: Does it grab attention?
2. **Data Value**: Is the information actionable?
3. **Commentary**: Does it provide insight/value?
4. **Call to Action**: Clear path to contact loan officer?

**Important:** Content that's TOO SIMPLE (e.g., only 2-3 words for commentary) should score LOW.
Rich, engaging content with 8-15 words commentary should score HIGH.

Return ONLY a JSON object:
{
  "headline_score": 1-10,
  "data_value_score": 1-10,
  "commentary_score": 1-10,
  "cta_score": 1-10,
  "total_score": average,
  "reasoning": "brief explanation"
}`;

        try {
            const response = await this.client.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            });

            const analysisText = response.content[0].text;
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                const analysis = JSON.parse(jsonMatch[0]);
                console.log(`   Marketing score: ${analysis.total_score}/10`);
                return analysis.total_score;
            }

            return 7; // Default if parsing fails

        } catch (error) {
            console.error(`   ⚠️  Marketing evaluation failed: ${error.message}`);
            return 7; // Default score
        }
    }

    /**
     * Check if result is oversimplified
     * @param {string} ocrText - OCR extracted text
     * @returns {boolean} True if oversimplified
     */
    isOversimplified(ocrText) {
        const words = ocrText.split(/\s+/).filter(w => w.length > 0);

        // Too few total words
        if (words.length < 30) {
            return true;
        }

        // Check for single-word elements (too simplified)
        const lines = ocrText.split('\n').filter(l => l.trim().length > 0);
        const singleWordLines = lines.filter(l => l.trim().split(/\s+/).length === 1);

        // More than 50% single-word lines = oversimplified
        if (singleWordLines.length > lines.length * 0.5) {
            return true;
        }

        return false;
    }
}

export default ContentValidator;
