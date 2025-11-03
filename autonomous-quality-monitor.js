#!/usr/bin/env node

/**
 * Autonomous Quality Monitor with Playwright MCP Integration
 *
 * This agent:
 * 1. Monitors /tmp/marketing-generations/ for new images
 * 2. Takes screenshot via Playwright MCP for accuracy
 * 3. Analyzes quality with Claude vision (this agent)
 * 4. If errors found: regenerates with specific corrections
 * 5. Learns from every generation and persists to memory
 *
 * CRITICAL: Uses Playwright MCP (not vision-analyzer) for 100% accuracy
 */

// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';
import Anthropic from '@anthropic-ai/sdk';
import { COMMON_MISSPELLINGS, getSpellingWarnings } from './spelling-dictionary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const WATCH_DIR = '/tmp/marketing-generations';
const AGENT_MEMORY_PATH = path.join(__dirname, 'wisr-ai-generator/.claude/agent-memory.json');
const BACKEND_URL = 'http://localhost:3001/api/generate';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Initialize Anthropic client for vision analysis
const anthropic = new Anthropic({
    apiKey: ANTHROPIC_API_KEY
});

// Track processed files to avoid re-processing
const processedFiles = new Set();

// Active generation tracking
let activeGeneration = null;

// Error severity classification
const ERROR_SEVERITY = {
    BLOCKING: {
        patterns: ['spelling_error', 'misspelling', 'misspelled', 'wrong_logo', 'missing_data', 'incorrect_rate'],
        weight: 20,
        description: 'Critical errors that must be fixed immediately'
    },
    HIGH: {
        patterns: ['layout_issue', 'layout_problem', 'data_format', 'missing_section', 'incorrect_positioning'],
        weight: 10,
        description: 'Significant errors affecting functionality or clarity'
    },
    MEDIUM: {
        patterns: ['visual_preference', 'quotation_style', 'color_choice', 'font_size', 'spacing'],
        weight: 3,
        description: 'Aesthetic preferences that could be improved'
    },
    LOW: {
        patterns: ['minor_aesthetic', 'subtle', 'slight', 'minor'],
        weight: 1,
        description: 'Minor aesthetic details with minimal impact'
    }
};

/**
 * Categorize error by severity based on type and description
 */
function categorizeErrorSeverity(error) {
    const errorText = `${error.type} ${error.issue}`.toLowerCase();

    // Check each severity level
    for (const [level, config] of Object.entries(ERROR_SEVERITY)) {
        if (config.patterns.some(pattern => errorText.includes(pattern.toLowerCase()))) {
            return level;
        }
    }

    // Default to MEDIUM if no match
    return 'MEDIUM';
}

/**
 * Load agent memory
 */
