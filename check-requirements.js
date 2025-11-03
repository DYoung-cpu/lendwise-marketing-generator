#!/usr/bin/env node

/**
 * Requirements Checker
 * Shows what API keys you have vs what you need
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';

dotenv.config();

console.log('\n' + '='.repeat(80));
console.log('🔍 SYSTEM REQUIREMENTS CHECK');
console.log('='.repeat(80));

const requirements = {
    critical: [],
    optional: [],
    working: []
};

// Check each requirement
async function checkRequirements() {

    // === CRITICAL REQUIREMENTS ===
    console.log('\n🔴 CRITICAL (System won\'t work without these):');
    console.log('-'.repeat(80));

    // Gemini/Google API
    if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
        console.log('✅ Gemini API Key: FOUND');
        requirements.working.push('Gemini');
    } else {
        console.log('❌ Gemini API Key: MISSING');
        console.log('   → Your existing image generation needs this');
        requirements.critical.push('Gemini/Google API Key');
    }

    // Anthropic (for orchestrator)
    if (process.env.ANTHROPIC_API_KEY) {
        console.log('✅ Anthropic API Key: FOUND');
        requirements.working.push('Anthropic');
    } else {
        console.log('❌ Anthropic API Key: MISSING');
        console.log('   → Orchestrator uses Claude for planning');
        requirements.critical.push('Anthropic API Key');
    }

    // === IMPORTANT (New features) ===
    console.log('\n🟡 IMPORTANT (New features need these):');
    console.log('-'.repeat(80));

    // Replicate
    if (process.env.REPLICATE_API_TOKEN) {
        console.log('✅ Replicate API Token: FOUND');
        console.log('   → Can use 15+ models (imagen-3, flux, etc.)');
        requirements.working.push('Replicate');

        // Test if it's valid
        try {
            const { default: Replicate } = await import('replicate');
            const client = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
            console.log('   → Token appears valid');
        } catch (error) {
            console.log('   ⚠️  Token may be invalid:', error.message);
        }
    } else {
        console.log('❌ Replicate API Token: MISSING');
        console.log('   → Get from: https://replicate.com/account/api-tokens');
        console.log('   → Needed for: imagen-3, flux, video generation, LoRA training');
        requirements.critical.push('Replicate API Token');
    }

    if (process.env.REPLICATE_USERNAME) {
        console.log('✅ Replicate Username: ' + process.env.REPLICATE_USERNAME);
    } else {
        console.log('⚠️  Replicate Username: MISSING');
        console.log('   → Needed for: LoRA training (can skip for now)');
    }

    // Supabase (for perpetual memory)
    if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
        console.log('✅ Supabase Credentials: FOUND');
        console.log('   → URL: ' + process.env.SUPABASE_URL);

        // Test connection
        try {
            const supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_KEY
            );
            const { data, error } = await supabase
                .from('perpetual_memory')
                .select('count')
                .limit(1);

            if (!error) {
                console.log('   → Database connected successfully');
                requirements.working.push('Supabase');
            } else {
                console.log('   ⚠️  Database error:', error.message);
                console.log('   → Did you run database-schema.sql?');
            }
        } catch (error) {
            console.log('   ⚠️  Connection failed:', error.message);
        }
    } else {
        console.log('❌ Supabase Credentials: MISSING');
        console.log('   → Get from: https://supabase.com (create project)');
        console.log('   → Needed for: Perpetual memory system');
        requirements.optional.push('Supabase');
    }

    // === OPTIONAL (Nice to have) ===
    console.log('\n🟢 OPTIONAL (System works without these, but slower):');
    console.log('-'.repeat(80));

    // Redis
    if (process.env.REDIS_URL || process.env.REDIS_HOST) {
        const host = process.env.REDIS_HOST || 'localhost';
        const port = process.env.REDIS_PORT || 6379;
        console.log(`✅ Redis Config: ${host}:${port}`);

        // Test connection
        try {
            const redis = new Redis({
                host: host,
                port: port,
                retryStrategy: () => null,
                maxRetriesPerRequest: 1
            });

            await redis.ping();
            console.log('   → Redis connected successfully');
            requirements.working.push('Redis');
            redis.disconnect();
        } catch (error) {
            console.log('   ⚠️  Redis not running (system will work without it)');
            console.log('   → To start: docker run -d -p 6379:6379 redis');
        }
    } else {
        console.log('⚪ Redis: NOT CONFIGURED');
        console.log('   → Optional: Speeds up caching');
        console.log('   → To add: docker run -d -p 6379:6379 redis');
    }

    // OpenAI (optional - for DALL-E)
    if (process.env.OPENAI_API_KEY) {
        console.log('✅ OpenAI API Key: FOUND');
        console.log('   → Can use DALL-E as fallback');
        requirements.working.push('OpenAI');
    } else {
        console.log('⚪ OpenAI API Key: NOT SET');
        console.log('   → Optional: Only needed for DALL-E generation');
    }

    // Firecrawl (optional - for web scraping)
    if (process.env.FIRECRAWL_API_KEY) {
        console.log('✅ Firecrawl API Key: FOUND');
        requirements.working.push('Firecrawl');
    } else {
        console.log('⚪ Firecrawl API Key: NOT SET');
        console.log('   → Optional: Only needed for advanced web scraping');
    }

    // === SUMMARY ===
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));

    console.log(`\n✅ Working: ${requirements.working.length} services`);
    if (requirements.working.length > 0) {
        requirements.working.forEach(service => {
            console.log(`   • ${service}`);
        });
    }

    if (requirements.critical.length > 0) {
        console.log(`\n❌ Missing (CRITICAL): ${requirements.critical.length}`);
        requirements.critical.forEach(req => {
            console.log(`   • ${req}`);
        });
    }

    if (requirements.optional.length > 0) {
        console.log(`\n⚠️  Missing (Optional): ${requirements.optional.length}`);
        requirements.optional.forEach(req => {
            console.log(`   • ${req}`);
        });
    }

    // === WHAT TO DO NEXT ===
    console.log('\n' + '='.repeat(80));
    console.log('🚀 WHAT TO DO NEXT');
    console.log('='.repeat(80));

    if (requirements.critical.length === 0) {
        console.log('\n✅ ALL CRITICAL REQUIREMENTS MET!');
        console.log('\nYou can now:');
        console.log('   1. Run: node test-system.js');
        console.log('   2. Start generating with Replicate');
        console.log('   3. Train brand LoRA models');
    } else {
        console.log('\n❌ MISSING CRITICAL REQUIREMENTS');
        console.log('\nTo fix:');

        if (requirements.critical.includes('Replicate API Token')) {
            console.log('\n1. Get Replicate API Token:');
            console.log('   → Go to: https://replicate.com');
            console.log('   → Sign up / Log in');
            console.log('   → Settings → API Tokens');
            console.log('   → Copy token');
            console.log('   → Add to .env: REPLICATE_API_TOKEN=r8_your_token_here');
        }

        if (requirements.critical.includes('Supabase')) {
            console.log('\n2. Setup Supabase:');
            console.log('   → Go to: https://supabase.com');
            console.log('   → Create new project');
            console.log('   → Copy URL and anon key');
            console.log('   → Add to .env:');
            console.log('     SUPABASE_URL=https://xxx.supabase.co');
            console.log('     SUPABASE_KEY=your_key_here');
            console.log('   → Run database-schema.sql in SQL Editor');
        }

        if (requirements.critical.includes('Gemini/Google API Key')) {
            console.log('\n3. Check existing Gemini key:');
            console.log('   → You should already have this for quality-backend.js');
            console.log('   → Check your .env for GEMINI_API_KEY or GOOGLE_API_KEY');
        }

        if (requirements.critical.includes('Anthropic API Key')) {
            console.log('\n4. Get Anthropic API Key:');
            console.log('   → Go to: https://console.anthropic.com');
            console.log('   → Get API key');
            console.log('   → Add to .env: ANTHROPIC_API_KEY=sk-ant-...');
        }
    }

    console.log('\n' + '='.repeat(80));

    // Exit with appropriate code
    if (requirements.critical.length > 0) {
        console.log('\n❌ Cannot proceed without critical requirements');
        process.exit(1);
    } else {
        console.log('\n✅ System ready to use!');
        process.exit(0);
    }
}

// Run checks
checkRequirements().catch(error => {
    console.error('\n❌ Error checking requirements:', error.message);
    process.exit(1);
});
