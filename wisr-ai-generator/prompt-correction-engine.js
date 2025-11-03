/**
 * Prompt Correction Engine
 *
 * Analyzes validation failures and generates corrected prompts with:
 * - Spelling corrections from dictionary
 * - Explicit letter-by-letter spelling instructions
 * - Past successful patterns from memory
 * - Temperature adjustments for retries
 */

import { SPELLING_CORRECTIONS } from './spelling-dictionary.js';

export class PromptCorrectionEngine {
  constructor(memoryAdapter) {
    this.memoryAdapter = memoryAdapter;
  }

  /**
   * Select recovery strategy based on memory (DIFFERENT approaches, not same prompt tweaks)
   * Implements David's discovery: "first image = layout anchor, corrections don't penetrate"
   *
   * @param {Object} validation - Failed validation result
   * @param {Object} memoryContext - Memory from past generations
   * @param {number} attemptNumber - Current retry attempt (1, 2, or 3)
   * @returns {Object} - Strategy with type and parameters
   */
  async selectRecoveryStrategy(validation, memoryContext, attemptNumber) {
    console.log(`\n🧠 MEMORY-GUIDED STRATEGY SELECTION (Attempt ${attemptNumber})`);
    console.log('═══════════════════════════════════════════════════════');

    // Analyze what type of failure occurred
    const failureType = this.classifyFailure(validation);
    console.log(`   Failure type: ${failureType}`);

    // Search memory for EFFECTIVE_FOR this failure type
    const successfulStrategies = this.findEffectiveStrategies(memoryContext, failureType);
    console.log(`   Found ${successfulStrategies.length} proven strategies for this failure`);

    // Search for INEFFECTIVE_FOR this failure type (what NOT to do)
    const ineffectiveStrategies = this.findIneffectiveStrategies(memoryContext, failureType);
    console.log(`   Found ${ineffectiveStrategies.length} ineffective strategies to avoid`);

    // David's key learning: "First image = layout anchor, mid-stream corrections don't work"
    const firstImageLayoutAnchorRule = {
      insight: "Gemini 2.5 Flash ignores position/layout corrections after first generation",
      solution: "Complete regeneration with DIFFERENT creative params, not prompt tweaks"
    };

    // Strategy selection based on attempt number and memory
    let strategy;

    if (attemptNumber === 1) {
      // Attempt 1: Try spelling-only correction with DRASTICALLY different creative params
      strategy = {
        type: 'regenerate-with-different-params',
        reason: firstImageLayoutAnchorRule.solution,
        approach: 'Regenerate from scratch with creative params that force different layout',
        params: {
          temperature: 0.4,  // Much lower than default 0.15
          topK: 20,          // More conservative (was 40)
          topP: 0.8,         // Lower diversity (was 0.95)
          seed: Date.now()   // Force different random seed
        },
        promptModifications: {
          addExplicitSpellings: true,
          addLayoutConstraints: false,  // Don't try to fix layout - will be ignored
          simplifyComplexity: true       // Reduce word count to increase accuracy
        }
      };
      console.log(`   ✅ Strategy 1: Drastically different creative parameters`);

    } else if (attemptNumber === 2) {
      // Attempt 2: Use proven successful template from memory if available
      if (successfulStrategies.length > 0) {
        const bestStrategy = successfulStrategies[0];
        strategy = {
          type: 'use-proven-template',
          reason: `This approach succeeded ${bestStrategy.successCount} time(s) before`,
          approach: 'Reuse exact parameters from past success',
          params: bestStrategy.params || {
            temperature: 0.1,
            topK: 30,
            topP: 0.85
          },
          promptTemplate: bestStrategy.promptPattern
        };
        console.log(`   ✅ Strategy 2: Using proven successful template (${bestStrategy.successCount}x success)`);
      } else {
        // No proven strategy - try extreme determinism
        strategy = {
          type: 'extreme-determinism',
          reason: 'No proven strategies in memory - maximize determinism',
          approach: 'Minimum temperature + explicit letter-by-letter spelling',
          params: {
            temperature: 0.05,  // Extreme low
            topK: 10,           // Extreme conservative
            topP: 0.7           // Extreme low diversity
          },
          promptModifications: {
            letterByLetterSpelling: true,
            repeatCriticalWords: 3,  // Repeat each critical word 3x in prompt
            addNegativePrompts: true  // "Do NOT spell as PERSONLIZED" style instructions
          }
        };
        console.log(`   ✅ Strategy 2: Extreme determinism (no proven templates found)`);
      }

    } else { // attemptNumber === 3
      // Attempt 3: Nuclear option - fundamentally different approach
      strategy = {
        type: 'alternative-generator',
        reason: 'Gemini failed 2x - switch to different generation method',
        approach: 'Use Fabric.js static render OR text-overlay compositor (no AI layout)',
        fallback: true,
        params: {
          method: 'fabric-js-static',  // Non-AI fallback
          usePreRenderedText: true,
          noAILayout: true
        }
      };
      console.log(`   ⚠️  Strategy 3: FALLBACK to Fabric.js (Gemini failed 2x)`);
    }

    console.log(`   Selected: ${strategy.type}`);
    console.log(`   Reason: ${strategy.reason}`);
    console.log('═══════════════════════════════════════════════════════\n');

    return strategy;
  }

