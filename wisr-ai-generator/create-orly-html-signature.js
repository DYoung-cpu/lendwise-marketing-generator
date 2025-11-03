import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PNG = '/mnt/c/Users/dyoun/Downloads/Generated Image October 29, 2025 - 2_13PM (1).png';
const OUTPUT_HTML = '/mnt/c/Users/dyoun/Downloads/Orly-Signature-READY.html';

async function createSignature() {
    console.log('📧 Creating Gmail-ready signature HTML...\n');

    // Read the PNG and convert to base64
    const imageBuffer = await fs.promises.readFile(INPUT_PNG);
    const base64 = imageBuffer.toString('base64');

    console.log(`✅ Image loaded: ${(imageBuffer.length / 1024).toFixed(2)} KB\n`);

    // Create HTML with embedded base64 image
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Orly Hakim Email Signature - Ready to Copy</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: #f0f0f0;
            font-family: Arial, sans-serif;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #1B4D3E;
            margin-top: 0;
        }
        .instructions {
            background: #fff3cd;
            padding: 20px;
            border-radius: 5px;
            border-left: 4px solid #DAA520;
            margin: 20px 0;
        }
        .instructions h2 {
            margin-top: 0;
            color: #856404;
        }
        .instructions ol {
            line-height: 2;
            padding-left: 20px;
        }
        .signature-box {
            border: 3px dashed #DAA520;
            padding: 20px;
            background: #fafafa;
            margin: 30px 0;
            text-align: center;
        }
        .signature-box img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 0 auto;
        }
        .note {
            background: #e7f3ff;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #1B4D3E;
            margin: 20px 0;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📧 Orly Hakim Email Signature</h1>

        <div class="instructions">
            <h2>📋 How to Add to Gmail</h2>
            <ol>
                <li><strong>Click on the signature image below</strong> to select it</li>
                <li><strong>Copy the image</strong> (Right-click → Copy image, or Ctrl+C / Cmd+C)</li>
                <li>Open <strong>Gmail Settings</strong> (gear icon → "See all settings")</li>
                <li>Scroll down to the <strong>"Signature"</strong> section</li>
                <li>Click the signature you want to edit (or "+ Create new")</li>
                <li><strong>Paste</strong> the image into the signature editor (Ctrl+V / Cmd+V)</li>
                <li>Scroll down and click <strong>"Save Changes"</strong></li>
            </ol>
        </div>

        <div class="signature-box">
            <p style="color: #666; margin-top: 0;"><strong>👇 SELECT AND COPY THIS IMAGE 👇</strong></p>

            <!-- SIGNATURE IMAGE -->
            <img src="data:image/png;base64,${base64}"
                 alt="Orly Hakim - Mortgage Banker - LendWise Mortgage"
                 width="600">

            <p style="color: #666; margin-bottom: 0; margin-top: 15px;">
                <em>Click the image above, then copy it (Ctrl+C or right-click → Copy image)</em>
            </p>
        </div>

        <div class="note">
            <strong>💡 Pro Tip:</strong> After pasting into Gmail, you can drag the corners of the image
            to resize it if needed. A width of around 500-600 pixels works best for most email clients.
        </div>

        <div class="note">
            <strong>✅ This method works for:</strong>
            <ul style="margin: 10px 0;">
                <li>Gmail (web and app)</li>
                <li>Outlook (web and desktop)</li>
                <li>Apple Mail</li>
                <li>Most other email clients</li>
            </ul>
        </div>
    </div>
</body>
</html>`;

    await fs.promises.writeFile(OUTPUT_HTML, html);

    console.log('✅ HTML signature file created!\n');
    console.log('📄 File: Orly-Signature-READY.html');
    console.log('📍 Location: Downloads folder\n');
    console.log('🎉 NEXT STEPS:');
    console.log('   1. Open "Orly-Signature-READY.html" from your Downloads folder');
    console.log('   2. Click the signature image');
    console.log('   3. Copy it (Ctrl+C or right-click → Copy image)');
    console.log('   4. Paste into Gmail signature settings\n');
}

createSignature().catch(e => {
    console.error('❌ Error:', e.message);
    process.exit(1);
});
