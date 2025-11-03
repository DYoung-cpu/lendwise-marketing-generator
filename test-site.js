import { chromium } from 'playwright';

async function testSite() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Testing http://localhost:5173...');

  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Browser Console Error:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('❌ Page Error:', error.message);
  });

  try {
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 10000
    });

    // Wait for React to render
    await page.waitForTimeout(2000);

    // Check if content is visible
    const bodyText = await page.textContent('body');

    if (bodyText.includes('90210')) {
      console.log('✅ Site loaded successfully!');
      console.log('✅ Content found: 90210 Love Care');
    } else {
      console.log('❌ Content not found');
    }

    // Take screenshot
    await page.screenshot({
      path: '/mnt/c/Users/dyoun/Active Projects/90210-site-test.png',
      fullPage: true
    });
    console.log('✅ Screenshot saved: 90210-site-test.png');

    // Check for navigation
    const navExists = await page.locator('nav').count();
    console.log(`✅ Navigation found: ${navExists > 0 ? 'Yes' : 'No'}`);

    // Keep browser open for 30 seconds for manual inspection
    console.log('\n🔍 Browser will stay open for 30 seconds for inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  await browser.close();
  console.log('\n✅ Test complete!');
}

testSite();
