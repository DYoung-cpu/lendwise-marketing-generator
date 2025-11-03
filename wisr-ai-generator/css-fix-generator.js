/**
 * CSS Fix Generator - Apply CSS fixes to HTML based on visual analysis
 *
 * Takes visual analysis results and:
 * - Generates specific CSS fixes
 * - Applies fixes to HTML files
 * - Creates versioned backups
 * - Validates fix application
 */

import fs from 'fs/promises';
import path from 'path';

class CSSFixGenerator {
  constructor(options = {}) {
    this.backupDir = options.backupDir || path.resolve('./backups');
  }

  /**
   * Apply CSS fixes to HTML file based on visual analysis
   * @param {string} htmlPath - Path to HTML file to fix
   * @param {Array} fixes - Array of CSS fixes from visual analysis
   * @param {Object} options - Fix options
   * @returns {Promise<Object>} - Results of fix application
   */
  async applyFixes(htmlPath, fixes, options = {}) {
    console.log('🔧 CSS Fix Generator: Applying fixes...');
    console.log(`   HTML: ${htmlPath}`);
    console.log(`   Fixes: ${fixes.length}`);

    // Read current HTML
    const html = await fs.readFile(htmlPath, 'utf-8');

    // Create backup
    if (options.backup !== false) {
      await this.createBackup(htmlPath, html);
    }

    // Apply fixes
    let modifiedHtml = html;
    const appliedFixes = [];
    const failedFixes = [];

    for (const fix of fixes) {
      try {
        const result = await this.applySingleFix(modifiedHtml, fix);
        modifiedHtml = result.html;
        appliedFixes.push({
          fix,
          applied: true,
          ...result
        });
        console.log(`   ✅ Applied: ${fix.property} = ${fix.value}`);
      } catch (error) {
        failedFixes.push({
          fix,
          error: error.message
        });
        console.log(`   ❌ Failed: ${fix.property} - ${error.message}`);
      }
    }

    // Write modified HTML
    await fs.writeFile(htmlPath, modifiedHtml);

    console.log(`   ✅ Applied ${appliedFixes.length}/${fixes.length} fixes`);

    return {
      success: appliedFixes.length > 0,
      htmlPath,
      appliedFixes,
      failedFixes,
      totalFixes: fixes.length
    };
  }

  /**
   * Apply a single CSS fix to HTML
   */
  async applySingleFix(html, fix) {
    const { property, value, selector, context } = fix;

    // Find <style> tag or create one
    let styleStart = html.indexOf('<style>');
    let styleEnd = html.indexOf('</style>');

    if (styleStart === -1) {
      // No style tag - create one
      const headEnd = html.indexOf('</head>');
      if (headEnd === -1) {
        throw new Error('No <head> tag found in HTML');
      }

      const newStyle = `  <style>\n    /* Auto-generated fixes */\n  </style>\n`;
      html = html.slice(0, headEnd) + newStyle + html.slice(headEnd);

      styleStart = html.indexOf('<style>');
      styleEnd = html.indexOf('</style>');
    }

    // Extract current CSS
    const cssContent = html.slice(styleStart + 7, styleEnd);

    // Determine selector to apply fix to
    const targetSelector = selector || this.inferSelector(fix, context);

    // Apply fix to CSS
    const modifiedCSS = this.applyCSSRule(cssContent, targetSelector, property, value);

    // Replace CSS in HTML
    const modifiedHTML = html.slice(0, styleStart + 7) + modifiedCSS + html.slice(styleEnd);

    return {
      html: modifiedHTML,
      selector: targetSelector,
      cssAdded: `${targetSelector} { ${property}: ${value}; }`
    };
  }

  /**
   * Infer CSS selector based on fix context
   */
  inferSelector(fix, context) {
    // If fix mentions specific elements, try to match them
    const description = fix.raw || fix.description || '';

    if (description.toLowerCase().includes('name') || description.toLowerCase().includes('contact')) {
      return '.contact-name, .name';
    }

    if (description.toLowerCase().includes('title')) {
      return '.title, .job-title';
    }

    if (description.toLowerCase().includes('logo')) {
      return '.logo, img.logo';
    }

    if (description.toLowerCase().includes('email')) {
      return '.email, a[href^="mailto"]';
    }

    if (description.toLowerCase().includes('phone')) {
      return '.phone, a[href^="tel"]';
    }

    if (description.toLowerCase().includes('button') || description.toLowerCase().includes('cta')) {
      return '.button, .cta, a.button';
    }

    // Default to body or wrapper
    return 'body, .signature-wrapper, .container';
  }

  /**
   * Apply CSS rule to existing CSS content
   */
  applyCSSRule(cssContent, selector, property, value) {
    // Check if selector already exists in CSS
    const selectorRegex = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'i');
    const match = cssContent.match(selectorRegex);

