#!/usr/bin/env node

/**
 * Gemini-Optimized Prompt Enhancer for WISR Marketing Generator
 *
 * Uses Claude 3.7 Sonnet to enhance marketing prompts specifically for
 * Gemini 2.5 Flash image generation, incorporating:
 * - Proven text rendering limits (15 words/section max)
 * - Structural separation requirements (lines, shadows, glows)
 * - Problem word avoidance (Navigate, Steady, Across)
 * - PTCF framework (Persona, Task, Context, Format)
 * - 191 known failure patterns from agent-memory.json
 * - Reference image styling adapted to LendWise branding
 *
 * Usage:
 *   import { enhanceForGemini } from './gemini-prompt-enhancer.js';
 *   const enhanced = await enhanceForGemini(basicPrompt, { stylePreset: 'dramatic' });
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy-initialize Anthropic client (after dotenv loads)
let anthropic = null;
function getAnthropicClient() {
    if (!anthropic) {
        anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });
    }
    return anthropic;
}

// Gemini 2.5 Flash optimal parameters (from official documentation)
const GEMINI_PARAMS = {
    creative: {
        temperature: 1.0,
        topK: 40,
        topP: 0.99
    },
    balanced: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95
    },
    precise: {
        temperature: 0.3,
        topK: 20,
        topP: 0.8
    }
};

// Text rendering limits (from empirical testing)
const TEXT_LIMITS = {
    wordsPerSection: 15,    // 100% success rate
    maxSections: 3,          // Optimal
    totalWords: 45           // 3 sections × 15 words
};

// Problem words that cause spelling errors
const PROBLEM_WORDS = {
    'Navigate': 'Guide',
    'Steady': 'Stable',
    'Steadily': 'Consistently',
    'Across': 'Through',
    'Appreciate': 'Value',
    'Appreciating': 'Valuing',
    'Unchanged': 'Stable',
    'Inventory': 'Supply'
};

// Structural separation methods (100% success rate)
const SEPARATION_METHODS = [
    'Use thin horizontal gold lines to separate sections',
    'Use soft gradient glow to define sections',
    'Use shadows to create floating sections',
    'Use top gold borders to separate sections'
];

// Template-specific color schemes
const TEMPLATE_COLOR_SCHEMES = {
    'Daily Rate Update': {
        background: 'forest green gradient (#2d5f3f to #1a3d2e)',
        accent: 'metallic gold (#FFD700, #DAA520)',
        mood: 'professional, trustworthy, market intelligence',
        category: 'market-intelligence'
    },
    'Rate Drop Alert': {
        background: 'urgent red-orange gradient (#dc2626 to #b91c1c)',
        accent: 'bright yellow (#FCD34D, #FDE047)',
        mood: 'urgent, attention-grabbing, time-sensitive',
        category: 'time-sensitive-alert'
    },
    'Market Intelligence Report': {
        background: 'forest green gradient (#2d5f3f to #1a3d2e)',
        accent: 'metallic gold (#FFD700, #DAA520)',
        mood: 'analytical, professional, data-driven',
        category: 'market-intelligence'
    },
    'Client Success Story': {
        background: 'warm navy blue gradient (#1e3a5f to #0f2847)',
        accent: 'silver and gold (#C0C0C0, #FFD700)',
        mood: 'celebratory, personal, success-focused',
        category: 'personal-branding'
    },
    'Tips & Advice': {
        background: 'warm teal gradient (#0f766e to #0d5f5a)',
        accent: 'coral and gold (#FF6B6B, #FFD700)',
        mood: 'helpful, educational, friendly',
        category: 'educational'
    },
    'Personal Branding': {
        background: 'sophisticated navy blue gradient (#1e3a5f to #0f2847)',
        accent: 'silver and gold (#C0C0C0, #DAA520)',
        mood: 'sophisticated, personal, professional',
        category: 'personal-branding'
    },
    'default': {
        background: 'forest green gradient (#2d5f3f to #1a3d2e)',
        accent: 'metallic gold (#FFD700, #DAA520)',
        mood: 'professional, trustworthy',
        category: 'market-intelligence'
    }
};

// Load learned patterns from agent memory
function loadAgentMemory() {
    try {
        const memoryPath = path.join(__dirname, '.claude', 'agent-memory.json');
        if (fs.existsSync(memoryPath)) {
            const content = fs.readFileSync(memoryPath, 'utf8');
            return JSON.parse(content);
        }
    } catch (error) {
        console.warn('⚠️  Could not load agent memory:', error.message);
    }
    return null;
}

/**
 * Enhance a marketing prompt for Gemini 2.5 Flash image generation
 *
 * @param {string} basicPrompt - The basic template prompt
 * @param {Object} options - Enhancement options
 * @param {string} options.stylePreset - Visual style (dramatic, elegant, modern, bold, random)
 * @param {string} options.templateType - Type of template (marketReport, rateAlert, etc.)
 * @param {number} options.creativityLevel - 1-10 (affects Gemini temperature)
 * @param {boolean} options.includePhoto - Whether user photo is included
 * @param {Object} options.customParams - Override Gemini parameters
 * @returns {Promise<Object>} - { enhanced, original, metadata, geminiParams }
 */
