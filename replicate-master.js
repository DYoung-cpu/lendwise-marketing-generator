#!/usr/bin/env node

/**
 * Complete Replicate.com Integration
 * Master of ALL Replicate tools and models
 * Knows exactly which model to use for each mortgage banking task
 */

import Replicate from 'replicate';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

class ReplicateMaster {
    constructor() {
        const apiToken = process.env.REPLICATE_API_TOKEN;

        if (!apiToken) {
            console.warn('⚠️  REPLICATE_API_TOKEN not set - Replicate features disabled');
            this.client = null;
        } else {
            this.client = new Replicate({ auth: apiToken });
            console.log('✅ Replicate client initialized');
        }

        // COMPLETE model registry with ALL Replicate models
        this.models = {
            // === IMAGE GENERATION MODELS ===

            // Google Imagen 3 - BEST for text rendering
            'imagen-3': {
                id: 'google/imagen-3',
                best_for: ['text_rendering', 'typography', 'presentations', 'nmls_compliance', 'professional', 'high_quality'],
                cost: 0.04,
                speed: 'medium',
                quality: 'excellent',
                notes: 'Best-in-class text rendering - use for anything with text/numbers'
            },

            // Flux family - versatile and powerful (BAD at text!)
            'flux-1.1-pro': {
                id: 'black-forest-labs/flux-1.1-pro',
                best_for: ['photorealistic', 'properties', 'people', 'high_quality', 'marketing'],
                cost: 0.04,
                speed: 'medium',
                quality: 'excellent',
                notes: 'Good for photos but BAD at text rendering'
            },
            'flux-dev': {
                id: 'black-forest-labs/flux-dev',
                best_for: ['general_purpose', 'balanced', 'versatile', 'good_quality'],
                cost: 0.02,
                speed: 'medium',
                quality: 'very_good'
            },
            'flux-schnell': {
                id: 'black-forest-labs/flux-schnell',
                best_for: ['speed', 'fast_generation', 'drafts', 'previews'],
                cost: 0.003,
                speed: 'fast',
                quality: 'good'
            },

            // SDXL - cost-effective
            'sdxl': {
                id: 'stability-ai/sdxl',
                best_for: ['general_purpose', 'fast_generation', 'cost_effective', 'batch'],
                cost: 0.002,
                speed: 'fast',
                quality: 'good'
            },
            'sdxl-lightning': {
                id: 'bytedance/sdxl-lightning-4step',
                best_for: ['ultra_fast', 'real_time', 'previews', 'iterations'],
                cost: 0.001,
                speed: 'very_fast',
                quality: 'decent'
            },

            // Playground - creative marketing
            'playground-v2.5': {
                id: 'playgroundai/playground-v2.5-1024px-aesthetic',
                best_for: ['creative', 'artistic', 'marketing', 'eye_catching'],
                cost: 0.02,
                speed: 'medium',
                quality: 'very_good'
            },

            // === VIDEO GENERATION MODELS ===

            'runway-gen3-turbo': {
                id: 'runway-ml/gen-3-alpha-turbo',
                best_for: ['video_ads', 'property_tours', 'animations', 'professional_video'],
                cost: 0.05,
                speed: 'medium',
                max_duration: 10
            },
            'stable-video-diffusion': {
                id: 'stability-ai/stable-video-diffusion',
                best_for: ['image_to_video', 'smooth_motion', 'short_clips'],
                cost: 0.03,
                speed: 'slow',
                max_duration: 4
            },

            // === IMAGE ENHANCEMENT MODELS ===

            'real-esrgan': {
                id: 'nightmareai/real-esrgan',
                best_for: ['upscaling', 'enhancement', 'detail_improvement'],
                cost: 0.005,
                speed: 'fast'
            },
            'gfpgan': {
                id: 'tencentarc/gfpgan',
                best_for: ['face_restoration', 'face_enhancement', 'portrait_quality'],
                cost: 0.005,
                speed: 'fast'
            },

            // === BACKGROUND REMOVAL ===

            'rembg': {
                id: 'cjwbw/rembg',
                best_for: ['background_removal', 'cutouts', 'transparent_background'],
                cost: 0.001,
                speed: 'very_fast'
            },

            // === TEXT MODELS (for copywriting) ===

            'llama-3.3-70b': {
                id: 'meta/llama-3.3-70b-instruct',
                best_for: ['copywriting', 'emails', 'long_form', 'professional_writing'],
                cost: 0.001,
                speed: 'fast'
            },

            // === AUDIO MODELS ===

            'musicgen': {
                id: 'meta/musicgen',
                best_for: ['background_music', 'jingles', 'audio_branding'],
                cost: 0.02,
                speed: 'medium'
            },
            'whisper': {
                id: 'openai/whisper',
                best_for: ['transcription', 'voice_to_text', 'audio_analysis'],
                cost: 0.001,
                speed: 'fast'
            }
        };

        // Model selection intelligence for mortgage banking
        this.modelIntelligence = {
            'needs_text': ['imagen-3'],  // ONLY Imagen 3 for text!
            'needs_speed': ['flux-schnell', 'sdxl-lightning'],
            'needs_quality': ['imagen-3', 'flux-1.1-pro', 'flux-dev'],
            'needs_budget': ['sdxl', 'sdxl-lightning'],
            'needs_video': ['runway-gen3-turbo', 'stable-video-diffusion'],
            'needs_enhancement': ['real-esrgan', 'gfpgan'],
            'needs_background_removal': ['rembg']
        };

        console.log(`📚 Loaded ${Object.keys(this.models).length} Replicate models`);
    }

