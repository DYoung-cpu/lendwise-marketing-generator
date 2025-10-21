const { chromium } = require('playwright');

async function pollLearningResults() {
    console.log('🔍 Connecting to existing browser session...\n');

    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const contexts = browser.contexts();

    if (contexts.length === 0) {
        console.log('❌ No browser contexts found. Make sure Chrome is running with remote debugging.');
        console.log('   Start Chrome with: chrome.exe --remote-debugging-port=9222');
        await browser.close();
        return;
    }

    const context = contexts[0];
    const pages = context.pages();
    const page = pages.find(p => p.url().includes('nano-test.html')) || pages[0];

    console.log(`📊 Monitoring: ${page.url()}\n`);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('REAL-TIME AUTONOMOUS LEARNING MONITOR');
    console.log('═══════════════════════════════════════════════════════════════\n');

    let lastReportedCount = 0;

    try {
        // Poll every 3 seconds
        while (lastReportedCount < 10) {
            await new Promise(resolve => setTimeout(resolve, 3000));

            const status = await page.evaluate(() => {
                const results = typeof learningResults !== 'undefined' ? learningResults : [];
                const memory = JSON.parse(localStorage.getItem('agent_learning_memory') || '{}');

                return {
                    completedCount: results.length,
                    results: results,
                    memory: memory
                };
            });

            // Report new completions
            if (status.completedCount > lastReportedCount) {
                for (let i = lastReportedCount; i < status.completedCount; i++) {
                    const result = status.results[i];
                    const gen = result.generationNumber;
                    const errors = result.errorCount;
                    const isPerfect = errors === 0;
                    const status_emoji = result.success ? '✅' : '❌';
                    const perfect_emoji = isPerfect ? ' 🏆' : '';

                    console.log('\n' + '─'.repeat(70));
                    console.log(`${status_emoji}${perfect_emoji} GENERATION ${gen}/10 COMPLETE`);
                    console.log('─'.repeat(70));
                    console.log(`   Errors: ${errors}`);
                    console.log(`   Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
                    console.log(`   Strategy: ${result.strategy}`);

                    if (result.verification && result.verification.issues) {
                        if (result.verification.issues.length > 0) {
                            console.log(`\n   ❌ Spelling Errors Found:`);
                            result.verification.issues.forEach(issue => {
                                console.log(`      • ${issue}`);
                            });
                        } else {
                            console.log(`\n   🏆 PERFECT - Zero spelling errors!`);
                        }
                    }

                    // Show what was learned
                    if (errors > 0 && status.memory.globalLessons) {
                        const recentLearned = status.memory.globalLessons.alwaysEmphasize.slice(-errors);
                        if (recentLearned.length > 0) {
                            console.log(`\n   📚 Agent Learned:`);
                            recentLearned.forEach(pattern => {
                                console.log(`      • "${pattern.correct}" (not "${pattern.wrong}")`);
                            });
                        }
                    }

                    // Show current styling accuracy
                    if (status.memory.stylingPatterns) {
                        console.log(`\n   🎨 Current Styling Accuracy:`);
                        for (const [style, data] of Object.entries(status.memory.stylingPatterns)) {
                            const rate = data.successRate || 0;
                            const correct = data.totalTextInstances - data.errorCount;
                            console.log(`      ${style}: ${rate.toFixed(1)}% (${correct}/${data.totalTextInstances})`);
                        }
                    }
                }

                lastReportedCount = status.completedCount;

                // Show running summary
                const successful = status.results.filter(r => r.success).length;
                const perfect = status.results.filter(r => r.errorCount === 0).length;
                const failed = status.results.filter(r => !r.success).length;

                console.log(`\n📈 RUNNING SUMMARY (${lastReportedCount}/10):`);
                console.log(`   Success Rate: ${(successful/lastReportedCount*100).toFixed(1)}% (${successful}/${lastReportedCount})`);
                console.log(`   Perfect: ${perfect}/${lastReportedCount}`);
                console.log(`   Failed: ${failed}/${lastReportedCount}`);
                console.log('');
            }
        }

        // Final report
        console.log('\n' + '═'.repeat(70));
        console.log('🎓 FINAL ANALYSIS');
        console.log('═'.repeat(70) + '\n');

        const finalStatus = await page.evaluate(() => {
            const results = typeof learningResults !== 'undefined' ? learningResults : [];
            const memory = JSON.parse(localStorage.getItem('agent_learning_memory') || '{}');
            return { results, memory };
        });

        const successful = finalStatus.results.filter(r => r.success);
        const perfect = finalStatus.results.filter(r => r.errorCount === 0);
        const failed = finalStatus.results.filter(r => !r.success);

        console.log('📊 FINAL STATISTICS:');
        console.log(`   Total: 10`);
        console.log(`   ✅ Successful: ${successful.length} (${(successful.length/10*100).toFixed(1)}%)`);
        console.log(`   🏆 Perfect: ${perfect.length} (${(perfect.length/10*100).toFixed(1)}%)`);
        console.log(`   ❌ Failed: ${failed.length} (${(failed.length/10*100).toFixed(1)}%)\n`);

        console.log('🎨 FINAL STYLING PATTERNS:');
        for (const [style, data] of Object.entries(finalStatus.memory.stylingPatterns)) {
            const rate = data.successRate || 0;
            const correct = data.totalTextInstances - data.errorCount;
            console.log(`   ${style}: ${rate.toFixed(1)}% (${correct}/${data.totalTextInstances})`);
        }

        console.log(`\n📚 Total Learned Patterns: ${finalStatus.memory.globalLessons?.alwaysEmphasize?.length || 0}`);

        console.log('\n' + '═'.repeat(70));
        console.log('✅ Monitoring complete!');
        console.log('═'.repeat(70) + '\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    await browser.close();
}

pollLearningResults().catch(console.error);
