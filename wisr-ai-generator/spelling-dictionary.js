/**
 * Spelling Dictionary with nspell Integration
 *
 * Uses full English dictionary via nspell for comprehensive spell-checking
 * PLUS custom whitelist for AI-common misspellings
 */

import nspell from 'nspell';
import dictionary from 'dictionary-en';
import { readFileSync } from 'fs';

// Initialize nspell with English dictionary
let spell = null;

async function initializeSpellChecker() {
  if (spell) return spell;

  try {
    const dict = await dictionary;
    spell = nspell(dict);

    // Add custom mortgage/finance terms to dictionary
    const customWords = [
      'LENDWISE', 'NMLS', 'DRE', 'APR', 'FHA', 'VA', 'USDA',
      'FREDDIE', 'FANNIE', 'MAE', 'MAC',
      'MORTGAGE', 'MORTGAGES', 'MORTGAGED', 'MORTGAGING',
      'PERSONALIZED', 'CUSTOMIZED', 'VOLATILITY', 'STRATEGY',
      'CONSULTATION', 'OPPORTUNITY', 'COMMITMENT', 'FINANCIAL',
      'PROFESSIONAL', 'DEFINITELY'
    ];

    customWords.forEach(word => spell.add(word));

    console.log('✅ nspell initialized with custom mortgage dictionary');
    return spell;
  } catch (error) {
    console.error('❌ Failed to initialize nspell:', error);
    return null;
  }
}

// Common misspellings with known corrections (for better error messages)
export const SPELLING_CORRECTIONS = {
  // PERSONALIZED variations
  'PERSONLIZED': 'PERSONALIZED',
  'PERSONIZED': 'PERSONALIZED',
  'PERSONALZIED': 'PERSONALIZED',
  'PERSONLAIZED': 'PERSONALIZED',
  'PERSONAILZED': 'PERSONALIZED',

  // CUSTOMIZED variations
  'CUSTOMZIED': 'CUSTOMIZED',
  'CUSTOMI ZED': 'CUSTOMIZED',
  'CUSTOMISED': 'CUSTOMIZED',

  // MORTGAGE variations
  'MORGAGE': 'MORTGAGE',
  'MORTAGE': 'MORTGAGE',
  'MORTGAGEE': 'MORTGAGE',

  // COMMITMENT variations
  'COMMITT': 'COMMITMENT',
  'COMMITMEN': 'COMMITMENT',
  'COMMITTMENT': 'COMMITMENT',

  // LENDWISE variations (brand name)
  'LENDWIZE': 'LENDWISE',
  'LEND WISE': 'LENDWISE',
  'LENDWLSE': 'LENDWISE',

  // STRATEGY variations
  'STRATERGY': 'STRATEGY',
  'STRATEGEY': 'STRATEGY',

  // FINANCIAL terms
  'FINANCIA': 'FINANCIAL',
  'FINANICAL': 'FINANCIAL',

  // PROFESSIONAL terms
  'PROFFESSIONAL': 'PROFESSIONAL',
  'PROFESIONAL': 'PROFESSIONAL',

  // CONSULTATION variations
  'CONSULATATION': 'CONSULTATION',
  'CONSULTATON': 'CONSULTATION',

  // OPPORTUNITY variations
  'OPPERTUNITY': 'OPPORTUNITY',
  'OPPORTUNTIY': 'OPPORTUNITY',

  // DEFINITELY variations
  'DEFINATELY': 'DEFINITELY',
  'DEFINITLY': 'DEFINITELY',

  // VOLATILITY variations
  'VOLITILITY': 'VOLATILITY',
  'VOLATLITY': 'VOLATILITY',
  'VOLATILTY': 'VOLATILITY',
  'VOLABILITY': 'VOLATILITY',
  'VOLABLITY': 'VOLATILITY'
};

// Words that MUST be spelled exactly (brand names, acronyms, proper nouns)
export const REQUIRED_EXACT_SPELLINGS = [
  'LENDWISE',
  'NMLS',
  'DRE',
  'APR',
  'FHA',
  'VA',
  'USDA',
  'CONVENTIONAL',
  'FREDDIE MAC',
  'FANNIE MAE'
];

