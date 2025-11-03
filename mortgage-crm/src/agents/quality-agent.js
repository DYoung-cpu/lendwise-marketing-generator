import OCRService from '../validators/ocr-service.js';
import SpellingValidator from '../validators/spelling-validator.js';
import ComplianceValidator from '../validators/compliance-validator.js';
import VisionAIValidator from '../validators/vision-ai-validator.js';
import PlaywrightMCPValidator from '../validators/playwright-mcp-validator.js';
import DreamboothValidator from '../validators/dreambooth-validator.js';

class QualityAgent {
  constructor(supabase) {
    this.ocr = new OCRService();
    this.spelling = new SpellingValidator();
    this.compliance = new ComplianceValidator();
    this.visionAI = new VisionAIValidator(supabase);
    this.playwrightMCP = new PlaywrightMCPValidator(supabase);
    this.dreamboothValidator = new DreamboothValidator();
    this.supabase = supabase;
  }

  async validate(result, intent) {
    if (!result.success) {
      return { score: 0, passed: false, issues: ['Generation failed'] };
    }

    // Detect if this is a Dreambooth output - STRICTER VALIDATION
    if (this.isDreamboothOutput(result)) {
      console.log('🎯 Detected Dreambooth output - applying specialized validation');
      return await this.validateDreamboothOutput(result, intent);
    }

    const validation = {
      ocr: { score: 1, issues: [], text: '' },
      spelling: { score: 1, issues: [], errors: [] },
      compliance: { score: 1, issues: [] },
      visual: { score: 1, issues: [] },
      overall: 1,
      passed: false,
      issues: []
    };

    // Text validation (if needed)
    if (intent.needsText || intent.hasNMLS) {
      try {
        const ocrResult = await this.ocr.validate(result.url);
        validation.ocr = {
          score: ocrResult.score || 0,
          text: ocrResult.text || '',
          issues: ocrResult.issues || []
        };

        const spellingResult = await this.spelling.validate(validation.ocr.text);
        validation.spelling = {
          score: spellingResult.score || 1,
          errors: spellingResult.errors || [],
          issues: spellingResult.issues || []
        };

        const complianceResult = await this.compliance.validate(validation.ocr.text, intent);
        validation.compliance = {
          score: complianceResult.score || 1,
          issues: complianceResult.issues || []
        };

        // Check for required content
        if (intent.detectedNMLS && validation.ocr.text) {
          const hasNMLS = new RegExp(intent.detectedNMLS).test(validation.ocr.text);
          if (!hasNMLS) {
            validation.issues.push(`Missing NMLS #${intent.detectedNMLS}`);
            validation.ocr.score *= 0.5;
          }
        }
      } catch (error) {
        console.error('Text validation error:', error);
        validation.issues.push('Text validation failed');
        validation.ocr.score = 0.6;
      }
    }

    // Visual quality assessment
    try {
      validation.visual = await this.assessVisualQuality(result.url, intent, result.generation_id);
    } catch (error) {
      console.error('Visual validation error:', error);
      validation.visual = { score: 0.7, issues: ['Visual validation unavailable'] };
    }

    // Calculate weighted overall score
    if (intent.needsText || intent.hasNMLS) {
      validation.overall = (
        validation.ocr.score * 0.3 +
        validation.spelling.score * 0.2 +
        validation.compliance.score * 0.2 +
        validation.visual.score * 0.3
      );
    } else {
      validation.overall = validation.visual.score;
    }

    // Aggregate all issues
    validation.issues = [
      ...validation.ocr.issues,
      ...validation.spelling.issues,
      ...validation.compliance.issues,
      ...validation.visual.issues
    ];

    // Determine if quality threshold met
    const threshold = intent.needsText ? 0.85 : 0.75;
    validation.passed = validation.overall >= threshold && validation.issues.length === 0;

    return validation;
  }

