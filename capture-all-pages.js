import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pages = [
  { name: 'home', url: 'https://www.90210lovecare.com/' },
  { name: '90210-touch', url: 'https://www.90210lovecare.com/90210-touch' },
  { name: 'home-care-services', url: 'https://www.90210lovecare.com/home-care-services' },
  { name: 'caregivers', url: 'https://www.90210lovecare.com/caregivers' },
  { name: 'contact-us', url: 'https://www.90210lovecare.com/contact-us' },
  { name: 'blog', url: 'https://www.90210lovecare.com/blog' }
];

async function captureAllPages() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const outputDir = path.join(__dirname, '90210lovecare-content');
  const allContent = {};

  try {
    for (const pageInfo of pages) {
      console.log(`\n📄 Capturing ${pageInfo.name}...`);

      try {
        await page.goto(pageInfo.url, {
          waitUntil: 'networkidle',
          timeout: 60000
        });

        await page.waitForTimeout(3000);

        // Take screenshot
        await page.screenshot({
          path: path.join(outputDir, `${pageInfo.name}-screenshot.png`),
          fullPage: true
        });

        // Extract content
        const content = await page.evaluate(() => {
          return {
            title: document.title,
            bodyText: document.body.innerText,
            headings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
              tag: h.tagName,
              text: h.innerText.trim()
            })).filter(h => h.text),
            paragraphs: Array.from(document.querySelectorAll('p')).map(p => p.innerText.trim()).filter(p => p),
            lists: Array.from(document.querySelectorAll('ul, ol')).map(list => ({
              type: list.tagName,
              items: Array.from(list.querySelectorAll('li')).map(li => li.innerText.trim())
            }))
          };
        });

        allContent[pageInfo.name] = content;
        console.log(`✅ ${pageInfo.name} captured`);
        console.log(`   - ${content.headings.length} headings`);
        console.log(`   - ${content.paragraphs.length} paragraphs`);
        console.log(`   - ${content.bodyText.length} characters`);

      } catch (error) {
        console.error(`❌ Error capturing ${pageInfo.name}:`, error.message);
        allContent[pageInfo.name] = { error: error.message };
      }
    }

    // Save all content
    fs.writeFileSync(
      path.join(outputDir, 'all-pages-content.json'),
      JSON.stringify(allContent, null, 2)
    );

    console.log('\n✅ All pages captured!');
    console.log(`📁 Saved to: ${path.join(outputDir, 'all-pages-content.json')}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

captureAllPages();
