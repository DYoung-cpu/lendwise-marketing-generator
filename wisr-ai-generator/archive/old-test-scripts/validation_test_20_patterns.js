// VALIDATION TEST: 20 Tests Using EXACT Working Prompt Patterns
// Date: October 14, 2025
// Purpose: Prove the 15-word formula works with proper vocabulary

const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================

const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyD7cwQ3dv2BScr9y0GM4lk0sYaVV0Uw1Os';
const OUTPUT_DIR = path.join(__dirname, 'validated_test_results');
const LOGO_PATH = path.join(__dirname, 'lendwise-logo.png');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ============================================
// TEST PROMPTS - BATCH 1: THIN LINES
// ============================================

const BATCH_1_THIN_LINES = [
    {
        id: 1,
        name: 'Market Update + Photo',
        withPhoto: true,
        prompt: `Create a professional mortgage market update.
Seamlessly integrate my photo - remove background and blend naturally.
Include LendWise logo.
Forest green gradient background with metallic gold accents.
Use thin horizontal gold lines to separate sections.

Section 1 (15 words): Current mortgage rate market shows notable change for home loan options available now through our expert team.
Section 2 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for immediate help call now or visit our office today.
Section 3 (15 words): We help you find the right loan program that fits your needs and budget goals available now.

Portrait 1080x1350.`
    },
    {
        id: 2,
        name: 'Market Update NO Photo',
        withPhoto: false,
        prompt: `Create a professional mortgage market update.
Include LendWise logo.
Forest green gradient background with metallic gold accents.
Use thin horizontal gold lines to separate sections.

Section 1 (15 words): Current mortgage rate market shows notable change for home loan options available now through our expert team.
Section 2 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for immediate help call now or visit our office today.
Section 3 (15 words): Expert mortgage guidance for your home purchase goals find the perfect loan program today available now through our team.

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

Section 1: Display rate trends chart showing movement over time.
Section 2 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for immediate help call now or visit our office today.
Section 3 (15 words): Expert guidance for purchase or refinance find your perfect loan program available now through our team of experts.

Portrait 1080x1350.`
    },
    {
        id: 4,
        name: 'Economic Outlook + Photo',
        withPhoto: true,
        prompt: `Create a professional economic outlook.
Seamlessly integrate my photo - remove background and blend naturally.
Include LendWise logo.
Forest green gradient background with metallic gold accents.
Use thin horizontal gold lines to separate sections.

Section 1: Current 30-year rate and market conditions.
Section 2: Key economic factors like Fed policy and inflation trends.
Section 3 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for immediate help call now or visit our office today.

Portrait 1080x1350.`
    },
    {
        id: 5,
        name: 'Custom Content + Photo',
        withPhoto: true,
        prompt: `Create a professional mortgage marketing image.
Seamlessly integrate my photo - remove background and blend naturally.
Include LendWise logo.
Forest green gradient background with metallic gold accents.
Use thin horizontal gold lines to separate sections.

Section 1 (15 words): Looking for better rates on your home loan refinance purchase programs available through our team expert guidance provided.
Section 2 (15 words): We offer conventional FHA VA jumbo and ARM loan programs tailored to your specific financial situation and goals.
Section 3 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for immediate help call now or visit our office today.

Portrait 1080x1350.`
    }
];

// ============================================
// CREATE BATCHES 2-4 (Same content, different separation methods)
// ============================================

function createBatch(baseBatch, batchNumber, separationMethod) {
    return baseBatch.map((test, index) => {
        let newPrompt = test.prompt.replace(
            'Use thin horizontal gold lines to separate sections.',
            separationMethod
        );

        return {
            ...test,
            prompt: newPrompt,
            id: batchNumber * 5 + index + 1,
            name: test.name
        };
    });
}

const BATCH_2_SHADOW = createBatch(
    BATCH_1_THIN_LINES,
    1,
    'Use subtle dark shadow beneath and offset to right to create floating sections'
);

const BATCH_3_GRADIENT_GLOW = createBatch(
    BATCH_1_THIN_LINES,
    2,
    'Use soft metallic gold gradient glow around edges to define sections'
);

const BATCH_4_TOP_BORDER = createBatch(
    BATCH_1_THIN_LINES,
    3,
    'Use thick metallic gold horizontal lines ABOVE each section'
);

// Combine all batches
const ALL_TESTS = [
    ...BATCH_1_THIN_LINES,
    ...BATCH_2_SHADOW,
    ...BATCH_3_GRADIENT_GLOW,
    ...BATCH_4_TOP_BORDER
];

// ============================================
// VALIDATION CHECKLIST
// ============================================

function validatePrompt(prompt) {
    const errors = [];

    // Check for spelled-out numbers
    const spelledNumbers = ['thirty', 'six', 'eight', 'fifteen', 'three', 'ten'];
    spelledNumbers.forEach(word => {
        if (prompt.toLowerCase().includes(word)) {
            errors.push(`Found spelled-out number: "${word}"`);
        }
    });

    // Check for "percent" word
    if (prompt.toLowerCase().includes('percent')) {
        errors.push('Found word "percent" - should avoid');
    }

    // Check for problem words
    const problemWords = ['navigate', 'steady', 'across', 'quick response'];
    problemWords.forEach(word => {
        if (prompt.toLowerCase().includes(word)) {
            errors.push(`Found problem word: "${word}"`);
        }
    });

    // Check that contact info uses correct format
    if (prompt.includes('David Young') && !prompt.includes('NMLS 62043')) {
        errors.push('Contact info missing NMLS 62043');
    }

    return errors;
}

// ============================================
// API CALL FUNCTION
// ============================================