  async assessVisualQuality(imageUrl, intent, generationId) {
    console.log('📊 Assessing visual quality with hybrid validation...');

    const scores = { vision: null, playwright: null };

    // Run both validators in parallel
    const [visionResult, playwrightResult] = await Promise.allSettled([
      this.runVisionAI(imageUrl, generationId, intent),
      this.runPlaywrightMCP(imageUrl, generationId)
    ]);

    if (visionResult.status === 'fulfilled' && visionResult.value) {
      scores.vision = visionResult.value;
      console.log(`✅ Vision AI: ${(scores.vision.score * 100).toFixed(1)}%`);
    } else if (visionResult.status === 'rejected') {
      console.warn('Vision AI failed:', visionResult.reason?.message);
    }

    if (playwrightResult.status === 'fulfilled' && playwrightResult.value) {
      scores.playwright = playwrightResult.value;
      console.log(`✅ Playwright MCP: ${(scores.playwright.score * 100).toFixed(1)}%`);
    } else if (playwrightResult.status === 'rejected') {
      console.warn('Playwright MCP failed:', playwrightResult.reason?.message);
    }

    // Combine scores intelligently
    if (scores.vision && scores.playwright) {
      // Both succeeded - hybrid scoring
      return this.combineScores(scores.vision, scores.playwright, intent);
    } else if (scores.vision) {
      // Vision AI only
      console.log('📊 Using Vision AI only (Playwright unavailable)');
      return scores.vision;
    } else if (scores.playwright) {
      // Playwright MCP only
      console.log('📊 Using Playwright MCP only (Vision AI unavailable)');
      return scores.playwright;
    } else {
      // Both failed - fallback to heuristics
      console.log('📊 Using heuristic visual assessment (both validators failed)');
      return this.assessVisualQualityHeuristic(imageUrl, intent);
    }
  }

  /**
   * Run Vision AI validator
   */
  async runVisionAI(imageUrl, generationId, intent) {
    const visionAnalysis = await this.visionAI.analyzeImage(imageUrl, generationId);
    if (!visionAnalysis) return null;

    // Calculate comprehensive score from Vision AI
    let score = 0.5; // Base score
    const issues = [];

    // Text readability
    if (visionAnalysis.text.readable_score > 0.8) {
      score += 0.1;
    } else if (visionAnalysis.text.all_text) {
      issues.push('Text readability could be improved');
    }

    // NMLS detection
    if (intent.hasNMLS || intent.detectedNMLS) {
      if (visionAnalysis.text.nmls_found) {
        score += 0.1;
      } else {
        issues.push('Missing NMLS number');
        score -= 0.2;
      }
    }

    // Face quality (if photo expected)
    if (intent.needsPhoto) {
      if (visionAnalysis.faces.professional > 0.7) {
        score += 0.1;
      } else if (visionAnalysis.faces.count > 0) {
        issues.push('Photo quality could be more professional');
      }
    }

    // Brand consistency
    const brandMatch = visionAnalysis.brand.brand_match;
    if (brandMatch.score > 0.8) {
      score += 0.2;
    } else {
      if (!brandMatch.greenMatch) issues.push('Missing brand green color');
      if (!brandMatch.goldMatch) issues.push('Missing brand gold color');
    }

    // Professional composition
    if (visionAnalysis.composition.professional_score > 0.7) {
      score += 0.1;
    }

    return {
      score: Math.min(Math.max(score, 0), 1.0),
      issues,
      hasDesignElements: visionAnalysis.composition.objects.length > 3,
      hasProperComposition: visionAnalysis.composition.layout_score > 0.7,
      hasGoodContrast: visionAnalysis.text.readable_score > 0.7,
      visionAI: true,
      analysis: visionAnalysis
    };
  }

  /**
   * Run Playwright MCP validator
   */
  async runPlaywrightMCP(imageUrl, generationId) {
    return await this.playwrightMCP.analyzeImage(imageUrl, generationId);
  }

