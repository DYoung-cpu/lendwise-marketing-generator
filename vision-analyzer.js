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

            console.log('\n📊 Analysis Results:');
            console.log(`   Success: ${result.success ? '✅' : '❌'}`);
            console.log(`   Score: ${result.score}%`);
            console.log(`   Errors found: ${result.errors.length}`);

            if (result.errors.length > 0) {
                console.log('\n⚠️ Issues Detected:');
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

**DATA COMPLETENESS & TEXT TRUNCATION:**
CRITICAL: Check EVERY piece of text for completeness. Look for missing words, partial words, or truncated labels.

- Are all rates displayed correctly with proper decimals (e.g., 6.27%)?
- Are all percent signs (%) visible and NOT missing?
- Is the date displayed FULLY (not truncated like "October 21" missing year)?
- Is contact info COMPLETE: "David Young NMLS 62043 Phone 310-954-7771"?
- Check for truncated labels: "30-" is WRONG (should be "30-Year"), "10-" is WRONG (should be "10-Year")
- Treasury Yields: Must say "10-Year [value] and 30-Year [value]" - verify BOTH "Year" labels are present
- Rate labels: Must show "30-Year Fixed" (NOT "30-Fixed" or "30-Year Fi")
- Look for incomplete words: "continu" instead of "continued", "optimi" instead of "optimism"

**VISUAL ELEMENTS:**
- Is the LendWise logo visible (gold owl)?
- Is there a forest green gradient background?
- Are there metallic gold accents?
- Does the design have depth (not flat)?
`;

        const templateSpecific = {
            'Daily Rate Update': `
**Template-Specific Checks:**
- Header: "Daily Rate Update [Date]" - verify COMPLETE date (month, day, year)
- Large 30-Year rate display: Must show "30-Year Fixed" FULLY (not "30-Year Fi" or "30-Fixed")
- Rate value: 6.38% with change indicator (+/-/—) - verify % sign present
- 3 economic factor bullets: Check each bullet for complete sentences (no truncated words)
- Lock strategy text: FULL sentence (not cut off mid-word)
- Expert insight quote: BOTH opening " and closing " quotation marks present
- Contact: "David Young NMLS 62043 Phone 310-954-7771" - verify ALL parts present (NMLS number, full phone)
`,
            'Market Report': `
**Template-Specific Checks:**
- Header: "Mortgage Rate Update" or "MORTGAGE MARKET UPDATE" - verify complete words
- 30-Year Fixed: Must show COMPLETE label "30-Year Fixed" (not "30-Fixed" or "30-Year Fi")
- Rate: 6.38% with change indicator - verify % sign visible
- 15-Year Fixed: Must show COMPLETE label "15-Year Fixed" (not "15-Fixed" or "15-Year Fi")
- Rate: 5.88% with change indicator - verify % sign visible
- Jumbo rate: Must show COMPLETE label "Jumbo Rate" or "Jumbo" - verify 6.29% with % sign
- Treasury yields: CRITICAL - Must say "10-Year [value] and 30-Year [value]"
  → Verify "10-Year" is complete (NOT "10-" or "10-Yea")
  → Verify "30-Year" is complete (NOT "30-" or "30-721" without "Year")
  → Example WRONG: "10-Year 4.132 and 30-721" ❌
  → Example CORRECT: "10-Year 4.132 and 30-Year 4.721" ✅
- Market insight text: COMPLETE sentences (no truncation)
- Expert note quote: BOTH opening " and closing " marks present
- Contact: "David Young NMLS 62043 Phone 310-954-7771" - ALL components present
`,
            'Rate Trends': `
**Template-Specific Checks:**
- Header: "MORTGAGE RATE TRENDS" or "Rate Trend Analysis" - verify complete words
- Large current rate display: Must show "30-Year Fixed" FULLY (not truncated)
- Rate value: 6.38% - verify % sign present
- 4-Week Range: COMPLETE labels and values (e.g., "6.31 to 6.39")
- 52-Week Range: COMPLETE labels and values (e.g., "6.13 to 7.26")
- Trend status: COMPLETE word (Stable/Volatile - not "Stab" or "Vol")
- Forward View: COMPLETE text (NOT "OUTLOK" typo - must be "OUTLOOK")
- Commentary quote: BOTH opening " and closing " marks, COMPLETE sentence
- Contact: "David Young NMLS 62043 Phone 310-954-7771" - verify all components
`,
            'Economic Outlook': `
**Template-Specific Checks:**
- Header: "ECONOMIC OUTLOOK" - verify COMPLETE spelling (NOT "OUTLOK" or "ECONOMIK")
- Subheadline: Must be COMPLETE - "How Current Conditions Impact Mortgage Rates"
- Large current rate: Must show "30-Year Fixed" FULLY (not "30-Fixed" or truncated)
- Rate value: 6.38% - verify % sign present
- 3 Key Economic Factors: Each bullet must have COMPLETE sentences (no truncated words)
- Status labels: COMPLETE words (Improving/Concern/etc - not "Improv" or "Concer")
- Treasury Yields section: CRITICAL TEXT COMPLETENESS CHECK
  → Must say "10-Year [value] and 30-Year [value]"
  → Verify "10-Year" is COMPLETE (NOT "10-" or "10-Yea")
  → Verify "30-Year" is COMPLETE (NOT "30-" or truncated)
  → Example WRONG: "10-Year 4.132 and 30-4.721" ❌
  → Example CORRECT: "10-Year 4.132 and 30-Year 4.721" ✅
- Market insight quote: BOTH opening " and closing " quotation marks present
- Quote text: COMPLETE sentence (no truncation mid-word)
- Contact: "David Young NMLS 62043 Phone 310-954-7771" - ALL components present
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
