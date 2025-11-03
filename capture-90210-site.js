import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureSite() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to 90210lovecare.com...');
    await page.goto('https://www.90210lovecare.com/', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    // Wait a bit for any animations or lazy loading
    await page.waitForTimeout(3000);

    // Create output directory
    const outputDir = path.join(__dirname, '90210lovecare-content');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Take full page screenshot
    console.log('Taking screenshot...');
    await page.screenshot({
      path: path.join(outputDir, 'homepage-full.png'),
      fullPage: true
    });

    // Extract all text content
    console.log('Extracting text content...');
    const textContent = await page.evaluate(() => {
      return {
        title: document.title,
        bodyText: document.body.innerText,
        allHeadings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
          tag: h.tagName,
          text: h.innerText
        })),
        allLinks: Array.from(document.querySelectorAll('a')).map(a => ({
          text: a.innerText,
          href: a.href
        })),
        allImages: Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src,
          alt: img.alt
        }))
      };
    });

    // Save text content
    fs.writeFileSync(
      path.join(outputDir, 'content.json'),
      JSON.stringify(textContent, null, 2)
    );

    // Extract page HTML
    const html = await page.content();
    fs.writeFileSync(
      path.join(outputDir, 'page.html'),
      html
    );

    // Try to find and download logo
    console.log('Looking for logo...');
    const logoImages = await page.evaluate(() => {
      const possibleLogos = [];
      const images = document.querySelectorAll('img');

      images.forEach(img => {
        const src = img.src;
        const alt = (img.alt || '').toLowerCase();
        const className = (img.className || '').toLowerCase();

        // Check if likely a logo
        if (alt.includes('logo') ||
            className.includes('logo') ||
            src.includes('logo') ||
            img.closest('header') ||
            img.closest('nav') ||
            img.closest('[class*="header"]') ||
            img.closest('[class*="logo"]')) {
          possibleLogos.push({
            src: src,
            alt: alt,
            width: img.width,
            height: img.height
          });
        }
      });

      return possibleLogos;
    });

    fs.writeFileSync(
      path.join(outputDir, 'logo-candidates.json'),
      JSON.stringify(logoImages, null, 2)
    );

    // Try to download the most likely logo
    if (logoImages.length > 0) {
      for (let i = 0; i < Math.min(3, logoImages.length); i++) {
        const logoUrl = logoImages[i].src;
        console.log(`Downloading logo candidate ${i + 1}: ${logoUrl}`);

        try {
          const response = await page.goto(logoUrl);
          const buffer = await response.body();
          const ext = logoUrl.split('.').pop().split('?')[0] || 'png';
          fs.writeFileSync(
            path.join(outputDir, `logo-${i + 1}.${ext}`),
            buffer
          );
        } catch (e) {
          console.log(`Could not download logo ${i + 1}: ${e.message}`);
        }
      }
    }

    // Navigate back to main page
    await page.goto('https://www.90210lovecare.com/', { waitUntil: 'networkidle' });

    // Check for additional pages
    console.log('Checking for navigation links...');
    const navLinks = await page.evaluate(() => {
      const links = [];
      document.querySelectorAll('nav a, header a, [class*="nav"] a, [class*="menu"] a').forEach(a => {
        if (a.href && a.href.includes('90210lovecare.com') && !links.includes(a.href)) {
          links.push({
            text: a.innerText.trim(),
            href: a.href
          });
        }
      });
      return links;
    });

    fs.writeFileSync(
      path.join(outputDir, 'navigation.json'),
      JSON.stringify(navLinks, null, 2)
    );

    console.log('\n✅ Site capture complete!');
    console.log(`📁 Content saved to: ${outputDir}`);
    console.log('\nCaptured:');
    console.log('- Full page screenshot');
    console.log(`- All text content (${textContent.bodyText.length} characters)`);
    console.log(`- ${textContent.allHeadings.length} headings`);
    console.log(`- ${textContent.allLinks.length} links`);
    console.log(`- ${logoImages.length} logo candidates`);
    console.log(`- ${navLinks.length} navigation links`);

  } catch (error) {
    console.error('Error capturing site:', error);
  } finally {
    await browser.close();
  }
}

captureSite();