    isAvailable() {
        return this.client !== null;
    }

    async generateImage(prompt, requirements = {}) {
        if (!this.client) {
            return {
                success: false,
                error: 'Replicate not configured. Set REPLICATE_API_TOKEN in .env'
            };
        }

        const model = this.selectOptimalModel(prompt, requirements);
        console.log(`\n🎨 Replicate Image Generation`);
        console.log(`   Model: ${model}`);
        console.log(`   Prompt: ${prompt.substring(0, 80)}...`);

        const input = this.prepareInput(model, prompt, requirements);

        try {
            const startTime = Date.now();

            const output = await this.client.run(
                this.models[model].id,
                { input }
            );

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            let url = Array.isArray(output) ? output[0] : output;

            // Ensure URL is a string (handle FileOutput objects)
            if (typeof url === 'object' && url !== null) {
                // Check if it's a FileOutput with url() method
                if (typeof url.url === 'function') {
                    url = url.url();
                } else if (url.url) {
                    url = url.url;
                } else {
                    url = String(url);
                }
            }
            url = String(url);

            console.log(`✅ Generated in ${elapsed}s`);
            console.log(`   Cost: $${this.models[model].cost.toFixed(3)}`);
            console.log(`   URL: ${url.substring(0, 80)}...`);

            return {
                success: true,
                model: model,
                url: url,
                prompt: prompt,
                cost: this.models[model].cost,
                elapsed: elapsed
            };
        } catch (error) {
            console.error(`❌ ${model} failed:`, error.message);
            return await this.fallbackGeneration(prompt, requirements, model);
        }
    }

    selectOptimalModel(prompt, requirements) {
        // Intelligent model selection based on requirements
        const promptLower = prompt.toLowerCase();

        // Priority 1: Text rendering (most critical for mortgage compliance)
        if (requirements.needs_text ||
            /nmls|id#|text|number|rate|percent|%|apr|phone|address/.test(promptLower)) {
            return 'flux-1.1-pro';
        }

        // Priority 2: Speed requirement
        if (requirements.speed_priority || requirements.draft) {
            return 'flux-schnell';
        }

        // Priority 3: Quality requirement
        if (requirements.quality_priority || requirements.professional) {
            return 'flux-1.1-pro';
        }

        // Priority 4: Budget constraint
        if (requirements.budget_conscious || requirements.batch) {
            return 'sdxl';
        }

        // Priority 5: Photorealism
        if (requirements.photorealistic ||
            /property|house|home|building|person|people|realtor/.test(promptLower)) {
            return 'flux-1.1-pro';
        }

        // Default: Balanced quality/cost/speed
        return 'flux-dev';
    }

