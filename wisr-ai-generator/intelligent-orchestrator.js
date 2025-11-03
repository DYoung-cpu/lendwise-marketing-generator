/**
 * INTELLIGENT ORCHESTRATOR
 * Understands ALL Replicate capabilities and makes decisions based on prompt content
 * No hardcoded preferences - learns what works through testing
 */

import Replicate from 'replicate';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// Import validation components from your infrastructure
import OCRService from './ocr-service.js';
import SpellingDictionary from './spelling-dictionary.js';
import ContentValidator from './content-validator.js';

class IntelligentOrchestrator {
    constructor() {
        console.log('🧠 Initializing Intelligent Orchestrator...');
        
        // Initialize Replicate
        this.replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN
        });
        
        // Initialize Supabase for perpetual memory (optional)
        if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
            this.supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_KEY
            );
        } else {
            this.supabase = null;
            console.log('⚠️  Supabase not configured - memory features disabled');
        }
        
        // Validation components
        this.ocrService = new OCRService();
        this.spellChecker = new SpellingDictionary();
        this.contentValidator = new ContentValidator();
        
        // Model knowledge base - will be populated from Replicate docs
        this.modelKnowledge = new Map();
        
        // Performance history
        this.performanceHistory = new Map();
        
        // Quality thresholds
        this.qualityThresholds = {
            text_content: 0.85,
            photo_content: 0.70,
            general_content: 0.75
        };
        
        // Load model knowledge and history
        this.initialize();
    }
    
    async initialize() {
        // Load all Replicate model documentation
        await this.gatherReplicateModels();
        
        // Load performance history from database
        await this.loadPerformanceHistory();
        
        console.log(`✅ Orchestrator ready with knowledge of ${this.modelKnowledge.size} models`);
    }
    
    /**
     * Gather all available Replicate models and their capabilities
     */
    async gatherReplicateModels() {
        console.log('📚 Gathering Replicate model documentation...');
        
        // Core models we know about (will be expanded through API discovery)
        const knownModels = [
            // Image Generation
            { id: 'stability-ai/sdxl', type: 'image', capabilities: ['general', 'fast'] },
            { id: 'black-forest-labs/flux-1.1-pro', type: 'image', capabilities: ['photorealistic', 'high-quality'] },
            { id: 'black-forest-labs/flux-dev', type: 'image', capabilities: ['general', 'balanced'] },
            { id: 'black-forest-labs/flux-schnell', type: 'image', capabilities: ['fast', 'draft'] },
            { id: 'playgroundai/playground-v2.5-1024px-aesthetic', type: 'image', capabilities: ['aesthetic', 'marketing'] },
            { id: 'bytedance/sdxl-lightning-4step', type: 'image', capabilities: ['ultra-fast', 'preview'] },
            
            // Text-optimized (based on documentation)
            { id: 'google/imagen-3', type: 'image', capabilities: ['text-rendering', 'typography', 'clear-text'] },
            { id: 'ideogram-ai/ideogram-v2', type: 'image', capabilities: ['text', 'typography', 'logos'] },
            
            // Video Generation
            { id: 'runway/gen-3-alpha-turbo', type: 'video', capabilities: ['text-to-video', 'high-quality'] },
            { id: 'stability-ai/stable-video-diffusion', type: 'video', capabilities: ['image-to-video', 'smooth-motion'] },
            { id: 'ali-vilab/i2vgen-xl', type: 'video', capabilities: ['image-animation', 'ken-burns'] },
            
            // Enhancement
            { id: 'nightmareai/real-esrgan', type: 'enhancement', capabilities: ['upscaling', '4x'] },
            { id: 'sczhou/codeformer', type: 'enhancement', capabilities: ['face-restoration'] },
            { id: 'cjwbw/rembg', type: 'enhancement', capabilities: ['background-removal'] },
            
            // Audio
            { id: 'meta/musicgen', type: 'audio', capabilities: ['music-generation'] },
            { id: 'openai/whisper', type: 'audio', capabilities: ['speech-to-text', 'transcription'] },
            
            // LLM
            { id: 'meta/llama-3.3-70b-instruct', type: 'text', capabilities: ['text-generation', 'analysis'] }
        ];
        
        // Store model knowledge
        for (const model of knownModels) {
            this.modelKnowledge.set(model.id, {
                ...model,
                performance: { attempts: 0, successes: 0, avg_quality: 0 }
            });
        }
        
        // TODO: Query Replicate API to discover all available models dynamically
        // This would involve using the Replicate API to list all models
    }
    
    /**
     * Load performance history from database
     */
    async loadPerformanceHistory() {
        try {
            const { data: history } = await this.supabase
                .from('model_performance')
                .select('*')
                .order('updated_at', { ascending: false });
            
            if (history) {
                for (const record of history) {
                    this.performanceHistory.set(record.model_id, {
                        successes: record.success_count || 0,
                        failures: record.failure_count || 0,
                        avg_quality: record.average_quality || 0,
                        best_for: record.best_for || [],
                        avoid_for: record.avoid_for || []
                    });
                }
                console.log(`📊 Loaded performance history for ${this.performanceHistory.size} models`);
            }
        } catch (error) {
            console.log('⚠️ No performance history available (starting fresh)');
        }
    }
    
    /**
     * MAIN GENERATION METHOD - Analyzes prompt and decides approach
     */
    async generate(prompt, options = {}) {
        console.log('\n' + '═'.repeat(70));
        console.log('🎯 INTELLIGENT GENERATION STARTING');
        console.log('═'.repeat(70));
        console.log(`Prompt: "${prompt.substring(0, 100)}..."`);
        
        // Step 1: Analyze the prompt to understand what's needed
        const analysis = this.analyzePrompt(prompt);
        console.log('\n📋 Prompt Analysis:');
        console.log(`  Type: ${analysis.contentType}`);
        console.log(`  Needs Text: ${analysis.needsText}`);
        console.log(`  Needs Photo: ${analysis.needsPhoto}`);
        console.log(`  Is Video: ${analysis.isVideo}`);
        
        // Step 2: Route to appropriate generation method
        if (analysis.isVideo) {
            return await this.generateVideo(prompt, analysis, options);
        } else {
            return await this.generateStaticImage(prompt, analysis, options);
        }
    }
    
    /**
     * Analyze prompt to understand requirements
     */
    analyzePrompt(prompt) {
        const promptLower = prompt.toLowerCase();
        
        return {
            // Content type detection
            contentType: this.detectContentType(promptLower),
            isVideo: this.detectVideo(promptLower),
            
            // Specific needs
            needsText: this.detectTextNeeds(promptLower),
            needsPhoto: this.detectPhotoNeeds(promptLower),
            needsGraphics: this.detectGraphicsNeeds(promptLower),
            
            // Extracted requirements
            hasNMLS: /nmls\s*#?\s*\d+/i.test(prompt),
            hasRates: /%|rate|apr|percent/i.test(prompt),
            hasContact: /phone|email|contact|call/i.test(prompt),
            
            // Quality requirements
            needsHighQuality: /high quality|professional|premium|luxury/i.test(prompt),
            needsFast: /quick|fast|draft|test/i.test(prompt),
            
            // Detected entities
            detectedNMLS: prompt.match(/nmls\s*#?\s*(\d+)/i)?.[1],
            detectedPhone: prompt.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/)?.[0],
            detectedRate: prompt.match(/(\d+\.?\d*)%/)?.[1]
        };
    }
    
    detectContentType(prompt) {
        if (/video|animation|motion|animated|tour|walkthrough/.test(prompt)) return 'video';
        if (/music|sound|audio|voice|narration/.test(prompt)) return 'audio';
        if (/3d|three.dimensional|model/.test(prompt)) return '3d';
        return 'image';
    }
    
    detectVideo(prompt) {
        return /video|animation|motion|animated|tour|walkthrough|timelapse|sequence/.test(prompt);
    }
    
    detectTextNeeds(prompt) {
        return /text|words|nmls|rate|percent|contact|phone|email|address|title|headline|caption|disclaimer/.test(prompt);
    }
    
    detectPhotoNeeds(prompt) {
        return /photo|realistic|property|house|home|building|person|people|realtor|agent|headshot/.test(prompt);
    }
    
    detectGraphicsNeeds(prompt) {
        return /logo|graphic|design|illustration|icon|banner|poster|flyer/.test(prompt);
    }
    
    /**
     * Generate static image with intelligent model selection
     */
    async generateStaticImage(prompt, analysis, options) {
        console.log('\n🖼️ STATIC IMAGE GENERATION');
        
        // Select best model based on analysis and performance history
        const selectedModel = this.selectBestModel(analysis, 'image');
        console.log(`\n🤖 Selected Model: ${selectedModel}`);
        
        const modelInfo = this.modelKnowledge.get(selectedModel);
        console.log(`  Capabilities: ${modelInfo?.capabilities.join(', ')}`);
        
        // Performance history for this model
        const history = this.performanceHistory.get(selectedModel);
        if (history) {
            console.log(`  Past Performance: ${history.successes}/${history.successes + history.failures} successful`);
        }
        
        // Generate with retry logic
        let attempts = 0;
        let bestResult = null;
        let bestQuality = 0;
        
        while (attempts < 5) {
            attempts++;
            console.log(`\n🔄 Attempt ${attempts}/5`);
            
            try {
                // Generate image
                const result = await this.callReplicateModel(selectedModel, prompt, options);
                
                if (!result.success) {
                    console.log('❌ Generation failed');
                    continue;
                }
                
                // Validate quality if text is needed
                if (analysis.needsText) {
                    const validation = await this.validateQuality(result.url, analysis);
                    result.validation = validation;
                    result.qualityScore = validation.overall;
                    
                    console.log(`\n📊 Quality Validation:`);
                    console.log(`  OCR: ${(validation.ocr * 100).toFixed(1)}%`);
                    console.log(`  Spelling: ${(validation.spelling * 100).toFixed(1)}%`);
                    console.log(`  Compliance: ${(validation.compliance * 100).toFixed(1)}%`);
                    console.log(`  Overall: ${(validation.overall * 100).toFixed(1)}%`);
                    
                    // Check if quality meets threshold
                    const threshold = this.qualityThresholds.text_content;
                    if (validation.overall >= threshold) {
                        console.log(`✅ Quality threshold met (>=${threshold * 100}%)`);
                        
                        // Record success
                        await this.recordPerformance(selectedModel, true, validation.overall);
                        
                        return result;
                    }
                    
                    // Keep best attempt
                    if (validation.overall > bestQuality) {
                        bestQuality = validation.overall;
                        bestResult = result;
                    }
                    
                    // Adjust prompt for retry
                    prompt = this.adjustPrompt(prompt, validation);
                    
                } else {
                    // No text validation needed, assume success
                    result.qualityScore = 0.9;
                    await this.recordPerformance(selectedModel, true, 0.9);
                    return result;
                }
                
            } catch (error) {
                console.error(`Attempt ${attempts} error:`, error.message);
            }
        }
        
        // Return best result or failure
        if (bestResult && bestQuality >= 0.6) {
            console.log(`⚠️ Returning best result: ${(bestQuality * 100).toFixed(1)}%`);
            await this.recordPerformance(selectedModel, false, bestQuality);
            return bestResult;
        }
        
        return {
            success: false,
            error: `Failed to generate with sufficient quality. Best: ${(bestQuality * 100).toFixed(1)}%`,
            model: selectedModel
        };
    }
    
    /**
     * Generate video
     */
    async generateVideo(prompt, analysis, options) {
        console.log('\n🎬 VIDEO GENERATION');
        
        const selectedModel = this.selectBestModel(analysis, 'video');
        console.log(`\n🤖 Selected Model: ${selectedModel}`);
        
        try {
            const result = await this.callReplicateModel(selectedModel, prompt, {
                ...options,
                duration: options.duration || 5,
                fps: options.fps || 24
            });
            
            if (result.success) {
                console.log(`✅ Video generated successfully`);
                await this.recordPerformance(selectedModel, true, 0.9);
            }
            
            return result;
            
        } catch (error) {
            console.error('Video generation error:', error);
            return {
                success: false,
                error: error.message,
                model: selectedModel
            };
        }
    }
    
    /**
     * Select best model based on analysis and history
     */
    selectBestModel(analysis, type) {
        const candidates = [];
        
        // Get models of the right type
        for (const [modelId, info] of this.modelKnowledge) {
            if (info.type !== type) continue;
            
            let score = 0;
            
            // Score based on capabilities matching needs
            if (analysis.needsText && info.capabilities.some(c => c.includes('text'))) {
                score += 50;
            }
            if (analysis.needsPhoto && info.capabilities.some(c => c.includes('photo') || c.includes('realistic'))) {
                score += 40;
            }
            if (analysis.needsFast && info.capabilities.some(c => c.includes('fast'))) {
                score += 30;
            }
            if (analysis.needsHighQuality && info.capabilities.some(c => c.includes('quality'))) {
                score += 20;
            }
            
            // Adjust based on performance history
            const history = this.performanceHistory.get(modelId);
            if (history) {
                // Boost if good performance
                if (history.avg_quality > 0.8) score += 30;
                // Penalize if poor performance for this type
                if (analysis.needsText && history.avoid_for?.includes('text')) score -= 50;
                // Boost if specifically good for this type
                if (analysis.needsText && history.best_for?.includes('text')) score += 40;
            }
            
            candidates.push({ modelId, score });
        }
        
        // Sort by score and return best
        candidates.sort((a, b) => b.score - a.score);
        
        if (candidates.length === 0) {
            // Fallback to default
            return type === 'video' ? 'stability-ai/stable-video-diffusion' : 'stability-ai/sdxl';
        }
        
        return candidates[0].modelId;
    }
    
    /**
     * Call Replicate model
     */
    async callReplicateModel(modelId, prompt, options = {}) {
        console.log(`🚀 Calling ${modelId}...`);
        const startTime = Date.now();
        
        try {
            const input = {
                prompt: prompt,
                ...this.getModelSpecificParams(modelId, options)
            };
            
            const output = await this.replicate.run(modelId, { input });
            
            // Extract URL
            let url = Array.isArray(output) ? output[0] : output;
            if (typeof url === 'object' && url !== null) {
                if (typeof url.url === 'function') {
                    url = url.url();
                } else if (url.url) {
                    url = url.url;
                } else {
                    url = String(url);
                }
            }
            url = String(url);
            
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`✅ Generated in ${duration}s`);
            
            return {
                success: true,
                url: url,
                model: modelId,
                duration: duration
            };
            
        } catch (error) {
            console.error(`❌ Model error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                model: modelId
            };
        }
    }
    
    /**
     * Get model-specific parameters
     */
    getModelSpecificParams(modelId, options) {
        const params = {
            width: options.width || 1024,
            height: options.height || 1024
        };
        
        // Model-specific adjustments
        if (modelId.includes('flux')) {
            params.num_inference_steps = options.steps || 28;
            params.guidance_scale = options.guidance || 3.5;
        } else if (modelId.includes('sdxl')) {
            params.num_inference_steps = options.steps || 25;
            params.negative_prompt = "low quality, blurry, distorted";
        } else if (modelId.includes('imagen')) {
            params.number_of_images = 1;
            params.guidance_scale = options.guidance || 7.5;
        }
        
        // Video-specific
        if (modelId.includes('video')) {
            params.duration = options.duration || 5;
            params.fps = options.fps || 24;
        }
        
        return params;
    }
    
    /**
     * Validate quality using OCR and other checks
     */
    async validateQuality(imageUrl, analysis) {
        const validation = {
            ocr: 1,
            spelling: 1,
            compliance: 1,
            overall: 1,
            issues: []
        };
        
        try {
            // OCR validation for text
            if (analysis.needsText) {
                const ocrResult = await this.ocrService.extractText(imageUrl);
                const extractedText = ocrResult.text;
                
                // Check for specific requirements
                if (analysis.hasNMLS) {
                    const extractedNMLS = extractedText.match(/nmls\s*#?\s*(\d+)/i)?.[1];
                    if (extractedNMLS === analysis.detectedNMLS) {
                        validation.ocr = 1;
                    } else if (extractedNMLS) {
                        validation.ocr = 0.5;
                        validation.issues.push('NMLS number incorrect');
                    } else {
                        validation.ocr = 0;
                        validation.issues.push('NMLS number missing');
                    }
                }
                
                // Spelling check
                const spellResult = await this.spellChecker.checkText(extractedText);
                validation.spelling = spellResult.score;
                if (spellResult.errors.length > 0) {
                    validation.issues.push(`Spelling errors: ${spellResult.errors.join(', ')}`);
                }
                
                // Compliance check
                const compResult = await this.contentValidator.validateCompliance({
                    text: extractedText,
                    hasNMLS: analysis.hasNMLS,
                    hasEqualHousing: false
                });
                validation.compliance = compResult.score;
                validation.issues.push(...compResult.issues);
            }
            
        } catch (error) {
            console.error('Validation error:', error);
        }
        
        // Calculate overall score
        validation.overall = (
            validation.ocr * 0.4 +
            validation.spelling * 0.3 +
            validation.compliance * 0.3
        );
        
        return validation;
    }
    
    /**
     * Adjust prompt based on validation issues
     */
    adjustPrompt(prompt, validation) {
        let adjusted = prompt;
        
        if (validation.issues.some(i => i.includes('NMLS'))) {
            adjusted += '. DISPLAY "NMLS #' + (this.analyzePrompt(prompt).detectedNMLS || '123456') + '" IN LARGE CLEAR TEXT';
        }
        
        if (validation.spelling < 0.8) {
            adjusted += '. ENSURE ALL TEXT IS SPELLED CORRECTLY';
        }
        
        console.log('📝 Adjusted prompt for better quality');
        return adjusted;
    }
    
    /**
     * Record performance for learning
     */
    async recordPerformance(modelId, success, quality) {
        // Update local history
        const history = this.performanceHistory.get(modelId) || {
            successes: 0,
            failures: 0,
            avg_quality: 0
        };
        
        if (success) {
            history.successes++;
        } else {
            history.failures++;
        }
        
        // Update average quality
        const totalAttempts = history.successes + history.failures;
        history.avg_quality = ((history.avg_quality * (totalAttempts - 1)) + quality) / totalAttempts;
        
        this.performanceHistory.set(modelId, history);
        
        // Save to database
        try {
            await this.supabase.from('model_performance').upsert({
                model_id: modelId,
                success_count: history.successes,
                failure_count: history.failures,
                average_quality: history.avg_quality,
                updated_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to save performance:', error);
        }
    }
}

export default IntelligentOrchestrator;
