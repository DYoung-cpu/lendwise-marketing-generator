const { chromium } = require('playwright');

(async () => {
    console.log('Taking screenshot of signature...\n');

    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto('http://localhost:3456');
    await page.waitForTimeout(1000);

    const screenshotPath = '/mnt/c/Users/dyoun/Active Projects/email-signature/signature-preview.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });

    console.log(`✅ Screenshot saved: ${screenshotPath}`);

    await browser.close();
})();
