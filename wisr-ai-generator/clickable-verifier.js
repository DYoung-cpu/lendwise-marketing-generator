#!/usr/bin/env node
/**
 * Clickable Verifier - Automated Visual Verification for Email Signatures
 *
 * Addresses user concern: "I believe you never testing it with playwright MCP to confirm placement"
 *
 * This tool uses Playwright to verify generated email signatures:
 * - Image dimensions within boundaries
 * - No stretched images (aspect ratio preserved)
 * - Text positioned correctly
 * - Clickable links functional
 * - Styles applied correctly
 *
 * Usage:
 *   import { verifySignature } from './clickable-verifier.js';
 *   const result = await verifySignature(signatureHTML, userInfo);
 */

import playwright from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const VERIFICATION_DIR = path.join(__dirname, 'verification-screenshots');

// Ensure verification directory exists
async function ensureVerificationDirectory() {
    try {
        await fs.mkdir(VERIFICATION_DIR, { recursive: true });
    } catch (error) {
        console.error('Failed to create verification directory:', error);
    }
}

/**
 * Verify email signature visual correctness
 * @param {string} signatureHTML - The generated signature HTML
 * @param {Object} userInfo - User information for validation
 * @param {string} userInfo.name - User's full name
 * @param {string} userInfo.phone - Phone number (e.g., "(555) 123-4567")
 * @param {string} userInfo.email - Email address
 * @param {string} userInfo.nmls - NMLS number
 * @returns {Promise<Object>} Verification result
 */
export async function verifySignature(signatureHTML, userInfo = {}) {
    await ensureVerificationDirectory();

    const issues = [];
    const checks = {
        dimensions: '⏳',
        aspectRatio: '⏳',
        textPositioning: '⏳',
        clickableLinks: '⏳',
        styling: '⏳',
        overflow: '⏳'
    };

    let browser;
    let screenshotPath = null;

    try {
        browser = await playwright.chromium.launch({ headless: true });
        const context = await browser.newContext({
            viewport: { width: 1000, height: 600 }
        });
        const page = await context.newPage();

        // Create test page with signature
        const testHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            margin: 0;
            padding: 40px;
            background: #f5f5f5;
            font-family: Arial, sans-serif;
        }
        #verification-container {
            background: white;
            border: 2px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            max-width: 750px;
            margin: 0 auto;
        }
        #signature-container {
            max-width: 700px;
            min-height: 200px;
            border: 1px dashed #ccc;
            padding: 10px;
            position: relative;
        }
        .verification-info {
            margin-top: 20px;
            padding: 15px;
            background: #f9f9f9;
            border-left: 4px solid #2d5f3f;
            font-size: 12px;
            color: #666;
        }
        .verification-info strong {
            color: #2d5f3f;
        }
    </style>
</head>
<body>
    <div id="verification-container">
        <h2 style="margin: 0 0 15px 0; color: #2d5f3f; font-size: 18px;">
            Email Signature Verification
        </h2>
        <div id="signature-container">
            ${signatureHTML}
        </div>
        <div class="verification-info">
            <strong>Verification Bounds:</strong> Max 700px width × 200px height<br>
            <strong>Checking:</strong> Dimensions, aspect ratios, text positioning, clickable links, styling
        </div>
    </div>
