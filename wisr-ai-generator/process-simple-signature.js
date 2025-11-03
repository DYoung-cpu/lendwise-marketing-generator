import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT = '/mnt/c/Users/dyoun/Downloads/Generated Image October 29, 2025 - 1_18PM (2).png';
const OUTPUT_IMG = path.join(__dirname, 'orly-signature-simple.png');
const OUTPUT_BASE64 = path.join(__dirname, 'orly-signature-simple-base64.txt');
const OUTPUT_HTML = '/mnt/c/Users/dyoun/Downloads/Orly-Signature-Simple.html';

async function process() {
    console.log('📸 Processing simple signature image...\n');

    // Resize to 600px width (email-safe)
    const buffer = await sharp(INPUT)
        .resize(600, null, { fit: 'inside' })
        .png({ quality: 95 })
        .toBuffer();

    console.log(`✅ Resized to 600px width`);
    console.log(`   Size: ${(buffer.length / 1024).toFixed(2)} KB\n`);

    // Save image
    await fs.promises.writeFile(OUTPUT_IMG, buffer);

    // Convert to base64
    const base64 = buffer.toString('base64');
    await fs.promises.writeFile(OUTPUT_BASE64, base64);

    console.log('✅ Base64 generated\n');

    // Create super simple HTML
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Orly Hakim Email Signature</title>
</head>
<body style="margin: 0; padding: 20px; background: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 5px;">
        <h2 style="color: #1B4D3E;">Orly Hakim - Email Signature</h2>
        <p style="color: #666;">Copy the signature image below and paste into your email client.</p>

        <div style="border: 2px dashed #DAA520; padding: 10px; background: #fafafa; margin: 20px 0;">
            <!-- SIGNATURE IMAGE - SELECT AND COPY THIS -->
            <img src="data:image/png;base64,${base64}"
                 alt="Orly Hakim - Mortgage Banker - LendWise Mortgage"
                 width="600"
                 style="max-width: 100%; height: auto; display: block;">
            <!-- END SIGNATURE -->
        </div>

        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border: 1px solid #ffc107;">
            <h3 style="margin-top: 0; color: #856404;">📋 Installation Instructions</h3>

            <h4>For Gmail:</h4>
            <ol style="line-height: 1.8;">
                <li>Click on the image above to select it</li>
                <li>Copy (Ctrl+C or Cmd+C)</li>
                <li>Go to Gmail Settings → See all settings</li>
                <li>Scroll to "Signature" section</li>
                <li>Click "+ Create new"</li>
                <li>Paste (Ctrl+V or Cmd+V)</li>
                <li>Save Changes</li>
            </ol>

            <h4>For Outlook:</h4>
            <ol style="line-height: 1.8;">
                <li>File → Options → Mail → Signatures</li>
                <li>Click "New"</li>
                <li>Right-click the image above → Copy image</li>
                <li>Paste into Outlook signature editor</li>
                <li>Click OK</li>
            </ol>

            <h4>For Apple Mail:</h4>
            <ol style="line-height: 1.8;">
                <li>Mail → Preferences → Signatures</li>
                <li>Click "+"</li>
                <li>Drag the image above into the signature field</li>
                <li>Close preferences</li>
            </ol>
        </div>

        <p style="color: #666; font-size: 12px; margin-top: 20px;">
            ✅ Simple image signature - no clickable links<br>
            ✅ Width: 600px (email-safe)<br>
            ✅ All contact info visible on image
        </p>
    </div>
</body>
</html>`;

    await fs.promises.writeFile(OUTPUT_HTML, html);

    console.log('📄 Simple HTML created!');
    console.log(`   File: Orly-Signature-Simple.html`);
    console.log(`   Location: Downloads folder\n`);

    console.log('🎉 DONE! Just open the HTML file and copy the image.\n');
}

process().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
