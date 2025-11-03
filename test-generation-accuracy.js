#!/usr/bin/env node

/**
 * Test Generation Accuracy
 * Run 5 iterations per template to find patterns in Gemini's errors
 * Goal: 100% accurate generations with NO spelling errors
 */

import promptBuilder from './prompt-builder.js';

const templates = [
    { name: 'Daily Rate Update', builder: 'buildDailyRateUpdatePrompt' },
    { name: 'Market Report', builder: 'buildMarketUpdatePrompt' },
    { name: 'Rate Trends', builder: 'buildRateTrendsPrompt' },
    { name: 'Economic Outlook', builder: 'buildEconomicOutlookPrompt' }
];

const ITERATIONS_PER_TEMPLATE = 5;
const marketData = promptBuilder.getMarketData();

console.log('\n' + '='.repeat(70));
console.log('🎯 GENERATION ACCURACY TEST - ELIMINATING SPELLING ERRORS');
console.log('='.repeat(70));
console.log(`Testing ${templates.length} templates × ${ITERATIONS_PER_TEMPLATE} iterations = ${templates.length * ITERATIONS_PER_TEMPLATE} total generations`);
console.log('Goal: 100% perfect generations with NO errors\n');

const results = [];
const errorPatterns = {};

for (const template of templates) {
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`📋 TEMPLATE: ${template.name}`);
    console.log(`${'═'.repeat(70)}\n`);

    const templateResults = {
        name: template.name,
        iterations: [],
        perfectCount: 0,
        totalErrors: [],
        commonErrors: {}
    };

    for (let iteration = 1; iteration <= ITERATIONS_PER_TEMPLATE; iteration++) {
        console.log(`\n--- Iteration ${iteration}/${ITERATIONS_PER_TEMPLATE} ---\n`);

        try {
            // Build prompt
            const prompt = promptBuilder[template.builder](marketData, false);

            // Generate with quality backend (up to 5 attempts to get perfect)
            const response = await fetch('http://localhost:3001/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    templateName: template.name,
                    maxAttempts: 5 // Try up to 5 times to get perfect
                })
            });

            const result = await response.json();

            // Log results
            const status = result.success ? '✅' : '❌';
            console.log(`${status} Result: ${result.score}% (${result.attempts} attempt${result.attempts > 1 ? 's' : ''})`);

            if (result.success && result.score === 100) {
                console.log(`   🎉 PERFECT on attempt ${result.attempts}!`);
                templateResults.perfectCount++;
            } else {
                console.log(`   ⚠️  Not perfect after ${result.attempts} attempts`);
                if (result.errors && result.errors.length > 0) {
                    console.log('   Errors found:');
                    result.errors.forEach((error, idx) => {
                        console.log(`      ${idx + 1}. [${error.type}] ${error.issue}`);

                        // Track error patterns
                        const errorKey = `${error.type}:${error.issue.substring(0, 50)}`;
                        templateResults.commonErrors[errorKey] = (templateResults.commonErrors[errorKey] || 0) + 1;
                        errorPatterns[errorKey] = (errorPatterns[errorKey] || 0) + 1;

                        templateResults.totalErrors.push(error);
                    });
                }
            }

            // Save result
            templateResults.iterations.push({
                iteration: iteration,
                success: result.success,
                score: result.score,
                attempts: result.attempts,
                errors: result.errors || []
            });

            // Small delay between iterations
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error(`❌ Error in iteration ${iteration}:`, error.message);
            templateResults.iterations.push({
                iteration: iteration,
                success: false,
                score: 0,
                attempts: 0,
                errors: [{ type: 'test_error', issue: error.message }]
            });
        }
    }

    results.push(templateResults);

    // Template Summary
    const successRate = (templateResults.perfectCount / ITERATIONS_PER_TEMPLATE * 100).toFixed(1);
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`📊 ${template.name} Summary:`);
    console.log(`   Perfect: ${templateResults.perfectCount}/${ITERATIONS_PER_TEMPLATE} (${successRate}%)`);
    console.log(`   Total Errors: ${templateResults.totalErrors.length}`);

    if (Object.keys(templateResults.commonErrors).length > 0) {
        console.log('   Most Common Errors:');
        const sortedErrors = Object.entries(templateResults.commonErrors)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        sortedErrors.forEach(([error, count]) => {
            console.log(`      • ${error} (${count}x)`);
        });
    }
}

// OVERALL SUMMARY
console.log(`\n\n${'═'.repeat(70)}`);
console.log('📈 OVERALL ACCURACY REPORT');
console.log(`${'═'.repeat(70)}\n`);

