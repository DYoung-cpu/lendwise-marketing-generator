// Test script for Imagen 4 Fast - Google's latest text-to-image model with perfect text rendering
// This eliminates CORS issues by running server-side

const fs = require('fs');
const path = require('path');

const API_KEY = 'AIzaSyD7cwQ3dv2BScr9y0GM4lk0sYaVV0Uw1Os';

async function testImagen4Ultra() {
    console.log('💎 IMAGEN 4 ULTRA TEST: Starting generation...\n');

    try {
        // Economic Outlook test prompt - SIMPLIFIED to focus on text accuracy
        const prompt = `Create a professional mortgage marketing image.

Use a dark forest green gradient background.
Use metallic gold text for the title.
Use white text for all other content.

Include this EXACT text with PERFECT spelling:

ECONOMIC OUTLOOK

FORECASTED RATES
6.75% - 30-YEAR FIXED APR
7.12% - 15-YEAR FIXED APR

MARKET INDICATORS:
BORROWER DEMAND: STRONG
LENDER COMPETITIVE CLIMATE: HIGH
INVESTMENT OUTLOOK: FAVORABLE
REFINANCE OPPORTUNITY: AVAILABLE

HOUSING MARKET:
HOME VALUES: APPRECIATING
INFLATION: MODERATING
INVENTORY: UNCHANGED

DAVID YOUNG
NMLS #62043
PHONE: 310-954-7771

LendWise Mortgages

IMPORTANT: Spell every word correctly. Do not abbreviate. Do not alter any text.`;

        console.log('📤 Sending request to Imagen 4 Ultra API...');

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-ultra-generate-001:predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': API_KEY
            },
            body: JSON.stringify({
                instances: [{
                    prompt: prompt
                }],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: '9:16'
                }
            })
        });

        const responseText = await response.text();
        console.log('📥 Response status:', response.status);
        console.log('📥 Response body preview:', responseText.substring(0, 500));

        if (!response.ok) {
            let errorData;
            try {
                errorData = JSON.parse(responseText);
            } catch {
                throw new Error(`Imagen API Error: ${response.statusText} - ${responseText}`);
            }
            throw new Error(`Imagen API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = JSON.parse(responseText);
        console.log('✅ Imagen 4 Ultra generation complete\n');

        // Extract base64 image from Imagen API response format
        // Response format: { predictions: [{ bytesBase64Encoded: "...", mimeType: "..." }] }
        const imageBase64 = data.predictions[0].bytesBase64Encoded;

        // Save image to file
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        const outputPath = path.resolve(__dirname, 'imagen4_ultra_result.png');
        fs.writeFileSync(outputPath, imageBuffer);
        console.log(`💾 Image saved to: imagen4_ultra_result.png\n`);

        // Verify spelling with Gemini Vision
        console.log('🔍 Verifying text accuracy with Gemini Vision...');
        const verification = await verifyImageText(imageBase64);

        // Display results
        console.log('═══════════════════════════════════════');
        console.log('💎 IMAGEN 4 ULTRA TEST RESULTS');
        console.log('═══════════════════════════════════════');
        console.log(`\n📊 Spelling Accuracy: ${verification.issues.length === 0 ? '✅ 100% PERFECT!' : `❌ ${verification.issues.length} errors`}`);
        console.log(`💰 Cost per Image: $0.06`);
        console.log(`📈 vs Gemini Flash: ${(0.06 / 0.02).toFixed(1)}× more expensive`);

        if (verification.issues.length > 0) {
            console.log(`\n⚠️ Spelling Errors Found:`);
            verification.issues.forEach((issue, i) => {
                console.log(`   ${i + 1}. ${issue}`);
            });
        } else {
            console.log(`\n🎉 SUCCESS! Imagen 4 Ultra achieved perfect spelling!`);
            console.log(`✨ This is the solution - perfect text for 3× the price!`);
            console.log(`💡 Worth it for professional marketing materials!`);
        }

        console.log('\n═══════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ IMAGEN 4 ULTRA TEST FAILED:', error.message);
        console.error('\nFull error:', error);
    }
}

async function verifyImageText(imageBase64) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        {
                            text: `🚨 ULTRA-STRICT SPELL CHECK - ZERO TOLERANCE FOR ERRORS 🚨

Your task is to be a RUTHLESS spell checker. Do NOT be lenient. Flag EVERY error, no matter how small.

INSTRUCTIONS:
1. Extract ALL visible text from this image
2. Check EVERY single word CHARACTER BY CHARACTER against correct English spelling
3. Flag ANY word that is not spelled PERFECTLY, including:
   - Missing letters (e.g., "APPRECATING" vs "APPRECIATING" - MISSING "I")
   - Wrong letters (e.g., "UNHANGED" vs "UNCHANGED" - WRONG LETTERS)

4. Common mortgage/finance words to verify EXACTLY:
   - APPRECIATING (NOT "APPRECATING" or "APPRECATING")
   - UNCHANGED (NOT "UNHANGED" or "UNCHANGED")
   - INVENTORY (NOT "INTVENTORY")
   - HOMEOWNERSHIP (NOT "Homeowerrship")
   - MORTGAGE (NOT "MOTPBST" or "Mortggage")

🚨 DO NOT SAY "valid": true IF YOU FIND ANY ERRORS AT ALL 🚨

Remember: BE RUTHLESS. Even ONE wrong letter = ERROR. Set valid to FALSE if ANY errors exist.

Return JSON only:
{
    "valid": true/false,
    "issues": ["list of specific spelling errors found"]
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
        });

        const data = await response.json();
        const resultText = data.candidates[0].content.parts[0].text;
        const result = JSON.parse(resultText);

        return {
            valid: result.valid,
            issues: result.issues || []
        };
    } catch (error) {
        console.error('⚠️ Verification error:', error.message);
        return {
            valid: false,
            issues: ['Verification failed: ' + error.message]
        };
    }
}

// Run the test
testImagen4Ultra();
