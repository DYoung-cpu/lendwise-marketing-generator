#!/usr/bin/env node

/**
 * Claude Prompt Enhancer for WISR Marketing Generator
 *
 * Takes basic marketing prompts and enhances them with professional
 * styling, typography, color psychology, and visual design details
 * optimized for Gemini Flash 2.5 (Imagen 3) generation.
 *
 * Usage:
 *   import { enhanceMarketingPrompt } from './claude-prompt-enhancer.js';
 *   const enhanced = await enhanceMarketingPrompt(basicPrompt, { templateType: 'marketReport' });
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Enhance a marketing prompt for Gemini image generation
 *
 * @param {string} basicPrompt - The basic template prompt
 * @param {Object} options - Enhancement options
 * @param {string} options.templateType - Type of template (marketReport, dailyRateUpdate, etc.)
 * @param {string} options.brandStyle - Brand style (professional, luxury, modern, etc.)
 * @param {number} options.creativityLevel - 0-10 (higher = more creative)
 * @returns {Promise<Object>} - { enhanced: string, original: string, metadata: {} }
 */
export async function enhanceMarketingPrompt(basicPrompt, options = {}) {
    const {
        templateType = 'general',
        brandStyle = 'professional luxury',
        creativityLevel = 7
    } = options;

    // Build enhancement instruction
    const enhancementPrompt = `You are an expert visual designer specializing in professional marketing materials for the mortgage industry.

**Your Task:** Transform this basic prompt into a detailed, visually sophisticated prompt for Gemini Flash 2.5 image generation.

**Basic Prompt:**
${basicPrompt}

**Template Type:** ${templateType}
**Brand Style:** ${brandStyle}
**Creativity Level:** ${creativityLevel}/10

**Enhancement Guidelines:**

1. **Typography & Text Styling**
   - Specify font characteristics (weight, spacing, hierarchy)
   - Add text effects (shadows, glows, embossing)
   - Define readability enhancements

2. **Color & Lighting**
   - Enhance forest green and metallic gold palette
   - Add gradient specifications (direction, stops, blending)
   - Include lighting effects (dramatic, soft, professional)
   - Specify color temperature and mood

3. **Composition & Layout**
   - Define visual hierarchy and focal points
   - Add spacing and balance guidelines
   - Specify element positioning and flow

4. **Depth & Dimension**
   - Add shadow specifications (soft, hard, directional)
   - Include layering instructions (foreground, background)
   - Define depth cues (blur, scale, overlap)

5. **Professional Polish**
   - Add texture details (subtle patterns, grain)
   - Include finishing touches (vignette, edge treatments)
   - Specify material qualities (metallic sheen, glossy accents)

**Critical Requirements:**
- Keep total prompt under 500 characters for Gemini API
- Maintain ALL data/text content from original prompt
- Prioritize text clarity and readability
- Use professional mortgage industry aesthetic
- Brand: LENDWISE MORTGAGE with gold metallic logo

**Output Format:**
Return ONLY the enhanced prompt text. No explanations, no meta-commentary. Just the prompt.`;

    try {
        const response = await anthropic.messages.create({
            model: 'claude-3-7-sonnet-20250219',
            max_tokens: 1000,
            temperature: creativityLevel / 10, // Convert 0-10 to 0-1
            messages: [{
                role: 'user',
                content: enhancementPrompt
            }]
        });

        const enhancedPrompt = response.content[0].text.trim();

        // Enforce character limit
        const finalPrompt = enhancedPrompt.length > 500
            ? enhancedPrompt.substring(0, 500)
            : enhancedPrompt;

        return {
            original: basicPrompt,
            enhanced: finalPrompt,
            metadata: {
                templateType,
                brandStyle,
                creativityLevel,
                tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
                truncated: enhancedPrompt.length > 500,
                timestamp: new Date().toISOString()
            }
        };

    } catch (error) {
        console.error('❌ Claude enhancement failed:', error.message);

        // Fallback: return original prompt
        return {
            original: basicPrompt,
            enhanced: basicPrompt,
            error: error.message,
            metadata: {
                fallback: true,
                timestamp: new Date().toISOString()
            }
        };
    }
}

