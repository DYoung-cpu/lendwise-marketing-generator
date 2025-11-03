/**
 * Dreambooth Validator
 * Specialized validation for Dreambooth-generated images
 * Stricter standards for face quality and professional appearance
 */

import VisionAIValidator from './vision-ai-validator.js';

class DreamboothValidator {
  constructor() {
    this.visionAI = new VisionAIValidator();
    console.log('🎯 Dreambooth Validator initialized');
  }

  /**
   * Comprehensive validation for Dreambooth outputs
   * Stricter than general image validation due to representing real people
   */
  async validateDreamboothOutput(imageUrl, officerId, expectedFeatures = {}) {
    console.log(`🔍 Running specialized Dreambooth validation for officer ${officerId}`);

    // Get Vision AI analysis
    const visionAnalysis = await this.visionAI.analyzeImage(imageUrl, `dreambooth_${officerId}_${Date.now()}`);

    // Run specific checks
    const checks = {
      faceIntegrity: this.checkFaceIntegrity(visionAnalysis, officerId),
      professionalAppearance: this.checkProfessionalAppearance(visionAnalysis),
      brandCompliance: this.checkBrandElements(visionAnalysis, expectedFeatures),
      textReadability: this.checkTextElements(visionAnalysis, expectedFeatures),
      safeContent: this.checkSafeContent(visionAnalysis)
    };

    // Calculate weighted score - face quality is most important
    const score = this.calculateWeightedScore(checks);

    // Identify issues
    const issues = this.identifyIssues(checks, visionAnalysis);

    // Determine if passed
    const passed = score >= 0.70 && checks.faceIntegrity.score >= 0.90;

    console.log(`📊 Dreambooth validation: ${(score * 100).toFixed(1)}% (${passed ? 'PASSED' : 'FAILED'})`);

    if (issues.length > 0) {
      console.log(`⚠️ Issues found: ${issues.join(', ')}`);
    }

    return {
      score,
      checks,
      issues,
      passed,
      visionAnalysis,
      recommendation: this.generateRecommendation(checks, score, passed)
    };
  }

  /**
   * Check face integrity - MOST CRITICAL for Dreambooth
   * Require >90% confidence for production use
   */
  checkFaceIntegrity(visionAnalysis, officerId) {
    const faces = visionAnalysis.faceAnnotations || [];

    // Must have exactly one face
    if (faces.length === 0) {
      return {
        score: 0,
        passed: false,
        reason: 'no_face_detected',
        details: 'No face was detected in the image'
      };
    }

    if (faces.length > 1) {
      return {
        score: 0.3,
        passed: false,
        reason: 'multiple_faces',
        details: `Expected 1 face, found ${faces.length}`
      };
    }

    const face = faces[0];
    const confidence = face.detectionConfidence || 0;

    // Face landmarks check
    const hasKeyLandmarks =
      face.landmarks?.some(l => l.type === 'LEFT_EYE') &&
      face.landmarks?.some(l => l.type === 'RIGHT_EYE') &&
      face.landmarks?.some(l => l.type === 'NOSE_TIP');

    // Face emotions (should look professional)
    const emotions = {
      joy: face.joyLikelihood || 'UNKNOWN',
      anger: face.angerLikelihood || 'UNKNOWN',
      sorrow: face.sorrowLikelihood || 'UNKNOWN',
      surprise: face.surpriseLikelihood || 'UNKNOWN'
    };

    const isProfessionalExpression =
      emotions.anger === 'VERY_UNLIKELY' &&
      emotions.sorrow === 'VERY_UNLIKELY' &&
      emotions.surprise !== 'VERY_LIKELY';

    // Scoring
    let score = 0;

    if (confidence >= 0.95) {
      score += 0.50; // Excellent face detection
    } else if (confidence >= 0.90) {
      score += 0.40; // Good face detection
    } else if (confidence >= 0.80) {
      score += 0.25; // Acceptable face detection
    } else {
      score += 0.10; // Poor face detection
    }

    if (hasKeyLandmarks) {
      score += 0.25; // All key landmarks present
    }

    if (isProfessionalExpression) {
      score += 0.25; // Professional facial expression
    } else {
      score += 0.10; // Partial credit
    }

    return {
      score,
      passed: score >= 0.90 && confidence >= 0.90,
      confidence,
      hasKeyLandmarks,
      isProfessionalExpression,
      emotions,
      faceCount: faces.length,
      details: `Face confidence: ${(confidence * 100).toFixed(1)}%, ${hasKeyLandmarks ? 'all landmarks present' : 'missing landmarks'}`
    };
  }

