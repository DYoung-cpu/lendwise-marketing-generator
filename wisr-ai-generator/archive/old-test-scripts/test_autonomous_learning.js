const { chromium } = require('playwright');

async function testAutonomousLearning() {
    console.log('🚀 Starting Playwright test for autonomous learning...');

    const browser = await chromium.launch({
        headless: false,  // Show browser so you can see it working
        slowMo: 1000      // Slow down actions for visibility
    });

    const page = await browser.newPage();

    try {
        // Navigate to the HTML file via HTTP server
        const url = 'http://127.0.0.1:8765/nano-test.html';
        console.log('📂 Loading:', url);
        await page.goto(url, { waitUntil: 'networkidle' });

        // Wait for page to load
        await page.waitForTimeout(2000);

        // Listen to console logs from the page
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('AGENT') || text.includes('AUTONOMOUS') || text.includes('SUCCESS') || text.includes('FAILED')) {
                console.log('🌐 Browser:', text);
            }
        });

        // Click the Auto-Learn button
        console.log('🤖 Clicking Auto-Learn (10x) button...');
        await page.click('#autoLearnBtn');

        // Wait for learning to complete (monitor progress)
        console.log('⏳ Waiting for autonomous learning to complete (this takes 2-3 minutes)...');

        // Check every 10 seconds if learning is complete
        let isComplete = false;
        let checkCount = 0;
        const maxChecks = 30; // 5 minutes max

        while (!isComplete && checkCount < maxChecks) {
            await page.waitForTimeout(10000); // Wait 10 seconds

            // Check if learning results are displayed
            const resultsVisible = await page.evaluate(() => {
                const resultsDiv = document.getElementById('learningResults');
                return resultsDiv && resultsDiv.style.display !== 'none';
            });

            if (resultsVisible) {
                console.log('✅ Learning complete! Results are visible.');
                isComplete = true;
            } else {
                checkCount++;
                console.log(`⏳ Still running... (check ${checkCount}/${maxChecks})`);
            }
        }

        if (!isComplete) {
            console.log('⚠️ Timeout waiting for results. Checking status anyway...');
        }

        // Wait a bit more to ensure all results are rendered
        await page.waitForTimeout(3000);

        // Get agent stats from browser console
        console.log('\n📊 Retrieving agent statistics...');
        const stats = await page.evaluate(() => {
            const memory = JSON.parse(localStorage.getItem('agent_learning_memory') || '{}');

            // Call showAgentStats to get formatted output
            let statsOutput = '\n=== AGENT STATISTICS ===\n\n';

            if (memory.stats) {
                statsOutput += `Total Generations: ${memory.stats.totalGenerations}\n`;
                statsOutput += `Successful: ${memory.stats.successfulGenerations}\n`;
                statsOutput += `Success Rate: ${(memory.stats.currentSuccessRate || 0).toFixed(1)}%\n\n`;
            }

            if (memory.strategies) {
                statsOutput += 'STRATEGY PERFORMANCE:\n';
                for (const [name, data] of Object.entries(memory.strategies)) {
                    const rate = data.totalAttempts > 0 ? (data.successCount / data.totalAttempts * 100).toFixed(1) : 0;
                    statsOutput += `  ${name}: ${data.successCount}/${data.totalAttempts} (${rate}%)\n`;
                }
                statsOutput += '\n';
            }

            if (memory.stylingPatterns) {
                statsOutput += 'STYLING PATTERNS:\n';
                for (const [style, data] of Object.entries(memory.stylingPatterns)) {
                    statsOutput += `  ${style}: ${data.successRate?.toFixed(1) || 0}% (${data.totalTextInstances - data.errorCount}/${data.totalTextInstances} correct)\n`;
                }
                statsOutput += '\n';
            }

            if (memory.globalLessons && memory.globalLessons.alwaysEmphasize) {
                statsOutput += `Learned Spelling Patterns: ${memory.globalLessons.alwaysEmphasize.length}\n`;
            }

            return statsOutput;
        });

        console.log(stats);

        // Get learning results summary
        const learningResults = await page.evaluate(() => {
            if (typeof learningResults !== 'undefined') {
                const successful = learningResults.filter(r => r.success);
                const perfect = learningResults.filter(r => r.errorCount === 0);

                return {
                    total: learningResults.length,
                    successful: successful.length,
                    perfect: perfect.length,
                    failed: learningResults.length - successful.length,
                    results: learningResults.map(r => ({
                        gen: r.generationNumber,
                        success: r.success,
                        errors: r.errorCount,
                        strategy: r.strategy
                    }))
                };
            }
            return null;
        });

        if (learningResults) {
            console.log('\n=== AUTONOMOUS LEARNING RESULTS ===\n');
            console.log(`Total Generations: ${learningResults.total}`);
            console.log(`✅ Successful (< 5 errors): ${learningResults.successful} (${(learningResults.successful/learningResults.total*100).toFixed(1)}%)`);
            console.log(`🏆 Perfect (0 errors): ${learningResults.perfect}`);
            console.log(`❌ Failed (≥ 5 errors): ${learningResults.failed}\n`);

            console.log('Individual Results:');
            learningResults.results.forEach(r => {
                const status = r.success ? '✅' : '❌';
                console.log(`  ${status} Gen ${r.gen}: ${r.errors} errors (${r.strategy})`);
            });
        }

        console.log('\n✅ Test complete! Browser will remain open for inspection.');
        console.log('Press Ctrl+C when ready to close.');

        // Keep browser open for inspection
        await page.waitForTimeout(300000); // 5 minutes

    } catch (error) {
        console.error('❌ Error during test:', error);
    } finally {
        await browser.close();
    }
}

testAutonomousLearning().catch(console.error);