  /**
   * Combine Vision AI and Playwright MCP scores
   */
  combineScores(visionScore, playwrightScore, intent) {
    // Determine weights based on content type
    let weights;

    if (intent.type === 'rate-update' || intent.needsText) {
      // Text-heavy content: prioritize Vision AI (better OCR)
      weights = { vision: 0.7, playwright: 0.3 };
    } else if (intent.type === 'social-media') {
      // Visual content: balance both
      weights = { vision: 0.5, playwright: 0.5 };
    } else if (intent.needsPhoto) {
      // Photo content: prioritize Vision AI (face detection)
      weights = { vision: 0.75, playwright: 0.25 };
    } else {
      // General: slight preference to Vision AI (more comprehensive)
      weights = { vision: 0.6, playwright: 0.4 };
    }

    const combinedScore = (
      visionScore.score * weights.vision +
      playwrightScore.score * weights.playwright
    );

    // Aggregate issues from both
    const allIssues = [
      ...(visionScore.issues || []),
      ...(playwrightScore.issues || [])
    ];

    // Use AND logic for quality flags (both must agree)
    const hasDesignElements = visionScore.hasDesignElements && playwrightScore.hasDesignElements;
    const hasProperComposition = visionScore.hasProperComposition && playwrightScore.hasProperComposition;
    const hasGoodContrast = visionScore.hasGoodContrast && playwrightScore.hasGoodContrast;

    console.log(`🎯 Hybrid score: ${(combinedScore * 100).toFixed(1)}% (Vision: ${(weights.vision * 100)}%, Playwright: ${(weights.playwright * 100)}%)`);

    return {
      score: combinedScore,
      issues: allIssues,
      hasDesignElements,
      hasProperComposition,
      hasGoodContrast,
      hybrid: true,
      weights,
      details: {
        vision: visionScore,
        playwright: playwrightScore
      }
    };
  }

  async assessVisualQualityHeuristic(imageUrl, intent) {
    const assessment = {
      score: 1.0,
      issues: [],
      hasDesignElements: false,
      hasProperComposition: false,
      hasGoodContrast: false
    };

    try {
      // Try Playwright MCP visual validation first
      const playwrightResult = await this.validateWithPlaywright(imageUrl);
      if (playwrightResult && playwrightResult.success) {
        console.log('✅ Using Playwright MCP visual validation');
        return playwrightResult.assessment;
      }

      // Fallback to heuristic checks
      console.log('📊 Using basic heuristic checks');

      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      const imageSize = buffer.byteLength;

      // Adjusted thresholds - modern compression is good!
      if (imageSize < 30000) {
        assessment.score -= 0.2;
        assessment.issues.push('Image file size very small (possible generation failure)');
      }

      if (imageSize > 10000000) {
        assessment.issues.push('Image file size very large (>10MB)');
      }

      // Marketing-appropriate size: 200KB-5MB (adjusted for modern compression)
      if (imageSize >= 200000 && imageSize <= 5000000) {
        assessment.hasProperComposition = true;
      }

      // Rate updates should have reasonable complexity (lowered threshold)
      if (intent.type === 'rate-update' && imageSize < 150000) {
        assessment.score -= 0.1;
        assessment.issues.push('Rate update graphic may be too simple');
      }

      // Check URL for model quality indicators
      if (imageUrl.includes('imagen') || imageUrl.includes('ideogram')) {
        assessment.hasDesignElements = true;
        assessment.score += 0.05; // Bonus for quality models
      }

      // Overall assessment
      if (assessment.issues.length === 0) {
        assessment.hasGoodContrast = true;
      }

      assessment.score = Math.max(0, Math.min(1, assessment.score));

    } catch (error) {
      console.error('Visual assessment error:', error);
      assessment.score = 0.7;
      assessment.issues.push('Could not analyze visual quality');
    }

    return assessment;
  }

