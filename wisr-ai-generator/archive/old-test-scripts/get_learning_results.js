// Automated script to retrieve autonomous learning results from localStorage
// This eliminates the need for manual console log copy-pasting

const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('🔍 Retrieving autonomous learning results...\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // Navigate to nano-test.html
        const filePath = 'file://' + path.resolve(__dirname, 'nano-test.html');
        await page.goto(filePath);

        // Wait for page to load
        await page.waitForTimeout(1000);

        // Retrieve results from localStorage
        const results = await page.evaluate(() => {
            const data = localStorage.getItem('autonomousLearning_lastResults');
            return data ? JSON.parse(data) : null;
        });

        if (!results) {
            console.log('❌ No autonomous learning results found in localStorage');
            console.log('   Run autonomous learning first by clicking "Auto-Learn (10x)" button\n');
            await browser.close();
            return;
        }

        // Display results
        console.log('═══════════════════════════════════════');
        console.log('📊 AUTONOMOUS LEARNING RESULTS');
        console.log('═══════════════════════════════════════');
        console.log(`\n⏰ Timestamp: ${results.timestamp}`);
        console.log(`\n📈 SUCCESS RATE: ${results.summary.successRate}`);
        console.log(`   Total Generations: ${results.summary.total}`);
        console.log(`   ✅ Successful: ${results.summary.successful}`);
        console.log(`   🏆 Perfect (0 errors): ${results.summary.perfect}`);
        console.log(`   ❌ Failed: ${results.summary.failed}`);

        if (Object.keys(results.stylingPatterns).length > 0) {
            console.log(`\n🎨 TEXT STYLING PATTERNS:`);
            for (const [style, data] of Object.entries(results.stylingPatterns)) {
                console.log(`   ${style}:`);
                console.log(`     Success Rate: ${data.successRate}`);
                console.log(`     Accuracy: ${data.accuracy} correct`);
                console.log(`     Errors: ${data.errorCount}`);
            }
        }

        console.log(`\n📋 INDIVIDUAL GENERATION RESULTS:`);
        results.results.forEach(r => {
            const icon = r.success ? '✅' : '❌';
            const status = r.success ? 'SUCCESS' : 'FAILED';
            console.log(`   ${icon} Generation ${r.generationNumber}: ${status}`);
            console.log(`      Template: ${r.templateName}`);
            console.log(`      Strategy: ${r.strategy}`);
            console.log(`      Errors: ${r.errorCount}`);

            if (r.issues && r.issues.length > 0 && r.issues.length <= 5) {
                console.log(`      Issues:`);
                r.issues.forEach(issue => {
                    console.log(`        - ${issue}`);
                });
            } else if (r.issues && r.issues.length > 5) {
                console.log(`      Issues: ${r.issues.length} total (showing first 5)`);
                r.issues.slice(0, 5).forEach(issue => {
                    console.log(`        - ${issue}`);
                });
            }
            console.log('');
        });

        console.log('═══════════════════════════════════════\n');

        // Also write to JSON file for easy inspection
        const fs = require('fs');
        const outputPath = path.resolve(__dirname, 'learning_results_latest.json');
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
        console.log(`💾 Full results saved to: learning_results_latest.json\n`);

    } catch (error) {
        console.error('❌ Error retrieving results:', error.message);
    } finally {
        await browser.close();
    }
})();
