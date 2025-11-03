/**
 * Create Orly Hakimi Email Signature
 * Embeds the signature image with clickable contact links
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// Read the base64 encoded image
const base64Image = readFileSync(resolve('./orly-signature-base64.txt'), 'utf-8').trim();

// Create the complete HTML signature
const signatureHTML = `<!-- Orly Hakimi - LendWise Mortgage Email Signature -->
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; max-width: 700px; border-collapse: collapse;">
    <tr>
        <td style="padding: 0;">
            <!-- Main Signature Image (with photo) -->
            <img src="data:image/png;base64,${base64Image}"
                 alt="Orly Hakimi - Mortgage Banker - LendWise Mortgage"
                 style="width: 700px; height: auto; display: block; border: 0;" />
        </td>
    </tr>

    <!-- Contact Links Bar -->
    <tr>
        <td style="padding: 10px 20px; background: linear-gradient(to right, #2d5f3f, #1a3d2e); text-align: center;">
            <a href="tel:3109222599" style="color: #DAA520; font-size: 13px; text-decoration: none; margin: 0 12px; font-weight: 600;">📞 310-922-2599</a>
            <span style="color: rgba(255,255,255,0.3);">|</span>
            <a href="mailto:orlyhakimi@priorityfinancial.net" style="color: #DAA520; font-size: 13px; text-decoration: none; margin: 0 12px; font-weight: 600;">✉️ orlyhakimi@priorityfinancial.net</a>
            <span style="color: rgba(255,255,255,0.3);">|</span>
            <a href="https://www.orlyhakimi.com" target="_blank" style="color: #DAA520; font-size: 13px; text-decoration: none; margin: 0 12px; font-weight: 600;">🌐 www.orlyhakimi.com</a>
        </td>
    </tr>

    <!-- Zillow Reviews Link -->
    <tr>
        <td style="padding: 8px 20px; background-color: #1a3d2e; text-align: center;">
            <a href="https://www.zillow.com/profile/orlyhakimi" target="_blank" style="color: #ffffff; font-size: 12px; text-decoration: none; font-weight: 600;">⭐ View My Zillow Reviews</a>
        </td>
    </tr>
</table>

<!-- Professional Disclaimer -->
<div style="font-family: Arial, sans-serif; font-size: 9px; color: #666; margin-top: 15px; padding: 10px 0; max-width: 700px; line-height: 1.4;">
    <p style="margin: 5px 0;"><strong>NMLS: 1017858</strong></p>
    <p style="margin: 5px 0;">5016 N. Pkwy Calabasas, Ste. 200, Calabasas, CA 91302</p>
    <p style="margin: 10px 0 5px 0;"><strong>Confidentiality:</strong> This message and its contents are confidential and may contain privileged information intended only for the addressee or the intended recipient. If you are not the addressee or the intended recipient of this message, you may not use, copy, or disclose to anyone any information contained in this message or its contents. If you have received this message in error, please advise the sender by reply e-mail, delete this message or its contents and destroy any hard copies.</p>
    <p style="margin: 5px 0;"><strong>IRS Circular 230 Disclosure:</strong> To ensure compliance with requirements imposed by the IRS, please be advised that any U.S. federal tax advice contained in this communication (including any attachments) is not intended or written to be used or relied upon, and cannot be used or relied upon, for the purpose of (i) avoiding penalties under the Internal Revenue Code, or (ii) promoting, marketing or recommending to another party any transaction or matter addressed herein.</p>
    <p style="margin: 5px 0;">If you have received this e-mail in error or wish to report a problem, please e-mail us at HelpDesk@PriorityFinancial.net or call 818-223-9999. Priority Financial Network is a dba of PFN Lending Group, Inc., NMLS ID #103098.</p>
</div>

<!-- End Orly Hakimi Signature -->`;

// Write the complete HTML
writeFileSync(resolve('./orly-hakimi-signature-complete.html'), signatureHTML, 'utf-8');

console.log('✅ Signature created successfully!');
console.log('📄 File: orly-hakimi-signature-complete.html');
console.log('📏 Image size:', (base64Image.length / 1024 / 1024).toFixed(2), 'MB');
console.log('');
console.log('Instructions for Orly:');
console.log('1. Open the HTML file in a browser');
console.log('2. Select all content (Ctrl+A / Cmd+A)');
console.log('3. Copy (Ctrl+C / Cmd+C)');
console.log('4. In Gmail, go to Settings → Signature');
console.log('5. Paste the signature (Ctrl+V / Cmd+V)');
console.log('6. Test the clickable links (phone, email, website)');