const totalGenerations = templates.length * ITERATIONS_PER_TEMPLATE;
const totalPerfect = results.reduce((sum, t) => sum + t.perfectCount, 0);
const totalErrors = results.reduce((sum, t) => sum + t.totalErrors.length, 0);
const overallSuccessRate = (totalPerfect / totalGenerations * 100).toFixed(1);

console.log(`Total Generations: ${totalGenerations}`);
console.log(`Perfect (100%): ${totalPerfect} (${overallSuccessRate}%)`);
console.log(`Total Errors Detected: ${totalErrors}\n`);

// Per-template breakdown
console.log('Per-Template Success Rates:');
results.forEach(template => {
    const rate = (template.perfectCount / ITERATIONS_PER_TEMPLATE * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(rate / 5)) + '░'.repeat(20 - Math.round(rate / 5));
    console.log(`  ${template.name.padEnd(20)} ${bar} ${rate}%`);
});

// ERROR ANALYSIS
console.log(`\n${'═'.repeat(70)}`);
console.log('🔍 ERROR PATTERN ANALYSIS');
console.log(`${'═'.repeat(70)}\n`);

// Initialize categories outside the if block so it's always defined
const categories = {
    'spelling': 0,
    'typo': 0,
    'truncation': 0,
    'quotation': 0,
    'data': 0,
    'other': 0
};

if (Object.keys(errorPatterns).length > 0) {
    console.log('Most Common Errors Across All Templates:\n');
    const sortedPatterns = Object.entries(errorPatterns)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    sortedPatterns.forEach(([pattern, count], idx) => {
        const [type, issue] = pattern.split(':');
        console.log(`${idx + 1}. [${type}] ${issue}... (${count}x)`);
    });

    // Categorize errors
    console.log('\n\nError Categories:\n');

    Object.keys(errorPatterns).forEach(pattern => {
        const [type] = pattern.split(':');
        const count = errorPatterns[pattern];
        if (type.includes('spell')) categories.spelling += count;
        else if (type.includes('typo')) categories.typo += count;
        else if (type.includes('truncat')) categories.truncation += count;
        else if (type.includes('quot')) categories.quotation += count;
        else if (type.includes('data')) categories.data += count;
        else categories.other += count;
    });

    Object.entries(categories).forEach(([cat, count]) => {
        if (count > 0) {
            const pct = (count / totalErrors * 100).toFixed(1);
            console.log(`  ${cat.padEnd(15)} ${count.toString().padStart(3)} errors (${pct}%)`);
        }
    });

} else {
    console.log('🎉 NO ERRORS DETECTED - ALL GENERATIONS WERE PERFECT!\n');
}

// RECOMMENDATIONS
console.log(`\n${'═'.repeat(70)}`);
console.log('💡 RECOMMENDATIONS FOR IMPROVEMENT');
console.log(`${'═'.repeat(70)}\n`);

if (overallSuccessRate < 100) {
    console.log('Based on error analysis, we need to:\n');

    if (categories.spelling > 0 || categories.typo > 0) {
        console.log('1. 📝 PROMPT IMPROVEMENT FOR SPELLING:');
        console.log('   - Add explicit spelling examples in prompts');
        console.log('   - Use simpler, shorter words where possible');
        console.log('   - Add "CRITICAL: Spell check every word" instruction\n');
    }

    if (categories.truncation > 0 || categories.data > 0) {
        console.log('2. 📊 FIX DATA TRUNCATION:');
        console.log('   - Make labels more explicit (e.g., "Treasury Yields: 10-Year 4.132 AND 30-Year 4.721")');
        console.log('   - Add word count limits to prevent overflow/truncation');
        console.log('   - Test with shorter overall prompts\n');
    }

    if (categories.quotation > 0) {
        console.log('3. 📖 QUOTATION MARKS:');
        console.log('   - Use ASCII quotes consistently in prompts');
        console.log('   - Add "MUST use BOTH opening \" and closing \"" instruction\n');
    }

    console.log('4. 🔄 NEXT STEPS:');
    console.log('   - Review prompt-builder.js and simplify problematic text');
    console.log('   - Add more explicit instructions for common errors');
    console.log('   - Re-test after prompt improvements');

} else {
    console.log('🎉 PERFECT! All generations are 100% accurate!');
    console.log('   No prompt improvements needed at this time.\n');
}

console.log(`\n${'═'.repeat(70)}\n`);

// Save detailed results
const fs = await import('fs/promises');
await fs.writeFile(
    '/tmp/generation-accuracy-report.json',
    JSON.stringify({ results, errorPatterns, categories, stats: { totalGenerations, totalPerfect, totalErrors, overallSuccessRate } }, null, 2)
);
console.log('📄 Detailed report saved to: /tmp/generation-accuracy-report.json\n');