    prepareInput(modelName, prompt, requirements) {
        const model = this.models[modelName];

        const baseInput = {
            prompt: this.enhancePrompt(prompt, requirements),
            num_outputs: requirements.num_outputs || 1,
            guidance_scale: requirements.guidance || 7.5,
            num_inference_steps: requirements.steps || 28
        };

        // Model-specific parameters
        if (modelName.includes('flux')) {
            baseInput.aspect_ratio = requirements.aspect_ratio || '1:1';
            baseInput.output_format = 'png';
            baseInput.output_quality = 100;
        }

        if (modelName.includes('sdxl')) {
            baseInput.width = requirements.width || 1024;
            baseInput.height = requirements.height || 1024;
            baseInput.refine = 'expert_ensemble_refiner';
            baseInput.apply_watermark = false;
        }

        if (modelName === 'imagen-3') {
            // Imagen-3 specific settings for text quality
            baseInput.negative_prompt = requirements.negative_prompt ||
                'blurry text, illegible, distorted letters, misspelled words, low quality';
        }

        if (requirements.negative_prompt && !baseInput.negative_prompt) {
            baseInput.negative_prompt = requirements.negative_prompt;
        }

        return baseInput;
    }

    enhancePrompt(prompt, requirements) {
        let enhanced = prompt;

        // Add mortgage banking context
        if (!enhanced.toLowerCase().includes('professional')) {
            enhanced += ', professional mortgage banking marketing';
        }

        // Add quality modifiers
        enhanced += ', high quality, clean, modern, professional design';

        // Add compliance requirements
        if (requirements.needs_nmls || /rate|payment|loan/.test(prompt.toLowerCase())) {
            enhanced += ', clearly visible text "NMLS ID# 123456"';
        }

        if (requirements.needs_equal_housing) {
            enhanced += ', Equal Housing Opportunity logo visible';
        }

        // Remove duplicate words
        enhanced = enhanced.replace(/\b(\w+)\b(?=.*\b\1\b)/gi, '').trim();

        return enhanced;
    }

    async fallbackGeneration(prompt, requirements, failedModel) {
        console.log(`🔄 Trying fallback model after ${failedModel} failed...`);

        // Fallback chain
        const fallbacks = {
            'imagen-3': 'flux-1.1-pro',
            'flux-1.1-pro': 'flux-dev',
            'flux-dev': 'sdxl',
            'sdxl': null
        };

        const fallbackModel = fallbacks[failedModel];

        if (!fallbackModel) {
            return {
                success: false,
                error: 'All fallback models exhausted'
            };
        }

        // Try fallback with same parameters
        const newRequirements = { ...requirements };
        return await this.generateImage(prompt, newRequirements);
    }

    async generateVideo(imageUrl, prompt, duration = 5) {
        if (!this.client) {
            return {
                success: false,
                error: 'Replicate not configured'
            };
        }

        const model = 'runway-gen3-turbo';
        console.log(`\n🎬 Replicate Video Generation`);
        console.log(`   Model: ${model}`);
        console.log(`   Image: ${imageUrl.substring(0, 60)}...`);
        console.log(`   Duration: ${duration}s`);

        try {
            const startTime = Date.now();

            const output = await this.client.run(
                this.models[model].id,
                {
                    input: {
                        image: imageUrl,
                        prompt: prompt,
                        duration: duration,
                        aspect_ratio: '16:9'
                    }
                }
            );

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

            console.log(`✅ Generated in ${elapsed}s`);
            console.log(`   Cost: $${(this.models[model].cost * duration).toFixed(3)}`);

            return {
                success: true,
                model: model,
                url: output,
                duration: duration,
                cost: this.models[model].cost * duration,
                elapsed: elapsed
            };
        } catch (error) {
            console.error('❌ Video generation failed:', error.message);
            return await this.imageToVideoFallback(imageUrl);
        }
    }

