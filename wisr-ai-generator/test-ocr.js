/**
 * OCR Service Test - Verify text extraction works
 */

import { extractTextFromImage, verifyText, checkSpelling } from './ocr-service.js';

// Test with the screenshot David provided
const TEST_IMAGE = '/mnt/c/Users/dyoun/Downloads/Screenshot 2025-10-28 071923.png';

async function testOCR() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║     🔍 OCR SERVICE TEST                        ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  try {
    // Extract text from screenshot
    console.log('📸 Testing with screenshot...\n');
    const result = await extractTextFromImage(TEST_IMAGE, {
      language: 'eng',
      preprocessing: true
    });

    if (result.success) {
      console.log('✅ Text extraction successful!\n');
      console.log('═══════════════════════════════════════════════');
      console.log('EXTRACTED TEXT:');
      console.log('═══════════════════════════════════════════════');
      console.log(result.text);
      console.log('═══════════════════════════════════════════════\n');

      console.log(`📊 Confidence: ${result.confidence.toFixed(2)}%`);
      console.log(`📝 Words detected: ${result.words ? result.words.length : 'N/A'}`);
      console.log(`📄 Lines detected: ${result.lines ? result.lines.length : 'N/A'}\n`);

      // Verify expected text
      console.log('🔍 Verifying expected text...\n');

      const expectedTexts = [
        'RATES DROPPED',
        '6.25%',
        '30-Year Fixed',
        'LENDWISE'
      ];

      const verification = verifyText(result.text, expectedTexts, {
        caseSensitive: false,
        allowPartialMatch: true
      });

      console.log(`✅ Found: ${verification.foundCount}/${verification.totalExpected} (${verification.percentage}%)\n`);

      verification.results.forEach(item => {
        const status = item.found ? '✅' : '❌';
        console.log(`${status} "${item.expected}" - ${item.matchType}`);
      });

      // Check for spelling errors
      console.log('\n📝 Checking spelling...\n');

      const spellingCheck = checkSpelling(result.text, {
        'Fixed': ['Firted', 'Fixd', 'Fixxed'],
        'Rates': ['Rats', 'Raets'],
        'Dropped': ['Droped', 'Dropt']
      });

      if (spellingCheck.success) {
        console.log('✅ No spelling errors detected!');
      } else {
        console.log(`⚠️  Found ${spellingCheck.errorsFound} spelling issue(s):\n`);

        Object.entries(spellingCheck.results).forEach(([word, status]) => {
          if (status.status === 'typo') {
            console.log(`❌ "${word}" has typos: ${status.typosFound.join(', ')}`);
          } else if (status.status === 'missing') {
            console.log(`⚠️  "${word}" not found in text`);
          } else {
            console.log(`✅ "${word}" spelled correctly`);
          }
        });
      }

    } else {
      console.error('❌ Text extraction failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }

  console.log('\n════════════════════════════════════════════════\n');
}

// Run test
testOCR();
