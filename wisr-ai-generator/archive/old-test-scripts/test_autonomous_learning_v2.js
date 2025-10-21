const { chromium } = require('playwright');

async function testAutonomousLearning() {
    console.log('🚀 Starting improved Playwright test...');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    const page = await browser.newPage();

    // Track generation progress
    let generationCount = 0;
    let learningComplete = false;
    const consoleMessages = [];

    try {
        // Capture ALL console messages
        page.on('console', msg => {
            const text = msg.text();
            consoleMessages.push(text);

            // Track progress
            if (text.includes('[') && text.includes('/10]')) {
                const match = text.match(/\[(\d+)\/10\]/);
                if (match) {
                    generationCount = parseInt(match[1]);
                    console.log(`📊 Progress: ${generationCount}/10 generations complete`);
                }
            }

            // Detect completion
            if (text.includes('LEARNING ANALYSIS') || text.includes('Displaying top')) {
                learningComplete = true;
                console.log('✅ Learning complete detected!');
            }

            // Show important messages
            if (text.includes('SUCCESS') || text.includes('FAILED') ||
                text.includes('STYLING PATTERN') || text.includes('accuracy')) {
                console.log(`🌐 ${text}`);
            }
        });

        // Navigate to page
        const url = 'http://127.0.0.1:8765/nano-test.html';
        console.log('📂 Loading:', url);
        await page.goto(url, { waitUntil: 'networkidle' });

        await page.waitForTimeout(2000);

        // Click Auto-Learn button
        console.log('🤖 Clicking Auto-Learn (10x) button...');
        await page.click('#autoLearnBtn');

        console.log('⏳ Waiting for 10 generations to complete...\n');

        // Wait for learning to complete (poll every 2 seconds)
        let attempts = 0;
        const maxAttempts = 150; // 5 minutes max

        while (!learningComplete && attempts < maxAttempts) {
            await page.waitForTimeout(2000);
            attempts++;

            // Check if we've reached 10 generations
            if (generationCount >= 10) {
                console.log('⏳ All generations complete, waiting for analysis...');
                await page.waitForTimeout(5000); // Extra time for analysis
                break;
            }
        }

        // Extract final results from browser
        console.log('\n📊 Extracting results from browser...\n');

        const results = await page.evaluate(() => {
            // Get agent stats from localStorage
            const memory = JSON.parse(localStorage.getItem('agent_learning_memory') || '{}');

            // Get learning results from global variable
            const learningData = typeof learningResults !== 'undefined' ? learningResults : null;

            return {
                memory: memory,
                learningResults: learningData,
                timestamp: new Date().toISOString()
            };
        });

        // Display comprehensive results
        console.log('═══════════════════════════════════════');
        console.log('🎯 AUTONOMOUS LEARNING RESULTS');
        console.log('═══════════════════════════════════════\n');

        if (results.learningResults && results.learningResults.length > 0) {
            const successful = results.learningResults.filter(r => r.success);
            const perfect = results.learningResults.filter(r => r.errorCount === 0);
            const failed = results.learningResults.filter(r => !r.success);

            console.log('📊 GENERATION SUMMARY:');
            console.log(`   Total: ${results.learningResults.length}`);
            console.log(`   ✅ Successful (< 5 errors): ${successful.length} (${(successful.length/results.learningResults.length*100).toFixed(1)}%)`);
            console.log(`   🏆 Perfect (0 errors): ${perfect.length}`);
            console.log(`   ❌ Failed (≥ 5 errors): ${failed.length}\n`);

            console.log('📋 INDIVIDUAL RESULTS:');
            results.learningResults.forEach(r => {
                const status = r.success ? '✅' : '❌';
                const perfect = r.errorCount === 0 ? '🏆 ' : '';
                console.log(`   ${status} ${perfect}Gen ${r.generationNumber}: ${r.errorCount} errors (${r.strategy})`);
            });
            console.log('');
        }

        if (results.memory.stylingPatterns) {
            console.log('🎨 STYLING PATTERNS DISCOVERED:');
            for (const [style, data] of Object.entries(results.memory.stylingPatterns)) {
                const rate = data.successRate || 0;
                const correct = data.totalTextInstances - data.errorCount;
                console.log(`   ${style}: ${rate.toFixed(1)}% accuracy (${correct}/${data.totalTextInstances} correct)`);
            }
            console.log('');
        }

        if (results.memory.stats) {
            console.log('📈 OVERALL STATS:');
            console.log(`   Total Generations: ${results.memory.stats.totalGenerations}`);
            console.log(`   Successful: ${results.memory.stats.successfulGenerations}`);
            console.log(`   Success Rate: ${(results.memory.stats.currentSuccessRate || 0).toFixed(1)}%\n`);
        }

        if (results.memory.globalLessons && results.memory.globalLessons.alwaysEmphasize) {
            console.log(`📚 Learned Spelling Patterns: ${results.memory.globalLessons.alwaysEmphasize.length}`);
            console.log('   Recent patterns:');
            results.memory.globalLessons.alwaysEmphasize.slice(-5).forEach(pattern => {
                console.log(`   - "${pattern.correct}" (not "${pattern.wrong}")`);
            });
        }

        console.log('\n═══════════════════════════════════════');
        console.log('✅ Test complete! Results extracted successfully.');
        console.log('═══════════════════════════════════════\n');

        // Keep browser open for 30 seconds for inspection
        console.log('Browser will remain open for 30 seconds for inspection...');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('❌ Error during test:', error);
    } finally {
        await browser.close();
        console.log('Browser closed.');
    }
}

testAutonomousLearning().catch(console.error);