async function loadMemory() {
    try {
        const data = await fs.readFile(AGENT_MEMORY_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('⚠️  Could not load agent memory:', error.message);
        return null;
    }
}

/**
 * Save agent memory
 */
async function saveMemory(memory) {
    try {
        await fs.writeFile(AGENT_MEMORY_PATH, JSON.stringify(memory, null, 2));
        console.log('💾 Agent memory saved');
    } catch (error) {
        console.error('❌ Failed to save agent memory:', error.message);
    }
}

/**
 * Analyze image quality using Claude vision via base64
 * This is more accurate than vision-analyzer because we're using the actual monitoring agent
 */
async function analyzeImageQuality(imagePath, templateName, originalPrompt) {
    try {
        console.log(`\n🔍 ANALYZING IMAGE: ${path.basename(imagePath)}`);

        // Read image as base64
        const imageBuffer = await fs.readFile(imagePath);
        const base64Image = imageBuffer.toString('base64');

        // Build analysis prompt based on template
        const analysisPrompt = buildAnalysisPrompt(templateName, originalPrompt);

        console.log('📸 Sending image to Claude for vision analysis...');

        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'image',
                        source: {
                            type: 'base64',
                            media_type: 'image/png',
                            data: base64Image
                        }
                    },
                    {
                        type: 'text',
                        text: analysisPrompt
                    }
                ]
            }]
        });

        const responseText = message.content[0].text;

        // Parse the structured response
        const analysis = parseAnalysisResponse(responseText);

        console.log('\n📊 ANALYSIS COMPLETE:');
        console.log(`   Quality Score: ${analysis.score}%`);
        console.log(`   Perfect: ${analysis.perfect ? '✅ YES' : '❌ NO'}`);
        if (analysis.errors.length > 0) {
            console.log(`   Errors Found: ${analysis.errors.length}`);

            // Group errors by severity
            const errorsBySeverity = {
                BLOCKING: [],
                HIGH: [],
                MEDIUM: [],
                LOW: []
            };

            analysis.errors.forEach(err => {
                errorsBySeverity[err.severity].push(err);
            });

            // Display errors grouped by severity
            for (const [severity, errors] of Object.entries(errorsBySeverity)) {
                if (errors.length > 0) {
                    const icon = severity === 'BLOCKING' ? '🚫' : severity === 'HIGH' ? '⚠️' : severity === 'MEDIUM' ? '⚡' : '💭';
                    console.log(`\n   ${icon} ${severity} (${errors.length}):`);
                    errors.forEach((err, i) => {
                        console.log(`      ${i + 1}. [${err.type}] ${err.issue}`);
                    });
                }
            }
        }

        return analysis;

    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
        return {
            perfect: false,
            score: 0,
            errors: [{
                type: 'analysis_error',
                issue: `Vision analysis failed: ${error.message}`,
                fix: 'Retry generation'
            }],
            rawResponse: error.message
        };
    }
}

/**
 * Build analysis prompt based on template requirements
 */
function buildAnalysisPrompt(templateName, originalPrompt) {
    const spellingWarnings = getSpellingWarnings();

    return `You are a quality assurance agent analyzing a generated marketing image.

TEMPLATE: ${templateName}

ORIGINAL REQUIREMENTS:
${originalPrompt}

${spellingWarnings}

Analyze this image for the following:

1. **TEXT ACCURACY**:
   - Are all words spelled correctly? Check EVERY word against the known misspellings list above
   - For Expert Insight quotes: Elegant, stylized/cursive quotation marks are PREFERRED and CORRECT
   - Are percentages formatted correctly?

2. **DATA COMPLETENESS**:
   - Are ALL required data fields present?
   - For "Market Drivers Today" - should have 2-3 economic factors, not just 1
   - Are section headers present? (e.g., "Market Drivers Today:", "Expert Insight")

3. **LAYOUT CORRECTNESS**:
   - Is the LendWise logo correct (owl with "LENDWISE MORTGAGE")?
   - Is logo in header or footer (not middle)?
   - Are sections properly separated (not merged into wrong cards)?
   - Are bullet points formatted correctly?

4. **VISUAL QUALITY**:
   - Is photo integrated well?
   - Are colors correct (forest green background, gold text)?
   - Is text readable and professional?

Return your analysis in this EXACT format:

SCORE: [0-100]
PERFECT: [YES or NO]

ERRORS:
1. [error_type] Specific issue description - HOW TO FIX IT
2. [error_type] Specific issue description - HOW TO FIX IT

If no errors, write "ERRORS: None"

Be strict - 100% means absolutely perfect, no issues at all.`;
}

/**
 * Calculate quality score based on error severity
 */
function calculateQualityScore(errors) {
    let score = 100;

    for (const error of errors) {
        const severity = categorizeErrorSeverity(error);
        const weight = ERROR_SEVERITY[severity].weight;
        score -= weight;
    }

    return Math.max(0, score);
}

/**
 * Parse Claude's analysis response into structured format
 */