async function generateImage(prompt, includePhoto) {
    try {
        // Load logo
        const logoBuffer = fs.readFileSync(LOGO_PATH);
        const logoBase64 = logoBuffer.toString('base64');

        // Build parts array
        const parts = [];

        // Add logo first
        parts.push({
            inline_data: {
                mime_type: 'image/png',
                data: logoBase64
            }
        });

        // Add photo if needed (using one of the successful test images)
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

        // Add text prompt
        parts.push({ text: prompt });

        // Call Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: parts
                    }],
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

// ============================================
// VERIFICATION FUNCTION
// ============================================

async function verifyImageText(imageBase64) {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            {
                                text: `ULTRA-STRICT SPELL CHECK - ZERO TOLERANCE FOR ERRORS

Your task is to be a RUTHLESS spell checker. Flag EVERY error, no matter how small.

INSTRUCTIONS:
1. Extract ALL visible text from this image
2. Check EVERY single word CHARACTER BY CHARACTER against correct English spelling
3. Flag ANY word that is not spelled PERFECTLY, including:
   - Missing letters
   - Wrong letters
   - Extra letters
   - Transposed letters

4. Common words to verify EXACTLY:
   - AVAILABLE, CURRENT, MARKET, NOTABLE, CHANGE
   - EXPERT, GUIDANCE, PURCHASE, PERFECT, PROGRAM
   - CONTACT, IMMEDIATE, OFFICE, REFINANCE
   - MORTGAGE, CONVENTIONAL, TAILORED, FINANCIAL

BE RUTHLESS. Even ONE wrong letter = ERROR.

Return JSON only:
{
    "valid": true/false,
    "issues": ["list of specific spelling errors found with exact wrong spelling"]
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
    console.log('║  VALIDATION TESTS - WORKING PROMPT PATTERNS               ║');
    console.log('║  Testing 20 prompts with proven 15-word formula           ║');
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

        // Validate prompt before executing
        console.log(`\n[1/4] Validating prompt against checklist...`);
        const validationErrors = validatePrompt(test.prompt);

        if (validationErrors.length > 0) {
            console.log(`   ❌ VALIDATION FAILED:`);
            validationErrors.forEach(err => console.log(`      - ${err}`));
            results.push({
                testNum,
                name: test.name,
                status: 'VALIDATION_FAILED',
                errors: validationErrors
            });
            continue;
        }
        console.log(`   ✓ Prompt validation passed`);

        // Generate image
        console.log(`\n[2/4] Generating image...`);
        try {
            const imageBase64 = await generateImage(test.prompt, test.withPhoto);

            // Save image
            const filename = `validated_test_${String(testNum).padStart(2, '0')}.png`;
            const filepath = path.join(OUTPUT_DIR, filename);
            fs.writeFileSync(filepath, Buffer.from(imageBase64, 'base64'));
            console.log(`   ✓ Image saved: ${filename}`);

            // Verify text
            console.log(`\n[3/4] Verifying text accuracy...`);
            const verification = await verifyImageText(imageBase64);

            console.log(`\n[4/4] Results:`);
            if (verification.valid && verification.issues.length === 0) {
                console.log(`   ✅ PERFECT - No spelling errors found`);
                perfectCount++;

                // Track batch results
                const batchName = i < 5 ? 'Thin Lines' :
                                 i < 10 ? 'Shadow' :
                                 i < 15 ? 'Gradient Glow' : 'Top Border';
                batchResults[batchName].perfect++;

                results.push({
                    testNum,
                    name: test.name,
                    status: 'PERFECT',
                    errors: []
                });
            } else {
                console.log(`   ❌ ERRORS FOUND:`);
                verification.issues.forEach(issue => {
                    console.log(`      - ${issue}`);
                });

                results.push({
                    testNum,
                    name: test.name,
                    status: 'ERRORS',
                    errors: verification.issues
                });
            }

            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
            console.log(`   ❌ Generation failed: ${error.message}`);
            results.push({
                testNum,
                name: test.name,
                status: 'GENERATION_FAILED',
                errors: [error.message]
            });
        }
    }

    // Generate final report
    console.log('\n\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
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
        console.log('  No errors found!');
    } else {
        errorTests.forEach(test => {
            console.log(`\nTest #${test.testNum} (${test.name}):`);
            test.errors.forEach(err => console.log(`  - ${err}`));
        });
    }

    console.log('\nCONCLUSION:');
    if (perfectCount >= 19) {
        console.log('✅ BULLETPROOF - Formula proven at 95-100% success rate');
        console.log('   Ready for production deployment!');
    } else if (perfectCount >= 17) {
        console.log('⚠️  Good but needs minor tweaks (85-94% success)');
        console.log('   Review error patterns and adjust vocabulary');
    } else {
        console.log('❌ Something still wrong (<85% success)');
        console.log('   Need to investigate failure patterns');
    }

    // Save detailed report
    const reportPath = path.join(OUTPUT_DIR, 'validation_report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        totalTests: 20,
        perfectCount,
        successRate: (perfectCount / 20 * 100).toFixed(1) + '%',
        batchResults,
        detailedResults: results
    }, null, 2));

    console.log(`\n📄 Detailed report saved: validation_report.json`);
    console.log(`📁 All images saved to: ${OUTPUT_DIR}\n`);
}

// ============================================
// RUN TESTS
// ============================================

if (!API_KEY) {
    console.error('❌ ERROR: GEMINI_API_KEY environment variable not set');
    console.error('   Set it with: export GEMINI_API_KEY=your_key_here');
    process.exit(1);
}

runAllTests().catch(error => {
    console.error('\n❌ FATAL ERROR:', error);
    process.exit(1);
});
