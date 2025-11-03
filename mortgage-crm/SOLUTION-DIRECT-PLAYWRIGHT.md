# Solution: Use Direct Playwright Library Instead of MCP

## Problem

MCP tools are only available in Claude Code's runtime, not in standalone Node.js servers.

## Solution

Replace MCP-based Playwright validator with direct Playwright library.

## Implementation

### Update: `src/validators/playwright-validator.js`

```javascript
import playwright from 'playwright';

class PlaywrightValidator {
  constructor(supabase) {
    this.supabase = supabase;
    this.browser = null;
  }

  async initialize() {
    if (!this.browser) {
      this.browser = await playwright.chromium.launch({ headless: true });
    }
  }

  async analyzeImage(imageUrl, generationId) {
    await this.initialize();

    const context = await this.browser.newContext();
    const page = await context.newPage();

    // Navigate to image
    await page.goto(`data:text/html,<img src="${imageUrl}" id="img" />`);
    await page.waitForLoadState('networkidle');

    // Analyze pixels
    const metrics = await page.evaluate(() => {
      const img = document.getElementById('img');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Calculate metrics (same as MCP version)
      let rTotal = 0, gTotal = 0, bTotal = 0;
      const sampleSize = Math.min(10000, pixels.length / 40);

      for (let i = 0; i < sampleSize; i++) {
        const idx = i * 4 * Math.floor(pixels.length / (sampleSize * 4));
        rTotal += pixels[idx];
        gTotal += pixels[idx + 1];
        bTotal += pixels[idx + 2];
      }

      return {
        dimensions: {
          width: img.naturalWidth,
          height: img.naturalHeight
        },
        colors: {
          avgR: rTotal / sampleSize,
          avgG: gTotal / sampleSize,
          avgB: bTotal / sampleSize
        }
      };
    });

    await context.close();
    return this.assessMetrics(metrics);
  }

  assessMetrics(metrics) {
    // Same scoring logic as MCP version
    let score = 0.5;
    const issues = [];

    if (metrics.dimensions.width >= 1024) score += 0.15;
    // ... rest of scoring

    return { score, issues, metrics };
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

export default PlaywrightValidator;
```

### Install Playwright

```bash
npm install playwright
npx playwright install chromium
```

### Update Quality Agent

```javascript
// src/agents/quality-agent.js
import PlaywrightValidator from '../validators/playwright-validator.js';

this.playwright = new PlaywrightValidator(supabase);
```

## Benefits

- ✅ Works in standalone Node.js server
- ✅ Same functionality as MCP version
- ✅ No dependency on Claude Code runtime
- ✅ Can run in production

## Trade-offs

- Slightly more code (need to manage browser lifecycle)
- Need to install Playwright separately
- But: More reliable, works everywhere
