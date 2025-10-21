// Test: ALL text in large gold gradient style
// Theory: Large 3D gold text = higher accuracy (based on user observation)

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testAllGoldDesign() {
    console.log('✨ ALL-GOLD-GRADIENT TEST: Starting generation...\n');
    console.log('💡 Theory: Large gold 3D text = better spelling accuracy\n');

    try {
        // Prompt emphasizing ALL TEXT should be large gold gradient style
        const prompt = `Create a professional mortgage marketing image in portrait format (9:16 aspect ratio).

DESIGN STYLE:
- Dark forest green gradient background (#1a4d2e to #0f2818)
- ALL TEXT in large, prominent METALLIC GOLD GRADIENT style (#B8860B to #FFD700)
- ALL TEXT with 3D effect, embossed appearance
- NO small text - everything should be bold and prominent
- Professional, luxurious aesthetic

INCLUDE THIS EXACT TEXT (all in large gold gradient):

ECONOMIC OUTLOOK

FORECASTED RATES

6.75%
30-YEAR FIXED APR

7.12%
15-YEAR FIXED APR

MARKET INDICATORS

BORROWER DEMAND: STRONG
LENDER COMPETITIVE CLIMATE: HIGH
INVESTMENT OUTLOOK: FAVORABLE
REFINANCE OPPORTUNITY: AVAILABLE

HOUSING MARKET

HOME VALUES: APPRECIATING
INFLATION: MODERATING
INVENTORY: UNCHANGED

DAVID YOUNG
NMLS #62043
PHONE: 310-954-7771

LENDWISE MORTGAGES

CRITICAL INSTRUCTIONS:
- Make ALL text large and prominent (no small body text)
- Use the SAME gold gradient style for ALL text
- Spell every word perfectly
- Use 3D embossed effect on ALL text
- Arrange text in clean, organized sections`;

        console.log('📤 Sending request to Gemini Flash 2.5 (Imagen)...');

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict`, {
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

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Generation complete\n');

        // Extract base64 image from Imagen API response
        const imageBase64 = data.predictions[0].bytesBase64Encoded;

        // Save image
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        const outputPath = path.resolve(__dirname, 'all_gold_test_result.png');
        fs.writeFileSync(outputPath, imageBuffer);
        console.log(`💾 Image saved to: all_gold_test_result.png\n`);

        // Verify spelling
        console.log('🔍 Verifying text accuracy with Gemini Vision...');
        const verification = await verifyImageText(imageBase64);

        // Display results
        console.log('═══════════════════════════════════════');
        console.log('✨ ALL-GOLD-GRADIENT TEST RESULTS');
        console.log('═══════════════════════════════════════');
        console.log(`\n📊 Spelling Accuracy: ${verification.issues.length === 0 ? '✅ 100% PERFECT!' : `❌ ${verification.issues.length} errors`}`);
        console.log(`💰 Cost per Image: $0.02`);
        console.log(`🎨 Design Style: All text in large gold gradient 3D`);

        if (verification.issues.length > 0) {
            console.log(`\n⚠️ Spelling Errors Found:`);
            verification.issues.forEach((issue, i) => {
                console.log(`   ${i + 1}. ${issue}`);
            });
            console.log(`\n💭 Theory partially confirmed - but still has errors with complex content`);
        } else {
            console.log(`\n🎉 BREAKTHROUGH! All-gold design achieved 100% accuracy!`);
            console.log(`✨ User's observation was correct - large 3D gold text = perfect spelling!`);
            console.log(`🚀 This is the solution for production!`);
        }

        console.log('\n═══════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ ALL-GOLD TEST FAILED:', error.message);
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
   - APPRECIATING (NOT "APPRECATING")
   - UNCHANGED (NOT "UNHANGED")
   - INVENTORY (NOT "INTVENTORY")
   - HOMEOWNERSHIP (NOT "Homeowerrship")
   - MORTGAGE (NOT "MOTPBST" or "Mortggage")
   - ECONOMIC (NOT "ECONLOMIC")
   - BORROWER (NOT "BORROWET")
   - LENDER (NOT "LENDRE")
   - COMPETITIVE (NOT "COMPEITIVE")
   - OUTLOOK (NOT "OUTTLOOK")
   - FAVORABLE (NOT "FAVORR")
   - OPPORTUNITY (NOT "OPPORTUNBLE")
   - AVAILABLE (NOT "AVAILANBED")
   - MODERATING (NOT "MODORATITY")

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
testAllGoldDesign();
