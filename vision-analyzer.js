import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';

/**
 * Vision Analyzer using Claude API
 * Analyzes generated marketing images for errors and quality
 */

class VisionAnalyzer {
    constructor() {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY environment variable not set');
        }

        this.client = new Anthropic({ apiKey });
    }

    /**
     * Analyze an image for template accuracy
     * @param {string|Buffer} imagePathOrBuffer - Path to the image file OR Buffer with image data
     * @param {string} templateName - Name of the template being tested
     * @param {object} options - Optional parameters (imageBuffer, mediaType)
     * @returns {Promise<{success: boolean, errors: Array, score: number, analysis: string}>}
     */
    async analyzeImage(imagePathOrBuffer, templateName, options = {}) {
        try {
            let base64Image;
            let mediaType;
            let imagePath;

            // PERFORMANCE OPTIMIZATION: Accept buffer directly to avoid disk I/O
            if (options.imageBuffer) {
                // Use provided buffer (fast path)
                console.log(`\n🔍 Analyzing image from buffer (${options.imageBuffer.length} bytes)`);
                base64Image = options.imageBuffer.toString('base64');
                mediaType = options.mediaType || 'image/png';
                imagePath = imagePathOrBuffer; // For logging
            } else if (Buffer.isBuffer(imagePathOrBuffer)) {
                // Buffer passed directly as first argument
                console.log(`\n🔍 Analyzing image from buffer (${imagePathOrBuffer.length} bytes)`);
                base64Image = imagePathOrBuffer.toString('base64');
                mediaType = options.mediaType || 'image/png';
                imagePath = 'buffer';
            } else {
                // Legacy path: read from disk
                imagePath = imagePathOrBuffer;
                console.log(`\n🔍 Analyzing image: ${imagePath}`);
                const imageData = await fs.readFile(imagePath);
                base64Image = imageData.toString('base64');
                mediaType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
            }

            console.log(`📋 Template: ${templateName}`);

            // Create analysis prompt based on template type
            const analysisPrompt = this.buildAnalysisPrompt(templateName);

            // Call Claude API with vision
            const response = await this.client.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 2000,
                messages: [{
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: mediaType,
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

            // Parse Claude's response
            const analysisText = response.content[0].text;
            const result = this.parseAnalysisResponse(analysisText);

            console.log(`\n📊 Analysis Results:`);
            console.log(`   Success: ${result.success ? '✅' : '❌'}`);
            console.log(`   Score: ${result.score}%`);
            console.log(`   Errors found: ${result.errors.length}`);

            if (result.errors.length > 0) {
                console.log(`\n⚠️ Issues Detected:`);
                result.errors.forEach((error, index) => {
                    console.log(`   ${index + 1}. [${error.type}] ${error.issue}`);
                });
            }

            return result;

        } catch (error) {
            console.error(`❌ Error analyzing image: ${error.message}`);
            return {
                success: false,
                errors: [{ type: 'analysis_error', issue: error.message }],
                score: 0,
                analysis: `Failed to analyze: ${error.message}`
            };
        }
    }

    /**
     * Build analysis prompt based on template type
     * @param {string} templateName - Template name
     * @returns {string} Analysis prompt
     */
    buildAnalysisPrompt(templateName) {
        const commonChecks = `
Analyze this marketing template image and check for:

**QUOTATION MARKS (HIGHEST PRIORITY):**
- Count every opening quote mark (")
- Count every closing quote mark (")
- CRITICAL: Opening and closing quotes MUST match exactly!
- If you see any quote without its pair, this is an AUTOMATIC FAIL

**SPELLING VERIFICATION (CRITICAL - DO NOT AUTO-CORRECT!):**
IMPORTANT: Read each letter INDIVIDUALLY. Do not mentally autocorrect what you see!

Verify these words LETTER-BY-LETTER (one letter at a time):
- OUTLOOK: Must be O-U-T-L-O-O-K (NOT "OUTLOK", "OUTTLOOK", or "OUTLOCK")
- MARKET: Must be M-A-R-K-E-T (NOT "MAPKATE", "MAKRET")
- ECONOMIC: Must be E-C-O-N-O-M-I-C (NOT "ECONOMIK", "ECONOMI")
- MORTGAGE: Must be M-O-R-T-G-A-G-E (NOT "MOTGAGE", "MORTAGE")
- STRATEGY: Must be S-T-R-A-T-E-G-Y (NOT "STATEGY", "STRATEGEY")
- COMMENTARY: Must be C-O-M-M-E-N-T-A-R-Y (NOT "COMMENTARYE", "COMENTARY")

If you see "OUTLOK" instead of "OUTLOOK", this is a SPELLING ERROR - report it immediately!
If ANY letter is missing or wrong, this is an AUTOMATIC FAIL!

**DATA COMPLETENESS:**
- Are all rates displayed correctly with proper decimals (e.g., 6.27%)?
- Are all percent signs (%) visible?
- Is the date displayed?
- Is contact info present: "David Young NMLS 62043 Phone 310-954-7771"?

**VISUAL ELEMENTS:**
- Is the LendWise logo visible (gold owl)?
- Is there a forest green gradient background?
- Are there metallic gold accents?
- Does the design have depth (not flat)?
`;

        const templateSpecific = {
            'Daily Rate Update': `
**Template-Specific Checks:**
- Header: "Daily Rate Update [Date]"
- Large 30-Year rate display (6.38%) with change indicator (+/-/—)
- 3 economic factor bullets visible (with or without indicators)
- Lock strategy text present
- Expert insight quote with both opening and closing quotation marks
`,
            'Market Report': `
**Template-Specific Checks:**
- Header: "Mortgage Rate Update" or "MORTGAGE MARKET UPDATE"
- 30-Year Fixed: 6.38% with change indicator
- 15-Year Fixed: 5.88% with change indicator
- Jumbo rate: 6.29% with change
- Treasury yields section visible
- Market insight text
- Expert note quote with opening and closing quotation marks
`,
            'Rate Trends': `
**Template-Specific Checks:**
- Header: "MORTGAGE RATE TRENDS" or "Rate Trend Analysis"
- Large current rate display: 6.38%
- 4-Week Range visible
- 52-Week Range visible
- Trend status (Stable/Volatile)
- Forward View or Forecast section (NOT "OUTLOK" typo)
- Commentary quote
`,
            'Economic Outlook': `
**Template-Specific Checks:**
- Header: "ECONOMIC OUTLOOK" (check spelling - NOT "OUTLOK" or "ECONOMIK")
- Subheadline: "How Current Conditions Impact Mortgage Rates" or "How Conditions Impact Mortgage Rates"
- Large current 30-year rate: 6.27%
- 3 Key Economic Factors with status labels (Improving/Concern/etc)
- Treasury Yield section: 10-Year value displayed (e.g., 4.021 or 4.132)
- Market insight quote with BOTH opening " and closing " quotation marks
- All numerical data must be EXACT (no extra digits added or removed)
`
        };

        return `${commonChecks}\n${templateSpecific[templateName] || ''}

**OUTPUT FORMAT:**
Provide your analysis in this exact JSON format:
{
  "success": true or false (true only if 100% perfect, no issues at all),
  "score": 0-100 (percentage of criteria met),
  "errors": [
    {"type": "typo", "issue": "description", "severity": "high/medium/low"},
    ...
  ],
  "summary": "brief overall assessment"
}

Be thorough and strict. Even minor typos or missing elements = success: false.`;
    }

    /**
     * Parse Claude's analysis response
     * @param {string} responseText - Raw response text
     * @returns {object} Parsed analysis result
     */
    parseAnalysisResponse(responseText) {
        try {
            // Try to extract JSON from response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    success: parsed.success === true,
                    errors: parsed.errors || [],
                    score: parsed.score || 0,
                    analysis: parsed.summary || responseText
                };
            }

            // If no JSON found, parse manually
            const hasErrors = responseText.toLowerCase().includes('error') ||
                            responseText.toLowerCase().includes('issue') ||
                            responseText.toLowerCase().includes('problem');

            return {
                success: !hasErrors,
                errors: hasErrors ? [{ type: 'unknown', issue: 'Issues detected in manual parsing' }] : [],
                score: hasErrors ? 50 : 100,
                analysis: responseText
            };

        } catch (error) {
            console.error(`Error parsing analysis response: ${error.message}`);
            return {
                success: false,
                errors: [{ type: 'parse_error', issue: 'Could not parse analysis response' }],
                score: 0,
                analysis: responseText
            };
        }
    }
}

export default VisionAnalyzer;