  /**
   * Classify failure type for memory search
   */
  classifyFailure(validation) {
    if (validation.spellingCheck && !validation.spellingCheck.passed) {
      return 'spelling-errors';
    }
    if (validation.issues?.some(i => i.type?.includes('layout') || i.type?.includes('positioning'))) {
      return 'layout-positioning';
    }
    if (validation.issues?.some(i => i.type?.includes('missing') || i.type?.includes('incomplete'))) {
      return 'missing-content';
    }
    return 'general-quality';
  }

  /**
   * Find strategies that were EFFECTIVE for this failure type
   */
  findEffectiveStrategies(memoryContext, failureType) {
    if (!memoryContext || !memoryContext.pastGenerations) return [];

    const successfulGens = memoryContext.pastGenerations.filter(g => g.pass);

    // Group by strategy and count successes
    const strategySuccessCount = {};
    successfulGens.forEach(gen => {
      const key = JSON.stringify({
        temp: gen.data?.temperature,
        topK: gen.data?.topK,
        topP: gen.data?.topP
      });
      strategySuccessCount[key] = (strategySuccessCount[key] || 0) + 1;
    });

    // Return sorted by success count
    return Object.entries(strategySuccessCount)
      .map(([params, count]) => ({
        params: JSON.parse(params),
        successCount: count
      }))
      .sort((a, b) => b.successCount - a.successCount);
  }

  /**
   * Find strategies that were INEFFECTIVE for this failure type
   */
  findIneffectiveStrategies(memoryContext, failureType) {
    if (!memoryContext || !memoryContext.pastGenerations) return [];

    return memoryContext.pastGenerations
      .filter(g => !g.pass && g.failures?.some(f =>
        f.toLowerCase().includes(failureType.replace('-', ' '))
      ))
      .map(g => ({
        params: {
          temperature: g.data?.temperature,
          topK: g.data?.topK,
          topP: g.data?.topP
        },
        failure: g.failures[0]
      }));
  }

  /**
   * Analyze validation failures to determine what went wrong
   * @param {Object} validation - Validation result with issues
   * @returns {Object} - Analysis with root causes and correction strategies
   */
  analyzeFailures(validation) {
    const analysis = {
      spellingErrors: [],
      visualIssues: [],
      rootCauses: [],
      recommendedCorrections: []
    };

    // Extract spelling errors from OCR check
    if (validation.spellingCheck && validation.spellingCheck.errors) {
      analysis.spellingErrors = validation.spellingCheck.errors.map(err => ({
        misspelled: err.word,
        correct: err.expected || SPELLING_CORRECTIONS[err.word],
        severity: err.severity || 'critical'
      }));
    }

    // Extract issues from validation.issues array
    if (validation.issues && validation.issues.length > 0) {
      validation.issues.forEach(issue => {
        if (issue.type === 'misspelling' || issue.type === 'spelling-error') {
          analysis.spellingErrors.push({
            misspelled: issue.word,
            correct: issue.expected,
            severity: issue.severity || 'critical'
          });
        } else {
          analysis.visualIssues.push({
            type: issue.type,
            message: issue.message,
            severity: issue.severity || 'medium'
          });
        }
      });
    }

    // Determine root causes
    if (analysis.spellingErrors.length > 0) {
      analysis.rootCauses.push({
        category: 'spelling',
        description: `${analysis.spellingErrors.length} spelling error(s) detected`,
        impact: 'critical'
      });
    }

    if (analysis.visualIssues.length > 0) {
      analysis.rootCauses.push({
        category: 'visual',
        description: `${analysis.visualIssues.length} visual issue(s) detected`,
        impact: 'high'
      });
    }

    // Generate correction recommendations
    analysis.recommendedCorrections = this.generateCorrections(analysis);

    return analysis;
  }

