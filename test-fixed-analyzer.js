#!/usr/bin/env node

/**
 * Test Fixed Vision Analyzer
 * Re-analyze the images that got false positives before the fix
 */

import VisionAnalyzer from './vision-analyzer.js';
import fs from 'fs/promises';

const analyzer = new VisionAnalyzer();

const testImages = [
    {
        path: '/tmp/test-Market-Report-iter1.png',
        template: 'Market Report',
        expectedError: 'Treasury Yields shows "30-721" instead of "30-Year 4.721"',
        shouldPass: false
    },
    {
        path: '/tmp/test-Market-Report-iter2.png',
        template: 'Market Report',
        expectedError: 'Treasury Yields shows "30-721" instead of "30-Year 4.721"',
        shouldPass: false
    },
    {
        path: '/tmp/test-Economic-Outlook-iter1.png',
        template: 'Economic Outlook',
        expectedError: 'None - this should be perfect',
        shouldPass: true
    }
];

console.log('\n' + '='.repeat(70));
console.log('🔬 TESTING FIXED VISION ANALYZER');
console.log('='.repeat(70));
console.log('Re-analyzing images that previously got FALSE POSITIVES\n');

const results = [];

for (const test of testImages) {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`📸 Image: ${test.path}`);
    console.log(`📋 Template: ${test.template}`);
    console.log(`🎯 Expected: ${test.shouldPass ? 'PASS (100%)' : 'FAIL (catch error)'}`);
    console.log(`⚠️  Known Issue: ${test.expectedError}`);
    console.log(`${'─'.repeat(70)}\n`);

    try {
        // Check if image exists
        await fs.access(test.path);

        // Analyze with FIXED vision analyzer
        console.log('🔍 Analyzing with FIXED vision analyzer...\n');
        const analysis = await analyzer.analyzeImage(test.path, test.template);

        // Display results
        console.log('📊 RESULTS:');
        console.log(`   Success: ${analysis.success ? '✅' : '❌'}`);
        console.log(`   Score: ${analysis.score}%`);
        console.log(`   Errors Found: ${analysis.errors.length}`);

        if (analysis.errors.length > 0) {
            console.log('\n⚠️  ERRORS DETECTED:');
            analysis.errors.forEach((error, idx) => {
                console.log(`   ${idx + 1}. [${error.type}] ${error.issue}`);
                console.log(`      Severity: ${error.severity || 'unknown'}`);
            });
        }

        console.log('\n💬 Full Analysis:');
        console.log(`   ${analysis.analysis.replace(/\n/g, '\n   ')}`);

        // Determine if fix worked
        const fixWorked = test.shouldPass ?
            (analysis.success && analysis.score === 100) :
            (!analysis.success && analysis.errors.length > 0);

        console.log('\n🎯 FIX VERIFICATION:');
        if (fixWorked) {
            console.log(`   ✅ CORRECT - Fixed analyzer ${test.shouldPass ? 'correctly passed' : 'correctly caught the error'}!`);
        } else {
            console.log(`   ❌ FAILED - Fixed analyzer ${test.shouldPass ? 'incorrectly failed' : 'STILL missing the error'}!`);
        }

        // Check if it caught the specific Treasury error
        if (!test.shouldPass) {
            const caughtTreasuryError = analysis.errors.some(err =>
                err.issue.toLowerCase().includes('treasury') ||
                err.issue.toLowerCase().includes('30-721') ||
                err.issue.toLowerCase().includes('30-year') ||
                err.issue.toLowerCase().includes('truncat')
            );

            if (caughtTreasuryError) {
                console.log('   🎉 SPECIFICALLY caught the Treasury truncation error!');
            } else {
                console.log('   ⚠️  Did NOT specifically mention Treasury truncation issue');
            }
        }

        results.push({
            image: test.path,
            template: test.template,
            expectedToPass: test.shouldPass,
            actuallyPassed: analysis.success,
            fixWorked: fixWorked,
            errors: analysis.errors,
            score: analysis.score
        });

    } catch (error) {
        console.error(`❌ Error analyzing ${test.path}:`, error.message);
        results.push({
            image: test.path,
            template: test.template,
            expectedToPass: test.shouldPass,
            actuallyPassed: null,
            fixWorked: false,
            errors: [{ type: 'test_error', issue: error.message }],
            score: 0
        });
    }
}

// Summary
console.log(`\n\n${'='.repeat(70)}`);
console.log('📈 FIX VERIFICATION SUMMARY');
console.log(`${'='.repeat(70)}\n`);

const totalTests = results.length;
const fixesWorked = results.filter(r => r.fixWorked).length;
const fixRate = ((fixesWorked / totalTests) * 100).toFixed(1);

console.log(`Total Tests: ${totalTests}`);
console.log(`Fixes Worked: ${fixesWorked}/${totalTests} (${fixRate}%)`);
console.log(`Fixes Failed: ${totalTests - fixesWorked}/${totalTests}\n`);

if (fixRate === '100.0') {
    console.log('🎉 SUCCESS! The vision analyzer fix is working correctly!');
    console.log('✅ All false positives have been eliminated!');
} else {
    console.log('⚠️  WARNING: Some tests still failing. Review results above.');
}

console.log(`\n${'='.repeat(70)}\n`);