  async validateWithPlaywright(imageUrl) {
    try {
      // Check if we're in a Playwright MCP environment
      if (typeof mcp__playwright__browser_navigate === 'undefined') {
        return null; // MCP not available
      }

      console.log('🎭 Using Playwright MCP for visual validation...');

      // Create an HTML page that displays the image
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 20px; background: #f0f0f0; }
    img { max-width: 100%; display: block; margin: 0 auto; }
  </style>
</head>
<body>
  <img src="${imageUrl}" id="generated-image" />
</body>
</html>
      `;

      // Save to temp file
      const fs = await import('fs/promises');
      const tempHtmlPath = `/tmp/image-validation-${Date.now()}.html`;
      await fs.writeFile(tempHtmlPath, htmlContent);

      // Navigate to the page
      await mcp__playwright__browser_navigate({ url: `file://${tempHtmlPath}` });

      // Wait for image to load
      await mcp__playwright__browser_wait_for({ time: 2 });

      // Take a snapshot to analyze the page
      const snapshot = await mcp__playwright__browser_snapshot({});

      // Evaluate the image dimensions and color variance
      const imageInfo = await mcp__playwright__browser_evaluate({
        element: 'generated image',
        ref: '#generated-image',
        function: `(img) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          ctx.drawImage(img, 0, 0);

          // Sample pixels to check color variance
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;

          // Calculate color variance
          let rTotal = 0, gTotal = 0, bTotal = 0;
          let rVariance = 0, gVariance = 0, bVariance = 0;
          const sampleSize = Math.min(10000, pixels.length / 4);

          for (let i = 0; i < sampleSize; i++) {
            const idx = i * 4;
            rTotal += pixels[idx];
            gTotal += pixels[idx + 1];
            bTotal += pixels[idx + 2];
          }

          const rAvg = rTotal / sampleSize;
          const gAvg = gTotal / sampleSize;
          const bAvg = bTotal / sampleSize;

          for (let i = 0; i < sampleSize; i++) {
            const idx = i * 4;
            rVariance += Math.abs(pixels[idx] - rAvg);
            gVariance += Math.abs(pixels[idx + 1] - gAvg);
            bVariance += Math.abs(pixels[idx + 2] - bAvg);
          }

          return {
            width: img.naturalWidth,
            height: img.naturalHeight,
            colorVariance: (rVariance + gVariance + bVariance) / (sampleSize * 3),
            avgR: rAvg,
            avgG: gAvg,
            avgB: bAvg
          };
        }`
      });

      // Clean up
      await fs.unlink(tempHtmlPath);

      // Analyze results
      const assessment = {
        score: 1.0,
        issues: [],
        hasDesignElements: false,
        hasProperComposition: false,
        hasGoodContrast: false
      };

      if (imageInfo.colorVariance > 30) {
        assessment.hasDesignElements = true;
        assessment.hasGoodContrast = true;
        assessment.score += 0.1;
      } else {
        assessment.issues.push('Low color variance - may be too simple');
        assessment.score -= 0.15;
      }

      if (imageInfo.width >= 1024 && imageInfo.height >= 1024) {
        assessment.hasProperComposition = true;
      } else {
        assessment.issues.push('Image dimensions smaller than expected');
        assessment.score -= 0.1;
      }

      assessment.score = Math.max(0, Math.min(1, assessment.score));

      return {
        success: true,
        assessment
      };

    } catch (error) {
      console.warn('Playwright MCP validation failed:', error.message);
      return null; // Fall back to heuristic validation
    }
  }

  /**
   * Detect if output is from Dreambooth model
   */
  isDreamboothOutput(result) {
    // Check generation_id prefix
    if (result.generation_id?.startsWith('dreambooth_')) {
      return true;
    }

    // Check if model name contains dreambooth
    if (result.model?.toLowerCase().includes('dreambooth')) {
      return true;
    }

    // Check if officer_id is present (indicates Dreambooth)
    if (result.officer_id) {
      return true;
    }

    // Check metadata for Dreambooth indicator
    if (result.metadata?.isDreambooth || result.metadata?.source === 'dreambooth') {
      return true;
    }

    return false;
  }

