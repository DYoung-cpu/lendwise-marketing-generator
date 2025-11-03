/**
 * Playwright Validator
 * Uses direct Playwright library for technical visual validation
 * Complements Vision AI with pixel-level, technical analysis
 *
 * Uses Playwright browser automation to:
 * - Navigate to images
 * - Analyze pixels (color variance, brightness, edges)
 * - Calculate technical quality scores
 * - Learn patterns over time
 */

import { chromium } from 'playwright';

class PlaywrightMCPValidator {
  constructor(supabase) {
    this.supabase = supabase;
    this.browser = null;
    this.enabled = true;  // Always enabled now (using direct Playwright)

    console.log('🎭 Playwright Validator initialized (direct library)');
  }

  /**
   * Initialize browser if needed
   */
  async initializeBrowser() {
    if (!this.browser) {
      try {
        this.browser = await chromium.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        console.log('✅ Playwright browser launched');
      } catch (error) {
        console.error('Failed to launch browser:', error.message);
        this.enabled = false;
        throw error;
      }
    }
    return this.browser;
  }

  /**
   * Main validation entry point
   * Analyzes image using Playwright for technical quality
   */
  async analyzeImage(imageUrl, generationId) {
    if (!this.enabled) {
      console.log('📊 Playwright disabled, skipping technical analysis');
      return null;
    }

    console.log('🎭 Playwright analyzing image...');
    const startTime = Date.now();

    let page = null;
    try {
      // Initialize browser
      const browser = await this.initializeBrowser();

      // Create HTML page that displays the image
      const htmlContent = this.createImageHTML(imageUrl);

      // Create new page
      page = await browser.newPage();

      // Track performance: Navigate
      const navStart = Date.now();
      await page.goto(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
      await this.trackPerformance('navigate', Date.now() - navStart, true, imageUrl, generationId);

      // Wait for image to load
      const waitStart = Date.now();
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      await page.waitForTimeout(2000);  // Additional 2s wait for image
      await this.trackPerformance('wait_for_load', Date.now() - waitStart, true, imageUrl, generationId);

      // Analyze image metrics using browser evaluate
      const evalStart = Date.now();
      const metrics = await this.evaluateImageMetrics(page);
      await this.trackPerformance('evaluate', Date.now() - evalStart, true, imageUrl, generationId);

      // Assess quality based on metrics
      const assessment = this.assessMetrics(metrics);

      // Save validation results to database
      const validationDuration = Date.now() - startTime;
      if (this.supabase) {
        await this.saveValidation(generationId, imageUrl, metrics, assessment, validationDuration);
      }

      console.log(`✅ Playwright: ${(assessment.score * 100).toFixed(1)}% (${validationDuration}ms)`);
      return assessment;

    } catch (error) {
      console.error('Playwright validation error:', error.message);
      await this.trackPerformance('full_analysis', Date.now() - startTime, false, imageUrl, generationId, error.message);
      return null;
    } finally {
      // Close page but keep browser open for reuse
      if (page) {
        await page.close().catch(() => {});
      }
    }
  }

  /**
   * Create HTML page to display image
   */
  createImageHTML(imageUrl) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; }
    body { background: #f0f0f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    img { max-width: 100%; max-height: 100vh; display: block; }
  </style>
</head>
<body>
  <img src="${imageUrl}" id="generated-image" crossorigin="anonymous" />
</body>
</html>
    `;
  }

  /**
   * Evaluate image metrics using Playwright page.evaluate()
   */
  async evaluateImageMetrics(page) {
    try {
      const result = await page.evaluate(() => {
        const img = document.getElementById('generated-image');

        if (!img) {
          throw new Error('Image element not found');
        }
          if (!img.complete || img.naturalWidth === 0) {
            throw new Error('Image not loaded');
          }

          // Create canvas for pixel analysis
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;

          try {
            ctx.drawImage(img, 0, 0);
          } catch (e) {
            throw new Error('Failed to draw image: ' + e.message);
          }

          // Get pixel data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;

          // Sample pixels (every 10th for performance)
          const sampleSize = Math.min(10000, Math.floor(pixels.length / 40));
          const sampleStep = Math.floor((pixels.length / 4) / sampleSize);

          let rTotal = 0, gTotal = 0, bTotal = 0;
          let brightnessTotal = 0;
          let edgeCount = 0;

          // First pass: averages
          for (let i = 0; i < sampleSize; i++) {
            const idx = i * sampleStep * 4;
            rTotal += pixels[idx];
            gTotal += pixels[idx + 1];
            bTotal += pixels[idx + 2];
          }

          const rAvg = rTotal / sampleSize;
          const gAvg = gTotal / sampleSize;
          const bAvg = bTotal / sampleSize;

          // Second pass: variance and edge detection
          let rVariance = 0, gVariance = 0, bVariance = 0;
          let prevBrightness = 0;

          for (let i = 0; i < sampleSize; i++) {
            const idx = i * sampleStep * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];

            rVariance += Math.abs(r - rAvg);
            gVariance += Math.abs(g - gAvg);
            bVariance += Math.abs(b - bAvg);

            const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
            brightnessTotal += brightness;

            if (i > 0 && Math.abs(brightness - prevBrightness) > 50) {
              edgeCount++;
            }
            prevBrightness = brightness;
          }

          return {
            dimensions: {
              width: img.naturalWidth,
              height: img.naturalHeight,
              aspectRatio: Math.round((img.naturalWidth / img.naturalHeight) * 100) / 100
            },
            colors: {
              avgR: Math.round(rAvg),
              avgG: Math.round(gAvg),
              avgB: Math.round(bAvg),
              variance: Math.round((rVariance + gVariance + bVariance) / (sampleSize * 3)),
              avgBrightness: Math.round(brightnessTotal / sampleSize)
            },
            complexity: {
              colorVariance: Math.round((rVariance + gVariance + bVariance) / (sampleSize * 3)),
              edgeRatio: Math.round((edgeCount / sampleSize) * 100) / 100,
              contrastRatio: Math.round(((rVariance + gVariance + bVariance) / (sampleSize * 3)) / 255 * 100) / 100
            }
          };
      });

      return result;
    } catch (error) {
      console.error('Evaluate metrics error:', error.message);
      throw error;
    }
  }

  /**
   * Assess technical quality based on metrics
   */
  assessMetrics(metrics) {
    let score = 0.5; // Base score
    const issues = [];

    const { width, height, aspectRatio } = metrics.dimensions;
    const { variance, avgBrightness } = metrics.colors;
    const { colorVariance, edgeRatio } = metrics.complexity;

    // 1. Resolution check
    if (width >= 1024 && height >= 1024) {
      score += 0.15;
    } else if (width >= 800 && height >= 600) {
      score += 0.05;
    } else {
      issues.push(`Low resolution: ${width}x${height}`);
      score -= 0.1;
    }

    // 2. Aspect ratio check (common marketing ratios)
    const commonRatios = [1.0, 1.33, 1.5, 1.78, 0.75];
    const hasCommonRatio = commonRatios.some(r => Math.abs(aspectRatio - r) < 0.05);
    if (hasCommonRatio) score += 0.05;

    // 3. Color complexity
    if (colorVariance > 50) {
      score += 0.15;
    } else if (colorVariance > 30) {
      score += 0.10;
    } else if (colorVariance < 15) {
      issues.push('Very low color variance - image may be too simple');
      score -= 0.15;
    }

    // 4. Brightness
    if (avgBrightness >= 50 && avgBrightness <= 200) {
      score += 0.05;
    } else if (avgBrightness < 30) {
      issues.push('Image is very dark');
    } else if (avgBrightness > 225) {
      issues.push('Image is very bright/washed out');
    }

    // 5. Edge detection (text, shapes, details)
    if (edgeRatio > 0.2) {
      score += 0.10;
    } else if (edgeRatio > 0.1) {
      score += 0.05;
    } else {
      issues.push('Low edge detection - may lack detail');
    }

    score = Math.max(0, Math.min(1.0, score));

    return {
      score,
      issues,
      metrics,
      hasDesignElements: colorVariance > 30,
      hasProperComposition: width >= 800 && height >= 600,
      hasGoodContrast: colorVariance > 25 && edgeRatio > 0.1,
      technical: {
        resolution: `${width}x${height}`,
        colorComplexity: colorVariance,
        brightness: avgBrightness,
        edgeDensity: edgeRatio
      }
    };
  }

  /**
   * Save validation results to Supabase
   */
  async saveValidation(generationId, imageUrl, metrics, assessment, duration) {
    if (!this.supabase) return;

    try {
      await this.supabase.from('playwright_validations').insert({
        generation_id: generationId,
        image_url: imageUrl,
        dimensions: metrics.dimensions,
        colors: metrics.colors,
        complexity: metrics.complexity,
        score: assessment.score,
        issues: assessment.issues,
        has_design_elements: assessment.hasDesignElements,
        has_proper_composition: assessment.hasProperComposition,
        has_good_contrast: assessment.hasGoodContrast,
        raw_metrics: metrics,
        validation_duration_ms: duration
      });

      console.log('💾 Playwright validation saved to database');
    } catch (error) {
      console.error('Failed to save Playwright validation:', error.message);
    }
  }

  /**
   * Track MCP operation performance
   */
  async trackPerformance(operation, duration, success, imageUrl, generationId, errorMessage = null) {
    if (!this.supabase) return;

    try {
      await this.supabase.from('playwright_performance_tracking').insert({
        operation,
        duration_ms: duration,
        success,
        error_message: errorMessage,
        image_url: imageUrl,
        generation_id: generationId
      });
    } catch (error) {
      // Silent fail - don't block validation
    }
  }

  /**
   * Get performance statistics
   */
  async getPerformanceStats() {
    if (!this.supabase) return null;

    try {
      const { data } = await this.supabase
        .from('playwright_performance_tracking')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (!data || data.length === 0) return null;

      const stats = {
        total_operations: data.length,
        success_rate: data.filter(d => d.success).length / data.length,
        avg_duration: data.reduce((sum, d) => sum + d.duration_ms, 0) / data.length,
        by_operation: {}
      };

      // Group by operation type
      const operations = [...new Set(data.map(d => d.operation))];
      operations.forEach(op => {
        const opData = data.filter(d => d.operation === op);
        stats.by_operation[op] = {
          count: opData.length,
          success_rate: opData.filter(d => d.success).length / opData.length,
          avg_duration: opData.reduce((sum, d) => sum + d.duration_ms, 0) / opData.length
        };
      });

      return stats;
    } catch (error) {
      console.error('Failed to get performance stats:', error.message);
      return null;
    }
  }

  /**
   * Cleanup: Close browser
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('🎭 Playwright browser closed');
    }
  }
}

export default PlaywrightMCPValidator;