export async function enhanceForGemini(basicPrompt, options = {}) {
    const {
        stylePreset = 'balanced',
        templateType = 'general',
        creativityLevel = 7,
        includePhoto = false,
        customParams = {},
        marketData = null
    } = options;

    // Load agent memory for learned patterns
    const agentMemory = loadAgentMemory();
    const knownIssues = agentMemory?.criticalIssues?.slice(0, 20) || [];

    // Select Gemini parameters based on creativity level
    let geminiParams;
    if (creativityLevel <= 4) {
        geminiParams = GEMINI_PARAMS.precise;
    } else if (creativityLevel <= 7) {
        geminiParams = GEMINI_PARAMS.balanced;
    } else {
        geminiParams = GEMINI_PARAMS.creative;
    }

    // Apply custom overrides
    geminiParams = { ...geminiParams, ...customParams };

    // Select random separation method
    const separationMethod = SEPARATION_METHODS[Math.floor(Math.random() * SEPARATION_METHODS.length)];

    // Get template-specific color scheme
    const colorScheme = TEMPLATE_COLOR_SCHEMES[templateType] || TEMPLATE_COLOR_SCHEMES['default'];

    // Build enhancement instruction for Claude
    const enhancementPrompt = `You are an expert prompt engineer for Gemini 2.5 Flash image generation, specializing in mortgage marketing materials.

**CRITICAL TASK:** Transform this basic prompt into a Gemini-optimized prompt that will generate PERFECT text with zero spelling errors.

**Basic Prompt:**
${basicPrompt}

**Template Type:** ${templateType}
**Color Scheme:** ${colorScheme.category}
**Style Preset:** ${stylePreset}
**Creativity Level:** ${creativityLevel}/10
**Photo Included:** ${includePhoto ? 'Yes' : 'No'}

${marketData ? `**LIVE MARKET DATA (USE THIS!):**
- Current 30-Year Fixed Rate: ${marketData.currentRate}%
- Change: ${marketData.change}
- Date: ${marketData.dataDate}
- Time: ${marketData.dataTime}

IMPORTANT: Replace any hard-coded dates like "AUGUST 2023" with the current date above (${marketData.dataDate}). Use the actual current rate (${marketData.currentRate}%) instead of generic placeholders like "6.5%".

` : ''}**CRITICAL GEMINI TEXT RENDERING RULES (NON-NEGOTIABLE):**

1. **15-WORD LIMIT PER SECTION**
   - Each text section MUST be ≤15 words
   - This is the ONLY way to achieve 100% text accuracy
   - Breaking this rule = guaranteed spelling errors
   - Example: "30-Year Fixed: 6.5% APR. Contact today." (7 words ✅)

2. **MAXIMUM 3 SECTIONS PER IMAGE**
   - Section 1: Header/main message (≤15 words)
   - Section 2: Supporting content (≤15 words)
   - Section 3: Contact info (≤15 words)
   - Total: 45 words maximum

3. **STRUCTURAL SEPARATION (MANDATORY)**
   - ALWAYS specify: "${separationMethod}"
   - Gemini needs visual structure hints to render text accurately
   - Without structure = text errors guaranteed

4. **AVOID PROBLEM WORDS**
   - Replace these words that cause spelling errors:
${Object.entries(PROBLEM_WORDS).map(([bad, good]) => `     - ${bad} → ${good}`).join('\n')}

5. **PTCF FRAMEWORK**
   - Persona: Expert graphic designer for financial services
   - Task: Create [specific content type]
   - Context: LendWise Mortgage, forest green + gold brand
   - Format: Instagram portrait (1080x1350), structured layout

**STYLE PRESET: ${stylePreset}**

${getStylePresetDescription(stylePreset)}

**TEMPLATE-SPECIFIC BRAND STYLING:**
- Background: ${colorScheme.background}
- Accent Colors: ${colorScheme.accent}
- Mood/Tone: ${colorScheme.mood}
- Typography: Playfair Display (headlines), Open Sans (body)
- Logo: LendWise Mortgage (always include)
- Aesthetic: Professional financial marketing with ${colorScheme.mood} emphasis

${includePhoto ? '**PHOTO INTEGRATION:**\n- Include: "Seamlessly integrate my photo - remove background and blend naturally."\n- Position photo prominently\n' : ''}

**LEARNED FAILURE PATTERNS TO AVOID:**
${knownIssues.slice(0, 10).map((issue, i) => `${i + 1}. ${issue.pattern || issue.issue}`).join('\n')}

**OUTPUT FORMAT:**
Return ONLY the enhanced Gemini prompt. No explanations. Just the prompt that will be sent to Gemini 2.5 Flash.

**PROMPT LENGTH:** Keep under 800 characters for optimal Gemini processing.

**EXAMPLE STRUCTURE:**
Create a professional [content type]. ${includePhoto ? 'Seamlessly integrate my photo. ' : ''}Include LendWise logo.
Forest green gradient background with metallic gold accents.
${separationMethod}

Section 1 (15 words max): [specific content]
Section 2 (15 words max): [specific content]
Section 3 (15 words max): Contact David Young NMLS 62043 Phone 310-954-7771

Portrait 1080x1350. Professional, high-quality design.`;

    try {
        // Call Claude to enhance the prompt (lazy-initialize client)
        const client = getAnthropicClient();
        const response = await client.messages.create({
            model: 'claude-3-7-sonnet-20250219',
            max_tokens: 1500,
            temperature: 0.7, // Balanced for prompt enhancement
            messages: [{
                role: 'user',
                content: enhancementPrompt
            }]
        });

        const enhancedPrompt = response.content[0].text.trim();

        // Validate word count in sections
        const validation = validatePrompt(enhancedPrompt);

        // Replace any remaining problem words
        let finalPrompt = enhancedPrompt;
        Object.entries(PROBLEM_WORDS).forEach(([bad, good]) => {
            const regex = new RegExp(`\\b${bad}\\b`, 'gi');
            finalPrompt = finalPrompt.replace(regex, good);
        });

        return {
            original: basicPrompt,
            enhanced: finalPrompt,
            geminiParams: geminiParams,
            metadata: {
                stylePreset,
                templateType,
                creativityLevel,
                validation,
                separationMethod,
                tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
                timestamp: new Date().toISOString()
            }
        };

    } catch (error) {
        console.error('❌ Claude enhancement failed:', error.message);

        // Fallback: return basic prompt with safety additions
        const fallbackPrompt = buildFallbackPrompt(basicPrompt, {
            separationMethod,
            includePhoto,
            stylePreset
        });

        return {
            original: basicPrompt,
            enhanced: fallbackPrompt,
            geminiParams: geminiParams,
            error: error.message,
            metadata: {
                fallback: true,
                timestamp: new Date().toISOString()
            }
        };
    }
}