  /**
   * Check professional appearance
   */
  checkProfessionalAppearance(visionAnalysis) {
    // Check image properties
    const imageProps = visionAnalysis.imagePropertiesAnnotation;
    const hasGoodQuality = imageProps?.dominantColors?.colors?.length > 0;

    // Check for professional labels
    const labels = visionAnalysis.labelAnnotations || [];
    const professionalLabels = ['business', 'professional', 'executive', 'corporate', 'office', 'suit', 'formal'];
    const casualLabels = ['casual', 'informal', 't-shirt', 'jeans'];

    const hasProfessionalLabels = labels.some(label =>
      professionalLabels.some(prof => label.description.toLowerCase().includes(prof))
    );

    const hasCasualLabels = labels.some(label =>
      casualLabels.some(casual => label.description.toLowerCase().includes(casual))
    );

    // Check lighting quality
    const face = visionAnalysis.faceAnnotations?.[0];
    const hasGoodLighting = face && (
      face.underExposedLikelihood === 'VERY_UNLIKELY' ||
      face.underExposedLikelihood === 'UNLIKELY'
    ) && (
      face.blurredLikelihood === 'VERY_UNLIKELY' ||
      face.blurredLikelihood === 'UNLIKELY'
    );

    let score = 0;

    if (hasGoodQuality) score += 0.35;
    if (hasProfessionalLabels) score += 0.35;
    if (!hasCasualLabels) score += 0.15;
    if (hasGoodLighting) score += 0.15;

    return {
      score,
      passed: score >= 0.70,
      hasGoodQuality,
      hasProfessionalLabels,
      hasCasualLabels,
      hasGoodLighting,
      labels: labels.slice(0, 5).map(l => l.description),
      details: hasProfessionalLabels ? 'Professional appearance detected' : 'No professional appearance indicators'
    };
  }

  /**
   * Check brand compliance (LendWise branding)
   */
  checkBrandElements(visionAnalysis, expectedFeatures) {
    const logos = visionAnalysis.logoAnnotations || [];
    const webEntities = visionAnalysis.webDetection?.webEntities || [];

    // Check for LendWise logo
    const hasLendWiseLogo = logos.some(logo =>
      logo.description.toLowerCase().includes('lendwise')
    ) || webEntities.some(entity =>
      entity.description?.toLowerCase().includes('lendwise')
    );

    // Check for NMLS number if expected
    const textAnnotations = visionAnalysis.textAnnotations || [];
    const fullText = textAnnotations[0]?.description || '';

    const hasNMLSNumber = expectedFeatures.requiresNMLS ?
      /nmls\s*#?\s*\d+/i.test(fullText) :
      true; // Pass if not required

    // Check brand colors (gold/black for LendWise)
    const colors = visionAnalysis.imagePropertiesAnnotation?.dominantColors?.colors || [];
    const hasBrandColors = colors.some(color => {
      const rgb = color.color;
      // Gold: RGB around (255, 215, 0) or Black: RGB around (0, 0, 0)
      const isGold = rgb.red > 200 && rgb.green > 150 && rgb.blue < 50;
      const isBlack = rgb.red < 50 && rgb.green < 50 && rgb.blue < 50;
      return isGold || isBlack;
    });

    let score = 0;

    if (hasLendWiseLogo) score += 0.50;
    if (hasNMLSNumber) score += 0.30;
    if (hasBrandColors) score += 0.20;

    return {
      score,
      passed: score >= 0.50,
      hasLendWiseLogo,
      hasNMLSNumber,
      hasBrandColors,
      details: hasLendWiseLogo ? 'LendWise branding present' : 'No LendWise branding detected'
    };
  }

