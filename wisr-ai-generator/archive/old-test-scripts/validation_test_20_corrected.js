// VALIDATION TEST: 20 Tests Using ACTUAL Working Patterns from Tonight
// Date: October 14, 2025
// Key Insight: Working prompts use SHORT PHRASES and BULLET POINTS, NOT long sentences

const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================

const API_KEY = 'AIzaSyD7cwQ3dv2BScr9y0GM4lk0sYaVV0Uw1Os';
const OUTPUT_DIR = path.join(__dirname, 'validated_test_results_corrected');
const LOGO_PATH = path.join(__dirname, 'lendwise-logo.png');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ============================================
// TEST PROMPTS - Using ACTUAL Working Pattern
// Key: Short phrases, bullet points, simple labels
// ============================================

const BATCH_1_THIN_LINES = [
    {
        id: 1,
        name: 'Economic Outlook + Photo',
        withPhoto: true,
        prompt: `Create a professional economic outlook.
Seamlessly integrate my photo - remove background and blend naturally.
Include LendWise logo.
Forest green gradient background with metallic gold accents.
Use thin horizontal gold lines to separate sections.

Top section: Current 30-year rate.
Middle section: Key economic factors like Fed policy and inflation.
Bottom section: Contact David Young NMLS 62043 Phone 310-954-7771.

Portrait 1080x1350.`
    },
    {
        id: 2,
        name: 'Market Update NO Photo',
        withPhoto: false,
        prompt: `Create a professional mortgage market update showing current rates.
Include LendWise logo.
Forest green gradient background with metallic gold accents.
Display current mortgage rates for 30-year, 15-year, Jumbo, ARM, FHA, and VA loans.
Contact: David Young NMLS 62043 Phone 310-954-7771.
Portrait 1080x1350.`
    },
    {
        id: 3,
        name: 'Rate Trends + Photo',
        withPhoto: true,
        prompt: `Create a professional mortgage rate trends chart.
Seamlessly integrate my photo - remove background and blend naturally.
Include LendWise logo.
Forest green gradient background with metallic gold accents.
Use thin horizontal gold lines to separate sections.

Display rate trends chart in center section.
Contact info in bottom section: David Young NMLS 62043 Phone 310-954-7771.

Portrait 1080x1350.`
    },
    {
        id: 4,
        name: 'Economic Factors + Photo',
        withPhoto: true,
        prompt: `Create a professional economic factors display.
Seamlessly integrate my photo - remove background and blend naturally.
Include LendWise logo.
Forest green gradient background with metallic gold accents.
Use thin horizontal gold lines to separate sections.

Top: Current rates display.
Middle: Economic factors - Fed policy, inflation, employment data.
Bottom: Contact David Young NMLS 62043 Phone 310-954-7771.

Portrait 1080x1350.`
    },
    {
        id: 5,
        name: 'Loan Programs + Photo',
        withPhoto: true,
        prompt: `Create a professional loan programs overview.
Seamlessly integrate my photo - remove background and blend naturally.
Include LendWise logo.
Forest green gradient background with metallic gold accents.
Use thin horizontal gold lines to separate sections.

Top: Available loan programs.
Middle: Conventional, FHA, VA, Jumbo, ARM options.
Bottom: Contact David Young NMLS 62043 Phone 310-954-7771.

Portrait 1080x1350.`
    }
];

// Create other batches with different separation methods
function createBatch(baseBatch, batchNumber, separationMethod, batchName) {
    return baseBatch.map((test, index) => {
        let newPrompt = test.prompt.replace(
            'Use thin horizontal gold lines to separate sections.',
            separationMethod
        );

        return {
            ...test,
            prompt: newPrompt,
            id: batchNumber * 5 + index + 1,
            name: `${test.name} [${batchName}]`
        };
    });
}

const BATCH_2_SHADOW = createBatch(
    BATCH_1_THIN_LINES,
    1,
    'Use subtle dark shadow beneath and offset to right to create floating sections',
    'Shadow'
);

const BATCH_3_GRADIENT_GLOW = createBatch(
    BATCH_1_THIN_LINES,
    2,
    'Use soft metallic gold gradient glow around edges to define sections',
    'Gradient Glow'
);

const BATCH_4_TOP_BORDER = createBatch(
    BATCH_1_THIN_LINES,
    3,
    'Use thick metallic gold horizontal lines ABOVE each section',
    'Top Border'
);

const ALL_TESTS = [
    ...BATCH_1_THIN_LINES,
    ...BATCH_2_SHADOW,
    ...BATCH_3_GRADIENT_GLOW,
    ...BATCH_4_TOP_BORDER
];

// ============================================
// API FUNCTIONS
// ============================================

async function generateImage(prompt, includePhoto) {
    try {
        const logoBuffer = fs.readFileSync(LOGO_PATH);
        const logoBase64 = logoBuffer.toString('base64');

        const parts = [];
        parts.push({
            inline_data: {
                mime_type: 'image/png',
                data: logoBase64
            }
        });

        if (includePhoto) {
            const photoPath = '/mnt/c/Users/dyoun/Downloads/download (24).png';
            if (fs.existsSync(photoPath)) {
                const photoBuffer = fs.readFileSync(photoPath);
                const photoBase64 = photoBuffer.toString('base64');
                parts.push({
                    inline_data: {
                        mime_type: 'image/png',
                        data: photoBase64
                    }
                });
            }
        }

        parts.push({ text: prompt });

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: parts }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        responseModalities: ["image"]
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0]) {
            const content = data.candidates[0].content;
            const imagePart = content.parts.find(part => part.inline_data || part.inlineData);
            if (imagePart) {
                const inlineData = imagePart.inline_data || imagePart.inlineData;
                return inlineData.data;
            }
        }

        throw new Error('No image data in response');
    } catch (error) {
        throw new Error(`Generation failed: ${error.message}`);
    }
}