/**
 * Get style preset description for Claude
 */
function getStylePresetDescription(stylePreset) {
    const presets = {
        dramatic: `**Dramatic Bokeh Style** (inspired by reference image):
- Deep purple/magenta bokeh effect adapted to forest green bokeh
- Floating light particles and lens flare effects
- Strong depth of field with blurred background
- High contrast between foreground and background
- Metallic gold accents with shimmer and glow
- Bold serif typography with dramatic shadows`,

        elegant: `**Elegant Luxury Style**:
- Smooth forest green gradients (light to dark)
- Metallic gold text with subtle shimmer
- Sophisticated floating shadows on key elements
- Clean, uncluttered composition
- Premium magazine aesthetic (Forbes, Bloomberg)
- Refined typography with perfect spacing`,

        modern: `**Modern Minimal Style**:
- Thin gold accent lines and geometric patterns
- Lots of whitespace for breathing room
- Clean sans-serif + serif contrast
- Subtle geometric overlays (5-10% opacity)
- Contemporary color blocking
- Crisp, sharp edges`,

        bold: `**Bold High-Impact Style**:
- High contrast: deep green + bright gold only
- Dynamic diagonal elements and angles
- Large, bold typography (48-72pt headlines)
- Multiple depth layers with strong shadows
- Energetic, attention-grabbing
- Call-to-action focused`,

        balanced: `**Balanced Professional Style**:
- Moderate forest green gradient
- Tasteful gold accents (not overwhelming)
- Clear visual hierarchy
- Professional shadows and depth
- Trustworthy, credible aesthetic
- Appeals to broad audience`,

        random: `**Random Style Mix**:
- Combine elements from multiple styles
- Surprise with creative variations
- Maintain LendWise brand consistency
- Explore different visual approaches
- Keep it professional yet interesting`
    };

    return presets[stylePreset] || presets.balanced;
}

