#!/usr/bin/env node

/**
 * Daily Rate Generation Testing Script
 *
 * Tests the marketing generator with daily rate template
 * Runs 3 iterations and learns from feedback
 */

import { chromium } from 'playwright';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const SCREENSHOTS_DIR = './screenshots';
const LEARNINGS_FILE = './.claude/agent-learnings.json';

// Ensure directories exist
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Load existing learnings
let learnings = [];
if (fs.existsSync(LEARNINGS_FILE)) {
  learnings = JSON.parse(fs.readFileSync(LEARNINGS_FILE, 'utf-8'));
}

function saveLearning(learning) {
  learnings.push({
    ...learning,
    timestamp: new Date().toISOString()
  });
  fs.writeFileSync(LEARNINGS_FILE, JSON.stringify(learnings, null, 2));
}

async function analyzeScreenshot(screenshotPath, testNumber) {
  console.log(`   👁️  Analyzing screenshot with Vision API...`);

  try {
    const imageData = fs.readFileSync(screenshotPath);
    const base64Image = imageData.toString('base64');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png',
              data: base64Image
            }
          },
          {
            type: 'text',
            text: `Analyze this marketing image for daily mortgage rates.

Check:
1. Text accuracy - Are all words spelled correctly?
2. Visual quality - Professional appearance? (1-10)
3. Brand compliance - Gold gradient used? Clear typography?
4. Readability - Is text crystal clear?
5. Layout - Proper spacing and alignment?

List any spelling errors found.
Rate overall quality (1-10).
Provide specific feedback for improvement.`
          }
        ]
      }]
    });

    const analysis = response.content[0].text;
    return { success: true, analysis };
  } catch (error) {
    console.error(`   ❌ Vision analysis failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTest(testNumber) {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`🧪 TEST ${testNumber}/3 - Daily Rate Generation`);
  console.log(`${'═'.repeat(70)}\n`);

  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  // Monitor console
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text()
    });
  });

  // Monitor errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push({
      message: error.message,
      stack: error.stack
    });
  });

  try {
    console.log(`   Step 1/6: Navigating to Marketing Generator...`);
    await page.goto('http://localhost:8080/nano-test.html', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    console.log(`   ✅ Page loaded\n`);

    console.log(`   Step 2/6: Looking for template selector...`);
    await page.waitForTimeout(2000); // Wait for page to fully render

    // Take initial screenshot
    const initialScreenshot = path.join(SCREENSHOTS_DIR, `test-${testNumber}-initial.png`);
    await page.screenshot({ path: initialScreenshot, fullPage: true });
    console.log(`   📸 Initial state captured\n`);

    console.log(`   Step 3/6: Selecting Daily Rate template...`);
    // Try to find and select the daily rate template
    const templateFound = await page.evaluate(() => {
      // Look for template selector/dropdown
      const selects = document.querySelectorAll('select');
      for (const select of selects) {
        const options = Array.from(select.options);
        const rateOption = options.find(opt =>
          opt.text.toLowerCase().includes('rate') ||
          opt.text.toLowerCase().includes('daily')
        );
        if (rateOption) {
          select.value = rateOption.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
      }
      return false;
    });

    if (!templateFound) {
      console.log(`   ⚠️  Auto-selection failed, template may need manual selection\n`);
    } else {
      console.log(`   ✅ Template selected\n`);
    }

    console.log(`   Step 4/6: Clicking Initialize button...`);
    await page.waitForTimeout(1000);

    const buttonClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const initButton = buttons.find(btn =>
        btn.textContent.includes('Initialize') ||
        btn.textContent.includes('Generate')
      );
      if (initButton) {
        initButton.click();
        return true;
      }
      return false;
    });

    if (!buttonClicked) {
      console.log(`   ⚠️  Initialize button not found, may need manual interaction\n`);
      console.log(`   ⏸️  Waiting 10 seconds for manual interaction...\n`);
      await page.waitForTimeout(10000);
    } else {
      console.log(`   ✅ Initialize clicked\n`);
      console.log(`   ⏳ Waiting for generation (10 seconds)...\n`);
      await page.waitForTimeout(10000);
    }

    console.log(`   Step 5/6: Capturing generated result...`);
    const resultScreenshot = path.join(SCREENSHOTS_DIR, `test-${testNumber}-result.png`);
    await page.screenshot({ path: resultScreenshot, fullPage: true });
    console.log(`   📸 Result captured: ${resultScreenshot}\n`);

    console.log(`   Step 6/6: Analyzing with Vision API...`);
    const analysis = await analyzeScreenshot(resultScreenshot, testNumber);

    // Report results
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`📊 TEST ${testNumber} RESULTS`);
    console.log(`${'─'.repeat(70)}\n`);

    if (analysis.success) {
      console.log(`✅ Vision Analysis:\n`);
      console.log(analysis.analysis);
      console.log();
    } else {
      console.log(`❌ Analysis failed: ${analysis.error}\n`);
    }

    console.log(`📋 Console Messages: ${consoleMessages.length}`);
    const errors = consoleMessages.filter(m => m.type === 'error');
    if (errors.length > 0) {
      console.log(`⚠️  Console Errors:`);
      errors.forEach(err => console.log(`   - ${err.text}`));
    }
    console.log();

    console.log(`🐛 Page Errors: ${pageErrors.length}`);
    if (pageErrors.length > 0) {
      console.log(`⚠️  JavaScript Errors:`);
      pageErrors.forEach(err => console.log(`   - ${err.message}`));
    }
    console.log();

    // Save learning
    saveLearning({
      test: `daily-rate-test-${testNumber}`,
      screenshot: resultScreenshot,
      analysis: analysis.success ? analysis.analysis : null,
      consoleErrors: errors.length,
      pageErrors: pageErrors.length
    });

    return {
      testNumber,
      screenshot: resultScreenshot,
      analysis,
      consoleErrors: errors.length,
      pageErrors: pageErrors.length
    };

  } catch (error) {
    console.error(`\n❌ Test ${testNumber} failed:`, error.message);
    return {
      testNumber,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`🤖 MARKETING AGENT: Daily Rate Generation Testing`);
  console.log(`${'═'.repeat(70)}\n`);
  console.log(`📋 Running 3 tests on daily rate generation`);
  console.log(`🧠 Learning from each iteration`);
  console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);
  console.log(`💾 Learnings saved to: ${LEARNINGS_FILE}\n`);

  const results = [];

  for (let i = 1; i <= 3; i++) {
    const result = await runTest(i);
    results.push(result);

    if (i < 3) {
      console.log(`\n⏸️  Pausing 5 seconds before next test...\n`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Final summary
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`📊 FINAL SUMMARY - All 3 Tests Complete`);
  console.log(`${'═'.repeat(70)}\n`);

  results.forEach((result, index) => {
    console.log(`Test ${index + 1}:`);
    if (result.error) {
      console.log(`   ❌ Failed: ${result.error}`);
    } else {
      console.log(`   📸 Screenshot: ${result.screenshot}`);
      console.log(`   🐛 Console Errors: ${result.consoleErrors}`);
      console.log(`   ⚠️  Page Errors: ${result.pageErrors}`);
    }
    console.log();
  });

  console.log(`💾 All learnings saved to: ${LEARNINGS_FILE}`);
  console.log(`\n✅ Testing complete!\n`);
}

main().catch(console.error);
