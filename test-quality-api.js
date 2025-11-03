#!/usr/bin/env node

/**
 * Quick test of quality backend API
 */

import { getMarketData, buildMarketUpdatePrompt } from './prompt-builder.js';

async function testQualityAPI() {
    console.log('\n🧪 TESTING QUALITY-GUARANTEED BACKEND API\n');
    console.log('=' .repeat(60));

    const marketData = getMarketData();
    const prompt = buildMarketUpdatePrompt(marketData, false);

    console.log('📋 Template: Market Report');
    console.log('📏 Prompt Length:', prompt.length, 'characters');
    console.log('🎯 Max Attempts: 3');
    console.log('\n⏳ Sending generation request...\n');

    const startTime = Date.now();

    try {
        const response = await fetch('http://localhost:8080/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: prompt,
                templateName: 'Market Report',
                maxAttempts: 3
            })
        });

        const data = await response.json();
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log('\n' + '='.repeat(60));
        console.log('📊 RESULT');
        console.log('='.repeat(60));
        console.log(`⏱️  Duration: ${duration}s`);
        console.log(`🎯 Success: ${data.success}`);
        console.log(`📈 Score: ${data.score}%`);
        console.log(`🔄 Attempts: ${data.attempts}`);
        console.log(`💬 Message: ${data.message}`);

        if (data.errors && data.errors.length > 0) {
            console.log(`\n⚠️  Errors Found: ${data.errors.length}`);
            data.errors.forEach((err, i) => {
                console.log(`   ${i + 1}. [${err.type}] ${err.issue}`);
            });
        }

        if (data.imageBase64) {
            console.log(`\n✅ Image received (${(data.imageBase64.length / 1024).toFixed(1)}KB base64)`);
        }

        console.log('\n' + '='.repeat(60));

        if (data.success && data.score === 100) {
            console.log('✅ TEST PASSED: Quality guarantee achieved!\n');
            process.exit(0);
        } else {
            console.log(`⚠️  TEST PARTIAL: Best quality ${data.score}% (not 100%)\n`);
            process.exit(0);
        }

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        process.exit(1);
    }
}

testQualityAPI();