async function verifyImageText(imageBase64) {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            {
                                text: `STRICT SPELL CHECK

Extract ALL visible text from this image and check every word for spelling errors.

Flag ANY misspelled words, including:
- Missing letters
- Wrong letters
- Extra letters
- Concatenated words (like "OPTIONSPTIONS" or "changer")
- Broken words

Return JSON:
{
    "valid": true/false,
    "issues": ["exact error with context"]
}`
                            },
                            {
                                inline_data: {
                                    mime_type: 'image/png',
                                    data: imageBase64
                                }
                            }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        response_mime_type: 'application/json'
                    }
                })
            }
        );

        const data = await response.json();
        const resultText = data.candidates[0].content.parts[0].text;
        const result = JSON.parse(resultText);

        return {
            valid: result.valid,
            issues: result.issues || []
        };
    } catch (error) {
        return {
            valid: false,
            issues: [`Verification failed: ${error.message}`]
        };
    }
}

// ============================================
// MAIN TEST EXECUTION
// ============================================

async function runAllTests() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  CORRECTED VALIDATION - SHORT PHRASE PATTERN              ║');
    console.log('║  Using actual working style from tonight                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const results = [];
    let perfectCount = 0;
    const batchResults = {
        'Thin Lines': { perfect: 0, total: 5 },
        'Shadow': { perfect: 0, total: 5 },
        'Gradient Glow': { perfect: 0, total: 5 },
        'Top Border': { perfect: 0, total: 5 }
    };

    for (let i = 0; i < ALL_TESTS.length; i++) {
        const test = ALL_TESTS[i];
        const testNum = i + 1;

        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`TEST ${testNum}/20: ${test.name}`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

        try {
            console.log(`[1/3] Generating image...`);
            const imageBase64 = await generateImage(test.prompt, test.withPhoto);

            const filename = `validated_test_${String(testNum).padStart(2, '0')}.png`;
            const filepath = path.join(OUTPUT_DIR, filename);
            fs.writeFileSync(filepath, Buffer.from(imageBase64, 'base64'));
            console.log(`   ✓ Saved: ${filename}`);

            console.log(`[2/3] Verifying text...`);
            const verification = await verifyImageText(imageBase64);

            console.log(`[3/3] Result:`);
            if (verification.valid && verification.issues.length === 0) {
                console.log(`   ✅ PERFECT`);
                perfectCount++;

                const batchName = i < 5 ? 'Thin Lines' :
                                 i < 10 ? 'Shadow' :
                                 i < 15 ? 'Gradient Glow' : 'Top Border';
                batchResults[batchName].perfect++;

                results.push({ testNum, name: test.name, status: 'PERFECT', errors: [] });
            } else {
                console.log(`   ❌ ERRORS:`);
                verification.issues.forEach(issue => console.log(`      - ${issue}`));
                results.push({ testNum, name: test.name, status: 'ERRORS', errors: verification.issues });
            }

            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
            console.log(`   ❌ Failed: ${error.message}`);
            results.push({ testNum, name: test.name, status: 'FAILED', errors: [error.message] });
        }
    }

    // Final Report
    console.log('\n\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              VALIDATION RESULTS SUMMARY                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log(`Date: ${new Date().toISOString()}`);
    console.log(`Total Tests: 20`);
    console.log(`Perfect Renders: ${perfectCount}/20`);
    console.log(`Success Rate: ${(perfectCount / 20 * 100).toFixed(1)}%\n`);

    console.log('BATCH RESULTS:');
    Object.entries(batchResults).forEach(([name, data]) => {
        console.log(`  ${name}: ${data.perfect}/${data.total} (${(data.perfect/data.total*100).toFixed(0)}%)`);
    });

    console.log('\nERROR LOG:');
    const errorTests = results.filter(r => r.status === 'ERRORS');
    if (errorTests.length === 0) {
        console.log('  ✅ No errors found!');
    } else {
        errorTests.forEach(test => {
            console.log(`\nTest #${test.testNum}: ${test.name}`);
            test.errors.forEach(err => console.log(`  - ${err}`));
        });
    }

    console.log('\nCONCLUSION:');
    if (perfectCount >= 19) {
        console.log('✅ BULLETPROOF - Formula proven (95-100% success)');
        console.log('   Production ready!');
    } else if (perfectCount >= 17) {
        console.log('⚠️  Good but needs tweaks (85-94% success)');
    } else {
        console.log('❌ Needs investigation (<85% success)');
    }

    const reportPath = path.join(OUTPUT_DIR, 'validation_report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        totalTests: 20,
        perfectCount,
        successRate: (perfectCount / 20 * 100).toFixed(1) + '%',
        batchResults,
        detailedResults: results
    }, null, 2));

    console.log(`\n📄 Report: validation_report.json`);
    console.log(`📁 Images: ${OUTPUT_DIR}\n`);
}

runAllTests().catch(error => {
    console.error('\n❌ FATAL ERROR:', error);
    process.exit(1);
});
