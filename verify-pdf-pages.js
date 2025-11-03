import { chromium } from 'playwright';

async function verifyPDF() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    const pdfPath = '/mnt/c/Users/dyoun/Downloads/Wayne_Davis_Compensation_Agreement.pdf';

    console.log('Opening PDF in browser...');
    await page.goto(`file://${pdfPath}`);

    console.log('PDF opened. Please review the pages manually.');
    console.log('Press Ctrl+C when done reviewing.');

    // Keep browser open for manual review
    await new Promise(() => {});
}

verifyPDF();
