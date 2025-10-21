// Automated test script for Daily Rate Update template
// Generates 5 test images and analyzes them against success criteria

const fs = require('fs');
const path = require('path');

const API_KEY = 'AIzaSyD7cwQ3dv2BScr9y0GM4lk0sYaVV0Uw1Os';

// Test configuration
const NUM_TESTS = 5;
const OUTPUT_DIR = path.resolve(__dirname, 'test_results_daily_rate_update');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Success criteria for validation
const SUCCESS_CRITERIA = {
    requiredElements: [
        'Daily Rate Update',
        'NMLS 62043',
        '310-954-7771',
        'David Young',
        'LendWise'
    ],
    requiredPatterns: [
        /\d+\.\d+%/,  // Rate percentage (e.g., 6.75%)
        /🟢|🔴/,      // Emoji indicators
    ],
    forbiddenText: [
        'LOL',
        'MAPKATE',
        'MOTPBST'
    ]
};

// Build the Daily Rate Update prompt
function buildDailyRateUpdatePrompt(testNumber) {
    const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    // Vary the economic factors slightly for each test
    const economicFactorSets = [
        [
            { factor: 'Fed policy suggests potential rate cuts ahead', impact: 'positive' },
            { factor: 'Inflation expectations rising per NY Fed survey', impact: 'negative' },
            { factor: 'Market showing cautious optimism near multi-week lows', impact: 'positive' }
        ],
        [
            { factor: 'Treasury yields declining on strong jobs report', impact: 'positive' },
            { factor: 'Global economic uncertainty weighing on markets', impact: 'negative' },
            { factor: 'Housing demand remains resilient despite high rates', impact: 'positive' }
        ],
        [
            { factor: 'Fed Chair signals dovish stance in recent speech', impact: 'positive' },
            { factor: 'Consumer spending data shows continued strength', impact: 'negative' },
            { factor: 'Mortgage applications increase for third week', impact: 'positive' }
        ],
        [
            { factor: 'Core inflation moderating faster than expected', impact: 'positive' },
            { factor: 'Labor market cooling signals economic slowdown', impact: 'negative' },
            { factor: 'Bond market pricing in multiple rate cuts', impact: 'positive' }
        ],
        [
            { factor: 'GDP growth exceeds forecasts signaling strong economy', impact: 'positive' },
            { factor: 'Rising energy costs putting pressure on inflation', impact: 'negative' },
            { factor: 'Housing inventory increasing in key markets', impact: 'positive' }
        ]
    ];

    const factors = economicFactorSets[testNumber % economicFactorSets.length];

    // Build economic factors bullets
    let economicBullets = '';
    factors.forEach(item => {
        const emoji = item.impact === 'positive' ? '🟢' : '🔴';
        economicBullets += `• ${emoji} ${item.factor}\n`;
    });

    const rate = (6.50 + (testNumber * 0.125)).toFixed(2) + '%';
    const change = testNumber % 2 === 0 ? '🟢 Down 0.125%' : '🔴 Up 0.125%';

    const lockRec = 'Contact me today to discuss your personalized rate lock strategy';
    const expertInsight = 'Today\'s movement reflects market response to recent economic data, creating opportunities for well-positioned buyers.';

    return `Create a professional daily mortgage rate update focusing on market drivers.
Include LendWise logo.
Forest green gradient background with metallic gold accents.
Use subtle dark shadow beneath and offset to right to create floating sections.
Preserve emoji colors: 🟢 green circle and 🔴 red circle as shown.

Header section (5 words):
Daily Rate Update ${date}

Current 30-Year Rate (prominent, large display):
${rate} ${change}

What's Moving Rates Today (3 economic factors, 8-12 words each):
${economicBullets}
Lock Strategy Recommendation:
${lockRec}

Expert Insight:
"${expertInsight}"

Contact (7 words):
David Young NMLS 62043 Phone 310-954-7771

Modern Forbes/Bloomberg magazine style. Portrait 1080x1350.`;
}

