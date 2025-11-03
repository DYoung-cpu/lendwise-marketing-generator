import vision from '@google-cloud/vision';

class VisionAIValidator {
  constructor(supabase) {
    this.supabase = supabase;

    // Try to initialize Google Cloud Vision client
    try {
      // Will use GOOGLE_APPLICATION_CREDENTIALS env var if set
      this.client = new vision.ImageAnnotatorClient();
      this.enabled = true;
      console.log('✅ Vision AI initialized');
    } catch (error) {
      console.warn('⚠️  Vision AI not configured:', error.message);
      console.warn('   Set GOOGLE_APPLICATION_CREDENTIALS to enable Vision AI');
      this.enabled = false;
    }
  }

  async analyzeImage(imageUrl, generationId) {
    if (!this.enabled) {
      console.log('📊 Vision AI disabled, skipping analysis');
      return null;
    }

    console.log('🔍 Vision AI analyzing image...');

    try {
      const [result] = await this.client.annotateImage({
        image: { source: { imageUri: imageUrl } },
        features: [
          { type: 'TEXT_DETECTION', maxResults: 50 },
          { type: 'FACE_DETECTION', maxResults: 10 },
          { type: 'LOGO_DETECTION', maxResults: 10 },
          { type: 'IMAGE_PROPERTIES' },
          { type: 'OBJECT_LOCALIZATION', maxResults: 20 },
          { type: 'SAFE_SEARCH_DETECTION' }
        ]
      });

      const analysis = {
        generation_id: generationId,
        text: {
          all_text: result.textAnnotations?.[0]?.description || '',
          nmls_found: this.extractNMLS(result.textAnnotations),
          rates_found: this.extractRates(result.textAnnotations),
          readable_score: this.assessTextReadability(result.textAnnotations)
        },
        faces: {
          count: result.faceAnnotations?.length || 0,
          quality: result.faceAnnotations?.[0]?.detectionConfidence || 0,
          professional: this.assessFaceProfessionalism(result.faceAnnotations?.[0]),
          emotions: this.extractEmotions(result.faceAnnotations?.[0])
        },
        brand: {
          colors: this.extractDominantColors(result.imagePropertiesAnnotation),
          brand_match: this.checkBrandConsistency(result.imagePropertiesAnnotation),
          logo_detected: result.logoAnnotations?.length > 0
        },
        composition: {
          objects: result.localizedObjectAnnotations?.map(obj => obj.name) || [],
          layout_score: this.assessComposition(result.localizedObjectAnnotations),
          professional_score: this.assessProfessionalism(result)
        }
      };

      // Save analysis to database
      if (this.supabase) {
        await this.supabase.from('vision_analysis').insert({
          ...analysis,
          raw_response: result,
          timestamp: new Date().toISOString()
        });
        console.log('💾 Vision analysis saved to database');
      }

      return analysis;
    } catch (error) {
      console.error('Vision AI analysis error:', error);
      return null;
    }
  }

  extractNMLS(textAnnotations) {
    if (!textAnnotations || textAnnotations.length === 0) return null;
    const text = textAnnotations[0]?.description || '';
    const match = text.match(/NMLS\s*#?\s*(\d+)/i);
    return match ? match[1] : null;
  }

  extractRates(textAnnotations) {
    if (!textAnnotations || textAnnotations.length === 0) return [];
    const text = textAnnotations[0]?.description || '';
    const rates = text.match(/(\d+\.?\d*)%/g) || [];
    return rates.map(r => parseFloat(r));
  }

  assessTextReadability(textAnnotations) {
    if (!textAnnotations || textAnnotations.length === 0) return 0;

    // More text blocks = better organized content
    const blockCount = textAnnotations.length;
    if (blockCount > 10) return 0.9;
    if (blockCount > 5) return 0.7;
    if (blockCount > 2) return 0.5;
    return 0.3;
  }

  assessFaceProfessionalism(face) {
    if (!face) return 0;

    // Professional = confident expression, good lighting, no extreme emotions
    let score = 0.5;

    if (face.joyLikelihood === 'POSSIBLE' || face.joyLikelihood === 'LIKELY') score += 0.2;
    if (face.angerLikelihood === 'VERY_UNLIKELY') score += 0.1;
    if (face.underExposedLikelihood === 'VERY_UNLIKELY') score += 0.1;
    if (face.blurredLikelihood === 'VERY_UNLIKELY') score += 0.1;

    return Math.min(score, 1.0);
  }

  extractEmotions(face) {
    if (!face) return null;
    return {
      joy: face.joyLikelihood,
      sorrow: face.sorrowLikelihood,
      anger: face.angerLikelihood,
      surprise: face.surpriseLikelihood
    };
  }

  extractDominantColors(imageProps) {
    if (!imageProps?.dominantColors?.colors) return [];
    return imageProps.dominantColors.colors.slice(0, 5).map(c => ({
      red: c.color.red || 0,
      green: c.color.green || 0,
      blue: c.color.blue || 0,
      score: c.score || 0,
      pixelFraction: c.pixelFraction || 0
    }));
  }

  checkBrandConsistency(imageProps) {
    const brandGreen = { r: 45, g: 95, b: 63 };  // #2d5f3f
    const brandGold = { r: 212, g: 175, b: 55 };  // #d4af37

    if (!imageProps?.dominantColors?.colors) {
      return { greenMatch: false, goldMatch: false, score: 0 };
    }

    const colors = imageProps.dominantColors.colors || [];

    let greenMatch = false;
    let goldMatch = false;

    for (const color of colors.slice(0, 5)) { // Check top 5 colors
      const c = color.color || {};
      if (this.colorDistance({ red: c.red, green: c.green, blue: c.blue }, brandGreen) < 30) greenMatch = true;
      if (this.colorDistance({ red: c.red, green: c.green, blue: c.blue }, brandGold) < 30) goldMatch = true;
    }

    return { greenMatch, goldMatch, score: (greenMatch && goldMatch) ? 1.0 : (greenMatch || goldMatch) ? 0.5 : 0 };
  }

  colorDistance(c1, c2) {
    return Math.sqrt(
      Math.pow((c1.red || 0) - c2.r, 2) +
      Math.pow((c1.green || 0) - c2.g, 2) +
      Math.pow((c1.blue || 0) - c2.b, 2)
    );
  }

  assessComposition(objects) {
    if (!objects || objects.length === 0) return 0.5;

    // Good composition has 3-7 distinct objects
    if (objects.length >= 3 && objects.length <= 7) return 0.9;
    if (objects.length >= 2) return 0.7;
    return 0.5;
  }

  assessProfessionalism(result) {
    let score = 0.7; // Base professional score

    // Check for professional elements
    if (result.safeSearchAnnotation) {
      if (result.safeSearchAnnotation.adult === 'VERY_UNLIKELY') score += 0.1;
      if (result.safeSearchAnnotation.violence === 'VERY_UNLIKELY') score += 0.1;
    }

    // Logo presence = more professional
    if (result.logoAnnotations?.length > 0) score += 0.1;

    return Math.min(score, 1.0);
  }
}

export default VisionAIValidator;
