#!/usr/bin/env node

/**
 * Test Vision Validation
 * Runs 2 generations for each template and logs vision analyzer results
 */

import promptBuilder from './prompt-builder.js';

const templates = [
    { name: 'Daily Rate Update', builder: 'buildDailyRateUpdatePrompt' },
    { name: 'Market Report', builder: 'buildMarketUpdatePrompt' },
    { name: 'Rate Trends', builder: 'buildRateTrendsPrompt' },
    { name: 'Economic Outlook', builder: 'buildEconomicOutlookPrompt' }
];

const marketData = promptBuilder.getMarketData();

console.log('\n' + '='.repeat(70));
console.log('🧪 VISION VALIDATION TEST');
console.log('='.repeat(70));
console.log(`Testing ${templates.length} templates × 2 iterations = ${templates.length * 2} total generations\n`);

const results = [];

for (const template of templates) {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`📋 TEMPLATE: ${template.name}`);
    console.log(`${'─'.repeat(70)}\n`);

    for (let iteration = 1; iteration <= 2; iteration++) {
        console.log(`\n--- Iteration ${iteration}/2 ---\n`);

        try {
            // Build prompt
            const prompt = promptBuilder[template.builder](marketData, false);
            console.log(`✅ Prompt built (${prompt.length} chars)`);

            // Make API call to quality backend
            const response = await fetch('http://localhost:3001/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    templateName: template.name,
                    maxAttempts: 1 // Only 1 attempt per test to see raw results
                })
            });

            const result = await response.json();

            // Log results
            console.log('\n📊 RESULTS:');
            console.log(`   Success: ${result.success ? '✅' : '❌'}`);
            console.log(`   Score: ${result.score}%`);
            console.log(`   Attempts: ${result.attempts}`);

            if (result.errors && result.errors.length > 0) {
                console.log('\n⚠️ ERRORS DETECTED BY VISION ANALYZER:');
                result.errors.forEach((error, idx) => {
                    console.log(`   ${idx + 1}. [${error.type}] ${error.issue}`);
                    console.log(`      Severity: ${error.severity || 'unknown'}`);
                });
            } else {
                console.log('\n✅ NO ERRORS - Vision analyzer says this is PERFECT');
            }

            if (result.analysis) {
                console.log('\n💬 Vision Analyzer Full Analysis:');
                console.log(`   ${result.analysis.replace(/\n/g, '\n   ')}`);
            }

            // Save image for manual review
            if (result.imageBase64) {
                const fs = await import('fs/promises');
                const imagePath = `/tmp/test-${template.name.replace(/\s+/g, '-')}-iter${iteration}.png`;
                await fs.writeFile(imagePath, Buffer.from(result.imageBase64, 'base64'));
                console.log(`\n💾 Image saved: ${imagePath}`);
                console.log('   👁️  MANUAL REVIEW REQUIRED - Please check this image yourself!');
            }

            // Store result
            results.push({
                template: template.name,
                iteration: iteration,
                success: result.success,
                score: result.score,
                errors: result.errors || [],
                imagePath: `/tmp/test-${template.name.replace(/\s+/g, '-')}-iter${iteration}.png`
            });

        } catch (error) {
            console.error(`❌ Error testing ${template.name} iteration ${iteration}:`, error.message);
            results.push({
                template: template.name,
                iteration: iteration,
                success: false,
                score: 0,
                errors: [{ type: 'test_error', issue: error.message }],
                imagePath: null
            });
        }

        // Small delay between iterations
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

// Summary Report
console.log(`\n\n${'='.repeat(70)}`);
console.log('📈 SUMMARY REPORT');
console.log(`${'='.repeat(70)}\n`);

let totalTests = results.length;
let perfectCount = results.filter(r => r.success && r.score === 100).length;
let errorCount = results.filter(r => r.errors.length > 0).length;

console.log(`Total Tests: ${totalTests}`);
console.log(`Perfect (100%): ${perfectCount} (${((perfectCount/totalTests)*100).toFixed(1)}%)`);
console.log(`With Errors: ${errorCount} (${((errorCount/totalTests)*100).toFixed(1)}%)`);

console.log('\n📋 DETAILED RESULTS:\n');

templates.forEach(template => {
    const templateResults = results.filter(r => r.template === template.name);
    console.log(`${template.name}:`);
    templateResults.forEach(r => {
        const status = r.success ? '✅' : '❌';
        const errorStr = r.errors.length > 0 ? ` (${r.errors.length} errors)` : '';
        console.log(`  Iteration ${r.iteration}: ${status} ${r.score}%${errorStr}`);
        if (r.errors.length > 0) {
            r.errors.forEach(err => {
                console.log(`    - [${err.type}] ${err.issue}`);
            });
        }
        console.log(`    Image: ${r.imagePath}`);
    });
    console.log('');
});

console.log(`\n${'='.repeat(70)}`);
console.log('🔍 NEXT STEPS:');
console.log(`${'='.repeat(70)}\n`);
console.log('1. Manually review each saved image in /tmp/test-*.png');
console.log('2. Compare your findings with the Vision Analyzer results above');
console.log('3. Identify any false positives (Vision says ✅ but you see errors)');
console.log('4. Identify any false negatives (Vision says ❌ but image is perfect)');
console.log('\nThis will tell us if the Vision Analyzer validation is accurate.\n');

// Save results to JSON for analysis
const fs = await import('fs/promises');
await fs.writeFile(
    '/tmp/vision-validation-test-results.json',
    JSON.stringify(results, null, 2)
);
console.log('📄 Full results saved to: /tmp/vision-validation-test-results.json\n');