</body>
</html>
        `;

        await page.setContent(testHTML, { waitUntil: 'networkidle' });

        // Wait for any images to load
        await page.waitForTimeout(1000);

        // === CHECK 1: Container Dimensions ===
        try {
            const container = await page.locator('#signature-container').first();
            const containerBox = await container.boundingBox();

            if (!containerBox) {
                issues.push('Container not found or not visible');
                checks.dimensions = '❌';
            } else {
                const contentWidth = containerBox.width - 20; // subtract padding
                const contentHeight = containerBox.height - 20;

                if (contentWidth > 700) {
                    issues.push(`Width exceeds limit: ${Math.round(contentWidth)}px > 700px`);
                    checks.dimensions = '❌';
                } else if (contentHeight > 250) {
                    issues.push(`Height exceeds recommended: ${Math.round(contentHeight)}px > 250px`);
                    checks.dimensions = '⚠️';
                } else {
                    checks.dimensions = '✓';
                }
            }
        } catch (error) {
            issues.push(`Dimension check failed: ${error.message}`);
            checks.dimensions = '❌';
        }

        // === CHECK 2: Image Aspect Ratio (No Stretching) ===
        try {
            const container = await page.locator('#signature-container').first();
            const images = await container.locator('img').all();

            if (images.length === 0) {
                checks.aspectRatio = '⚠️ No images found';
            } else {
                let aspectIssues = 0;

                for (let i = 0; i < images.length; i++) {
                    const img = images[i];

                    // Get natural and display dimensions
                    const imgInfo = await img.evaluate(el => ({
                        naturalWidth: el.naturalWidth,
                        naturalHeight: el.naturalHeight,
                        displayWidth: el.width,
                        displayHeight: el.height,
                        objectFit: window.getComputedStyle(el).objectFit,
                        src: el.src.substring(0, 50) + '...'
                    }));

                    if (imgInfo.naturalWidth === 0 || imgInfo.naturalHeight === 0) {
                        issues.push(`Image ${i} failed to load`);
                        aspectIssues++;
                        continue;
                    }

                    const naturalRatio = imgInfo.naturalWidth / imgInfo.naturalHeight;
                    const displayRatio = imgInfo.displayWidth / imgInfo.displayHeight;
                    const ratioDiff = Math.abs(naturalRatio - displayRatio);

                    // Allow 10% tolerance
                    if (ratioDiff > 0.1) {
                        issues.push(`Image ${i} stretched: natural=${naturalRatio.toFixed(2)}, display=${displayRatio.toFixed(2)}`);
                        aspectIssues++;
                    }

                    // Check object-fit
                    if (!['cover', 'contain', 'scale-down'].includes(imgInfo.objectFit)) {
                        issues.push(`Image ${i} may stretch: object-fit="${imgInfo.objectFit}"`);
                        aspectIssues++;
                    }
                }

                checks.aspectRatio = aspectIssues === 0 ? '✓' : '❌';
            }
        } catch (error) {
            issues.push(`Aspect ratio check failed: ${error.message}`);
            checks.aspectRatio = '❌';
        }

        // === CHECK 3: Text Positioning ===
        try {
            const container = await page.locator('#signature-container').first();
            const containerBox = await container.boundingBox();
            const textElements = await container.locator('div, span, p, a, h1, h2, h3, td').all();

            let positionIssues = 0;

            for (let i = 0; i < Math.min(textElements.length, 20); i++) {
                const elem = textElements[i];
                const box = await elem.boundingBox();

                if (box) {
                    // Check if element is outside container (relative to container position)
                    if (box.x < containerBox.x || box.y < containerBox.y) {
                        issues.push(`Text element ${i} positioned outside container: x=${Math.round(box.x)}, y=${Math.round(box.y)}`);
                        positionIssues++;
                    }

                    // Check if element overflows container
                    if (box.x + box.width > containerBox.x + containerBox.width + 10) { // 10px tolerance
                        issues.push(`Text element ${i} overflows right boundary`);
                        positionIssues++;
                    }
                }
            }

            checks.textPositioning = positionIssues === 0 ? '✓' : '❌';
        } catch (error) {
            issues.push(`Text positioning check failed: ${error.message}`);
            checks.textPositioning = '❌';
        }

        // === CHECK 4: Clickable Links ===
        try {
            const container = await page.locator('#signature-container').first();
            let linkIssues = 0;

            // Check phone link
            if (userInfo.phone) {
                const cleanPhone = userInfo.phone.replace(/[^0-9]/g, '');
                const phoneLinks = await container.locator(`a[href*="tel"]`).all();

                if (phoneLinks.length === 0) {
                    issues.push('Phone link missing');
                    linkIssues++;
                } else {
                    // Verify link is clickable
                    try {
                        await phoneLinks[0].click({ trial: true, timeout: 1000 });
                    } catch (e) {
                        issues.push('Phone link not clickable');
                        linkIssues++;
                    }
                }
            }

            // Check email link
            if (userInfo.email) {
                const emailLinks = await container.locator(`a[href*="mailto"]`).all();

                if (emailLinks.length === 0) {
                    issues.push('Email link missing');
                    linkIssues++;
                } else {
                    try {
                        await emailLinks[0].click({ trial: true, timeout: 1000 });
                    } catch (e) {
                        issues.push('Email link not clickable');
                        linkIssues++;
                    }
                }
            }

            // Check website link
            const websiteLinks = await container.locator(`a[href*="lendwisemtg.com"], a[href*="lendwise"]`).all();
            if (websiteLinks.length === 0) {
                issues.push('Website link missing');
                linkIssues++;
            }

            checks.clickableLinks = linkIssues === 0 ? '✓' : '❌';
        } catch (error) {
            issues.push(`Link check failed: ${error.message}`);
            checks.clickableLinks = '❌';
        }

        // === CHECK 5: Styling ===
        try {
            const container = await page.locator('#signature-container').first();
            let styleIssues = 0;

            // Check for common styling issues
            const elements = await container.locator('*').all();

            for (const elem of elements.slice(0, 15)) {
                const styles = await elem.evaluate(el => {
                    const computed = window.getComputedStyle(el);
                    return {
                        fontSize: computed.fontSize,
                        color: computed.color,
                        fontFamily: computed.fontFamily
                    };
                });

                // Check for unstyled text (default browser styles)
                if (styles.fontSize === '16px' && styles.fontFamily.includes('Times')) {
                    styleIssues++;
                }
            }

            checks.styling = styleIssues === 0 ? '✓' : '⚠️';
        } catch (error) {
            checks.styling = '⚠️';
        }

        // === CHECK 6: Overflow Detection ===
        try {
            const container = await page.locator('#signature-container').first();
            const hasOverflow = await container.evaluate(el => {
                return el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
            });

            if (hasOverflow) {
                issues.push('Content overflows container boundaries');
                checks.overflow = '❌';
            } else {
                checks.overflow = '✓';
            }
        } catch (error) {
            checks.overflow = '⚠️';
        }

        // Take verification screenshot
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        screenshotPath = path.join(VERIFICATION_DIR, `verification-${timestamp}.png`);
        await page.screenshot({
            path: screenshotPath,
            fullPage: true
        });

    } catch (error) {
        issues.push(`Verification error: ${error.message}`);
        Object.keys(checks).forEach(key => {
            if (checks[key] === '⏳') checks[key] = '❌';
        });
    } finally {
        if (browser) {
            await browser.close();
        }
    }

    const passed = issues.length === 0;

    return {
        passed,
        issues,
        checks,
        screenshot: screenshotPath,
        timestamp: new Date().toISOString(),
        summary: `${passed ? '✓ PASSED' : '❌ FAILED'} - ${issues.length} issue(s) found`
    };
}

/**
 * Verify signature with retry logic
 * @param {string} signatureHTML - The generated signature HTML
 * @param {Object} userInfo - User information
 * @param {number} maxRetries - Maximum retry attempts (default: 3)
 * @returns {Promise<Object>} Final verification result
 */
export async function verifySignatureWithRetry(signatureHTML, userInfo, maxRetries = 3) {
    console.log(`\n🔍 Starting signature verification (max ${maxRetries} attempts)...`);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`\nAttempt ${attempt}/${maxRetries}:`);

        const result = await verifySignature(signatureHTML, userInfo);

        console.log(`  ${result.summary}`);
        console.log(`  Checks:`, result.checks);

        if (result.passed) {
            console.log(`\n✅ Verification PASSED on attempt ${attempt}`);
            return {
                ...result,
                attempt,
                finalAttempt: attempt,
                retriesNeeded: attempt - 1
            };
        }

        console.log(`  Issues found:`);
        result.issues.forEach(issue => console.log(`    - ${issue}`));

        if (attempt < maxRetries) {
            console.log(`  Retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        }
    }

    console.log(`\n❌ Verification FAILED after ${maxRetries} attempts`);

    // Return final failed result
    const finalResult = await verifySignature(signatureHTML, userInfo);
    return {
        ...finalResult,
        attempt: maxRetries,
        finalAttempt: maxRetries,
        retriesNeeded: maxRetries
    };
}

// CLI usage
if (process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
    const htmlFilePath = process.argv[2];

    if (!htmlFilePath) {
        console.error('❌ Error: HTML file path required');
        console.error('Usage: node clickable-verifier.js <path-to-html-file>');
        process.exit(1);
    }

    // Read the HTML file
    fs.readFile(htmlFilePath, 'utf8')
        .then(html => {
            const userInfo = {
                name: 'Test User',
                phone: '(555) 123-4567',
                email: 'test@lendwisemtg.com',
                nmls: '123456'
            };

            return verifySignatureWithRetry(html, userInfo);
        })
        .then(result => {
            // Output JSON for easy parsing
            console.log(JSON.stringify(result, null, 2));
            process.exit(result.passed ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Verification failed:', error.message);
            process.exit(1);
        });
}
