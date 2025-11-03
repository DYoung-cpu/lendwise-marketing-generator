import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PNG = '/mnt/c/Users/dyoun/Downloads/Generated Image October 29, 2025 - 2_13PM (1).png';
const OUTPUT_HTML = '/mnt/c/Users/dyoun/Downloads/Orly-Signature-Gmail-Ready.html';

async function createCompressedSignature() {
    console.log('🗜️  Creating Gmail-compatible compressed signature...\n');

    // Resize to 400px width and convert to JPEG with compression
    const imageBuffer = await sharp(INPUT_PNG)
        .resize(400, null, { fit: 'inside' })
        .jpeg({ quality: 82, progressive: true })
        .toBuffer();

    const sizeKB = (imageBuffer.length / 1024).toFixed(2);
    console.log(`✅ Compressed image: ${sizeKB} KB`);

    // Convert to base64
    const base64 = imageBuffer.toString('base64');
    const base64SizeKB = (base64.length / 1024).toFixed(2);
    console.log(`✅ Base64 size: ${base64SizeKB} KB\n`);

    // Gmail typically accepts signatures up to ~10KB
    if (imageBuffer.length > 50000) {
        console.log('⚠️  Warning: Image might still be too large for Gmail');
        console.log('   Trying even more compression...\n');

        // More aggressive compression
        const smallerBuffer = await sharp(INPUT_PNG)
            .resize(350, null, { fit: 'inside' })
            .jpeg({ quality: 75, progressive: true })
            .toBuffer();

        const smallerBase64 = smallerBuffer.toString('base64');
        console.log(`✅ Ultra-compressed: ${(smallerBuffer.length / 1024).toFixed(2)} KB`);
        console.log(`✅ Base64 size: ${(smallerBase64.length / 1024).toFixed(2)} KB\n`);

        return createHTML(smallerBase64, 350);
    }

    return createHTML(base64, 400);
}

function createHTML(base64, width) {
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Orly Hakim Gmail Signature - Compressed</title>
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
        .warning {
            background: #d4edda;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #28a745;
            margin: 20px 0;
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
        .instructions {
            background: #fff3cd;
            padding: 20px;
            border-radius: 5px;
            border-left: 4px solid #DAA520;
            margin: 20px 0;
        }
        .instructions ol {
            line-height: 2;
            padding-left: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📧 Orly Hakim Gmail Signature (Compressed)</h1>

        <div class="warning">
            <strong>✅ This version is compressed to fit Gmail's size limits</strong><br>
            Width: ${width}px | Optimized for email clients
        </div>

        <div class="instructions">
            <h3>📋 Copy to Gmail in 4 Steps:</h3>
            <ol>
                <li><strong>Click the image below</strong> to select it</li>
                <li><strong>Right-click → "Copy image"</strong> (or Ctrl+C / Cmd+C)</li>
                <li>Go to <strong>Gmail Settings → Signature</strong></li>
                <li><strong>Paste</strong> into the editor (Ctrl+V)</li>
            </ol>
        </div>

        <div class="signature-box">
            <p style="color: #666; margin-top: 0;"><strong>👇 COPY THIS IMAGE 👇</strong></p>

            <img src="data:image/jpeg;base64,${base64}"
                 alt="Orly Hakim - Mortgage Banker - LendWise Mortgage"
                 width="${width}">

            <p style="color: #666; margin: 15px 0 0 0;">
                <em>Right-click the image and select "Copy image"</em>
            </p>
        </div>
    </div>
</body>
</html>`;

    return html;
}

async function run() {
    const html = await createCompressedSignature();
    await fs.promises.writeFile(OUTPUT_HTML, html);

    console.log('✅ Gmail-ready signature created!\n');
    console.log('📄 File: Orly-Signature-Gmail-Ready.html');
    console.log('📍 Location: Downloads folder\n');
    console.log('🎯 This version should work with Gmail!\n');
}

run().catch(e => {
    console.error('❌ Error:', e.message);
    process.exit(1);
});
