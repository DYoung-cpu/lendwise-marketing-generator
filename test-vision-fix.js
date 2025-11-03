#!/usr/bin/env node

/**
 * Test if updated vision analyzer catches the Treasury error
 */

import VisionAnalyzer from './vision-analyzer.js';
import fs from 'fs/promises';

async function testVisionFix() {
    console.log('\n🧪 TESTING UPDATED VISION ANALYZER\n');
    console.log('Testing Economic Outlook image that was incorrectly passed...\n');

    // Copy the downloaded image to a test location
    const sourcePath = '/mnt/c/Users/dyoun/Downloads/download (68).png';
    const testPath = '/tmp/test-economic-outlook.png';

    await fs.copyFile(sourcePath, testPath);
    console.log('✅ Test image copied\n');

    const vision = new VisionAnalyzer();
    const result = await vision.analyzeImage(testPath, 'Economic Outlook');

    console.log('\n' + '='.repeat(60));
    console.log('📊 ANALYSIS RESULT');
    console.log('='.repeat(60));
    console.log(`Success: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Score: ${result.score}%`);
    console.log(`Errors Found: ${result.errors.length}`);

    if (result.errors.length > 0) {
        console.log('\n⚠️  Issues Detected:');
        result.errors.forEach((err, i) => {
            console.log(`   ${i + 1}. [${err.type}] ${err.issue}`);
        });
    }

    console.log('\n' + '='.repeat(60));

    if (result.errors.length > 0 && result.errors.some(e => e.issue.includes('4.132') || e.issue.includes('Treasury'))) {
        console.log('✅ SUCCESS: Updated analyzer now catches Treasury errors!\n');
    } else if (!result.success) {
        console.log('⚠️  Vision analyzer found other errors\n');
    } else {
        console.log('❌ FAILED: Analyzer still missed the Treasury error\n');
    }

    // Cleanup
    await fs.unlink(testPath);
}

testVisionFix().catch(console.error);