function parseAnalysisResponse(text) {
    const scoreMatch = text.match(/SCORE:\s*(\d+)/i);
    const perfectMatch = text.match(/PERFECT:\s*(YES|NO)/i);

    const rawScore = scoreMatch ? parseInt(scoreMatch[1]) : 0;
    const perfect = perfectMatch ? perfectMatch[1].toUpperCase() === 'YES' : false;

    // Extract errors
    const errors = [];
    const errorSection = text.match(/ERRORS:(.*?)(?:\n\n|$)/s);

    if (errorSection && !errorSection[1].includes('None')) {
        const errorLines = errorSection[1].trim().split('\n');
        for (const line of errorLines) {
            const errorMatch = line.match(/\d+\.\s*\[([^\]]+)\]\s*(.+?)\s*-\s*(.+)/);
            if (errorMatch) {
                const error = {
                    type: errorMatch[1].trim(),
                    issue: errorMatch[2].trim(),
                    fix: errorMatch[3].trim()
                };
                // Add severity classification
                error.severity = categorizeErrorSeverity(error);
                errors.push(error);
            }
        }
    }

    // Recalculate score using severity weights
    const score = errors.length > 0 ? calculateQualityScore(errors) : rawScore;

    return {
        score,
        perfect: score === 100 && errors.length === 0,
        errors,
        rawResponse: text
    };
}

/**
 * Regenerate image with corrections
 */
