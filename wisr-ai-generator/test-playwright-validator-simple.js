#!/usr/bin/env node
/**
 * Simple Playwright Validator Test
 */

import PlaywrightValidator from './playwright-validator.js';
import fs from 'fs/promises';
import path from 'path';

const projectRoot = '/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator';

async function createSimpleTestHTML() {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Test</title>
</head>
<body>
  <h1>Test Signature</h1>
  <p>Name: John Smith</p>
  <p>NMLS: 123456</p>
  <p>Email: <a href="mailto:test@lendwise.com">test@lendwise.com</a></p>
</body>
</html>`;

  const filepath = path.join(projectRoot, 'artifacts', 'test-simple.html');
  await fs.mkdir(path.join(projectRoot, 'artifacts'), { recursive: true });
  await fs.writeFile(filepath, html);
  return filepath;
}

async function main() {
  console.log('Testing Playwright Validator...\n');

  try {
    const validator = new PlaywrightValidator({
      artifactsDir: path.join(projectRoot, 'artifacts'),
      useClickableVerifier: false // Force Playwright usage
    });

    console.log('Creating test HTML...');
    const htmlPath = await createSimpleTestHTML();
    console.log(`Created: ${htmlPath}\n`);

    console.log('Running validation...');
    const result = await validator.validateSignature(htmlPath, {
      name: 'John Smith',
      nmls: '123456',
      email: 'test@lendwise.com'
    });

    console.log('\nResult:', JSON.stringify(result, null, 2));

    if (result.passed) {
      console.log('\n✅ TEST PASSED');
      process.exit(0);
    } else {
      console.log('\n❌ TEST FAILED');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
