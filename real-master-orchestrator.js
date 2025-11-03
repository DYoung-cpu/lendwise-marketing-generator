#!/usr/bin/env node

/**
 * REAL Master Orchestrator - Uses ALL Your Existing Components
 * This integrates your 576-line replicate-master.js with real quality validation
 */

import ReplicateMaster from './replicate-master.js';
import { extractTextFromImage } from './wisr-ai-generator/ocr-service.js';
import { COMMON_MISSPELLINGS, getSpellingWarnings } from './spelling-dictionary.js';
import { createClient } from '@supabase/supabase-js';
import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

class RealMasterOrchestrator extends EventEmitter {
    constructor() {
        super();
        
        // Use YOUR existing ReplicateMaster with 100+ models
        this.replicateMaster = new ReplicateMaster();
        
        // Supabase for perpetual memory
        if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
            this.supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_KEY
            );
            console.log('✅ Supabase connected for perpetual memory');
        } else {
            console.warn('⚠️ Supabase not configured - memory disabled');
            this.supabase = null;
        }
        
        // Perpetual memory
        this.memory = new Map();
        this.loadPerpetualMemory();
        
        // Quality thresholds
        this.qualityThreshold = 0.90;  // 90% minimum (realistic)
        this.maxRetries = 3;
        
        console.log('✅ Real Master Orchestrator initialized');
        console.log('   ✓ ReplicateMaster with 100+ models');
        console.log('   ✓ OCR validation (Tesseract)');
        console.log('   ✓ Spell checking');
        console.log('   ✓ Perpetual memory');
    }
    
    async loadPerpetualMemory() {
        if (!this.supabase) return;
        
        try {
            const { data: memories } = await this.supabase
                .from('perpetual_memory')
                .select('*')
                .order('importance', { ascending: false })
                .limit(100);
            
            memories?.forEach(mem => {
                this.memory.set(mem.key, mem.value);
            });
            
            console.log(`✅ Loaded ${this.memory.size} perpetual memories`);
            
        } catch (error) {
            console.warn('Memory load failed:', error.message);
        }
    }
    
    async executeWithQualityLoop(task, params) {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`🎯 REAL QUALITY LOOP - ${task.type}`);
        console.log(`   Target: ${this.qualityThreshold * 100}% quality`);
        console.log(`   Max retries: ${this.maxRetries}`);
        console.log(`${'='.repeat(70)}`);
        
        let attempts = 0;
        let bestResult = null;
        let bestScore = 0;
        
        // Analyze what we're making
        const taskAnalysis = this.analyzeTask(task, params);
        console.log('\n📋 Task Analysis:', JSON.stringify(taskAnalysis, null, 2));
        
        while (attempts < this.maxRetries) {
            attempts++;
            console.log(`\n🔄 Attempt ${attempts}/${this.maxRetries}`);
            
            try {
                // Step 1: Generate with intelligent model selection
                const genResult = await this.generateWithBestModel(taskAnalysis, params);
                
                if (!genResult.success) {
                    console.log('❌ Generation failed, retrying...');
                    continue;
                }
                
                console.log(`✅ Generated with ${genResult.model}`);
                console.log(`   URL: ${genResult.url}`);
                
                // Step 2: Run REAL quality validation
                const validation = await this.validateQuality(genResult, params, taskAnalysis);
                
                console.log('\n📊 Validation Results:');
                console.log(`   OCR Score: ${(validation.ocrScore * 100).toFixed(1)}%`);
                console.log(`   Spelling Score: ${(validation.spellingScore * 100).toFixed(1)}%`);
                console.log(`   Content Score: ${(validation.contentScore * 100).toFixed(1)}%`);
                console.log(`   Overall: ${(validation.overallScore * 100).toFixed(1)}%`);
                
                if (validation.issues.length > 0) {
                    console.log('\n⚠️ Issues found:');
                    validation.issues.forEach(issue => console.log(`   - ${issue}`));
                }
                
                // Check if quality threshold met
                if (validation.overallScore >= this.qualityThreshold) {
                    console.log(`\n✅ Quality threshold met!`);
                    
                    // Remember success
                    await this.rememberSuccess(taskAnalysis, params, genResult, validation);
                    
                    return {
                        success: true,
                        output: genResult.url,
                        model: genResult.model,
                        provider: 'replicate',
                        qualityScore: validation.overallScore,
                        attempts: attempts,
                        validationReport: validation,
                        cost: genResult.cost
                    };
                }
                
                // Keep best attempt
                if (validation.overallScore > bestScore) {
                    bestScore = validation.overallScore;
                    bestResult = {
                        success: true,
                        output: genResult.url,
                        model: genResult.model,
                        provider: 'replicate',
                        qualityScore: validation.overallScore,
                        attempts: attempts,
                        validationReport: validation,
                        cost: genResult.cost
                    };
                }
                
                // Step 3: Learn and adjust for next attempt
                params = await this.learnAndAdjust(taskAnalysis, params, validation);
                
            } catch (error) {
                console.error(`❌ Attempt ${attempts} error:`, error.message);
            }
        }
        
        // Return best result even if below threshold
        if (bestResult) {
            console.log(`\n⚠️ Using best result: ${(bestScore * 100).toFixed(1)}%`);
            console.log(`${'='.repeat(70)}\n`);
            return bestResult;
        }
        
        throw new Error('Failed to generate after all attempts');
    }
    
    analyzeTask(task, params) {
        const prompt = params.prompt?.toLowerCase() || '';
        
        return {
            type: task.type,
            needs_text: /nmls|rate|percent|contact|phone|email|address|\d/.test(prompt),
            needs_compliance: /nmls|equal housing|license|disclosure/.test(prompt),
            is_rate_update: /rate update|daily rate|mortgage rate/.test(prompt),
            detected_nmls: prompt.match(/nmls\s*#?\s*(\d+)/i)?.[1],
            detected_phone: prompt.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/)?.[0],
            detected_rate: prompt.match(/(\d+\.\d+)%/)?.[1],
            has_logo: params.logo != null,
            has_photo: params.photo != null
        };
    }
    
    async generateWithBestModel(taskAnalysis, params) {
        console.log('\n🤖 Selecting optimal Replicate model...');
        
        // Use YOUR replicate-master.js intelligence
        const requirements = {
            needs_text: taskAnalysis.needs_text,
            quality_priority: params.quality_priority || taskAnalysis.needs_compliance,
            speed_priority: params.speed_priority,
            budget_conscious: params.budget_conscious,
            photorealistic: params.photorealistic,
            width: params.width || 1080,
            height: params.height || 1350
        };
        
        // Let ReplicateMaster select the best model
        const result = await this.replicateMaster.generateImage(params.prompt, requirements);
        
        return result;
    }
    
    async validateQuality(genResult, params, taskAnalysis) {
        console.log('\n🔍 Running REAL quality validation...');
        
        const validation = {
            ocrScore: 0,
            spellingScore: 0,
            contentScore: 0,
            overallScore: 0,
            issues: [],
            extractedText: '',
            corrections: []
        };
        
        // 1. OCR Text Extraction (using YOUR ocr-service.js)
        try {
            console.log('📝 Extracting text with OCR...');
            const ocrResult = await extractTextFromImage(genResult.url);
            
            validation.extractedText = ocrResult.text || '';
            validation.ocrConfidence = ocrResult.confidence || 0;
            
            console.log(`   Extracted: "${validation.extractedText.substring(0, 80)}..."`);
            console.log(`   Confidence: ${(validation.ocrConfidence * 100).toFixed(1)}%`);
            
            // Check if required text is present
            if (taskAnalysis.detected_nmls) {
                const hasNMLS = new RegExp(taskAnalysis.detected_nmls).test(validation.extractedText);
                if (!hasNMLS) {
                    validation.issues.push(`Missing NMLS number: ${taskAnalysis.detected_nmls}`);
                    validation.ocrScore = 0.5;
                } else {
                    validation.ocrScore = 1.0;
                }
            } else {
                validation.ocrScore = validation.ocrConfidence > 0.7 ? 1.0 : validation.ocrConfidence;
            }
            
        } catch (error) {
            console.error('   OCR error:', error.message);
            validation.ocrScore = 0.6; // Partial score if OCR fails
            validation.issues.push('OCR extraction failed');
        }
        
        // 2. Spelling Check (using YOUR spelling-dictionary.js)
        try {
            console.log('📖 Checking spelling...');
            const spellingWarnings = getSpellingWarnings(validation.extractedText);
            
            if (spellingWarnings.length > 0) {
                validation.spellingScore = Math.max(0, 1 - (spellingWarnings.length * 0.1));
                validation.misspellings = spellingWarnings;
                validation.issues.push(`${spellingWarnings.length} potential spelling error(s)`);
                console.log(`   Found ${spellingWarnings.length} potential misspellings`);
            } else {
                validation.spellingScore = 1.0;
                console.log('   ✓ No spelling errors detected');
            }
            
        } catch (error) {
            console.error('   Spelling check error:', error.message);
            validation.spellingScore = 0.8;
        }
        
        // 3. Content Validation
        try {
            console.log('✓ Validating content...');
            let contentScore = 1.0;
            
            // Check for detected phone number
            if (taskAnalysis.detected_phone) {
                const hasPhone = validation.extractedText.includes(taskAnalysis.detected_phone);
                if (!hasPhone) {
                    validation.issues.push(`Missing phone: ${taskAnalysis.detected_phone}`);
                    contentScore -= 0.2;
                }
            }
            
            // Check for detected rate
            if (taskAnalysis.detected_rate) {
                const hasRate = validation.extractedText.includes(taskAnalysis.detected_rate);
                if (!hasRate) {
                    validation.issues.push(`Missing rate: ${taskAnalysis.detected_rate}%`);
                    contentScore -= 0.2;
                }
            }
            
            validation.contentScore = Math.max(0, contentScore);
            
        } catch (error) {
            console.error('   Content validation error:', error.message);
            validation.contentScore = 0.8;
        }
        
        // Calculate weighted overall score
        validation.overallScore = (
            validation.ocrScore * 0.4 +       // Text accuracy is critical
            validation.spellingScore * 0.3 +   // Spelling is important
            validation.contentScore * 0.3      // Content presence
        );
        
        return validation;
    }
    
    async learnAndAdjust(taskAnalysis, params, validation) {
        console.log('\n🧠 Learning from validation...');
        
        const adjusted = { ...params };
        
        // Fix NMLS if missing
        if (validation.issues.some(i => i.includes('NMLS'))) {
            adjusted.prompt = `${params.prompt}\n\nIMPORTANT: Include "NMLS #${taskAnalysis.detected_nmls}" in LARGE, CLEAR text`;
            console.log('   → Enhanced NMLS display requirement');
        }
        
        // Fix phone if missing
        if (validation.issues.some(i => i.includes('phone'))) {
            adjusted.prompt = `${params.prompt}\n\nInclude phone number ${taskAnalysis.detected_phone} clearly`;
            console.log('   → Added phone number requirement');
        }
        
        // Improve text clarity if OCR score low
        if (validation.ocrScore < 0.7) {
            adjusted.prompt += '\n\nAll text must be EXTREMELY clear, high contrast, easily readable';
            console.log('   → Enhanced text clarity requirement');
        }
        
        // Try higher quality model if score very low
        if (validation.overallScore < 0.6) {
            adjusted.quality_priority = true;
            console.log('   → Switching to higher quality model');
        }
        
        // Store learning
        await this.storeLearning(taskAnalysis, validation, adjusted);
        
        return adjusted;
    }
    
    async storeLearning(taskAnalysis, validation, adjustments) {
        if (!this.supabase) return;
        
        try {
            await this.supabase.from('learning_patterns').insert({
                pattern_type: taskAnalysis.type,
                trigger_conditions: taskAnalysis,
                successful_response: adjustments,
                quality_score: validation.overallScore,
                created_at: new Date().toISOString()
            });
        } catch (error) {
            // Silent fail - learning is nice to have
        }
    }
    
    async rememberSuccess(taskAnalysis, params, result, validation) {
        const memory = {
            task: taskAnalysis,
            model: result.model,
            quality: validation.overallScore,
            timestamp: new Date().toISOString()
        };
        
        // Store in memory
        const key = `success_${taskAnalysis.type}_${Date.now()}`;
        this.memory.set(key, memory);
        
        // Persist to database
        if (this.supabase) {
            try {
                await this.supabase.from('perpetual_memory').insert({
                    key: key,
                    value: memory,
                    importance: Math.round(validation.overallScore * 10),
                    category: taskAnalysis.type
                });
                
                console.log('💾 Success remembered permanently');
            } catch (error) {
                // Silent fail
            }
        }
    }
}

export default RealMasterOrchestrator;