  /**
   * Generate specific corrections for each type of failure
   * @param {Object} analysis - Failure analysis
   * @returns {Array} - Array of correction strategies
   */
  generateCorrections(analysis) {
    const corrections = [];

    // Add spelling corrections
    analysis.spellingErrors.forEach(error => {
      corrections.push({
        type: 'spelling',
        action: 'add-explicit-spelling',
        word: error.misspelled,
        correctSpelling: error.correct,
        instruction: this.generateSpellingInstruction(error.correct),
        priority: 1
      });
    });

    // Add visual corrections
    analysis.visualIssues.forEach(issue => {
      corrections.push({
        type: 'visual',
        action: 'adjust-layout',
        issue: issue.type,
        description: issue.message,
        priority: 2
      });
    });

    // Sort by priority
    corrections.sort((a, b) => a.priority - b.priority);

    return corrections;
  }

  /**
   * Generate explicit letter-by-letter spelling instruction
   * @param {string} word - Correctly spelled word
   * @returns {string} - Instruction for AI model
   */
  generateSpellingInstruction(word) {
    const letters = word.split('').join('-');
    return `spell "${word}" exactly as: ${letters}`;
  }

  /**
   * Apply corrections to original prompt
   * @param {string} originalPrompt - Original generation prompt
   * @param {Array} corrections - Corrections to apply
   * @param {Object} memoryContext - Past successful patterns
   * @param {number} retryAttempt - Which retry attempt (1-3)
   * @returns {string} - Corrected prompt
   */
  async applyCorrectionsToPrompt(originalPrompt, corrections, memoryContext, retryAttempt) {
    let correctedPrompt = originalPrompt;

    // Build correction instructions
    const spellingInstructions = [];
    const layoutInstructions = [];

    corrections.forEach(correction => {
      if (correction.type === 'spelling') {
        spellingInstructions.push(
          `CRITICAL: ${correction.instruction}. ` +
          `DO NOT use "${correction.word}" - it is INCORRECT. ` +
          `The correct spelling is "${correction.correctSpelling}".`
        );
      } else if (correction.type === 'visual') {
        layoutInstructions.push(correction.description);
      }
    });

    // Prepend spelling corrections to prompt
    if (spellingInstructions.length > 0) {
      const spellingSection = [
        '\n\n=== SPELLING REQUIREMENTS (CRITICAL) ===',
        ...spellingInstructions,
        '=== END SPELLING REQUIREMENTS ===\n'
      ].join('\n');

      correctedPrompt = spellingSection + correctedPrompt;
    }

    // Add layout corrections if any
    if (layoutInstructions.length > 0) {
      const layoutSection = [
        '\n\n=== LAYOUT REQUIREMENTS ===',
        ...layoutInstructions,
        '=== END LAYOUT REQUIREMENTS ===\n'
      ].join('\n');

      correctedPrompt = correctedPrompt + layoutSection;
    }

    // On retry attempts, add past successful patterns
    if (retryAttempt >= 2 && memoryContext && memoryContext.successfulPatterns.length > 0) {
      const patternInstructions = this.extractPatternInstructions(memoryContext.successfulPatterns[0]);
      if (patternInstructions) {
        correctedPrompt = `${patternInstructions}\n\n${correctedPrompt}`;
      }
    }

    // Add retry-specific emphasis
    if (retryAttempt >= 2) {
      correctedPrompt = `RETRY ATTEMPT ${retryAttempt}: FOCUS ON ACCURACY.\n\n${correctedPrompt}`;
    }

    return correctedPrompt;
  }

  /**
   * Extract successful pattern instructions from past generations
   * @param {Object} pattern - Successful pattern from memory
   * @returns {string} - Instructions based on pattern
   */
  extractPatternInstructions(pattern) {
    if (!pattern || !pattern.data) return null;

    const instructions = [];

    // Extract any specific successful parameters
    if (pattern.data.temperature) {
      instructions.push(`Use temperature: ${pattern.data.temperature}`);
    }

    if (pattern.data.styleNotes) {
      instructions.push(`Style guidance: ${pattern.data.styleNotes}`);
    }

    if (instructions.length === 0) return null;

    return `=== SUCCESSFUL PATTERN ===\n${instructions.join('\n')}\n=== END PATTERN ===`;
  }

