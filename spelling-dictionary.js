/**
 * Spelling Dictionary - Common Gemini 2.5 Flash Misspellings
 *
 * This dictionary tracks known spelling errors that Gemini frequently makes
 * in marketing image generation. Used by autonomous-quality-monitor.js
 * to provide enhanced detection and correction.
 *
 * Updated: 2025-10-29
 */

export const COMMON_MISSPELLINGS = {
    // Critical financial terminology
    'PERSONAIIZED': 'PERSONALIZED',
    'VOLITALIITY': 'VOLATILITY',
    'volitiliy': 'volatility',      // Missing 'at' in middle
    'volitaliy': 'volatility',      // Missing second 'i'
    'volatiliy': 'volatility',      // Missing 't' at end
    'volitility': 'volatility',     // Extra 'i'
    'volotility': 'volatility',     // Wrong vowel
    'VOLITILIY': 'VOLATILITY',      // Uppercase variant
    'voltability': 'volatility',
    'vol\'ability': 'volatility',

    // Common mortgage terms
    'morgage': 'mortgage',
    'MORGAGE': 'MORTGAGE',
    'preapproval': 'pre-approval',
    'PREAPPROVAL': 'PRE-APPROVAL',

    // Professional terminology
    'gurantee': 'guarantee',
    'GURANTEE': 'GUARANTEE',
    'experiance': 'experience',
    'EXPERIANCE': 'EXPERIENCE',
    'profesional': 'professional',
    'PROFESIONAL': 'PROFESSIONAL',

    // Common typos in marketing
    'oppurtunity': 'opportunity',
    'OPPURTUNITY': 'OPPORTUNITY',
    'recieve': 'receive',
    'RECIEVE': 'RECEIVE'
};

/**
 * Check if text contains any known misspellings (case-insensitive)
 * @param {string} text - Text to check
 * @returns {Array} Array of found misspellings with corrections
 */
export function findMisspellings(text) {
    const found = [];
    const lowerText = text.toLowerCase();

    for (const [misspelling, correct] of Object.entries(COMMON_MISSPELLINGS)) {
        // Check case-insensitive
        if (lowerText.includes(misspelling.toLowerCase())) {
            found.push({
                misspelling,
                correct,
                type: 'known_error'
            });
        }
    }

    return found;
}

/**
 * Generate warning text for analysis prompt
 * @returns {string} Formatted warning text with all known misspellings
 */
export function getSpellingWarnings() {
    const warnings = [];

    // Group by error type
    const critical = [
        'PERSONALIZED (not PERSONAIIZED)',
        'VOLATILITY (not VOLITALIITY or voltability or vol\'ability)'
    ];

    const mortgage = [
        'MORTGAGE (not MORGAGE)',
        'PRE-APPROVAL (not PREAPPROVAL)'
    ];

    const professional = [
        'GUARANTEE (not GURANTEE)',
        'EXPERIENCE (not EXPERIANCE)',
        'PROFESSIONAL (not PROFESIONAL)'
    ];

    return `
CRITICAL SPELLING CHECKS:
Financial Terms: ${critical.join(', ')}
Mortgage Terms: ${mortgage.join(', ')}
Professional Terms: ${professional.join(', ')}

IMPORTANT: These are KNOWN common misspellings by the generation model. Double-check each one carefully.`;
}
