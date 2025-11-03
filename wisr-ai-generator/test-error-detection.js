#!/usr/bin/env node
/**
 * Test Console Error Detection
 */

import PlaywrightValidator from './playwright-validator.js';
import path from 'path';

const projectRoot = '/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator';

async function main() {
  console.log('Testing Console Error Detection...\n');

  try {
    const validator = new PlaywrightValidator({
      artifactsDir: path.join(projectRoot, 'artifacts'),
      useClickableVerifier: false
    });

    const htmlPath = path.join(projectRoot, 'test-console-errors.html');
    console.log(`Testing file: ${htmlPath}\n`);

    console.log('Running validation with console monitoring...');
    const result = await validator.validateSignature(htmlPath, {
      name: 'Test User',
      nmls: '123456',
      email: 'test@example.com'
    });

    console.log('\n' + '='.repeat(70));
    console.log('CONSOLE ERROR DETECTION RESULTS');
    console.log('='.repeat(70) + '\n');

    console.log(`✅ Success: ${result.success}`);
    console.log(`✅ Passed: ${result.passed}`);
    console.log(`📸 Screenshot: ${result.screenshotPath}\n`);

    if (result.details) {
      console.log('📊 Console Monitoring Data:\n');

      console.log(`   Total Console Messages: ${result.details.consoleMessages?.length || 0}`);
      console.log(`   Console Errors: ${result.details.consoleErrors?.length || 0}`);
      console.log(`   Page Errors: ${result.details.pageErrors?.length || 0}\n`);

      if (result.details.consoleErrors && result.details.consoleErrors.length > 0) {
        console.log('🔴 Console Errors Detected:');
        result.details.consoleErrors.forEach((err, i) => {
          console.log(`   ${i + 1}. ${err.text}`);
          if (err.location) {
            console.log(`      Location: ${err.location.url}:${err.location.lineNumber}`);
          }
        });
        console.log('');
      }

      if (result.details.pageErrors && result.details.pageErrors.length > 0) {
        console.log('🔴 Page Errors Detected:');
        result.details.pageErrors.forEach((err, i) => {
          console.log(`   ${i + 1}. ${err.message}`);
        });
        console.log('');
      }

      if (result.details.consoleMessages && result.details.consoleMessages.length > 0) {
        console.log('📋 All Console Messages:');
        result.details.consoleMessages.forEach((msg, i) => {
          const icon = msg.type === 'error' ? '🔴' :
                       msg.type === 'warning' ? '⚠️ ' :
                       msg.type === 'log' ? '📝' : 'ℹ️';
          console.log(`   ${icon} [${msg.type}] ${msg.text}`);
        });
        console.log('');
      }
    }

    console.log('='.repeat(70));

    if (result.details.consoleErrors?.length > 0 || result.details.pageErrors?.length > 0) {
      console.log('\n✅ SUCCESS: Console error monitoring is working!');
      console.log(`   Detected ${result.details.consoleErrors?.length || 0} console errors`);
      console.log(`   Detected ${result.details.pageErrors?.length || 0} page errors`);
    } else {
      console.log('\n⚠️  No errors detected (file may not have errors)');
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
