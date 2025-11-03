/**
 * Playwright Learning System
 * Learns from technical validation patterns to improve quality assessment
 * Similar to Brand Learning, but focuses on technical/pixel-level correlations
 *
 * Learning Focus:
 * - Which technical metrics correlate with high/low quality
 * - Common failure patterns (low variance, poor resolution, etc.)
 * - Performance bottlenecks in MCP operations
 * - Optimal thresholds for different content types
 */

class PlaywrightLearningSystem {
  constructor(supabase) {
    this.supabase = supabase;
    this.learnedPatterns = new Map();
    this.loadPatterns();
  }

  async loadPatterns() {
    if (!this.supabase) {
      console.log('📊 Using local Playwright learning only (no Supabase)');
      return;
    }

    try {
      const { data } = await this.supabase
        .from('playwright_learning_patterns')
        .select('*')
        .eq('active', true);

      if (data) {
        data.forEach(pattern => {
          this.learnedPatterns.set(pattern.pattern_type, {
            trigger: pattern.trigger_conditions,
            impact: pattern.quality_impact,
            recommendation: pattern.recommendation,
            confidence: pattern.confidence,
            avgScorePresent: pattern.avg_score_when_present,
            avgScoreAbsent: pattern.avg_score_when_absent
          });
        });
      }

      console.log(`📊 Loaded ${this.learnedPatterns.size} Playwright learning patterns`);
    } catch (error) {
      console.warn('Could not load Playwright patterns:', error.message);
    }
  }

  /**
   * Analyze validation result and learn patterns
   */
  async analyzeAndLearn(validationResult, generationIntent, finalScore) {
    if (!validationResult || !validationResult.metrics) return;

    console.log('\n' + '='.repeat(60));
    console.log('📊 PLAYWRIGHT LEARNING ANALYSIS');
    console.log('='.repeat(60));

    const { metrics, score, issues } = validationResult;
    const patterns = this.detectPatterns(metrics, score, issues);

    console.log(`🔍 Detected ${patterns.length} patterns`);

    for (const pattern of patterns) {
      await this.recordPattern(pattern, score, finalScore);
    }

    // Check for performance issues
    await this.analyzePerformance();

    console.log('='.repeat(60) + '\n');
  }

  /**
   * Detect patterns in validation metrics
   */
  detectPatterns(metrics, score, issues) {
    const patterns = [];

    const { width, height } = metrics.dimensions;
    const { variance, avgBrightness } = metrics.colors;
    const { colorVariance, edgeRatio } = metrics.complexity;

    // Pattern 1: Low color variance
    if (colorVariance < 20) {
      patterns.push({
        type: 'low_color_variance',
        condition: { colorVariance: { lt: 20 } },
        impact: score < 0.7 ? 'negative' : 'neutral',
        recommendation: 'Increase visual complexity, add gradients or design elements'
      });
    }

    // Pattern 2: Poor resolution
    if (width < 800 || height < 600) {
      patterns.push({
        type: 'poor_resolution',
        condition: { width: { lt: 800 }, height: { lt: 600 } },
        impact: 'negative',
        recommendation: 'Generate at minimum 1024x1024 resolution'
      });
    }

    // Pattern 3: Very high resolution (overkill)
    if (width > 3000 && height > 3000) {
      patterns.push({
        type: 'excessive_resolution',
        condition: { width: { gt: 3000 }, height: { gt: 3000 } },
        impact: 'neutral',
        recommendation: 'Consider reducing resolution for performance (1536x1536 sufficient)'
      });
    }

    // Pattern 4: Too dark
    if (avgBrightness < 40) {
      patterns.push({
        type: 'too_dark',
        condition: { avgBrightness: { lt: 40 } },
        impact: 'negative',
        recommendation: 'Increase image brightness or add lighting to prompt'
      });
    }

    // Pattern 5: Too bright/washed out
    if (avgBrightness > 220) {
      patterns.push({
        type: 'too_bright',
        condition: { avgBrightness: { gt: 220 } },
        impact: 'negative',
        recommendation: 'Reduce brightness or add depth/contrast to design'
      });
    }

    // Pattern 6: Lack of detail (low edges)
    if (edgeRatio < 0.08) {
      patterns.push({
        type: 'lacks_detail',
        condition: { edgeRatio: { lt: 0.08 } },
        impact: 'negative',
        recommendation: 'Add text, shapes, or graphic elements for more detail'
      });
    }

    // Pattern 7: High complexity (good)
    if (colorVariance > 50 && edgeRatio > 0.2) {
      patterns.push({
        type: 'high_quality_complexity',
        condition: { colorVariance: { gt: 50 }, edgeRatio: { gt: 0.2 } },
        impact: 'positive',
        recommendation: 'Good visual complexity - maintain this level'
      });
    }

    // Pattern 8: Unusual aspect ratio
    const aspectRatio = width / height;
    const commonRatios = [1.0, 1.33, 1.5, 1.78, 0.75, 0.56];
    const isCommon = commonRatios.some(r => Math.abs(aspectRatio - r) < 0.05);

    if (!isCommon) {
      patterns.push({
        type: 'unusual_aspect_ratio',
        condition: { aspectRatio: { not_in: commonRatios } },
        impact: 'neutral',
        recommendation: `Aspect ratio ${aspectRatio.toFixed(2)} is unusual. Consider standard ratios (1:1, 16:9, 4:3)`
      });
    }

    return patterns;
  }