/**
 * Validate prompt for text rendering safety
 */
function validatePrompt(prompt) {
    const warnings = [];
    let wordCount = 0;

    // Try to identify sections and count words
    const lines = prompt.split('\n').filter(line => line.trim().length > 0);

    for (const line of lines) {
        const words = line.trim().split(/\s+/).length;
        if (words > 15 && !line.includes('Create a') && !line.includes('Portrait')) {
            warnings.push(`Section exceeds 15 words: "${line.substring(0, 50)}..." (${words} words)`);
        }
        wordCount += words;
    }

    // Check for problem words
    Object.keys(PROBLEM_WORDS).forEach(word => {
        if (new RegExp(`\\b${word}\\b`, 'i').test(prompt)) {
            warnings.push(`Contains problem word: "${word}"`);
        }
    });

    // Check for structural separation
    const hasStructure = SEPARATION_METHODS.some(method =>
        prompt.toLowerCase().includes(method.toLowerCase().substring(0, 20))
    );

    if (!hasStructure) {
        warnings.push('Missing structural separation method');
    }

    return {
        valid: warnings.length === 0,
        wordCount,
        warnings,
        safetyScore: Math.max(0, 100 - (warnings.length * 20))
    };
}

/**
 * Build fallback prompt with safety features
 */
function buildFallbackPrompt(basicPrompt, options) {
    const { separationMethod, includePhoto, stylePreset } = options;

    // Extract key content from basic prompt
    const content = basicPrompt
        .replace(/create a/gi, '')
        .replace(/professional/gi, '')
        .trim();

    return `Create a professional marketing image. ${includePhoto ? 'Seamlessly integrate my photo - remove background. ' : ''}Include LendWise logo.
Forest green gradient background with metallic gold accents.
${separationMethod}

Main content: ${content.substring(0, 100)}

Contact: David Young NMLS 62043 Phone 310-954-7771

Portrait 1080x1350. ${getStylePresetDescription(stylePreset).split('\n')[0]}`;
}

