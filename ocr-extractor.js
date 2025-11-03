#!/usr/bin/env node

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';

/**
 * OCR Extractor
 * Uses Claude Vision to extract exact text from generated images
 */

class OCRExtractor {
    constructor() {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY environment variable not set');
        }

        this.client = new Anthropic({ apiKey });
    }

    /**
     * Extract all text from image
     * @param {string} imageUrl - URL or base64 image
     * @returns {Promise<Object>} Extracted text with character-level details
     */
    async extractText(imageUrl) {
        console.log('\n📖 Extracting text from image...');

        try {
            let imageSource;

            // Handle base64 vs URL
            if (imageUrl.startsWith('data:image')) {
                const base64Data = imageUrl.split(',')[1];
                const mediaType = imageUrl.match(/data:(.*?);/)[1];
                imageSource = {
                    type: 'base64',
                    media_type: mediaType,
                    data: base64Data
                };
            } else {
                imageSource = {
                    type: 'url',
                    url: imageUrl
                };
            }

            const response = await this.client.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 2000,
                messages: [{
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: imageSource
                        },
                        {
                            type: 'text',
                            text: `Extract ALL text from this image. Return it EXACTLY as it appears, preserving:
- All punctuation marks (quotes, periods, commas, etc.)
- Line breaks
- Spacing
- Capitalization

Return ONLY valid JSON:
{
  "text": "exact text as it appears",
  "elements": [
    {"type": "header", "content": "exact text"},
    {"type": "rate", "content": "exact text with numbers"},
    {"type": "commentary", "content": "exact quoted text"},
    {"type": "contact", "content": "exact contact info"}
  ],
  "punctuation_check": {
    "has_opening_quotes": true/false,
    "has_closing_quotes": true/false,
    "quote_count": number,
    "period_count": number
  }
}`
                        }
                    ]
                }]
            });

            const extractedText = response.content[0].text;
            const jsonMatch = extractedText.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                console.log(`✅ Extracted ${result.text.length} characters`);
                console.log(`   Quote marks: ${result.punctuation_check?.quote_count || 0}`);
                return {
                    success: true,
                    ...result
                };
            }

            // Fallback if JSON parsing fails
            return {
                success: true,
                text: extractedText,
                elements: [],
                punctuation_check: {
                    has_opening_quotes: extractedText.includes('"'),
                    has_closing_quotes: extractedText.lastIndexOf('"') > extractedText.indexOf('"'),
                    quote_count: (extractedText.match(/"/g) || []).length,
                    period_count: (extractedText.match(/\./g) || []).length
                }
            };

        } catch (error) {
            console.error(`❌ OCR extraction failed: ${error.message}`);
            return {
                success: false,
                text: '',
                elements: [],
                punctuation_check: {
                    has_opening_quotes: false,
                    has_closing_quotes: false,
                    quote_count: 0,
                    period_count: 0
                },
                error: error.message
            };
        }
    }

    /**
     * Validate specific text elements are present
     * @param {Object} ocrResult - Result from extractText()
     * @param {Array} requiredElements - Array of strings that must be present
     * @returns {Object} Validation result
     */
    validateElements(ocrResult, requiredElements) {
        const textLower = ocrResult.text.toLowerCase();
        const missing = [];

        for (const element of requiredElements) {
            if (!textLower.includes(element.toLowerCase())) {
                missing.push(element);
            }
        }

        return {
            valid: missing.length === 0,
            missing,
            found: requiredElements.length - missing.length,
            total: requiredElements.length
        };
    }

    /**
     * Check for specific punctuation issues
     * @param {Object} ocrResult - Result from extractText()
     * @returns {Array} Array of punctuation errors
     */
    checkPunctuation(ocrResult) {
        const errors = [];
        const pc = ocrResult.punctuation_check;

        // Check quote marks are paired
        if (pc.quote_count % 2 !== 0) {
            errors.push({
                type: 'punctuation',
                issue: `Unpaired quote marks: found ${pc.quote_count} (should be even number)`
            });
        }

        if (pc.has_opening_quotes && !pc.has_closing_quotes) {
            errors.push({
                type: 'punctuation',
                issue: 'Opening quote mark without closing quote'
            });
        }

        // Check commentary has quotes
        const commentaryElement = ocrResult.elements?.find(e => e.type === 'commentary');
        if (commentaryElement) {
            const content = commentaryElement.content;
            if (!content.startsWith('"') || !content.endsWith('"')) {
                errors.push({
                    type: 'punctuation',
                    issue: 'Commentary missing opening or closing quote marks'
                });
            }
        }

        return errors;
    }

    /**
     * Check for typos by comparing expected vs actual text
     * @param {Object} ocrResult - Result from extractText()
     * @param {string} expectedText - What we expect to see
     * @returns {Array} Array of typo errors
     */
    findTypos(ocrResult, expectedText) {
        const actual = ocrResult.text.toLowerCase().replace(/\s+/g, ' ');
        const expected = expectedText.toLowerCase().replace(/\s+/g, ' ');

        const errors = [];

        // Simple word-by-word comparison
        const actualWords = actual.split(' ');
        const expectedWords = expected.split(' ');

        for (const expectedWord of expectedWords) {
            if (expectedWord.length < 3) continue; // Skip very short words

            let found = false;
            for (const actualWord of actualWords) {
                if (this.similarity(expectedWord, actualWord) > 0.8) {
                    found = true;
                    break;
                }
            }

            if (!found && !actual.includes(expectedWord)) {
                errors.push({
                    type: 'typo',
                    issue: `Expected word "${expectedWord}" not found or misspelled in image`
                });
            }
        }

        return errors;
    }

    /**
     * Calculate similarity between two strings (0-1)
     */
    similarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) return 1.0;

        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    /**
     * Calculate Levenshtein distance between two strings
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }
}

export default OCRExtractor;
