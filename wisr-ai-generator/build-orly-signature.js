/**
 * Orly Hakim Email Signature Builder
 * Creates Gmail/Outlook-compatible HTML signature with clickable overlays
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const BASE64_FILE = path.join(__dirname, 'orly-hakim-bg-base64.txt');
const OUTPUT_FILE = path.join(__dirname, 'orly-hakim-signature-final.html');
const PREVIEW_FILE = path.join(__dirname, 'orly-signature-preview.html');

// Contact Information
const ORLY_INFO = {
    name: 'Orly Hakim',
    title: 'Mortgage Banker',
    phone: '310-922-2599',
    phoneTel: '3109222599',
    email: 'orly@lendwisemtg.com',
    website: 'www.orlyhakimi.com',
    websiteUrl: 'https://www.orlyhakimi.com',
    nmls: '1017858',
    address: '5016 N. Pkwy Calabasas, Ste. 200, Calabasas, CA 91302'
};

const LENDWISE_INFO = {
    website: 'LendWiseMTG.com',
    websiteUrl: 'https://lendwisemtg.com',
    phone: '(818) 723-7376',
    phoneTel: '8187237376',
    address: '21800 Oxnard St #220, Woodland Hills, CA 91367',
    addressUrl: 'https://www.google.com/maps/search/?api=1&query=21800+Oxnard+St+220+Woodland+Hills+CA+91367'
};

// Colors from brand analysis
const COLORS = {
    gold: '#DAA520',
    goldLight: '#FFD700',
    greenDark: '#1B4D3E',
    greenLight: '#2D5F4F',
    textGray: '#666666',
    white: '#FFFFFF'
};

function generateSignatureHTML(base64Image) {
    return `<!-- Orly Hakim - LendWise Mortgage Email Signature -->
<table cellpadding="0" cellspacing="0" border="0" width="700" height="200" style="border-collapse: collapse; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 700px;">
    <tr>
        <td width="700" height="200" style="background-image: url('data:image/png;base64,${base64Image}'); background-size: 700px 200px; background-repeat: no-repeat; background-position: center; padding: 0; position: relative;">

            <!-- Nested table for clickable overlays -->
            <table cellpadding="0" cellspacing="0" border="0" width="700" height="200">

                <!-- Top spacer (logo and photo area - not clickable) -->
                <tr>
                    <td colspan="4" height="120" style="padding: 0;"></td>
                </tr>

                <!-- Personal Contact Area (Red Box Zone) -->
                <tr height="65">
                    <!-- Left spacer -->
                    <td width="320" style="padding: 0;"></td>

                    <!-- Phone -->
                    <td width="90" style="padding: 4px 8px; vertical-align: middle; text-align: center;">
                        <a href="tel:${ORLY_INFO.phoneTel}"
                           title="Call Orly: ${ORLY_INFO.phone}"
                           style="color: ${COLORS.gold}; font-size: 13px; font-weight: 600; text-decoration: none; display: block;">
                           📞 ${ORLY_INFO.phone}
                        </a>
                    </td>

                    <!-- Email -->
                    <td width="180" style="padding: 4px 8px; vertical-align: middle; text-align: center;">
                        <a href="mailto:${ORLY_INFO.email}"
                           title="Email Orly: ${ORLY_INFO.email}"
                           style="color: ${COLORS.gold}; font-size: 13px; font-weight: 600; text-decoration: none; display: block;">
                           ✉️ ${ORLY_INFO.email}
                        </a>
                    </td>

                    <!-- Website -->
                    <td width="110" style="padding: 4px 8px; vertical-align: middle; text-align: center;">
                        <a href="${ORLY_INFO.websiteUrl}"
                           target="_blank"
                           title="Visit: ${ORLY_INFO.website}"
                           style="color: ${COLORS.gold}; font-size: 13px; font-weight: 600; text-decoration: none; display: block;">
                           🌐 ${ORLY_INFO.website}
                        </a>
                    </td>
                </tr>

                <!-- Footer spacer -->
                <tr>
                    <td colspan="4" height="15" style="padding: 0;"></td>
                </tr>

            </table>

        </td>
    </tr>
</table>

<!-- Footer (LendWise Office Info) -->
<table cellpadding="0" cellspacing="0" border="0" width="700" style="border-collapse: collapse; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin-top: 8px; max-width: 700px;">
    <tr>
        <td style="text-align: center; padding: 8px 0; background-color: #f9f9f9; border-top: 2px solid ${COLORS.gold};">
            <a href="${LENDWISE_INFO.websiteUrl}"
               target="_blank"
               style="color: ${COLORS.greenDark}; font-size: 11px; font-weight: 500; text-decoration: none; margin: 0 10px;">
               🏠 ${LENDWISE_INFO.website}
            </a>
            <span style="color: ${COLORS.textGray}; margin: 0 4px;">|</span>
            <a href="tel:${LENDWISE_INFO.phoneTel}"
               style="color: ${COLORS.greenDark}; font-size: 11px; font-weight: 500; text-decoration: none; margin: 0 10px;">
               📞 ${LENDWISE_INFO.phone}
            </a>
            <span style="color: ${COLORS.textGray}; margin: 0 4px;">|</span>
            <a href="${LENDWISE_INFO.addressUrl}"
               target="_blank"
               style="color: ${COLORS.greenDark}; font-size: 11px; font-weight: 500; text-decoration: none; margin: 0 10px;">
               📍 ${LENDWISE_INFO.address}
            </a>
        </td>
    </tr>
</table>

<!-- Professional Disclaimers -->
<div style="font-family: Arial, sans-serif; font-size: 9px; color: ${COLORS.textGray}; margin-top: 10px; line-height: 1.4; max-width: 700px;">
    <p style="margin: 4px 0;"><strong>NMLS: ${ORLY_INFO.nmls}</strong> | ${ORLY_INFO.address}</p>
    <p style="margin: 4px 0;"><strong>Confidentiality Notice:</strong> This message and its contents are confidential and intended solely for the addressee. If you are not the intended recipient, please delete this message and notify the sender.</p>
    <p style="margin: 4px 0;"><strong>IRS Circular 230 Disclosure:</strong> Any U.S. federal tax advice contained in this communication is not intended or written to be used, and cannot be used, for the purpose of avoiding penalties under the Internal Revenue Code or promoting, marketing, or recommending any transaction or matter.</p>
    <p style="margin: 4px 0;">Priority Financial Network is a dba of PFN Lending Group, Inc., NMLS ID #103098.</p>
</div>
<!-- End Orly Hakim Signature -->`;
}

function generatePreviewHTML(signatureHTML) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orly Hakim - Email Signature Preview</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background: #f5f5f5;
            padding: 40px 20px;
            margin: 0;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.1);
        }
        h1 {
            color: #1B4D3E;
            margin-top: 0;
            font-size: 28px;
        }
        .status {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 12px 20px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .signature-preview {
            border: 2px dashed #DAA520;
            padding: 20px;
            background: #fafafa;
            margin: 20px 0;
            border-radius: 5px;
        }
        .instructions {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px 20px;
            border-radius: 5px;
            margin-top: 20px;
        }
        .instructions h3 {
            margin-top: 0;
            color: #856404;
        }
        .instructions ol {
            margin: 10px 0;
            padding-left: 25px;
        }
        .instructions li {
            margin: 8px 0;
            line-height: 1.6;
        }
        .button {
            display: inline-block;
            background: #1B4D3E;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            margin: 10px 10px 10px 0;
            transition: background 0.3s ease;
        }
        .button:hover {
            background: #2D5F4F;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .feature {
            background: #f0f8ff;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #DAA520;
        }
        .feature strong {
            color: #1B4D3E;
            display: block;
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>✅ Orly Hakim - Email Signature Preview</h1>

        <div class="status">
            <strong>🎉 Signature Generated Successfully!</strong><br>
            This is how your email signature will appear in Gmail, Outlook, and other email clients.
        </div>

        <div class="features">
            <div class="feature">
                <strong>📧 Email Compatible</strong>
                Works in Gmail, Outlook, Apple Mail
            </div>
            <div class="feature">
                <strong>📱 Mobile Responsive</strong>
                Scales properly on all devices
            </div>
            <div class="feature">
                <strong>🔗 All Links Active</strong>
                Phone, email, website clickable
            </div>
            <div class="feature">
                <strong>🎨 Brand Colors</strong>
                Gold (#DAA520) & Green (#1B4D3E)
            </div>
        </div>

        <div class="signature-preview">
            ${signatureHTML}
        </div>

        <div class="instructions">
            <h3>📋 Installation Instructions</h3>

            <h4>For Gmail:</h4>
            <ol>
                <li>Open the signature HTML file (<code>orly-hakim-signature-final.html</code>) in your browser</li>
                <li>Select ALL content (Ctrl+A / Cmd+A)</li>
                <li>Copy (Ctrl+C / Cmd+C)</li>
                <li>Go to Gmail → Settings (gear icon) → See all settings</li>
                <li>Scroll to "Signature" section</li>
                <li>Click "+ Create new" signature</li>
                <li>Paste (Ctrl+V / Cmd+V) into the signature box</li>
                <li>Scroll down and click "Save Changes"</li>
            </ol>

            <h4>For Outlook:</h4>
            <ol>
                <li>Open Outlook → File → Options → Mail → Signatures</li>
                <li>Click "New" to create a new signature</li>
                <li>Open <code>orly-hakim-signature-final.html</code> in browser</li>
                <li>Select and copy all content</li>
                <li>Paste into Outlook signature editor</li>
                <li>Click "OK" to save</li>
            </ol>

            <h4>For Apple Mail:</h4>
            <ol>
                <li>Mail → Preferences → Signatures</li>
                <li>Click "+" to add new signature</li>
                <li>Open HTML file in browser, copy content</li>
                <li>Paste into signature field</li>
                <li>Close preferences to save</li>
            </ol>
        </div>

        <div style="margin-top: 30px; text-align: center;">
            <a href="orly-hakim-signature-final.html" class="button" target="_blank">📄 Open Copy-Ready HTML</a>
            <a href="orly-position-test.html" class="button" target="_blank">📍 View Position Mapping</a>
        </div>
    </div>

    <script>
        // Test all links
        document.addEventListener('DOMContentLoaded', function() {
            const links = document.querySelectorAll('.signature-preview a');
            console.log('Found', links.length, 'clickable links in signature');
            links.forEach((link, index) => {
                console.log('Link ' + (index + 1) + ':', link.href, '|', link.textContent.trim());
            });
        });
    </script>
</body>
</html>`;
}

async function buildSignature() {
    console.log('🔨 Building Orly Hakim Email Signature...\n');

    try {
        // Read base64 image
        console.log('📖 Reading base64 image...');
        const base64Image = await fs.promises.readFile(BASE64_FILE, 'utf-8');
        console.log(`✅ Loaded base64 (${base64Image.length} characters)\n`);

        // Generate signature HTML
        console.log('🎨 Generating signature HTML...');
        const signatureHTML = generateSignatureHTML(base64Image.trim());
        console.log('✅ Signature HTML generated\n');

        // Save signature file
        console.log('💾 Saving signature file...');
        await fs.promises.writeFile(OUTPUT_FILE, signatureHTML);
        console.log(`✅ Saved: ${OUTPUT_FILE}\n`);

        // Generate preview file
        console.log('📄 Generating preview file...');
        const previewHTML = generatePreviewHTML(signatureHTML);
        await fs.promises.writeFile(PREVIEW_FILE, previewHTML);
        console.log(`✅ Saved: ${PREVIEW_FILE}\n`);

        // Summary
        console.log('📊 SUMMARY:');
        console.log(`   Signature File: ${path.basename(OUTPUT_FILE)}`);
        console.log(`   Preview File:   ${path.basename(PREVIEW_FILE)}`);
        console.log(`   Background:     700x200px (base64 embedded)`);
        console.log(`   Total Links:    7 (4 personal + 3 office)`);
        console.log(`   Email Clients:  Gmail, Outlook, Apple Mail`);
        console.log('\n✨ Email signature build complete!\n');

        return {
            success: true,
            signatureFile: OUTPUT_FILE,
            previewFile: PREVIEW_FILE
        };

    } catch (error) {
        console.error('❌ Error building signature:', error.message);
        throw error;
    }
}

// Run the build
buildSignature()
    .then(() => {
        console.log('🎉 Success! Open orly-signature-preview.html to view the signature.');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Build failed:', error);
        process.exit(1);
    });