// Words to ignore (numbers, abbreviations, etc.)
const IGNORE_PATTERNS = [
  /^\d+$/,                    // Pure numbers
  /^\d+%$/,                   // Percentages
  /^\d+\.\d+%?$/,             // Decimals
  /^\$\d+/,                   // Dollar amounts
  /^[\+\-]?\d+\.\d+%$/,       // Rate changes like +0.06%
  /^\d{3}-\d{3}-\d{4}$/,      // Phone numbers
  /^\d{5,}$/,                 // NMLS numbers, etc.
  /^[A-Z]{2,3}$/              // 2-3 letter acronyms (OK, US, FHA, etc.)
];

/**
 * Check if a word should be ignored
 */
function shouldIgnoreWord(word) {
  return IGNORE_PATTERNS.some(pattern => pattern.test(word));
}

/**
 * Check text for spelling errors using nspell + custom dictionary
 * @param {string} text - Text extracted from image (via OCR)
 * @returns {Promise<Array>} - Array of spelling errors found
 */
export async function checkSpelling(text) {
  const errors = [];
  const upperText = text.toUpperCase();

  // Initialize spell checker if not already done
  const spellChecker = await initializeSpellChecker();

  // Step 1: Check custom whitelist first (known AI misspellings)
  for (const [misspelled, correct] of Object.entries(SPELLING_CORRECTIONS)) {
    const regex = new RegExp(`\\b${misspelled}\\b`, 'g');
    const matches = upperText.match(regex);

    if (matches) {
      errors.push({
        word: misspelled,
        expected: correct,
        count: matches.length,
        severity: 'critical',
        type: 'known-misspelling',
        source: 'whitelist'
      });
    }
  }

  // Step 2: Use nspell for comprehensive checking (if available)
  if (spellChecker) {
    // Extract words from text
    const words = upperText.match(/\b[A-Z]+\b/g) || [];
    const uniqueWords = [...new Set(words)];

    for (const word of uniqueWords) {
      // Skip if already found in whitelist
      if (errors.some(e => e.word === word)) continue;

      // Skip ignored patterns
      if (shouldIgnoreWord(word)) continue;

      // Skip very short words (1-2 letters)
      if (word.length <= 2) continue;

      // Check with nspell
      if (!spellChecker.correct(word)) {
        // Get suggestions from nspell
        const suggestions = spellChecker.suggest(word).slice(0, 3);

        errors.push({
          word: word,
          expected: suggestions[0] || '(no suggestion)',
          suggestions: suggestions,
          severity: 'high',
          type: 'misspelling',
          source: 'nspell'
        });
      }
    }
  }

  return errors;
}

/**
 * Verify required spellings are present and correct
 * @param {string} text - Text extracted from image
 * @param {Array} requiredWords - Words that must appear
 * @returns {Array} - Array of missing or incorrect required words
 */
export function verifyRequiredSpellings(text, requiredWords = []) {
  const errors = [];
  const upperText = text.toUpperCase();

  for (const requiredWord of requiredWords) {
    if (!upperText.includes(requiredWord.toUpperCase())) {
      errors.push({
        word: requiredWord,
        type: 'missing-required',
        severity: 'high',
        message: `Required word "${requiredWord}" not found in image`,
        source: 'required-check'
      });
    }
  }

  return errors;
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
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
          matrix[i - 1][j - 1] + 1,  // substitution
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j] + 1       // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Generate a comprehensive spelling report
 * @param {string} text - Text to analyze
 * @param {Array} requiredWords - Words that must be present
 * @returns {Promise<Object>} - Detailed spelling report
 */
export async function generateSpellingReport(text, requiredWords = []) {
  const misspellings = await checkSpelling(text);
  const missingWords = verifyRequiredSpellings(text, requiredWords);

  const allErrors = [...misspellings, ...missingWords];

  return {
    passed: allErrors.length === 0,
    errorCount: allErrors.length,
    errors: allErrors,
    criticalErrors: allErrors.filter(e => e.severity === 'critical').length,
    highErrors: allErrors.filter(e => e.severity === 'high').length,
    nspellEnabled: spell !== null,
    summary: allErrors.length === 0
      ? 'No spelling errors detected'
      : `Found ${allErrors.length} spelling error(s)`
  };
}

export default {
  SPELLING_CORRECTIONS,
  REQUIRED_EXACT_SPELLINGS,
  checkSpelling,
  verifyRequiredSpellings,
  generateSpellingReport,
  initializeSpellChecker
};
