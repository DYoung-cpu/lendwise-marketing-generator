import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const htmlPath = 'file://' + path.resolve('/mnt/c/Users/dyoun/Downloads/Wayne_Davis_Compensation_Agreement.html');
  console.log('Loading HTML file:', htmlPath);

  await page.goto(htmlPath, {
    waitUntil: 'networkidle0'
  });

  const pdfPath = '/mnt/c/Users/dyoun/Downloads/LendWise_Compensation_Agreement_Wayne_Davis_v3.1_' + Date.now() + '.pdf';

  console.log('Generating PDF...');
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: {
      top: '0.5in',
      right: '0.5in',
      bottom: '0.5in',
      left: '0.5in'
    }
  });

  console.log('PDF generated successfully at:', pdfPath);
  await browser.close();

  process.exit(0);
})().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
