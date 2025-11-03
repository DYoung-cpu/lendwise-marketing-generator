import { chromium } from 'playwright';

async function debug() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    console.log('BROWSER LOG:', msg.type(), msg.text());
  });
  
  // Listen for errors
  page.on('pageerror', error => {
    console.error('PAGE ERROR:', error.message);
  });
  
  try {
    console.log('Navigating to http://localhost:3003/...');
    await page.goto('http://localhost:3003/', { waitUntil: 'networkidle', timeout: 10000 });
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: '/tmp/90210-debug.png', fullPage: true });
    
    // Get page title and content
    const title = await page.title();
    const bodyText = await page.evaluate(() => document.body.innerText);
    const htmlContent = await page.content();
    
    console.log('\n=== DEBUG INFO ===');
    console.log('Title:', title);
    console.log('Body text length:', bodyText.length);
    console.log('Body text preview:', bodyText.substring(0, 200));
    
    // Check for React root
    const hasRoot = await page.evaluate(() => !!document.getElementById('root'));
    console.log('Has #root element:', hasRoot);
    
    // Check if React rendered anything
    const rootContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root ? root.innerHTML.length : 0;
    });
    console.log('Root content length:', rootContent);
    
    await browser.close();
  } catch (error) {
    console.error('ERROR:', error.message);
    await browser.close();
  }
}

debug();