// Generate a single test image using Gemini Flash (faster, cheaper for testing)
async function generateTestImage(testNumber) {
    console.log(`\n🎨 Generating Test Image ${testNumber}...`);

    try {
        const prompt = buildDailyRateUpdatePrompt(testNumber - 1);

        console.log(`📤 Sending request to Gemini Flash API...`);

        // Load LendWise logo for inclusion in request
        const logoPath = path.resolve(__dirname, 'lendwise-logo-final.png');
        let logoBase64 = null;
        if (fs.existsSync(logoPath)) {
            const logoBuffer = fs.readFileSync(logoPath);
            logoBase64 = logoBuffer.toString('base64');
        }

        // Build parts array (logo first, then prompt)
        const parts = [];
        if (logoBase64) {
            parts.push({
                inline_data: {
                    mime_type: 'image/png',
                    data: logoBase64
                }
            });
        }
        parts.push({ text: prompt });

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: parts
                }],
                generationConfig: {
                    temperature: 0.9,
                    topK: 40,
                    topP: 0.95,
                    responseModalities: ["image"]
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        // Extract base64 image from response
        const imagePart = data.candidates?.[0]?.content?.parts?.find(p => p.inline_data || p.inlineData);
        if (!imagePart) {
            throw new Error('No image data in API response');
        }

        const imageBase64 = imagePart.inline_data?.data || imagePart.inlineData?.data;

        // Save image to file
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        const filename = `daily_rate_update_test_${testNumber}_${Date.now()}.png`;
        const outputPath = path.join(OUTPUT_DIR, filename);
        fs.writeFileSync(outputPath, imageBuffer);

        console.log(`✅ Test ${testNumber} saved: ${filename}`);

        return {
            testNumber,
            filename,
            path: outputPath,
            base64: imageBase64,
            prompt: prompt
        };

    } catch (error) {
        console.error(`❌ Test ${testNumber} FAILED:`, error.message);
        return {
            testNumber,
            error: error.message
        };
    }
}

// Verify image against success criteria using Gemini Vision
async function verifyImage(imageData) {
    try {
        console.log(`\n🔍 Analyzing Test ${imageData.testNumber}...`);

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        {
                            text: `Analyze this Daily Rate Update image against the following success criteria:

REQUIRED ELEMENTS (must be present and spelled correctly):
1. Header showing "Daily Rate Update" with date
2. 30-year rate displayed prominently with emoji indicator (🟢 or 🔴)
3. Economic factors section with EXACTLY 3 bullets
4. Each economic factor has emoji (🟢 green for positive, 🔴 red for negative)
5. Lock recommendation section appears
6. Expert insight quote with opening and closing quotes
7. Contact info: David Young NMLS 62043 Phone 310-954-7771
8. LendWise logo present

TEXT QUALITY CHECKS:
- NO corruption (forbidden text: "LOL", "MAPKATE", "MOTPBST", missing characters)
- Emoji colors preserved (green and red circles visible)
- All spelling is correct
- Professional formatting

Return detailed JSON analysis:
{
    "passed": true/false,
    "elementsFound": {
        "dailyRateUpdateHeader": true/false,
        "rateWithEmoji": true/false,
        "threeEconomicFactors": true/false,
        "economicFactorEmojis": true/false,
        "lockRecommendation": true/false,
        "expertQuote": true/false,
        "contactInfo": true/false,
        "lendWiseLogo": true/false
    },
    "textQuality": {
        "noCorruption": true/false,
        "emojisVisible": true/false,
        "correctSpelling": true/false
    },
    "issues": ["list of any problems found"],
    "strengths": ["list of what worked well"]
}`
                        },
                        {
                            inline_data: {
                                mime_type: 'image/png',
                                data: imageData.base64
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.1,
                    response_mime_type: 'application/json'
                }
            })
        });

        const data = await response.json();
        const resultText = data.candidates[0].content.parts[0].text;
        const result = JSON.parse(resultText);

        console.log(`${result.passed ? '✅' : '❌'} Test ${imageData.testNumber} ${result.passed ? 'PASSED' : 'FAILED'}`);

        return {
            testNumber: imageData.testNumber,
            filename: imageData.filename,
            ...result
        };

    } catch (error) {
        console.error(`⚠️ Verification error for Test ${imageData.testNumber}:`, error.message);
        return {
            testNumber: imageData.testNumber,
            filename: imageData.filename,
            passed: false,
            issues: ['Verification failed: ' + error.message]
        };
    }
}