  /**
   * Validate Dreambooth output with specialized checks
   * STRICTER standards: Face confidence must be >90%
   */
  async validateDreamboothOutput(result, intent) {
    console.log('🎯 Running specialized Dreambooth validation');

    const validation = {
      dreambooth: null,
      visionAI: null,
      overall: 0,
      passed: false,
      issues: [],
      isDreambooth: true
    };

    try {
      // Run Dreambooth-specific validation
      const dreamboothResult = await this.dreamboothValidator.validateDreamboothOutput(
        result.url,
        result.officer_id || 'unknown',
        {
          requiresNMLS: intent.hasNMLS || intent.detectedNMLS,
          requiresText: intent.needsText,
          requiresLogo: intent.brand
        }
      );

      validation.dreambooth = dreamboothResult;

      // Calculate overall score with strict face requirements
      // Dreambooth outputs require >90% face confidence
      if (dreamboothResult.checks.faceIntegrity.score >= 0.90) {
        // Face quality excellent - combine all scores
        validation.overall = (
          dreamboothResult.checks.faceIntegrity.score * 0.40 +      // Face is critical
          dreamboothResult.checks.professionalAppearance.score * 0.25 +
          dreamboothResult.checks.brandCompliance.score * 0.20 +
          dreamboothResult.checks.textReadability.score * 0.10 +
          dreamboothResult.checks.safeContent.score * 0.05
        );
      } else {
        // Face quality insufficient - automatic failure for Dreambooth
        console.log(`❌ Face confidence too low for Dreambooth: ${(dreamboothResult.checks.faceIntegrity.confidence * 100).toFixed(1)}%`);
        validation.overall = Math.min(0.69, dreamboothResult.score); // Cap at 69% if face fails
        validation.issues.push('CRITICAL: Face quality below Dreambooth standards (requires >90%)');
      }

      // Aggregate issues
      validation.issues = [
        ...validation.issues,
        ...dreamboothResult.issues
      ];

      // Strict passing criteria for Dreambooth
      validation.passed =
        validation.overall >= 0.70 &&
        dreamboothResult.checks.faceIntegrity.score >= 0.90 && // Face must be excellent
        dreamboothResult.checks.faceIntegrity.confidence >= 0.90 && // High confidence required
        dreamboothResult.checks.safeContent.passed; // Must be safe

      console.log(`📊 Dreambooth validation: ${(validation.overall * 100).toFixed(1)}% ${validation.passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`   Face confidence: ${(dreamboothResult.checks.faceIntegrity.confidence * 100).toFixed(1)}%`);

      // Save validation results to database for learning
      if (this.supabase && result.generation_id) {
        await this.saveDreamboothValidation(result.generation_id, result.officer_id, validation);
      }

      return validation;

    } catch (error) {
      console.error('Dreambooth validation error:', error.message);
      return {
        score: 0,
        overall: 0,
        passed: false,
        issues: ['Dreambooth validation failed: ' + error.message],
        isDreambooth: true,
        error: error.message
      };
    }
  }

  /**
   * Save Dreambooth validation results to database
   */
  async saveDreamboothValidation(generationId, officerId, validation) {
    try {
      await this.supabase.from('dreambooth_quality_validations').insert({
        generation_id: generationId,
        officer_id: officerId,
        overall_score: validation.overall,
        face_confidence: validation.dreambooth?.checks.faceIntegrity.confidence || 0,
        face_score: validation.dreambooth?.checks.faceIntegrity.score || 0,
        professional_score: validation.dreambooth?.checks.professionalAppearance.score || 0,
        brand_score: validation.dreambooth?.checks.brandCompliance.score || 0,
        passed: validation.passed,
        issues: validation.issues,
        validation_data: validation.dreambooth,
        timestamp: new Date().toISOString()
      });

      console.log('💾 Dreambooth validation saved to database');

    } catch (error) {
      console.error('Failed to save Dreambooth validation:', error.message);
    }
  }
}

export default QualityAgent;
