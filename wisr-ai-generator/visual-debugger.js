/**
 * Visual Debugger - Claude Vision Analysis for Layout Debugging
 *
 * Uses Claude Vision API to analyze screenshots and identify:
 * - Text alignment issues
 * - Spacing problems
 * - Element positioning
 * - Layout inconsistencies
 *
 * Returns specific, actionable CSS fixes
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';

class VisualDebugger {
  constructor(options = {}) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    this.model = options.model || 'claude-3-opus-20240229';
  }

  /**
   * Analyze a screenshot to identify layout issues
   * @param {string} screenshotPath - Path to screenshot file
   * @param {Object} expectedLayout - Expected layout specification
   * @param {Object} consoleData - Console errors and page errors from Playwright
   * @returns {Promise<Object>} - Analysis with specific issues and fixes
   */
  async analyzeScreenshot(screenshotPath, expectedLayout = {}, consoleData = {}) {
    console.log('🔍 Visual Debugger: Analyzing screenshot...');

    // Read screenshot as base64
    const imageBuffer = await fs.readFile(screenshotPath);
    const base64Image = imageBuffer.toString('base64');
    const mediaType = screenshotPath.endsWith('.png') ? 'image/png' : 'image/jpeg';

    // Build analysis prompt (include console errors if provided)
    const prompt = this.buildAnalysisPrompt(expectedLayout, consoleData);

    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image
              }
            },
            {
              type: 'text',
              text: prompt
            }
          ]
        }]
      });

      const analysisText = response.content[0].text;

      // Parse the analysis into structured data
      const analysis = this.parseAnalysis(analysisText);

      console.log('✅ Visual analysis complete');
      console.log(`   Found ${analysis.issues.length} issues`);

      return analysis;

    } catch (error) {
      console.error('❌ Visual analysis failed:', error.message);
      return {
        success: false,
        error: error.message,
        issues: [],
        fixes: []
      };
    }
  }

  /**
   * Build the analysis prompt based on asset type
   */
  buildAnalysisPrompt(expectedLayout, consoleData = {}) {
    const { assetType, template, expectedElements = [] } = expectedLayout;
    const { consoleErrors = [], pageErrors = [] } = consoleData;

    // Add console/page errors to the analysis context
    let errorContext = '';
    if (consoleErrors.length > 0 || pageErrors.length > 0) {
      errorContext = `\n\nBROWSER ERRORS DETECTED:`;

      if (consoleErrors.length > 0) {
        errorContext += `\n\nConsole Errors (${consoleErrors.length}):\n`;
        errorContext += consoleErrors.map(err => `- ${err.text}`).join('\n');
      }

      if (pageErrors.length > 0) {
        errorContext += `\n\nPage Errors (${pageErrors.length}):\n`;
        errorContext += pageErrors.map(err => `- ${err.message}`).join('\n');
      }

      errorContext += `\n\nPlease analyze both the visual issues AND these JavaScript errors. Suggest fixes for both.`;
    }

    if (assetType === 'signature') {
      return `You are analyzing an email signature image for layout and text positioning issues.

EXPECTED ELEMENTS:
${expectedElements.map(e => `- ${e.name}: ${e.description}`).join('\n')}

CRITICAL REQUIREMENTS:
- Aspect ratio: 21:9 (or 7:2 for email clients)
- Text must NOT be stretched or distorted
- Logo must be positioned correctly
- All text must be readable
- Contact information must be properly aligned
- Links must be visually distinct${errorContext}

ANALYZE THIS IMAGE AND IDENTIFY:
1. Text alignment issues (left/right/center misalignment)
2. Text stretching or distortion
3. Spacing problems (too tight, too loose)
4. Element overlap or occlusion
5. Aspect ratio violations
6. Logo positioning issues
7. Font size inconsistencies

For each issue found, provide:
- ISSUE: Clear description of what's wrong
- LOCATION: Where in the image (top/middle/bottom, left/center/right)
- SEVERITY: Critical, High, Medium, Low
- FIX: Specific CSS property and value to fix it

Format your response as:
ISSUE: [description]
LOCATION: [position]
SEVERITY: [level]
FIX: [css-property]: [value]

---

If the image looks correct with no issues, respond with:
NO ISSUES FOUND

Be extremely specific about pixel measurements and positioning.`;
    }

    if (assetType === 'video') {
      return `You are analyzing a video frame for text overlay positioning and readability.

EXPECTED TEXT OVERLAYS:
${expectedElements.map(e => `- ${e.text}: ${e.position}`).join('\n')}

CRITICAL REQUIREMENTS:
- All text must be readable against background
- Text must not overlap with other elements
- Animations must be visible at key frames
- Text sizing must be appropriate
- Color contrast must be sufficient

ANALYZE THIS VIDEO FRAME AND IDENTIFY:
1. Text readability issues
2. Text positioning problems
3. Overlap with background elements
4. Color contrast issues
5. Font size problems

For each issue, provide specific fixes.`;
    }

    // Default/generic analysis
    return `Analyze this image for layout and design issues. Identify any text alignment, spacing, or positioning problems. Provide specific CSS fixes for each issue found.`;
  }

  /**
   * Parse Claude's analysis text into structured data
   */
  parseAnalysis(analysisText) {
    const lines = analysisText.split('\n');
    const issues = [];
    const fixes = [];

    let currentIssue = null;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('ISSUE:')) {
        if (currentIssue) {
          issues.push(currentIssue);
          if (currentIssue.fix) {
            fixes.push(currentIssue.fix);
          }
        }
        currentIssue = {
          description: trimmed.replace('ISSUE:', '').trim(),
          location: '',
          severity: 'Medium',
          fix: null
        };
      } else if (trimmed.startsWith('LOCATION:') && currentIssue) {
        currentIssue.location = trimmed.replace('LOCATION:', '').trim();
      } else if (trimmed.startsWith('SEVERITY:') && currentIssue) {
        currentIssue.severity = trimmed.replace('SEVERITY:', '').trim();
      } else if (trimmed.startsWith('FIX:') && currentIssue) {
        const fixText = trimmed.replace('FIX:', '').trim();
        currentIssue.fix = this.parseCSSFix(fixText);
      }
    }

    // Add last issue
    if (currentIssue) {
      issues.push(currentIssue);
      if (currentIssue.fix) {
        fixes.push(currentIssue.fix);
      }
    }

    // Check if no issues found
    const noIssues = analysisText.includes('NO ISSUES FOUND');

    return {
      success: true,
      noIssues,
      issues,
      fixes,
      rawAnalysis: analysisText
    };
  }

  /**
   * Parse CSS fix from text like "margin-left: 20px"
   */
  parseCSSFix(fixText) {
    // Try to extract property: value
    const match = fixText.match(/([a-z-]+):\s*([^;]+)/i);

    if (match) {
      return {
        property: match[1].trim(),
        value: match[2].trim(),
        raw: fixText
      };
    }

    return {
      property: null,
      value: null,
      raw: fixText
    };
  }

  /**
   * Analyze and compare before/after screenshots
   */
  async compareScreenshots(beforePath, afterPath, expectedLayout) {
    console.log('🔍 Visual Debugger: Comparing before/after screenshots...');

    const beforeAnalysis = await this.analyzeScreenshot(beforePath, expectedLayout);
    const afterAnalysis = await this.analyzeScreenshot(afterPath, expectedLayout);

    const improvements = [];
    const newIssues = [];
    const stillBroken = [];

    // Check which issues were fixed
    for (const beforeIssue of beforeAnalysis.issues) {
      const stillExists = afterAnalysis.issues.some(
        afterIssue => afterIssue.description === beforeIssue.description
      );

      if (!stillExists) {
        improvements.push(beforeIssue.description);
      } else {
        stillBroken.push(beforeIssue.description);
      }
    }

    // Check for new issues introduced
    for (const afterIssue of afterAnalysis.issues) {
      const wasPresent = beforeAnalysis.issues.some(
        beforeIssue => beforeIssue.description === afterIssue.description
      );

      if (!wasPresent) {
        newIssues.push(afterIssue.description);
      }
    }

    return {
      before: beforeAnalysis,
      after: afterAnalysis,
      improvements,
      newIssues,
      stillBroken,
      improved: improvements.length > 0 && newIssues.length === 0
    };
  }

  /**
   * Generate detailed debugging report
   */
  async generateReport(screenshotPath, expectedLayout) {
    const analysis = await this.analyzeScreenshot(screenshotPath, expectedLayout);

    const report = {
      timestamp: new Date().toISOString(),
      screenshot: screenshotPath,
      summary: {
        totalIssues: analysis.issues.length,
        critical: analysis.issues.filter(i => i.severity === 'Critical').length,
        high: analysis.issues.filter(i => i.severity === 'High').length,
        medium: analysis.issues.filter(i => i.severity === 'Medium').length,
        low: analysis.issues.filter(i => i.severity === 'Low').length
      },
      issues: analysis.issues,
      recommendedFixes: analysis.fixes,
      passedValidation: analysis.noIssues,
      rawAnalysis: analysis.rawAnalysis
    };

    return report;
  }

  /**
   * Quick validation - just check if screenshot passes
   */
  async quickValidate(screenshotPath, expectedLayout) {
    const analysis = await this.analyzeScreenshot(screenshotPath, expectedLayout);

    return {
      passed: analysis.noIssues,
      issueCount: analysis.issues.length,
      criticalIssues: analysis.issues.filter(i => i.severity === 'Critical').length,
      issues: analysis.issues.map(i => i.description)
    };
  }
}

