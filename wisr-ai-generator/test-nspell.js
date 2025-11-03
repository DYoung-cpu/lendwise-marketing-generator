/**
 * Quick test to verify nspell integration is working
 */

import { checkSpelling, generateSpellingReport } from './spelling-dictionary.js';

async function testSpellChecker() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║      NSPELL INTEGRATION TEST                            ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Test 1: Known misspelling from whitelist
  console.log('Test 1: Known AI misspelling (whitelist)');
  console.log('Testing text: "VOLITILITY" (should catch as VOLATILITY)');
  const test1 = await checkSpelling('MARKET VOLITILITY IS HIGH');
  console.log('Result:', test1.length > 0 ? `✅ CAUGHT: ${test1[0].word} → ${test1[0].expected}` : '❌ MISSED');
  console.log('Source:', test1[0]?.source);
  console.log('');

  // Test 2: OCR-misread version
  console.log('Test 2: OCR misread version');
  console.log('Testing text: "VOLABLITY" (should catch as VOLATILITY)');
  const test2 = await checkSpelling('MARKET VOLABLITY IS HIGH');
  console.log('Result:', test2.length > 0 ? `✅ CAUGHT: ${test2[0].word} → ${test2[0].expected}` : '❌ MISSED');
  console.log('Source:', test2[0]?.source);
  console.log('');

  // Test 3: Random misspelling (should be caught by nspell)
  console.log('Test 3: Random misspelling (nspell comprehensive check)');
  console.log('Testing text: "OPPPORTUNITY" (double P)');
  const test3 = await checkSpelling('GREAT OPPPORTUNITY AVAILABLE');
  console.log('Result:', test3.length > 0 ? `✅ CAUGHT: ${test3[0].word} → ${test3[0].expected}` : '❌ MISSED');
  console.log('Source:', test3[0]?.source);
  console.log('Suggestions:', test3[0]?.suggestions);
  console.log('');

  // Test 4: Correct text (should pass)
  console.log('Test 4: Correct text');
  console.log('Testing text: "VOLATILITY" (correct spelling)');
  const test4 = await checkSpelling('MARKET VOLATILITY IS HIGH');
  console.log('Result:', test4.length === 0 ? '✅ PASSED (no errors)' : `❌ FAILED: ${test4[0]?.word}`);
  console.log('');

  // Test 5: Full report with realistic mortgage content
  console.log('Test 5: Full spelling report (realistic content)');
  const mortgageText = `
    LENDWISE MORTGAGE
    DAILY RATE UPDATE
    30-YEAR FIXED: 6.33%
    MARKET DRIVERS TODAY:
    - Fed policy expectations shift
    - Bond market volitility
    - Economic data influence
  `;
  const report = await generateSpellingReport(mortgageText);
  console.log('Passed:', report.passed ? '❌ FALSE (should catch volitility)' : '✅ TRUE (correctly caught error)');
  console.log('Error count:', report.errorCount);
  console.log('nspell enabled:', report.nspellEnabled);
  console.log('Errors:', report.errors.map(e => `${e.word} → ${e.expected} (${e.source})`));
  console.log('');

  // Summary
  console.log('═══════════════════════════════════════════════════════');
  console.log('SUMMARY:');
  console.log(`Test 1 (whitelist): ${test1.length > 0 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 2 (whitelist): ${test2.length > 0 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 3 (nspell): ${test3.length > 0 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 4 (correct): ${test4.length === 0 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 5 (report): ${!report.passed && report.errorCount > 0 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`nspell enabled: ${report.nspellEnabled ? '✅ YES' : '❌ NO'}`);
  console.log('═══════════════════════════════════════════════════════');
}

testSpellChecker().catch(console.error);
