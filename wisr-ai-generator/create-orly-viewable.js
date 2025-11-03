/**
 * Create Viewable Orly Hakimi Email Signature
 * Full HTML document that displays properly in browser
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// Read the base64 encoded image
const base64Image = readFileSync(resolve('./orly-signature-base64.txt'), 'utf-8').trim();

// Create the FULL HTML document with proper structure
const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orly Hakimi - Email Signature</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            padding: 40px;
            margin: 0;
        }
        .preview-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2d5f3f;
            margin-top: 0;
            margin-bottom: 10px;
        }
        .instructions {
            background: #e8f5e9;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 14px;
            line-height: 1.6;
        }
        .signature-preview {
            border: 2px dashed #ccc;
            padding: 20px;
            background: #fafafa;
            margin-bottom: 20px;
        }
        .copy-instructions {
            background: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
            font-size: 14px;
        }
        .copy-instructions strong {
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="preview-container">
        <h1>✅ Orly Hakimi - Email Signature</h1>

        <div class="instructions">
            <strong>📋 How to Copy This Signature:</strong><br>
            1. Scroll down to the signature preview below<br>
            2. Click at the start of the signature<br>
            3. Hold Shift and click at the end (or use Ctrl+A to select all)<br>
            4. Copy with Ctrl+C (Windows) or Cmd+C (Mac)<br>
            5. Paste into Gmail Settings → Signature
        </div>

        <h2>Preview:</h2>
        <div class="signature-preview">
            <!-- START OF SIGNATURE - SELECT FROM HERE -->
            <table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; max-width: 700px; border-collapse: collapse;">
                <tr>
                    <td style="padding: 0;">
                        <img src="data:image/png;base64,${base64Image}"
                             alt="Orly Hakimi - Mortgage Banker - LendWise Mortgage"
                             style="width: 700px; height: auto; display: block; border: 0;" />
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 20px; background: linear-gradient(to right, #2d5f3f, #1a3d2e); text-align: center;">
                        <a href="tel:3109222599" style="color: #DAA520; font-size: 13px; text-decoration: none; margin: 0 12px; font-weight: 600;">📞 310-922-2599</a>
                        <span style="color: rgba(255,255,255,0.3);">|</span>
                        <a href="mailto:orlyhakimi@priorityfinancial.net" style="color: #DAA520; font-size: 13px; text-decoration: none; margin: 0 12px; font-weight: 600;">✉️ orlyhakimi@priorityfinancial.net</a>
                        <span style="color: rgba(255,255,255,0.3);">|</span>
                        <a href="https://www.orlyhakimi.com" target="_blank" style="color: #DAA520; font-size: 13px; text-decoration: none; margin: 0 12px; font-weight: 600;">🌐 www.orlyhakimi.com</a>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 20px; background-color: #1a3d2e; text-align: center;">
                        <a href="https://www.zillow.com/profile/orlyhakimi" target="_blank" style="color: #ffffff; font-size: 12px; text-decoration: none; font-weight: 600;">⭐ View My Zillow Reviews</a>
                    </td>
                </tr>
            </table>
            <div style="font-family: Arial, sans-serif; font-size: 9px; color: #666; margin-top: 15px; padding: 10px 0; max-width: 700px; line-height: 1.4;">
                <p style="margin: 5px 0;"><strong>NMLS: 1017858</strong></p>
                <p style="margin: 5px 0;">5016 N. Pkwy Calabasas, Ste. 200, Calabasas, CA 91302</p>
                <p style="margin: 10px 0 5px 0;"><strong>Confidentiality:</strong> This message and its contents are confidential and may contain privileged information intended only for the addressee or the intended recipient. If you are not the addressee or the intended recipient of this message, you may not use, copy, or disclose to anyone any information contained in this message or its contents. If you have received this message in error, please advise the sender by reply e-mail, delete this message or its contents and destroy any hard copies.</p>
                <p style="margin: 5px 0;"><strong>IRS Circular 230 Disclosure:</strong> To ensure compliance with requirements imposed by the IRS, please be advised that any U.S. federal tax advice contained in this communication (including any attachments) is not intended or written to be used or relied upon, and cannot be used or relied upon, for the purpose of (i) avoiding penalties under the Internal Revenue Code, or (ii) promoting, marketing or recommending to another party any transaction or matter addressed herein.</p>
                <p style="margin: 5px 0;">If you have received this e-mail in error or wish to report a problem, please e-mail us at HelpDesk@PriorityFinancial.net or call 818-223-9999. Priority Financial Network is a dba of PFN Lending Group, Inc., NMLS ID #103098.</p>
            </div>
            <!-- END OF SIGNATURE - SELECT UNTIL HERE -->
        </div>

        <div class="copy-instructions">
            <strong>⚠️ Important:</strong><br>
            • Copy ONLY the signature content (inside the gray box above)<br>
            • Do NOT copy the yellow instructions or page title<br>
            • Test the links after pasting into Gmail to make sure they work<br>
            • The signature image includes your photo, logo, name, and title
        </div>
    </div>
</body>
</html>`;

// Write the complete viewable HTML
writeFileSync(resolve('./orly-hakimi-signature-viewable.html'), fullHTML, 'utf-8');

console.log('✅ Viewable signature created!');
console.log('📄 File: orly-hakimi-signature-viewable.html');
console.log('');
console.log('Open this file in your browser to:');
console.log('• See how the signature looks');
console.log('• Select and copy it for Gmail');
console.log('• Test the clickable links');