// Main test execution
async function runTests() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🧪 DAILY RATE UPDATE TEMPLATE - COMPREHENSIVE TEST SUITE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📊 Generating ${NUM_TESTS} test images...`);
    console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);

    const startTime = Date.now();
    const testResults = [];
    const verificationResults = [];

    // Phase 1: Generate all test images
    console.log('\n📸 PHASE 1: Image Generation');
    console.log('─────────────────────────────────────────────────────────');

    for (let i = 1; i <= NUM_TESTS; i++) {
        const result = await generateTestImage(i);
        testResults.push(result);

        // Small delay between generations to avoid rate limiting
        if (i < NUM_TESTS) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // Phase 2: Verify all images
    console.log('\n\n🔍 PHASE 2: Image Analysis');
    console.log('─────────────────────────────────────────────────────────');

    for (const testResult of testResults) {
        if (!testResult.error) {
            const verification = await verifyImage(testResult);
            verificationResults.push(verification);

            // Small delay between verifications
            await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
            verificationResults.push({
                testNumber: testResult.testNumber,
                passed: false,
                issues: [testResult.error]
            });
        }
    }

    // Phase 3: Compile final report
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const passedTests = verificationResults.filter(r => r.passed).length;
    const successRate = `${passedTests}/${NUM_TESTS}`;
    const successPercentage = ((passedTests / NUM_TESTS) * 100).toFixed(0);

    console.log('\n\n═══════════════════════════════════════════════════════════');
    console.log('📊 FINAL TEST REPORT');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log(`⏱️  Total Duration: ${duration}s`);
    console.log(`✅ Success Rate: ${successRate} tests (${successPercentage}%)`);
    console.log(`📁 Images saved to: ${OUTPUT_DIR}\n`);

    // Detailed results for each test
    console.log('📋 INDIVIDUAL TEST RESULTS:');
    console.log('─────────────────────────────────────────────────────────');
    verificationResults.forEach(result => {
        console.log(`\n${result.passed ? '✅' : '❌'} Test ${result.testNumber}: ${result.filename || 'FAILED'}`);

        if (result.elementsFound) {
            console.log('   Elements Found:');
            Object.entries(result.elementsFound).forEach(([key, value]) => {
                console.log(`      ${value ? '✅' : '❌'} ${key}`);
            });
        }

        if (result.issues && result.issues.length > 0) {
            console.log('   ⚠️  Issues:');
            result.issues.forEach(issue => console.log(`      - ${issue}`));
        }

        if (result.strengths && result.strengths.length > 0) {
            console.log('   💪 Strengths:');
            result.strengths.forEach(strength => console.log(`      + ${strength}`));
        }
    });

    // Pattern analysis across all tests
    console.log('\n\n📈 PATTERN ANALYSIS:');
    console.log('─────────────────────────────────────────────────────────');

    const allIssues = verificationResults.flatMap(r => r.issues || []);
    const issueFrequency = {};
    allIssues.forEach(issue => {
        const key = issue.toLowerCase();
        issueFrequency[key] = (issueFrequency[key] || 0) + 1;
    });

    if (Object.keys(issueFrequency).length > 0) {
        console.log('Most Common Issues:');
        Object.entries(issueFrequency)
            .sort((a, b) => b[1] - a[1])
            .forEach(([issue, count]) => {
                console.log(`   ${count}× ${issue}`);
            });
    } else {
        console.log('✅ No recurring issues detected!');
    }

    // Production readiness assessment
    console.log('\n\n🎯 PRODUCTION READINESS ASSESSMENT:');
    console.log('─────────────────────────────────────────────────────────');

    if (successPercentage >= 80) {
        console.log('✅ READY FOR PRODUCTION');
        console.log(`   ${successPercentage}% success rate meets production threshold (≥80%)`);
    } else if (successPercentage >= 60) {
        console.log('⚠️  NEEDS MINOR IMPROVEMENTS');
        console.log(`   ${successPercentage}% success rate - address common issues before production`);
    } else {
        console.log('❌ NOT READY FOR PRODUCTION');
        console.log(`   ${successPercentage}% success rate - significant improvements required`);
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (passedTests === NUM_TESTS) {
        console.log('   🎉 Perfect score! Template is production-ready.');
        console.log('   📝 Consider running additional tests with photo integration.');
    } else {
        const failedElements = new Set();
        verificationResults.forEach(r => {
            if (r.elementsFound) {
                Object.entries(r.elementsFound).forEach(([key, value]) => {
                    if (!value) failedElements.add(key);
                });
            }
        });

        if (failedElements.size > 0) {
            console.log('   🔧 Focus on improving reliability of:');
            failedElements.forEach(element => {
                console.log(`      - ${element}`);
            });
        }

        if (allIssues.some(i => i.toLowerCase().includes('emoji'))) {
            console.log('   🔧 Emoji rendering needs attention - consider prompt adjustments');
        }

        if (allIssues.some(i => i.toLowerCase().includes('spell') || i.toLowerCase().includes('corrupt'))) {
            console.log('   🔧 Text quality issues detected - review prompt specificity');
        }
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');

    // Save detailed report to file
    const reportPath = path.join(OUTPUT_DIR, 'test_report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        duration,
        successRate,
        successPercentage: parseInt(successPercentage),
        results: verificationResults,
        issueFrequency
    }, null, 2));

    console.log(`💾 Detailed report saved: ${reportPath}`);
}

// Run the tests
runTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
});
