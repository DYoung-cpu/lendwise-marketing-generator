/**
 * Text Overlay Renderer
 *
 * Uses Playwright to render Nano-styled text as transparent PNG overlays
 * This solves the "Firted" problem by generating perfect text separately
 */

import { chromium } from 'playwright';
import { writeFile } from 'fs/promises';

/**
 * Nano-style CSS template matching your brand
 */
const NANO_TEXT_STYLES = {
  headline: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: 'transparent',
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #B8860B 100%)',
    webkitBackgroundClip: 'text',
    webkitTextFillColor: 'transparent',
    textShadow: '3px 3px 6px rgba(0,0,0,0.4), 0 0 20px rgba(255,215,0,0.3)',
    letterSpacing: '1px'
  },
  rateLarge: {
    fontSize: '72px',
    fontWeight: 'bold',
    color: 'transparent',
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #B8860B 100%)',
    webkitBackgroundClip: 'text',
    webkitTextFillColor: 'transparent',
    textShadow: '5px 5px 10px rgba(0,0,0,0.5), 0 0 30px rgba(255,215,0,0.4)',
    letterSpacing: '2px'
  },
  rateSmall: {
    fontSize: '36px',
    fontWeight: '600',
    color: 'transparent',
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #B8860B 100%)',
    webkitBackgroundClip: 'text',
    webkitTextFillColor: 'transparent',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 0 15px rgba(255,215,0,0.2)',
    letterSpacing: '0.5px'
  },
  contact: {
    fontSize: '32px',
    fontWeight: '500',
    color: '#FFFFFF',
    textShadow: '2px 2px 4px rgba(0,0,0,0.6), 0 0 10px rgba(255,215,0,0.3)',
    letterSpacing: '0.5px'
  },
  white: {
    fontSize: '36px',
    fontWeight: '600',
    color: '#FFFFFF',
    textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
    letterSpacing: '1px'
  }
};

/**
 * Convert CSS object to inline style string
 */
function cssToInlineStyle(cssObj) {
  return Object.entries(cssObj)
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${kebabKey}: ${value}`;
    })
    .join('; ');
}

/**
 * Generate styled text overlay as PNG
 *
 * @param {Object} config - Text configuration
 * @param {string} config.text - Text content
 * @param {string} config.style - Style name from NANO_TEXT_STYLES
 * @param {number} config.width - Canvas width (default: 1080)
 * @param {number} config.height - Canvas height (default: 1920)
 * @param {Object} config.customStyle - Optional custom CSS overrides
 * @returns {Promise<Buffer>} PNG buffer
 */
export async function generateTextOverlay(config) {
  const {
    text,
    style = 'headline',
    width = 1080,
    height = 1920,
    customStyle = {}
  } = config;

  // Get base style
  const baseStyle = NANO_TEXT_STYLES[style] || NANO_TEXT_STYLES.headline;

  // Merge with custom overrides
  const finalStyle = { ...baseStyle, ...customStyle };

  // Convert to inline CSS
  const inlineStyle = cssToInlineStyle(finalStyle);

  // Create HTML
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: ${width}px;
      height: ${height}px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      font-family: 'Arial', 'Helvetica', sans-serif;
    }
    .text {
      ${inlineStyle};
      text-align: center;
      max-width: 90%;
      word-wrap: break-word;
    }
  </style>
</head>
<body>
  <div class="text">${text}</div>
</body>
</html>
  `;

  // Launch headless browser
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Set viewport
  await page.setViewportSize({ width, height });

  // Load HTML
  await page.setContent(html);

  // Take screenshot with transparency
  const screenshot = await page.screenshot({
    omitBackground: true,
    type: 'png'
  });

  await browser.close();

  return screenshot;
}

/**
 * Generate multiple text overlays for a complete design
 *
 * @param {Array} textLayers - Array of text layer configurations
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {Promise<Array>} Array of { layer: config, buffer: PNG }
 */
export async function generateMultipleOverlays(textLayers, width = 1080, height = 1920) {
  const results = [];

  for (const layer of textLayers) {
    const buffer = await generateTextOverlay({
      ...layer,
      width,
      height
    });

    results.push({
      layer,
      buffer
    });
  }

  return results;
}

/**
 * Save text overlay to file
 *
 * @param {Object} config - Text configuration
 * @param {string} outputPath - Output file path
 * @returns {Promise<string>} Output path
 */
export async function saveTextOverlay(config, outputPath) {
  const buffer = await generateTextOverlay(config);
  await writeFile(outputPath, buffer);
  return outputPath;
}

/**
 * Example usage
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Text Overlay Renderer - Example Usage\n');

  const exampleLayers = [
    {
      text: 'MORTGAGE RATE UPDATE',
      style: 'headline'
    },
    {
      text: '30-Year Fixed: 6.13%',
      style: 'rateLarge'
    },
    {
      text: '15-Year: 5.45% | Jumbo: 6.75%',
      style: 'rateSmall'
    },
    {
      text: 'Contact David Young NMLS 62043',
      style: 'contact'
    }
  ];

  console.log('Generating example overlays...\n');

  for (const [index, layer] of exampleLayers.entries()) {
    const outputPath = `/tmp/text-overlay-${index}.png`;
    await saveTextOverlay(layer, outputPath);
    console.log(`✅ Generated: ${outputPath}`);
    console.log(`   Text: "${layer.text}"`);
    console.log(`   Style: ${layer.style}\n`);
  }

  console.log('Done! Check /tmp/ for generated PNG files.');
}