  /**
   * Record pattern occurrence and update learning database
   */
  async recordPattern(pattern, playwrightScore, finalScore) {
    if (!this.supabase) return;

    try {
      // Get existing pattern data
      const { data: existing } = await this.supabase
        .from('playwright_learning_patterns')
        .select('*')
        .eq('pattern_type', pattern.type)
        .single();

      if (existing) {
        // Update existing pattern
        const newFrequency = existing.frequency + 1;
        const newAvgPresent = (
          (existing.avg_score_when_present * existing.frequency + finalScore) /
          newFrequency
        );

        // Calculate confidence based on sample size
        const confidence = Math.min(newFrequency / 20, 1.0); // Max confidence at 20 samples

        await this.supabase
          .from('playwright_learning_patterns')
          .update({
            frequency: newFrequency,
            avg_score_when_present: newAvgPresent,
            confidence: confidence,
            last_seen: new Date().toISOString()
          })
          .eq('pattern_type', pattern.type);

        console.log(`   📈 Updated pattern: ${pattern.type} (${newFrequency}x, confidence: ${(confidence * 100).toFixed(0)}%)`);

      } else {
        // Create new pattern
        await this.supabase
          .from('playwright_learning_patterns')
          .insert({
            pattern_type: pattern.type,
            trigger_conditions: pattern.condition,
            quality_impact: pattern.impact,
            recommendation: pattern.recommendation,
            frequency: 1,
            avg_score_when_present: finalScore,
            avg_score_when_absent: 0.75, // Default baseline
            confidence: 0.05, // Low initial confidence
            active: true
          });

        console.log(`   ✅ New pattern learned: ${pattern.type}`);
      }

      // Update local cache
      this.learnedPatterns.set(pattern.type, {
        trigger: pattern.condition,
        impact: pattern.impact,
        recommendation: pattern.recommendation,
        confidence: existing ? Math.min(existing.frequency / 20, 1.0) : 0.05
      });

    } catch (error) {
      console.error(`Failed to record pattern ${pattern.type}:`, error.message);
    }
  }

  /**
   * Analyze MCP performance and identify bottlenecks
   */
  async analyzePerformance() {
    if (!this.supabase) return;

    try {
      const { data } = await this.supabase
        .from('playwright_performance_tracking')
        .select('operation, duration_ms, success')
        .gte('timestamp', new Date(Date.now() - 3600000).toISOString()) // Last hour
        .limit(100);

      if (!data || data.length === 0) return;

      const byOperation = {};

      data.forEach(record => {
        if (!byOperation[record.operation]) {
          byOperation[record.operation] = { count: 0, totalDuration: 0, failures: 0 };
        }

        byOperation[record.operation].count++;
        byOperation[record.operation].totalDuration += record.duration_ms;
        if (!record.success) byOperation[record.operation].failures++;
      });

      // Check for slow operations
      for (const [operation, stats] of Object.entries(byOperation)) {
        const avgDuration = stats.totalDuration / stats.count;
        const failureRate = stats.failures / stats.count;

        if (avgDuration > 5000) {
          console.log(`   ⚠️  Slow operation: ${operation} (${avgDuration.toFixed(0)}ms avg)`);
        }

        if (failureRate > 0.1) {
          console.log(`   ⚠️  High failure rate: ${operation} (${(failureRate * 100).toFixed(1)}%)`);
        }
      }

    } catch (error) {
      console.error('Performance analysis error:', error.message);
    }
  }

  /**
   * Apply learned patterns to enhance prompts
   * (Future enhancement - similar to brand learning's applyLearnedPreferences)
   */
  applyLearnedPatterns(prompt, intentType) {
    let enhancedPrompt = prompt;
    const appliedPatterns = [];

    for (const [patternType, data] of this.learnedPatterns) {
      // Only apply high-confidence negative patterns
      if (data.confidence > 0.7 && data.impact === 'negative') {
        enhancedPrompt += `\n\nTECHNICAL NOTE: ${data.recommendation}`;
        appliedPatterns.push(patternType);
      }
    }

    if (appliedPatterns.length > 0) {
      console.log(`🎯 Applied ${appliedPatterns.length} learned technical patterns`);
    }

    return enhancedPrompt;
  }

  /**
   * Get pattern insights for reporting
   */
  getPatternInsights() {
    const insights = [];

    for (const [type, data] of this.learnedPatterns) {
      if (data.confidence > 0.5) {
        insights.push({
          pattern: type,
          impact: data.impact,
          recommendation: data.recommendation,
          confidence: data.confidence,
          scoreDifference: data.avgScoreAbsent - data.avgScorePresent
        });
      }
    }

    // Sort by score impact (most negative first)
    insights.sort((a, b) => b.scoreDifference - a.scoreDifference);

    return insights;
  }

  /**
   * Clear a specific pattern (if it's no longer relevant)
   */
  async clearPattern(patternType) {
    if (this.supabase) {
      await this.supabase
        .from('playwright_learning_patterns')
        .update({ active: false })
        .eq('pattern_type', patternType);
    }

    this.learnedPatterns.delete(patternType);
    console.log(`🗑️  Cleared Playwright pattern: ${patternType}`);
  }
}

export default PlaywrightLearningSystem;