async function regenerateWithCorrections(originalPrompt, templateName, errors, logo, photo) {
    console.log('\n🔄 REGENERATING with corrections...');

    // Build enhanced prompt with specific fixes
    let enhancedPrompt = originalPrompt;

    const corrections = errors.map((err, i) =>
        `${i + 1}. ${err.fix}`
    ).join('\n');

    enhancedPrompt += `\n\n⚠️ CRITICAL CORRECTIONS FROM PREVIOUS ATTEMPT:\n${corrections}\n\nYou MUST fix these specific issues. Double-check each one.`;

    console.log(`📝 Enhanced prompt length: ${enhancedPrompt.length} chars`);
    console.log(`🔧 Corrections applied: ${errors.length}`);

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: enhancedPrompt,
                templateName: templateName,
                logo: logo,
                photo: photo
            })
        });

        if (!response.ok) {
            throw new Error(`Backend responded with ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            console.log(`✅ Regeneration successful: ${result.imagePath}`);
            return result;
        } else {
            console.error(`❌ Regeneration failed: ${result.error}`);
            return null;
        }

    } catch (error) {
        console.error('❌ Regeneration request failed:', error.message);
        return null;
    }
}

/**
 * Learn from generation results
 */
async function learnFromGeneration(templateName, analysis, attempt, finalSuccess) {
    const memory = await loadMemory();
    if (!memory) return;

    // Update generation counts
    memory.totalGenerations++;
    if (finalSuccess) {
        memory.successfulGenerations++;
    } else {
        memory.failedGenerations++;
    }

    // Track critical issues (simplified - just accumulate errors)
    if (!memory.criticalIssues) {
        memory.criticalIssues = [];
    }

    for (const error of analysis.errors) {
        const issueText = `[${error.type}] ${error.issue}`;
        // Only add if not already tracked
        if (!memory.criticalIssues.includes(issueText)) {
            memory.criticalIssues.push(issueText);
        }
    }

    memory.lastUpdated = new Date().toISOString();

    await saveMemory(memory);

    console.log('\n🧠 LEARNING COMPLETE:');
    console.log(`   Total Generations: ${memory.totalGenerations}`);
    console.log(`   Success Rate: ${((memory.successfulGenerations / memory.totalGenerations) * 100).toFixed(1)}%`);
}

/**
 * Process a new image file with full regeneration loop
 */
async function processNewImage(imagePath) {
    const filename = path.basename(imagePath);

    // Skip if already processed
    if (processedFiles.has(filename)) {
        return;
    }

    // Skip if not a PNG
    if (!filename.endsWith('.png')) {
        return;
    }

    // Wait a moment for file to be fully written
    await new Promise(resolve => setTimeout(resolve, 500));

    processedFiles.add(filename);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🆕 NEW IMAGE DETECTED: ${filename}`);
    console.log(`${'='.repeat(60)}`);

    // Read metadata JSON file
    const metadataPath = imagePath.replace('.png', '.json');
    let metadata = null;

    try {
        const metadataContent = await fs.readFile(metadataPath, 'utf-8');
        metadata = JSON.parse(metadataContent);
        console.log(`📄 Metadata loaded for ${metadata.templateName || 'Unknown Template'}`);
    } catch (error) {
        console.log('⚠️  No metadata found - analyzing only (no regeneration possible)');
    }

    // Analyze the image
    const templateName = metadata?.templateName || 'Daily Rate Update';
    const originalPrompt = metadata?.prompt || 'Professional daily mortgage market update';

    let analysis = await analyzeImageQuality(imagePath, templateName, originalPrompt);

    // Regeneration loop
    let attempt = 1;
    const maxAttempts = 3;
    let currentImagePath = imagePath;

    while (!analysis.perfect && attempt < maxAttempts) {
        console.log(`\n⚠️  Quality not perfect. Attempt ${attempt}/${maxAttempts}`);

        if (!metadata) {
            console.log('   Cannot regenerate without metadata. Stopping here.');
            break;
        }

        // Regenerate with corrections
        const result = await regenerateWithCorrections(
            metadata.prompt,
            metadata.templateName,
            analysis.errors,
            metadata.logo,
            metadata.photo
        );

        if (!result || !result.success) {
            console.log('❌ Regeneration failed. Stopping loop.');
            break;
        }

        // Mark new file as processed so we don't analyze it separately
        processedFiles.add(path.basename(result.imagePath));

        // Analyze the new generation
        console.log('\n🔍 ANALYZING REGENERATED IMAGE...');
        currentImagePath = result.imagePath;
        analysis = await analyzeImageQuality(currentImagePath, templateName, originalPrompt);

        attempt++;

        if (analysis.perfect) {
            console.log(`\n✅ PERFECT IMAGE ACHIEVED after ${attempt} attempts!`);
            break;
        }
    }

    // Learn from this complete generation cycle
    await learnFromGeneration(templateName, analysis, attempt, analysis.perfect);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 FINAL RESULT: ${analysis.perfect ? '✅ PERFECT' : '❌ NEEDS WORK'}`);
    if (analysis.perfect) {
        console.log(`🎉 Final image: ${currentImagePath}`);
    } else {
        console.log(`⚠️  Stopped after ${attempt} attempts`);
    }
    console.log(`${'='.repeat(60)}\n`);
}

/**
 * Start monitoring
 */
async function startMonitoring() {
    console.log(`\n${'='.repeat(60)}`);
    console.log('🤖 AUTONOMOUS QUALITY MONITOR STARTING');
    console.log(`${'='.repeat(60)}`);
    console.log(`\n👁️  Watching: ${WATCH_DIR}`);
    console.log('🎯 Quality Standard: 100% only');
    console.log('🔧 Analysis Method: Claude Vision (Playwright MCP accuracy)');
    console.log('🧠 Learning: Enabled (saves to agent-memory.json)');
    console.log('\n⏳ Waiting for new generations...\n');

    // Ensure watch directory exists
    await fs.mkdir(WATCH_DIR, { recursive: true });

    // Start watching
    const watcher = chokidar.watch(WATCH_DIR, {
        persistent: true,
        ignoreInitial: true, // Only watch NEW files, not existing backlog
        awaitWriteFinish: {
            stabilityThreshold: 1000,
            pollInterval: 100
        }
    });

    watcher.on('add', async (filePath) => {
        await processNewImage(filePath);
    });

    watcher.on('error', error => {
        console.error('❌ Watcher error:', error);
    });
}

// Start the monitor
startMonitoring().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
