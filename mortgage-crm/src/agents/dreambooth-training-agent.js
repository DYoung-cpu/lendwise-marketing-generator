/**
 * Dreambooth Training Agent
 * Trains custom models for loan officers and generates validated professional images
 * Integrates with Vision AI for quality validation and compliance
 */

import Replicate from 'replicate';
import VisionAIValidator from '../validators/vision-ai-validator.js';

class DreamboothTrainingAgent {
  constructor(supabase) {
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    });
    this.supabase = supabase;
    this.visionAI = new VisionAIValidator();

    // Dreambooth configuration
    this.dreamboothParams = {
      guidance_scale: 7.5,
      num_inference_steps: 50,
      negative_prompt: 'low quality, blurry, distorted face, multiple faces, deformed, disfigured',
      scheduler: 'DPMSolverMultistep'
    };

    console.log('🎨 Dreambooth Training Agent initialized');
  }

  /**
   * Train a Dreambooth model for a loan officer
   */
  async trainModel(officerId, trainingImages, options = {}) {
    console.log(`🏋️ Training Dreambooth model for officer ${officerId}`);

    const {
      instancePrompt = 'photo of sks person',
      classPrompt = 'photo of a person',
      maxTrainSteps = 1000,
      learningRate = 1e-6
    } = options;

    try {
      // Validate training images first
      console.log('🔍 Validating training images...');
      const validationResults = await this.validateTrainingImages(trainingImages);

      if (validationResults.invalidCount > 0) {
        console.warn(`⚠️ ${validationResults.invalidCount} training images failed validation`);
        console.warn('Issues:', validationResults.issues);
      }

      // Start training on Replicate
      const training = await this.replicate.trainings.create(
        'stability-ai',
        'sdxl',
        'da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf',
        {
          destination: `${process.env.REPLICATE_USERNAME}/${officerId}-dreambooth`,
          input: {
            input_images: trainingImages.join('|'),
            instance_prompt: instancePrompt,
            class_prompt: classPrompt,
            max_train_steps: maxTrainSteps,
            learning_rate: learningRate
          }
        }
      );

      console.log(`✅ Training started: ${training.id}`);

      // Save training record to database
      if (this.supabase) {
        await this.supabase.from('dreambooth_trainings').insert({
          officer_id: officerId,
          training_id: training.id,
          status: 'training',
          training_images: trainingImages,
          parameters: {
            instance_prompt: instancePrompt,
            max_train_steps: maxTrainSteps,
            learning_rate: learningRate
          }
        });
      }

      return {
        success: true,
        trainingId: training.id,
        officerId,
        status: 'training',
        validation: validationResults
      };

    } catch (error) {
      console.error('❌ Training failed:', error.message);
      throw error;
    }
  }

  /**
   * Validate training images before training
   */
  async validateTrainingImages(imageUrls) {
    const results = [];
    let invalidCount = 0;
    const issues = [];

    for (const imageUrl of imageUrls) {
      try {
        const validation = await this.visionAI.analyzeImage(imageUrl, `training_validation_${Date.now()}`);

        const isValid =
          validation.faceAnnotations?.length === 1 && // Exactly one face
          validation.faceAnnotations[0].detectionConfidence > 0.9 && // High face confidence
          !validation.safeSearchAnnotation?.adult && // Not adult content
          !validation.safeSearchAnnotation?.violence; // Not violent

        results.push({
          imageUrl,
          isValid,
          faceCount: validation.faceAnnotations?.length || 0,
          faceConfidence: validation.faceAnnotations?.[0]?.detectionConfidence || 0,
          issues: isValid ? [] : this.identifyTrainingImageIssues(validation)
        });

        if (!isValid) {
          invalidCount++;
          issues.push(...results[results.length - 1].issues);
        }

      } catch (error) {
        console.error(`Failed to validate ${imageUrl}:`, error.message);
        results.push({
          imageUrl,
          isValid: false,
          error: error.message
        });
        invalidCount++;
      }
    }

    return {
      totalImages: imageUrls.length,
      validCount: imageUrls.length - invalidCount,
      invalidCount,
      issues: [...new Set(issues)], // Unique issues
      results
    };
  }

  /**
   * Identify specific issues with training images
   */
  identifyTrainingImageIssues(validation) {
    const issues = [];

    if (!validation.faceAnnotations || validation.faceAnnotations.length === 0) {
      issues.push('no_face_detected');
    } else if (validation.faceAnnotations.length > 1) {
      issues.push('multiple_faces');
    } else if (validation.faceAnnotations[0].detectionConfidence < 0.9) {
      issues.push('low_face_confidence');
    }

    if (validation.safeSearchAnnotation?.adult) {
      issues.push('adult_content');
    }

    if (validation.imagePropertiesAnnotation?.dominantColors?.colors?.length === 0) {
      issues.push('poor_image_quality');
    }

    return issues;
  }

  /**
   * Generate image with Dreambooth and validate with Vision AI
   */
  async generateWithValidation(officerId, prompt, style = 'professional', maxAttempts = 3) {
    console.log(`🎨 Generating validated image for officer ${officerId}`);

    let attempts = 0;
    let bestResult = null;
    let bestScore = 0;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`🔄 Generation attempt ${attempts}/${maxAttempts}`);

      try {
        // Step 1: Generate with Dreambooth
        const imageUrl = await this.generateWithDreambooth(officerId, prompt, style);

        // Step 2: Validate with Vision AI
        console.log('🔍 Running Vision AI validation on Dreambooth output...');
        const generationId = `dreambooth_${officerId}_${Date.now()}`;
        const validation = await this.visionAI.analyzeImage(imageUrl, generationId);

        // Step 3: Calculate comprehensive score
        const score = this.calculateDreamboothScore(validation);

        console.log(`📊 Validation score: ${(score * 100).toFixed(1)}%`);

        // Track best result
        if (score > bestScore) {
          bestScore = score;
          bestResult = {
            success: true,
            imageUrl,
            validation,
            score,
            attempts
          };
        }

        // Step 4: Check if validation passed
        if (score >= 0.70) {
          console.log('✅ Dreambooth output passed Vision AI validation!');

          // Additional face quality check
          if (validation.faceAnnotations?.length > 0) {
            const faceConfidence = validation.faceAnnotations[0].detectionConfidence;

            if (faceConfidence < 0.9) {
              console.warn(`⚠️ Face quality below optimal threshold: ${(faceConfidence * 100).toFixed(1)}%`);
              // Adjust Dreambooth parameters for next training
              await this.adjustDreamboothParams(officerId, 'increase_face_weight');
            } else {
              console.log(`✨ Excellent face quality: ${(faceConfidence * 100).toFixed(1)}%`);
            }
          }

          // Save successful generation to database
          if (this.supabase) {
            await this.saveGeneration(officerId, imageUrl, validation, score, attempts);
          }

          return bestResult;
        }

        // Step 5: Learn from failures
        console.log(`❌ Validation failed: ${validation.issues?.join(', ') || 'Low score'}`);
        await this.learnFromFailure(validation, officerId, prompt);

        // Adjust parameters based on issues
        if (validation.issues?.includes('face_distorted') || validation.faceAnnotations?.[0]?.detectionConfidence < 0.8) {
          console.log('📉 Reducing guidance scale to improve face quality');
          this.dreamboothParams.guidance_scale = Math.max(5, this.dreamboothParams.guidance_scale - 1);
        }

        if (validation.textAnnotations?.length === 0 && prompt.includes('NMLS')) {
          console.log('📝 Adjusting prompt to emphasize text clarity');
          prompt = `${prompt}, clear readable text, high contrast, professional typography`;
        }

      } catch (error) {
        console.error(`❌ Generation attempt ${attempts} failed:`, error.message);
      }
    }

    // Return best result if we have one, even if below threshold
    if (bestResult) {
      console.log(`⚠️ Using best result: ${(bestScore * 100).toFixed(1)}% (below 70% threshold)`);
      return bestResult;
    }

    throw new Error(`Failed to generate valid image after ${maxAttempts} attempts`);
  }

  /**
   * Generate image using Dreambooth model
   */
  async generateWithDreambooth(officerId, prompt, style) {
    const modelVersion = `${process.env.REPLICATE_USERNAME}/${officerId}-dreambooth`;

    // Style-specific prompts
    const stylePrompts = {
      professional: 'professional business attire, office setting, high quality headshot',
      casual: 'business casual, modern office, approachable appearance',
      formal: 'formal executive portrait, professional lighting, premium quality'
    };

    const fullPrompt = `photo of sks person, ${stylePrompts[style] || stylePrompts.professional}, ${prompt}`;

    console.log(`📸 Generating with prompt: "${fullPrompt}"`);

    try {
      const output = await this.replicate.run(
        modelVersion,
        {
          input: {
            prompt: fullPrompt,
            negative_prompt: this.dreamboothParams.negative_prompt,
            guidance_scale: this.dreamboothParams.guidance_scale,
            num_inference_steps: this.dreamboothParams.num_inference_steps,
            scheduler: this.dreamboothParams.scheduler,
            width: 1024,
            height: 1024
          }
        }
      );

      return Array.isArray(output) ? output[0] : output;

    } catch (error) {
      console.error('Failed to generate with Dreambooth:', error.message);
      throw error;
    }
  }

  /**
   * Calculate comprehensive Dreambooth-specific score
   */
  calculateDreamboothScore(validation) {
    let score = 0;

    // 1. Face quality (40% weight) - Most important for Dreambooth
    if (validation.faceAnnotations?.length === 1) {
      const face = validation.faceAnnotations[0];
      const faceConfidence = face.detectionConfidence || 0;

      // Require very high face confidence for Dreambooth
      if (faceConfidence >= 0.95) {
        score += 0.40;
      } else if (faceConfidence >= 0.90) {
        score += 0.35;
      } else if (faceConfidence >= 0.80) {
        score += 0.25;
      } else {
        score += 0.10;
      }
    }

    // 2. Image quality (30% weight)
    if (validation.imagePropertiesAnnotation?.dominantColors?.colors?.length > 0) {
      score += 0.30;
    }

    // 3. Brand compliance (20% weight)
    if (validation.logoAnnotations?.some(logo => logo.description.toLowerCase().includes('lendwise'))) {
      score += 0.20;
    } else {
      score += 0.10; // Partial credit if no logo but otherwise good
    }

    // 4. Safe content (10% weight)
    const safeSearch = validation.safeSearchAnnotation;
    if (safeSearch && !safeSearch.adult && !safeSearch.violence && !safeSearch.racy) {
      score += 0.10;
    }

    return Math.min(1.0, score);
  }

  /**
   * Validate training quality by testing with multiple prompts
   */
  async validateTrainingQuality(officerId) {
    console.log(`🧪 Validating training quality for officer ${officerId}`);

    const testPrompts = [
      'professional headshot, office background',
      'business casual, modern setting, smiling',
      'formal attire, executive portrait, confident'
    ];

    const results = [];

    for (const testPrompt of testPrompts) {
      try {
        const output = await this.generateWithDreambooth(officerId, testPrompt, 'professional');
        const validation = await this.visionAI.analyzeImage(output, `test_${officerId}_${Date.now()}`);

        results.push({
          prompt: testPrompt,
          imageUrl: output,
          faceConfidence: validation.faceAnnotations?.[0]?.detectionConfidence || 0,
          faceCount: validation.faceAnnotations?.length || 0,
          textQuality: validation.textAnnotations?.length > 0 ? 'readable' : 'no-text',
          overallScore: this.calculateDreamboothScore(validation)
        });

      } catch (error) {
        console.error(`Test failed for prompt "${testPrompt}":`, error.message);
        results.push({
          prompt: testPrompt,
          error: error.message,
          overallScore: 0
        });
      }
    }

    // Calculate training quality metrics
    const avgFaceConfidence = results.reduce((sum, r) => sum + (r.faceConfidence || 0), 0) / results.length;
    const avgOverallScore = results.reduce((sum, r) => sum + r.overallScore, 0) / results.length;
    const allHaveSingleFace = results.every(r => r.faceCount === 1);

    const trainingQuality =
      avgFaceConfidence > 0.95 && avgOverallScore > 0.80 && allHaveSingleFace ? 'excellent' :
      avgFaceConfidence > 0.85 && avgOverallScore > 0.70 ? 'good' :
      'needs-improvement';

    console.log(`📊 Training quality: ${trainingQuality}`);
    console.log(`📊 Average face confidence: ${(avgFaceConfidence * 100).toFixed(1)}%`);
    console.log(`📊 Average overall score: ${(avgOverallScore * 100).toFixed(1)}%`);

    return {
      officerId,
      trainingQuality,
      avgFaceConfidence,
      avgOverallScore,
      allHaveSingleFace,
      testResults: results,
      recommendation:
        trainingQuality === 'excellent' ? 'Ready for production use' :
        trainingQuality === 'good' ? 'Acceptable for production, monitor results' :
        'Retrain with higher quality photos - ensure single face, good lighting, clear features'
    };
  }

  /**
   * Adjust Dreambooth parameters based on validation feedback
   */
  async adjustDreamboothParams(officerId, adjustment) {
    console.log(`⚙️ Adjusting Dreambooth parameters for ${officerId}: ${adjustment}`);

    switch (adjustment) {
      case 'increase_face_weight':
        // Increase focus on face by adjusting guidance
        this.dreamboothParams.guidance_scale = Math.min(10, this.dreamboothParams.guidance_scale + 0.5);
        break;

      case 'improve_quality':
        // Increase inference steps for better quality
        this.dreamboothParams.num_inference_steps = Math.min(100, this.dreamboothParams.num_inference_steps + 10);
        break;

      case 'reduce_artifacts':
        // Lower guidance scale to reduce artifacts
        this.dreamboothParams.guidance_scale = Math.max(5, this.dreamboothParams.guidance_scale - 0.5);
        break;
    }

    // Save adjustment to database for learning
    if (this.supabase) {
      await this.supabase.from('dreambooth_parameter_adjustments').insert({
        officer_id: officerId,
        adjustment,
        parameters: this.dreamboothParams,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Learn from validation failures
   */
  async learnFromFailure(validation, officerId, prompt) {
    const issues = [];

    if (!validation.faceAnnotations || validation.faceAnnotations.length === 0) {
      issues.push('no_face_detected');
    } else if (validation.faceAnnotations.length > 1) {
      issues.push('multiple_faces');
    } else if (validation.faceAnnotations[0].detectionConfidence < 0.8) {
      issues.push('low_face_confidence');
    }

    if (validation.textAnnotations?.length === 0 && prompt.includes('NMLS')) {
      issues.push('text_missing');
    }

    if (issues.length > 0) {
      console.log(`📚 Learning from issues: ${issues.join(', ')}`);

      // Save to database for pattern detection
      if (this.supabase) {
        await this.supabase.from('dreambooth_failures').insert({
          officer_id: officerId,
          prompt,
          issues,
          validation_data: validation,
          parameters: this.dreamboothParams,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Save successful generation to database
   */
  async saveGeneration(officerId, imageUrl, validation, score, attempts) {
    try {
      await this.supabase.from('dreambooth_generations').insert({
        officer_id: officerId,
        image_url: imageUrl,
        validation_score: score,
        face_confidence: validation.faceAnnotations?.[0]?.detectionConfidence || 0,
        attempts,
        parameters: this.dreamboothParams,
        validation_data: validation,
        timestamp: new Date().toISOString()
      });

      console.log('💾 Generation saved to database');

    } catch (error) {
      console.error('Failed to save generation:', error.message);
    }
  }

  /**
   * Get training status
   */
  async getTrainingStatus(trainingId) {
    try {
      const training = await this.replicate.trainings.get(trainingId);

      // Update database
      if (this.supabase) {
        await this.supabase
          .from('dreambooth_trainings')
          .update({
            status: training.status,
            completed_at: training.status === 'succeeded' ? new Date().toISOString() : null
          })
          .eq('training_id', trainingId);
      }

      return training;

    } catch (error) {
      console.error('Failed to get training status:', error.message);
      throw error;
    }
  }
}

export default DreamboothTrainingAgent;