  /**
   * Calculate adjusted generation parameters for retry
   * @param {Object} originalOptions - Original generation options
   * @param {number} retryAttempt - Which retry (1-3)
   * @returns {Object} - Adjusted options
   */
  adjustGenerationOptions(originalOptions, retryAttempt) {
    const adjusted = { ...originalOptions };

    // Lower temperature on retries for more deterministic output
    if (retryAttempt === 1) {
      adjusted.temperature = 0.05; // Very low for first retry
    } else if (retryAttempt === 2) {
      adjusted.temperature = 0.02; // Even lower for second retry
    } else if (retryAttempt >= 3) {
      adjusted.temperature = 0.01; // Extremely low for final retry
    }

    // Increase topK on retries for more conservative token selection
    if (retryAttempt >= 2) {
      adjusted.topK = Math.max(20, (originalOptions.topK || 40) - (retryAttempt * 10));
    }

    return adjusted;
  }

  /**
   * Check if prompt corrections match past failures
   * @param {Array} corrections - Current corrections
   * @param {Object} memoryContext - Memory context with past failures
   * @returns {Object} - Match analysis
   */
  checkForRepeatFailures(corrections, memoryContext) {
    if (!memoryContext || !memoryContext.commonFailures) {
      return { isRepeat: false, matches: [] };
    }

    const matches = [];

    corrections.forEach(correction => {
      memoryContext.commonFailures.forEach(pastFailure => {
        // Check if same type of error
        if (correction.type === pastFailure.type) {
          // Check if same specific issue
          if (correction.word === pastFailure.word ||
              correction.issue === pastFailure.issue) {
            matches.push({
              current: correction,
              past: pastFailure,
              frequency: pastFailure.count || 1
            });
          }
        }
      });
    });

    return {
      isRepeat: matches.length > 0,
      matches,
      totalRepeatCount: matches.reduce((sum, m) => sum + m.frequency, 0)
    };
  }

  /**
   * Query learning database for effective solutions
   * @param {Object} analysis - Failure analysis
   * @returns {Array} - Relevant learnings from database
   */
  async queryLearningDatabase(analysis) {
    if (!this.memoryAdapter) {
      return [];
    }

    const relevantLearnings = [];

    try {
      const memory = await this.memoryAdapter.loadMemory();

      if (!memory.learningDatabase || memory.learningDatabase.length === 0) {
        return [];
      }

      // Search for learnings related to current failures
      analysis.spellingErrors.forEach(error => {
        const matches = memory.learningDatabase.filter(learning =>
          learning.problem.toLowerCase().includes(error.misspelled.toLowerCase()) ||
          learning.successfulStrategy.toLowerCase().includes(error.correct.toLowerCase())
        );

        relevantLearnings.push(...matches);
      });

      // Remove duplicates and sort by effectiveness
      const unique = [...new Set(relevantLearnings.map(l => l.id))].map(id =>
        relevantLearnings.find(l => l.id === id)
      );

      return unique.sort((a, b) => {
        const effectivenessScore = { high: 3, medium: 2, low: 1 };
        return (effectivenessScore[b.effectiveness] || 0) - (effectivenessScore[a.effectiveness] || 0);
      });

    } catch (error) {
      console.error('Error querying learning database:', error.message);
      return [];
    }
  }

  /**
   * Generate comprehensive correction report
   * @param {string} originalPrompt - Original prompt
   * @param {string} correctedPrompt - Corrected prompt
   * @param {Array} corrections - Applied corrections
   * @param {number} retryAttempt - Retry number
   * @returns {Object} - Detailed report
   */
  generateCorrectionReport(originalPrompt, correctedPrompt, corrections, retryAttempt) {
    return {
      retryAttempt,
      originalPromptLength: originalPrompt.length,
      correctedPromptLength: correctedPrompt.length,
      addedInstructions: correctedPrompt.length - originalPrompt.length,
      corrections: corrections.map(c => ({
        type: c.type,
        action: c.action,
        details: c.type === 'spelling'
          ? `"${c.word}" → "${c.correctSpelling}"`
          : c.description
      })),
      summary: `Applied ${corrections.length} correction(s) for retry attempt ${retryAttempt}`
    };
  }
}

export default PromptCorrectionEngine;
