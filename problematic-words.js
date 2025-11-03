/**
 * Problematic Words Database - Adaptive Word Replacement System
 *
 * Tracks words that Gemini consistently misspells and provides alternatives.
 * The system learns from failures and automatically substitutes problematic words
 * BEFORE generation to ensure 100% accuracy.
 *
 * Updated: 2025-10-29
 */

export const PROBLEMATIC_WORDS = {
    'volatility': {
        failureCount: 15,
        lastFailed: '2025-10-29',
        knownMisspellings: [
            'voltability', 'vol\'ability', 'VOLITALIITY',
            'volitiliy', 'VOLITALITY', 'volitaliy'
        ],
        alternatives: [
            'market uncertainty',
            'rate fluctuation',
            'market shifts',
            'price swings',
            'rate changes'
        ],
        autoReplace: true,
        category: 'financial-terminology',
        severity: 'critical'
    },
    'personalized': {
        failureCount: 8,
        lastFailed: '2025-10-29',
        knownMisspellings: ['PERSONAIIZED', 'personailzed'],
        alternatives: [
            'customized',
            'tailored',
            'individualized',
            'custom'
        ],
        autoReplace: false,  // This word is less critical, try first
        category: 'marketing',
        severity: 'high'
    },
    'appreciate': {
        failureCount: 3,
        lastFailed: '2025-10-28',
        knownMisspellings: ['apreciate', 'apprecaite'],
        alternatives: [
            'value',
            'increase',
            'grow'
        ],
        autoReplace: false,
        category: 'financial-terminology',
        severity: 'medium'
    }
};

/**
 * Get replacement for a problematic word
 * @param {string} word - The problematic word
 * @param {number} attemptNumber - Which attempt this is (rotates alternatives)
 * @returns {string|null} - Replacement word or null if not problematic
 */
export function getReplacementWord(word, attemptNumber = 0) {
    const wordLower = word.toLowerCase();
    const problemEntry = PROBLEMATIC_WORDS[wordLower];

    if (!problemEntry) return null;
    if (!problemEntry.autoReplace) return null;

    // Rotate through alternatives based on attempt number
    const alternatives = problemEntry.alternatives;
    const index = attemptNumber % alternatives.length;

    return alternatives[index];
}

/**
 * Check if a word is problematic
 * @param {string} word - Word to check
 * @returns {boolean} - True if word frequently causes issues
 */
export function isProblematicWord(word) {
    return PROBLEMATIC_WORDS.hasOwnProperty(word.toLowerCase());
}

/**
 * Record a word failure (increments failure count)
 * @param {string} word - The word that failed
 * @param {string} misspelling - How it was misspelled
 */
export function recordWordFailure(word, misspelling) {
    const wordLower = word.toLowerCase();

    if (!PROBLEMATIC_WORDS[wordLower]) {
        // Create new entry
        PROBLEMATIC_WORDS[wordLower] = {
            failureCount: 1,
            lastFailed: new Date().toISOString().split('T')[0],
            knownMisspellings: [misspelling],
            alternatives: [],
            autoReplace: false,
            category: 'unknown',
            severity: 'medium'
        };
    } else {
        // Update existing entry
        const entry = PROBLEMATIC_WORDS[wordLower];
        entry.failureCount++;
        entry.lastFailed = new Date().toISOString().split('T')[0];

        // Add misspelling if not already tracked
        if (!entry.knownMisspellings.includes(misspelling)) {
            entry.knownMisspellings.push(misspelling);
        }

        // Enable auto-replace after 5 failures
        if (entry.failureCount >= 5) {
            entry.autoReplace = true;
            entry.severity = 'critical';
        }
    }

    console.log(`📊 Word failure recorded: "${word}" (${PROBLEMATIC_WORDS[wordLower].failureCount} total failures)`);
}

/**
 * Apply intelligent word replacement to prompt
 * @param {string} prompt - Original prompt
 * @param {number} attemptNumber - Current attempt number
 * @returns {Object} - { modifiedPrompt, replacements[] }
 */
export function applyIntelligentReplacement(prompt, attemptNumber = 0) {
    let modifiedPrompt = prompt;
    const replacements = [];

    for (const [word, config] of Object.entries(PROBLEMATIC_WORDS)) {
        if (!config.autoReplace) continue;

        // Case-insensitive replacement
        const regex = new RegExp(`\\b${word}\\b`, 'gi');

        if (regex.test(modifiedPrompt)) {
            const replacement = getReplacementWord(word, attemptNumber);

            if (replacement) {
                modifiedPrompt = modifiedPrompt.replace(regex, replacement);
                replacements.push({
                    original: word,
                    replacement: replacement,
                    reason: `Auto-replaced (${config.failureCount} failures)`
                });
            }
        }
    }

    return {
        modifiedPrompt,
        replacements
    };
}

/**
 * Get statistics on problematic words
 * @returns {Object} - Statistics summary
 */
export function getProblematicWordsStats() {
    const words = Object.keys(PROBLEMATIC_WORDS);
    const autoReplaceCount = words.filter(w => PROBLEMATIC_WORDS[w].autoReplace).length;
    const totalFailures = words.reduce((sum, w) => sum + PROBLEMATIC_WORDS[w].failureCount, 0);

    return {
        totalProblematicWords: words.length,
        autoReplaceEnabled: autoReplaceCount,
        totalFailures: totalFailures,
        criticalWords: words.filter(w => PROBLEMATIC_WORDS[w].severity === 'critical'),
        highPriorityWords: words.filter(w => PROBLEMATIC_WORDS[w].severity === 'high')
    };
}

/**
 * Research alternatives using Firecrawl (placeholder for future integration)
 * @param {string} word - Word to research
 * @returns {Promise<string[]>} - Array of alternatives
 */
export async function researchAlternatives(word) {
    // TODO: Integrate with Firecrawl MCP to research synonyms
    // For now, return empty array
    console.log(`🔍 TODO: Research alternatives for "${word}" using Firecrawl`);
    return [];
}

export default {
    PROBLEMATIC_WORDS,
    getReplacementWord,
    isProblematicWord,
    recordWordFailure,
    applyIntelligentReplacement,
    getProblematicWordsStats,
    researchAlternatives
};
