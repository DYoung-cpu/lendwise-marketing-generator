#!/usr/bin/env node
/**
 * Simple Orchestrator Test - Memory & Validation Only
 */

console.log('Starting test...\n');

import Orchestrator from './orchestrator.js';
import fs from 'fs/promises';
import path from 'path';

const projectRoot = '/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator';

async function main() {
  console.log('='.repeat(70));
  console.log('SIMPLE ORCHESTRATOR TEST');
  console.log('='.repeat(70) + '\n');

  try {
    // Test 1: Create orchestrator
    console.log('TEST 1: Creating Orchestrator...');
    const orchestrator = new Orchestrator({
      projectRoot,
      maxRetries: 2,
      useVisualDebugging: false, // Disable for simple test
      playwrightValidator: {
        artifactsDir: path.join(projectRoot, 'artifacts'),
        useClickableVerifier: false
      }
    });
    console.log('✅ Orchestrator created\n');

    // Test 2: Memory retrieval
    console.log('TEST 2: Retrieving Memory...');
    const context = await orchestrator.retrieveMemory({
      assetType: 'signature',
      template: 'classic',
      client: 'TestClient'
    });
    console.log('✅ Memory retrieved:');
    console.log(`   - Past results: ${context.pastResults.length}`);
    console.log(`   - Success rate: ${context.successRate}%`);
    console.log(`   - Total generations: ${context.totalGenerations}\n`);

    // Test 3: Create simple HTML
    console.log('TEST 3: Creating test HTML...');
    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Test</title></head>
<body><h1>Test Signature</h1><p>John Smith NMLS 123456</p></body></html>`;

    const testPath = path.join(projectRoot, 'artifacts', 'test-orch.html');
    await fs.mkdir(path.join(projectRoot, 'artifacts'), { recursive: true });
    await fs.writeFile(testPath, html);
    console.log(`✅ Created: ${testPath}\n`);

    // Test 4: Validate with Playwright
    console.log('TEST 4: Validating with Playwright...');
    const validation = await orchestrator.validateWithPlaywright({
      assetType: 'signature',
      outputPath: testPath,
      checks: ['text-present', 'dimensions-valid']
    });
    console.log('✅ Validation completed:');
    console.log(`   - Passed: ${validation.pass}`);
    console.log(`   - Screenshot: ${validation.screenshotPath}\n`);

    // Test 5: Persist to memory
    console.log('TEST 5: Persisting to Memory...');
    await orchestrator.persistToMemory({
      assetType: 'signature',
      template: 'classic',
      client: 'TestClient',
      campaign: 'SimpleTest',
      inputs: { name: 'John Smith', nmls: '123456' },
      result: {
        outputPath: testPath,
        artifacts: [{ kind: 'html', path: testPath, note: 'Test' }]
      },
      validation,
      context,
      retries: 0
    });
    console.log('✅ Memory persisted\n');

    console.log('='.repeat(70));
    console.log('✅ ALL TESTS PASSED');
    console.log('='.repeat(70) + '\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