/**
 * Batch enhance multiple prompts
 */
export async function enhanceMultiplePrompts(prompts, options = {}) {
    const results = [];

    for (const [index, prompt] of prompts.entries()) {
        console.log(`\n[${index + 1}/${prompts.length}] Enhancing prompt...`);

        const result = await enhanceForGemini(prompt, options);
        results.push(result);

        console.log(`✅ Enhanced (${result.metadata.validation?.safetyScore || 'N/A'}% safety score)`);

        // Small delay to avoid rate limits
        if (index < prompts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    return results;
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`
🎨 Gemini-Optimized Prompt Enhancer for WISR Marketing Generator

Usage:
  node gemini-prompt-enhancer.js "your basic prompt here"
  node gemini-prompt-enhancer.js "prompt" --style dramatic --creativity 8

Options:
  --style         Style preset (dramatic, elegant, modern, bold, balanced, random)
  --creativity    Creativity level 1-10 (default: 7)
  --type          Template type (marketReport, rateAlert, etc.)
  --photo         Include photo integration instructions
  --compare       Show before/after comparison

Example:
  node gemini-prompt-enhancer.js "Create a rate alert showing 6.5%" --style dramatic --compare
        `);
        process.exit(0);
    }

    const basicPrompt = args[0];
    const styleIndex = args.indexOf('--style');
    const creativityIndex = args.indexOf('--creativity');
    const typeIndex = args.indexOf('--type');
    const showComparison = args.includes('--compare');
    const includePhoto = args.includes('--photo');

    const options = {
        stylePreset: styleIndex >= 0 ? args[styleIndex + 1] : 'balanced',
        creativityLevel: creativityIndex >= 0 ? parseInt(args[creativityIndex + 1]) : 7,
        templateType: typeIndex >= 0 ? args[typeIndex + 1] : 'general',
        includePhoto
    };

    console.log('\n🎨 Enhancing your marketing prompt for Gemini 2.5 Flash...\n');

    const result = await enhanceForGemini(basicPrompt, options);

    if (showComparison) {
        console.log('='.repeat(80));
        console.log('📋 ORIGINAL PROMPT:');
        console.log('='.repeat(80));
        console.log(result.original);
        console.log('\n' + '='.repeat(80));
        console.log('✨ GEMINI-OPTIMIZED PROMPT:');
        console.log('='.repeat(80));
        console.log(result.enhanced);
        console.log('\n' + '='.repeat(80));
    } else {
        console.log(result.enhanced);
    }

    console.log(`\n📊 Validation:`);
    console.log(`   Safety Score: ${result.metadata.validation?.safetyScore || 'N/A'}%`);
    console.log(`   Word Count: ${result.metadata.validation?.wordCount || 'N/A'}`);
    console.log(`   Warnings: ${result.metadata.validation?.warnings?.length || 0}`);

    if (result.metadata.validation?.warnings?.length > 0) {
        console.log(`\n⚠️  Warnings:`);
        result.metadata.validation.warnings.forEach(w => console.log(`   - ${w}`));
    }

    console.log(`\n⚙️  Gemini Parameters:`);
    console.log(`   Temperature: ${result.geminiParams.temperature}`);
    console.log(`   TopK: ${result.geminiParams.topK}`);
    console.log(`   TopP: ${result.geminiParams.topP}`);

    console.log(`\n🎨 Style: ${result.metadata.stylePreset}`);
    console.log(`⚡ Creativity: ${result.metadata.creativityLevel}/10\n`);

    if (result.error) {
        console.error(`⚠️  Error: ${result.error} (using fallback)`);
    }
}

export default {
    enhanceForGemini,
    enhanceMultiplePrompts,
    GEMINI_PARAMS,
    TEXT_LIMITS,
    PROBLEM_WORDS,
    TEMPLATE_COLOR_SCHEMES
};