  /**
   * Check text readability
   */
  checkTextElements(visionAnalysis, expectedFeatures) {
    const textAnnotations = visionAnalysis.textAnnotations || [];

    if (textAnnotations.length === 0) {
      // If text is expected but not found
      if (expectedFeatures.requiresText || expectedFeatures.requiresNMLS) {
        return {
          score: 0,
          passed: false,
          hasText: false,
          isReadable: false,
          details: 'No text detected, but text was expected'
        };
      }

      // If no text expected, that's okay
      return {
        score: 1.0,
        passed: true,
        hasText: false,
        isReadable: true,
        details: 'No text required'
      };
    }

    const fullText = textAnnotations[0].description;

    // Check readability indicators
    const hasGoodConfidence = textAnnotations.slice(1, 6).every(text =>
      (text.confidence || 0) > 0.8
    );

    // Check for common text issues
    const hasNoGarbledText = !/[^\w\s\d#.,!?-]/.test(fullText.substring(0, 100));

    let score = 0;

    if (textAnnotations.length > 0) score += 0.40;
    if (hasGoodConfidence) score += 0.40;
    if (hasNoGarbledText) score += 0.20;

    return {
      score,
      passed: score >= 0.70,
      hasText: textAnnotations.length > 0,
      isReadable: hasGoodConfidence && hasNoGarbledText,
      textCount: textAnnotations.length,
      avgConfidence: textAnnotations.slice(1, 6).reduce((sum, t) => sum + (t.confidence || 0), 0) / Math.min(5, textAnnotations.length - 1),
      details: hasGoodConfidence ? 'Text is clear and readable' : 'Text quality issues detected'
    };
  }

  /**
   * Check safe content
   */
  checkSafeContent(visionAnalysis) {
    const safeSearch = visionAnalysis.safeSearchAnnotation;

    if (!safeSearch) {
      return {
        score: 0.70,
        passed: true,
        details: 'No safe search data available'
      };
    }

    const isSafe =
      safeSearch.adult !== 'LIKELY' && safeSearch.adult !== 'VERY_LIKELY' &&
      safeSearch.violence !== 'LIKELY' && safeSearch.violence !== 'VERY_LIKELY' &&
      safeSearch.racy !== 'LIKELY' && safeSearch.racy !== 'VERY_LIKELY';

    return {
      score: isSafe ? 1.0 : 0,
      passed: isSafe,
      adult: safeSearch.adult,
      violence: safeSearch.violence,
      racy: safeSearch.racy,
      details: isSafe ? 'Content is safe' : 'Content safety concerns detected'
    };
  }

  /**
   * Calculate weighted score
   * Face integrity is most important (40%)
   */
  calculateWeightedScore(checks) {
    const weights = {
      faceIntegrity: 0.40,         // Most important - representing real person
      professionalAppearance: 0.25, // Professional look matters
      brandCompliance: 0.20,        // LendWise branding
      textReadability: 0.10,        // Text clarity
      safeContent: 0.05             // Must be safe, but if unsafe score is 0 anyway
    };

    return (
      checks.faceIntegrity.score * weights.faceIntegrity +
      checks.professionalAppearance.score * weights.professionalAppearance +
      checks.brandCompliance.score * weights.brandCompliance +
      checks.textReadability.score * weights.textReadability +
      checks.safeContent.score * weights.safeContent
    );
  }

  /**
   * Identify specific issues
   */
  identifyIssues(checks, visionAnalysis) {
    const issues = [];

    if (!checks.faceIntegrity.passed) {
      if (checks.faceIntegrity.faceCount === 0) {
        issues.push('no_face_detected');
      } else if (checks.faceIntegrity.faceCount > 1) {
        issues.push('multiple_faces');
      } else if (checks.faceIntegrity.confidence < 0.90) {
        issues.push('low_face_confidence');
      }

      if (!checks.faceIntegrity.hasKeyLandmarks) {
        issues.push('missing_face_landmarks');
      }

      if (!checks.faceIntegrity.isProfessionalExpression) {
        issues.push('unprofessional_expression');
      }
    }

    if (!checks.professionalAppearance.passed) {
      if (!checks.professionalAppearance.hasGoodQuality) {
        issues.push('poor_image_quality');
      }
      if (!checks.professionalAppearance.hasProfessionalLabels) {
        issues.push('not_professional_appearance');
      }
      if (!checks.professionalAppearance.hasGoodLighting) {
        issues.push('poor_lighting');
      }
    }

    if (!checks.brandCompliance.passed) {
      if (!checks.brandCompliance.hasLendWiseLogo) {
        issues.push('missing_lendwise_logo');
      }
      if (!checks.brandCompliance.hasNMLSNumber) {
        issues.push('missing_nmls_number');
      }
    }

    if (!checks.textReadability.passed && checks.textReadability.hasText) {
      issues.push('text_unreadable');
    }

    if (!checks.safeContent.passed) {
      issues.push('unsafe_content');
    }

    return issues;
  }

  /**
   * Generate recommendation for improvement
   */
  generateRecommendation(checks, score, passed) {
    if (passed && score >= 0.90) {
      return 'Excellent quality - ready for production use';
    }

    if (passed) {
      return 'Acceptable quality - monitor for improvements';
    }

    // Not passed - provide specific recommendations
    const recommendations = [];

    if (checks.faceIntegrity.score < 0.90) {
      recommendations.push('Retrain model with higher quality face photos');
      recommendations.push('Ensure training photos have single, clear face with good lighting');
    }

    if (checks.professionalAppearance.score < 0.70) {
      recommendations.push('Use more professional training photos (business attire, office setting)');
    }

    if (checks.brandCompliance.score < 0.50) {
      recommendations.push('Add LendWise logo to prompt or post-processing');
      recommendations.push('Include NMLS number in text overlay');
    }

    if (checks.textReadability.score < 0.70 && checks.textReadability.hasText) {
      recommendations.push('Improve text clarity - use higher contrast, larger font');
    }

    return recommendations.join('. ');
  }
}

export default DreamboothValidator;