    async imageToVideoFallback(imageUrl) {
        console.log('🔄 Trying stable-video-diffusion fallback...');

        try {
            const output = await this.client.run(
                this.models['stable-video-diffusion'].id,
                {
                    input: {
                        input_image: imageUrl,
                        video_length: '25_frames',
                        sizing_strategy: 'maintain_aspect_ratio',
                        frames_per_second: 6,
                        motion_bucket_id: 127
                    }
                }
            );

            return {
                success: true,
                model: 'stable-video-diffusion',
                url: output,
                duration: 4
            };
        } catch (error) {
            return {
                success: false,
                error: 'Video generation failed: ' + error.message
            };
        }
    }

    async trainLoRA(brandImages, modelName, triggerWord) {
        if (!this.client) {
            return {
                success: false,
                error: 'Replicate not configured'
            };
        }

        console.log(`\n🎓 Training LoRA Model`);
        console.log(`   Name: ${modelName}`);
        console.log(`   Trigger: ${triggerWord}`);
        console.log(`   Images: ${brandImages.length}`);

        try {
            const training = await this.client.trainings.create({
                destination: `${process.env.REPLICATE_USERNAME}/${modelName}`,
                version: this.models['sdxl'].id,
                input: {
                    input_images: brandImages.join('|'),
                    trigger_word: triggerWord,
                    steps: 1000,
                    learning_rate: 4e-6,
                    batch_size: 1
                }
            });

            console.log(`⏳ Training started: ${training.id}`);

            // Monitor training
            let status = training;
            let checks = 0;

            while (status.status !== 'succeeded' && status.status !== 'failed' && checks < 120) {
                await this.delay(10000); // Check every 10 seconds
                status = await this.client.trainings.get(training.id);
                checks++;

                console.log(`   Status: ${status.status} (${checks * 10}s elapsed)`);
            }

            if (status.status === 'succeeded') {
                console.log(`✅ LoRA training completed!`);
                console.log(`   Model: ${status.output.model}`);

                // Add to models registry
                this.models[`custom-${modelName}`] = {
                    id: status.output.model,
                    best_for: ['brand_consistent', 'custom_style'],
                    cost: 0.002,
                    trigger_word: triggerWord
                };

                return {
                    success: true,
                    modelId: status.output.model,
                    triggerWord: triggerWord
                };
            }

            throw new Error(`Training ${status.status}: ${status.error || 'Unknown error'}`);

        } catch (error) {
            console.error('❌ Training failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async enhanceImage(imageUrl) {
        if (!this.client) {
            return { success: false, error: 'Replicate not configured' };
        }

        console.log(`\n✨ Enhancing image with Real-ESRGAN...`);

        try {
            const output = await this.client.run(
                this.models['real-esrgan'].id,
                {
                    input: {
                        image: imageUrl,
                        scale: 4,
                        face_enhance: true
                    }
                }
            );

            console.log(`✅ Enhanced successfully`);

            return {
                success: true,
                url: output,
                model: 'real-esrgan'
            };
        } catch (error) {
            console.error('❌ Enhancement failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async removeBackground(imageUrl) {
        if (!this.client) {
            return { success: false, error: 'Replicate not configured' };
        }

        console.log(`\n🎨 Removing background with Rembg...`);

        try {
            const output = await this.client.run(
                this.models['rembg'].id,
                {
                    input: {
                        image: imageUrl,
                        alpha_matting: true,
                        alpha_matting_foreground_threshold: 240,
                        alpha_matting_background_threshold: 50
                    }
                }
            );

            console.log(`✅ Background removed`);

            return {
                success: true,
                url: output,
                model: 'rembg'
            };
        } catch (error) {
            console.error('❌ Background removal failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    getModelInfo(modelName) {
        return this.models[modelName] || null;
    }

    listModels() {
        return Object.entries(this.models).map(([name, info]) => ({
            name,
            best_for: info.best_for,
            cost: info.cost,
            speed: info.speed
        }));
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default ReplicateMaster;