export default VisualDebugger;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const screenshotPath = process.argv[2];
  const assetType = process.argv[3] || 'signature';

  if (!screenshotPath) {
    console.error('Usage: node visual-debugger.js <screenshot-path> [asset-type]');
    process.exit(1);
  }

  const visualDebugger = new VisualDebugger();

  visualDebugger.analyzeScreenshot(screenshotPath, {
    assetType,
    expectedElements: [
      { name: 'Contact Name', description: 'Should be centered and clearly visible' },
      { name: 'Title', description: 'Should be below name' },
      { name: 'Logo', description: 'Should not overlap text' }
    ]
  })
    .then(analysis => {
      console.log('\n📊 VISUAL ANALYSIS REPORT');
      console.log('═══════════════════════════════════════\n');

      if (analysis.noIssues) {
        console.log('✅ NO ISSUES FOUND - Layout looks perfect!\n');
      } else {
        console.log(`Found ${analysis.issues.length} issues:\n`);

        analysis.issues.forEach((issue, index) => {
          console.log(`${index + 1}. ${issue.description}`);
          console.log(`   Location: ${issue.location}`);
          console.log(`   Severity: ${issue.severity}`);
          if (issue.fix) {
            console.log(`   Fix: ${issue.fix.property}: ${issue.fix.value}`);
          }
          console.log('');
        });

        if (analysis.fixes.length > 0) {
          console.log('\n🔧 RECOMMENDED CSS FIXES:');
          console.log('═══════════════════════════════════════\n');
          analysis.fixes.forEach(fix => {
            console.log(`${fix.property}: ${fix.value};`);
          });
        }
      }

      console.log('\n═══════════════════════════════════════\n');
    })
    .catch(error => {
      console.error('Error:', error.message);
      process.exit(1);
    });
}