    if (match) {
      // Selector exists - update or add property
      const existingRules = match[1];
      const propertyRegex = new RegExp(`${property}\\s*:\\s*[^;]+;`, 'i');

      let newRules;
      if (propertyRegex.test(existingRules)) {
        // Property exists - replace it
        newRules = existingRules.replace(propertyRegex, `${property}: ${value};`);
      } else {
        // Property doesn't exist - add it
        newRules = existingRules.trim() + `\n      ${property}: ${value};`;
      }

      return cssContent.replace(match[0], `${selector} {${newRules}\n    }`);
    } else {
      // Selector doesn't exist - add new rule
      const newRule = `\n    ${selector} {\n      ${property}: ${value};\n    }\n`;
      return cssContent + newRule;
    }
  }

  /**
   * Create backup of HTML file before applying fixes
   */
  async createBackup(htmlPath, htmlContent) {
    await fs.mkdir(this.backupDir, { recursive: true });

    const filename = path.basename(htmlPath);
    const timestamp = Date.now();
    const backupPath = path.join(this.backupDir, `${filename}.${timestamp}.backup`);

    await fs.writeFile(backupPath, htmlContent);

    console.log(`   💾 Backup created: ${backupPath}`);

    return backupPath;
  }

  /**
   * Generate CSS fixes from common issues
   */
  generateCommonFixes(issues) {
    const fixes = [];

    for (const issue of issues) {
      const desc = (issue.description || '').toLowerCase();
      const location = (issue.location || '').toLowerCase();

      // Text alignment issues
      if (desc.includes('text') && desc.includes('left')) {
        fixes.push({
          property: 'text-align',
          value: 'left',
          description: issue.description,
          context: issue
        });
      } else if (desc.includes('text') && desc.includes('center')) {
        fixes.push({
          property: 'text-align',
          value: 'center',
          description: issue.description,
          context: issue
        });
      }

      // Text stretching
      if (desc.includes('stretch') || desc.includes('distort')) {
        fixes.push({
          property: 'transform',
          value: 'scale(1, 1)',
          description: issue.description,
          context: issue
        });
        fixes.push({
          property: 'aspect-ratio',
          value: 'auto',
          description: issue.description,
          context: issue
        });
      }

      // Spacing issues
      if (desc.includes('spacing') && desc.includes('tight')) {
        fixes.push({
          property: 'margin',
          value: '10px 0',
          description: issue.description,
          context: issue
        });
      } else if (desc.includes('spacing') && desc.includes('loose')) {
        fixes.push({
          property: 'margin',
          value: '5px 0',
          description: issue.description,
          context: issue
        });
      }

      // Overlap issues
      if (desc.includes('overlap')) {
        fixes.push({
          property: 'z-index',
          value: '10',
          description: issue.description,
          context: issue
        });
        fixes.push({
          property: 'position',
          value: 'relative',
          description: issue.description,
          context: issue
        });
      }

      // Logo positioning
      if (desc.includes('logo') && location.includes('left')) {
        fixes.push({
          property: 'margin-right',
          value: '15px',
          selector: '.logo, img.logo',
          description: issue.description,
          context: issue
        });
      }

      // Font size issues
      if (desc.includes('font') && desc.includes('small')) {
        fixes.push({
          property: 'font-size',
          value: '14px',
          description: issue.description,
          context: issue
        });
      } else if (desc.includes('font') && desc.includes('large')) {
        fixes.push({
          property: 'font-size',
          value: '12px',
          description: issue.description,
          context: issue
        });
      }
    }

    return fixes;
  }

  /**
   * Merge fixes from visual analysis and generated common fixes
   */
  mergeFixes(visualFixes, issues) {
    const allFixes = [...visualFixes];

    // Add common fixes for issues that don't have specific visual fixes
    const commonFixes = this.generateCommonFixes(issues);

    for (const commonFix of commonFixes) {
      const alreadyFixed = visualFixes.some(
        vf => vf.property === commonFix.property
      );

      if (!alreadyFixed) {
        allFixes.push(commonFix);
      }
    }

    return allFixes;
  }

  /**
   * Restore from backup
   */
  async restoreBackup(htmlPath) {
    const filename = path.basename(htmlPath);

    // Find most recent backup
    const backups = await fs.readdir(this.backupDir);
    const matchingBackups = backups
      .filter(b => b.startsWith(filename))
      .sort()
      .reverse();

    if (matchingBackups.length === 0) {
      throw new Error('No backup found');
    }

    const latestBackup = path.join(this.backupDir, matchingBackups[0]);
    const backupContent = await fs.readFile(latestBackup, 'utf-8');

    await fs.writeFile(htmlPath, backupContent);

    console.log(`✅ Restored from backup: ${latestBackup}`);

    return latestBackup;
  }
}

export default CSSFixGenerator;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const htmlPath = process.argv[2];
  const property = process.argv[3];
  const value = process.argv[4];

  if (!htmlPath || !property || !value) {
    console.error('Usage: node css-fix-generator.js <html-path> <css-property> <css-value>');
    console.error('Example: node css-fix-generator.js signature.html margin-left 20px');
    process.exit(1);
  }

  const generator = new CSSFixGenerator();

  generator.applyFixes(htmlPath, [{
    property,
    value,
    description: `Manual fix: ${property} = ${value}`
  }])
    .then(result => {
      console.log('\n✅ CSS FIXES APPLIED');
      console.log('═══════════════════════════════════════\n');
      console.log(`Applied: ${result.appliedFixes.length} fixes`);
      console.log(`Failed: ${result.failedFixes.length} fixes`);

      if (result.appliedFixes.length > 0) {
        console.log('\nApplied CSS:');
        result.appliedFixes.forEach(af => {
          console.log(`  ${af.cssAdded}`);
        });
      }

      console.log('\n═══════════════════════════════════════\n');
    })
    .catch(error => {
      console.error('Error:', error.message);
      process.exit(1);
    });
}
