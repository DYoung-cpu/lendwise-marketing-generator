/**
 * Orly Hakimi Email Signature Preview Server
 * Serves the signature with proper contact information overlay
 */

import express from 'express';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const app = express();
const PORT = 3002;

// Read the base64 image
const base64Image = readFileSync(resolve('./orly-final-bg-base64.txt'), 'utf-8').trim();

// Orly's contact information
const ORLY_CONTACT = {
    phone: '310-922-2599',
    phoneTel: '3109222599',
    email: 'orlyhakimi@priorityfinancial.net',
    website: 'www.orlyhakimi.com',
    websiteUrl: 'https://www.orlyhakimi.com',
    zillowUrl: 'https://www.zillow.com/profile/orlyhakimi',
    nmls: '1017858',
    address: '5016 N. Pkwy Calabasas, Ste. 200, Calabasas, CA 91302'
};

// LendWise office information
const LENDWISE_OFFICE = {
    phone: '(818) 723-7376',
    phoneTel: '8187237376',
    address: '21800 Oxnard St #220, Woodland Hills, CA 91367',
    website: 'LendWiseMTG.com',
    websiteUrl: 'https://lendwisemtg.com'
};

// Generate the signature HTML with overlay (no stacking)
function generateSignatureHTML() {
    return `<!-- Orly Hakimi - LendWise Mortgage Email Signature (Overlay Method) -->
<table cellpadding="0" cellspacing="0" border="0" width="700" height="200" style="border-collapse: collapse; background-image: url('data:image/png;base64,${base64Image}'); background-size: 700px 200px; background-repeat: no-repeat; background-position: center;">
    <!-- Top spacer row (logo and name area - not clickable) -->
    <tr>
        <td colspan="3" height="140" style="padding: 0;">&nbsp;</td>
    </tr>

    <!-- Clickable contact area (positioned over bottom of image) -->
    <tr>
        <td width="233" height="60" style="padding: 0; vertical-align: bottom;">
            <a href="tel:${ORLY_CONTACT.phoneTel}"
               title="Call Orly: ${ORLY_CONTACT.phone}"
               style="display: block; width: 100%; height: 100%; text-decoration: none; color: transparent; font-size: 0;">
               ${ORLY_CONTACT.phone}
            </a>
        </td>
        <td width="234" height="60" style="padding: 0; vertical-align: bottom;">
            <a href="mailto:${ORLY_CONTACT.email}"
               title="Email Orly: ${ORLY_CONTACT.email}"
               style="display: block; width: 100%; height: 100%; text-decoration: none; color: transparent; font-size: 0;">
               ${ORLY_CONTACT.email}
            </a>
        </td>
        <td width="233" height="60" style="padding: 0; vertical-align: bottom;">
            <a href="${ORLY_CONTACT.websiteUrl}"
               target="_blank"
               title="Visit: ${ORLY_CONTACT.website}"
               style="display: block; width: 100%; height: 100%; text-decoration: none; color: transparent; font-size: 0;">
               ${ORLY_CONTACT.website}
            </a>
        </td>
    </tr>
</table>

<!-- Professional Disclaimers (below image, minimal) -->
<div style="font-family: Arial, sans-serif; font-size: 9px; color: #666; margin-top: 8px; line-height: 1.3; max-width: 700px;">
    <p style="margin: 3px 0;"><strong>NMLS: ${ORLY_CONTACT.nmls}</strong> | ${ORLY_CONTACT.address}</p>
    <p style="margin: 3px 0;"><strong>Confidentiality:</strong> This message and its contents are confidential. If you are not the intended recipient, please delete this message.</p>
    <p style="margin: 3px 0;"><strong>IRS Circular 230:</strong> Any tax advice in this communication is not intended to be used for avoiding penalties.</p>
    <p style="margin: 3px 0;">Priority Financial Network is a dba of PFN Lending Group, Inc., NMLS ID #103098.</p>
</div>
<!-- End Orly Hakimi Signature -->`;
}

// Serve the preview page
app.get('/', (req, res) => {
    const html = readFileSync(resolve('./orly-signature-preview.html'), 'utf-8');
    res.send(html);
});

// API endpoint for the signature HTML
app.get('/api/signature', (req, res) => {
    res.send(generateSignatureHTML());
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Orly signature server running',
        contact: ORLY_CONTACT
    });
});

// Start server
app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║   ORLY HAKIMI EMAIL SIGNATURE SERVER          ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('');
    console.log('📧 Preview the signature:');
    console.log(`   http://localhost:${PORT}/`);
    console.log('');
    console.log('✅ Contact Information:');
    console.log(`   Phone: ${ORLY_CONTACT.phone}`);
    console.log(`   Email: ${ORLY_CONTACT.email}`);
    console.log(`   Website: ${ORLY_CONTACT.website}`);
    console.log(`   NMLS: ${ORLY_CONTACT.nmls}`);
    console.log('');
});

export default app;