/**
 * Batch enhance multiple prompts
 */
export async function enhanceMultiplePrompts(prompts, options = {}) {
    const results = [];

    for (const [index, prompt] of prompts.entries()) {
        console.log(`[${index + 1}/${prompts.length}] Enhancing prompt...`);

        const result = await enhanceMarketingPrompt(prompt, options);
        results.push(result);

        // Small delay to avoid rate limits
        if (index < prompts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    return results;
}

/**
 * Get template-specific enhancement settings
 */
export function getTemplateSettings(templateType) {
    const settings = {
        marketReport: {
            brandStyle: 'professional corporate',
            creativityLevel: 6,
            emphasis: ['data visualization', 'authority', 'trust']
        },
        dailyRateUpdate: {
            brandStyle: 'financial news',
            creativityLevel: 5,
            emphasis: ['clarity', 'urgency', 'professionalism']
        },
        testimonial: {
            brandStyle: 'warm emotional',
            creativityLevel: 8,
            emphasis: ['authenticity', 'connection', 'joy']
        },
        educational: {
            brandStyle: 'approachable expert',
            creativityLevel: 7,
            emphasis: ['clarity', 'trust', 'accessibility']
        },
        promotional: {
            brandStyle: 'premium luxury',
            creativityLevel: 9,
            emphasis: ['attention-grabbing', 'elegance', 'desire']
        }
    };

    return settings[templateType] || {
        brandStyle: 'professional luxury',
        creativityLevel: 7,
        emphasis: ['professional', 'trustworthy', 'polished']
    };
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`
🎨 Claude Prompt Enhancer for WISR Marketing Generator

Usage:
  node claude-prompt-enhancer.js "your basic prompt here"
  node claude-prompt-enhancer.js "prompt" --type marketReport --creativity 8

Options:
  --type          Template type (marketReport, dailyRateUpdate, testimonial, etc.)
  --creativity    Creativity level 0-10 (default: 7)
  --style         Brand style (professional, luxury, modern, etc.)
  --compare       Show before/after comparison

Example:
  node claude-prompt-enhancer.js "Create a market report" --type marketReport --compare
        `);
        process.exit(0);
    }

    const basicPrompt = args[0];
    const typeIndex = args.indexOf('--type');
    const creativityIndex = args.indexOf('--creativity');
    const styleIndex = args.indexOf('--style');
    const showComparison = args.includes('--compare');

    const options = {
        templateType: typeIndex >= 0 ? args[typeIndex + 1] : 'general',
        creativityLevel: creativityIndex >= 0 ? parseInt(args[creativityIndex + 1]) : 7,
        brandStyle: styleIndex >= 0 ? args[styleIndex + 1] : 'professional luxury'
    };

    console.log('\n🎨 Enhancing your marketing prompt with Claude...\n');

    const result = await enhanceMarketingPrompt(basicPrompt, options);

    if (showComparison) {
        console.log('='.repeat(80));
        console.log('📋 ORIGINAL PROMPT:');
        console.log('='.repeat(80));
        console.log(result.original);
        console.log('\n' + '='.repeat(80));
        console.log('✨ ENHANCED PROMPT:');
        console.log('='.repeat(80));
        console.log(result.enhanced);
        console.log('\n' + '='.repeat(80));
    } else {
        console.log(result.enhanced);
    }

    console.log(`\n📊 Tokens used: ${result.metadata.tokensUsed || 'N/A'}`);
    console.log(`🎨 Style: ${result.metadata.brandStyle}`);
    console.log(`⚡ Creativity: ${result.metadata.creativityLevel}/10\n`);

    if (result.error) {
        console.error(`⚠️  Error: ${result.error}`);
    }
}

export default {
    enhanceMarketingPrompt,
    enhanceMultiplePrompts,
    getTemplateSettings
};
