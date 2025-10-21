const { chromium } = require('playwright');

async function monitorAutonomousLearning() {
    console.log('🚀 Starting Real-Time Autonomous Learning Monitor\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Will show results after EACH generation completes');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 300
    });

    const page = await browser.newPage();

    let currentGeneration = 0;
    let completedGenerations = [];

    try {
        // Real-time console monitoring
        page.on('console', msg => {
            const text = msg.text();

            // Track which generation is starting
            if (text.includes('🔄') && text.includes('Starting generation')) {
                const match = text.match(/\[(\d+)\/10\]/);
                if (match) {
                    currentGeneration = parseInt(match[1]);
                    console.log('\n' + '='.repeat(70));
                    console.log(`🔄 GENERATION ${currentGeneration}/10 STARTING...`);
                    console.log('='.repeat(70));
                }
            }

            // Show success/failure immediately
            if (text.includes('✅') && text.includes('SUCCESS')) {
                const errorMatch = text.match(/(\d+) errors?/);
                if (errorMatch) {
                    const errors = parseInt(errorMatch[1]);
                    const perfect = errors === 0 ? ' 🏆 PERFECT!' : '';
                    console.log(`✅ Gen ${currentGeneration} COMPLETE: ${errors} errors${perfect}`);
                }
            }

            // Show what agent learned
            if (text.includes('📚 AGENT LEARNED')) {
                console.log(`   ${text}`);
            }

            // Show styling discoveries
            if (text.includes('🎨') && text.includes('accuracy')) {
                console.log(`   ${text}`);
            }
        });

        // Navigate and start
        const url = 'http://127.0.0.1:8765/nano-test.html';
        console.log('📂 Loading page...');
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        console.log('🤖 Clicking Auto-Learn (10x) button...\n');
        await page.click('#autoLearnBtn');

        // Monitor progress and extract results after each generation
        let lastReportedGen = 0;

        while (lastReportedGen < 10) {
            await page.waitForTimeout(3000);

            // Check how many generations have completed
            const status = await page.evaluate(() => {
                const results = typeof learningResults !== 'undefined' ? learningResults : [];
                const memory = JSON.parse(localStorage.getItem('agent_learning_memory') || '{}');

                return {
                    completedCount: results.length,
                    results: results,
                    goldRate: memory.stylingPatterns?.gold_gradient?.successRate || 0,
                    plainWhiteRate: memory.stylingPatterns?.plain_white?.successRate || 0,
                    plainColoredRate: memory.stylingPatterns?.plain_colored?.successRate || 0
                };
            });

            // Report on any new completed generations
            if (status.completedCount > lastReportedGen) {
                for (let i = lastReportedGen; i < status.completedCount; i++) {
                    const result = status.results[i];

                    console.log(`\n📊 GENERATION ${result.generationNumber} DETAILED RESULTS:`);
                    console.log(`   Errors: ${result.errorCount}`);
                    console.log(`   Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
                    console.log(`   Strategy: ${result.strategy}`);

                    if (result.verification && result.verification.issues && result.verification.issues.length > 0) {
                        console.log(`   Errors found:`);
                        result.verification.issues.forEach(issue => {
                            console.log(`      - ${issue}`);
                        });
                    } else {
                        console.log(`   🏆 PERFECT - No spelling errors!`);
                    }

                    console.log(`\n   Current Styling Accuracy:`);
                    console.log(`      Gold Gradient: ${status.goldRate.toFixed(1)}%`);
                    console.log(`      Plain White: ${status.plainWhiteRate.toFixed(1)}%`);
                    console.log(`      Plain Colored: ${status.plainColoredRate.toFixed(1)}%`);
                }

                lastReportedGen = status.completedCount;

                // Show running summary
                const successful = status.results.filter(r => r.success).length;
                const perfect = status.results.filter(r => r.errorCount === 0).length;

                console.log(`\n📈 RUNNING SUMMARY (${lastReportedGen}/10 complete):`);
                console.log(`   Success Rate: ${(successful/lastReportedGen*100).toFixed(1)}%`);
                console.log(`   Perfect: ${perfect}/${lastReportedGen}`);
                console.log(`   Failed: ${lastReportedGen - successful}/${lastReportedGen}`);
            }
        }

        // Final comprehensive report
        console.log('\n\n' + '═'.repeat(70));
        console.log('🎓 FINAL LEARNING ANALYSIS');
        console.log('═'.repeat(70) + '\n');

        const finalResults = await page.evaluate(() => {
            const results = typeof learningResults !== 'undefined' ? learningResults : [];
            const memory = JSON.parse(localStorage.getItem('agent_learning_memory') || '{}');

            return {
                results: results,
                memory: memory
            };
        });

        const successful = finalResults.results.filter(r => r.success);
        const perfect = finalResults.results.filter(r => r.errorCount === 0);
        const failed = finalResults.results.filter(r => !r.success);

        console.log('📊 FINAL STATISTICS:');
        console.log(`   Total Generations: ${finalResults.results.length}`);
        console.log(`   ✅ Successful (< 5 errors): ${successful.length} (${(successful.length/10*100).toFixed(1)}%)`);
        console.log(`   🏆 Perfect (0 errors): ${perfect.length}`);
        console.log(`   ❌ Failed (≥ 5 errors): ${failed.length}\n`);

        console.log('🎨 FINAL STYLING PATTERNS:');
        if (finalResults.memory.stylingPatterns) {
            for (const [style, data] of Object.entries(finalResults.memory.stylingPatterns)) {
                const rate = data.successRate || 0;
                const correct = data.totalTextInstances - data.errorCount;
                console.log(`   ${style}: ${rate.toFixed(1)}% (${correct}/${data.totalTextInstances} correct)`);
            }
        }

        console.log(`\n📚 Total Learned Patterns: ${finalResults.memory.globalLessons?.alwaysEmphasize?.length || 0}`);

        if (finalResults.memory.globalLessons?.alwaysEmphasize?.length > 0) {
            console.log('\n   Most Recent Learnings:');
            finalResults.memory.globalLessons.alwaysEmphasize.slice(-5).forEach(pattern => {
                console.log(`      - "${pattern.correct}" (not "${pattern.wrong}")`);
            });
        }

        console.log('\n' + '═'.repeat(70));
        console.log('✅ Testing complete! Browser will remain open for 30 seconds.');
        console.log('═'.repeat(70) + '\n');

        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('\n❌ Error during monitoring:', error);
    } finally {
        await browser.close();
        console.log('\n🔚 Browser closed. Test complete.');
    }
}

monitorAutonomousLearning().catch(console.error);
