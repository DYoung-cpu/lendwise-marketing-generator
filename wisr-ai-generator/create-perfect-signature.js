import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_JPG = '/mnt/c/Users/dyoun/Downloads/Generated Image October 29, 2025 - 2_13PM (1).jpg';
const OUTPUT_OPTIMIZED = '/mnt/c/Users/dyoun/Downloads/Orly-Signature-Optimized.jpg';
const OUTPUT_HTML_HOSTED = '/mnt/c/Users/dyoun/Downloads/Orly-Signature-Hosted-Method.html';
const OUTPUT_HTML_EMBEDDED = '/mnt/c/Users/dyoun/Downloads/Orly-Signature-Try-This.html';

async function createPerfectSignature() {
    console.log('✨ Creating perfect signature (no pixelation, no white space)...\n');

    // First, get image info
    const image = sharp(INPUT_JPG);
    const metadata = await image.metadata();

    console.log(`Original size: ${metadata.width}x${metadata.height}`);

    // Auto-crop white space, then resize to 550px width with high quality
    const optimizedBuffer = await sharp(INPUT_JPG)
        .trim({ background: 'white', threshold: 10 })  // Remove white space
        .resize(550, null, {
            fit: 'inside',
            kernel: sharp.kernel.lanczos3,  // High quality resize
            withoutEnlargement: true
        })
        .jpeg({
            quality: 90,  // High quality (90 is excellent)
            progressive: true,
            mozjpeg: true  // Better compression
        })
        .toBuffer();

    const sizeKB = (optimizedBuffer.length / 1024).toFixed(2);
    console.log(`✅ Optimized signature: ${sizeKB} KB`);
    console.log(`   Width: 550px | Quality: 90 | No pixelation\n`);

    // Save the optimized JPG
    await fs.promises.writeFile(OUTPUT_OPTIMIZED, optimizedBuffer);
    console.log(`💾 Saved: Orly-Signature-Optimized.jpg\n`);

    // Check if it's small enough for Gmail (need under ~10KB for base64)
    const base64 = optimizedBuffer.toString('base64');
    const base64KB = (base64.length / 1024).toFixed(2);
    console.log(`📊 Base64 size: ${base64KB} KB`);

    if (base64.length > 10240) {
        console.log(`⚠️  Still too large for Gmail base64 method (${base64KB} KB > 10 KB limit)\n`);
        console.log('🌐 BEST SOLUTION: Use hosted image method (see HTML file)\n');
    } else {
        console.log(`✅ Small enough for Gmail! (${base64KB} KB < 10 KB)\n`);
    }

    // Create HTML for HOSTED method (recommended)
    const hostedHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Orly Hakim Signature - Hosted Method (RECOMMENDED)</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: #f0f0f0;
            font-family: Arial, sans-serif;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
        }
        h1 { color: #1B4D3E; }
        .method {
            background: #d4edda;
            padding: 20px;
            border-radius: 5px;
            border-left: 5px solid #28a745;
            margin: 20px 0;
        }
        .steps {
            background: #fff3cd;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .steps ol {
            line-height: 2.2;
            padding-left: 25px;
        }
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📧 Orly Hakim Signature - Hosted Image Method</h1>

        <div class="method">
            <h2 style="margin-top: 0;">✅ BEST METHOD: Host the Image</h2>
            <p>Because the signature image is too large for Gmail's embedded limit,
            we'll upload it somewhere and link to it. This is actually the professional way to do it!</p>
        </div>

        <div class="steps">
            <h3>🚀 Quick Setup (3 Steps):</h3>

            <h4>Step 1: Upload the Image</h4>
            <ol>
                <li>Go to <a href="https://imgur.com/upload" target="_blank"><strong>Imgur.com/upload</strong></a> (free, no login required)</li>
                <li>Drag <code>Orly-Signature-Optimized.jpg</code> from your Downloads folder</li>
                <li>Once uploaded, right-click the image → <strong>"Copy image address"</strong></li>
                <li>You'll get a URL like: <code>https://i.imgur.com/XXXXXX.jpg</code></li>
            </ol>

            <h4>Step 2: Create Gmail Signature</h4>
            <ol start="5">
                <li>Go to Gmail Settings → Signature section</li>
                <li>Click the <strong>Image icon</strong> in the toolbar (looks like a mountain/photo)</li>
                <li>Select <strong>"Web Address (URL)"</strong></li>
                <li>Paste your Imgur URL</li>
                <li>Set width to <strong>550</strong> pixels</li>
                <li>Click <strong>"Select"</strong>, then <strong>"Save Changes"</strong></li>
            </ol>

            <h4>Step 3: Done! ✅</h4>
            <p>Your signature will now load from Imgur. It's fast, reliable, and bypasses Gmail's size limits completely.</p>
        </div>

        <div style="background: #e7f3ff; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>🎯 Why This Method is Better:</h3>
            <ul style="line-height: 1.8;">
                <li>✅ No size limits (Gmail loads from URL)</li>
                <li>✅ Full quality image (no pixelation)</li>
                <li>✅ Faster loading in emails</li>
                <li>✅ Easy to update (just replace the hosted image)</li>
                <li>✅ Works in ALL email clients</li>
            </ul>
        </div>

        <div style="background: #fff; padding: 15px; border: 2px solid #ddd; border-radius: 5px;">
            <h4>Alternative: Google Drive</h4>
            <p>You can also use Google Drive:</p>
            <ol>
                <li>Upload <code>Orly-Signature-Optimized.jpg</code> to Google Drive</li>
                <li>Right-click → Get link → Change to "Anyone with the link"</li>
                <li>Use this format: <code>https://drive.google.com/uc?export=view&id=FILE_ID</code></li>
            </ol>
        </div>
    </div>
</body>
</html>`;

    await fs.promises.writeFile(OUTPUT_HTML_HOSTED, hostedHTML);
    console.log('📄 Created: Orly-Signature-Hosted-Method.html');
    console.log('   (Instructions for using Imgur or Google Drive)\n');

    // Also create a "try this anyway" version with embedded base64
    const embeddedHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Orly Signature - Try Copying This</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: #f0f0f0;
            font-family: Arial, sans-serif;
            text-align: center;
        }
        .container {
            max-width: 700px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
        }
        h1 { color: #1B4D3E; }
        .warning {
            background: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .signature-box {
            border: 3px dashed #DAA520;
            padding: 20px;
            background: #fafafa;
            margin: 30px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Orly Hakim Signature</h1>

        <div class="warning">
            <strong>⚠️ Note:</strong> This might still be too large for Gmail.<br>
            If Gmail rejects it, use the <strong>Hosted Method</strong> instead<br>
            (see Orly-Signature-Hosted-Method.html)
        </div>

        <div class="signature-box">
            <p><strong>Right-click → Copy image</strong></p>
            <img src="data:image/jpeg;base64,${base64}"
                 alt="Orly Hakim - Mortgage Banker - LendWise Mortgage"
                 width="550"
                 style="max-width: 100%; height: auto;">
        </div>
    </div>
</body>
</html>`;

    await fs.promises.writeFile(OUTPUT_HTML_EMBEDDED, embeddedHTML);
    console.log('📄 Created: Orly-Signature-Try-This.html');
    console.log('   (Embedded version - may still be too large)\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 RECOMMENDED: Open "Orly-Signature-Hosted-Method.html"');
    console.log('   Follow the Imgur upload instructions');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

createPerfectSignature().catch(e => {
    console.error('❌ Error:', e.message);
    process.exit(1);
});
