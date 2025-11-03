import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Original high-res source
const INPUT = '/mnt/c/Users/dyoun/Downloads/Generated Image October 29, 2025 - 2_54PM (1) (1).png';
const OUTPUT = path.join(__dirname, 'email-signatures/Orly-Signature-With-NMLS.png');

async function createOptimalSignature() {
    console.log('📐 Creating optimal signature (bigger for readability)...\n');

    // Trim white space first
    const trimmed = await sharp(INPUT)
        .trim({ background: 'white', threshold: 10 })
        .toBuffer();

    const metadata = await sharp(trimmed).metadata();
    console.log(`After trimming: ${metadata.width}x${metadata.height}`);

    // Target: 550px wide (good balance - readable and reasonable)
    const targetWidth = 550;
    const targetHeight = Math.round((metadata.height / metadata.width) * targetWidth);

    console.log(`Target size: ${targetWidth}x${targetHeight}`);
    console.log('Big enough to read clearly, reasonable for email\n');

    const final = await sharp(trimmed)
        .resize(targetWidth, targetHeight, {
            kernel: sharp.kernel.lanczos3  // Best quality resize
        })
        .png({
            quality: 100,  // Maximum quality
            compressionLevel: 6
        })
        .toBuffer();

    const sizeKB = (final.length / 1024).toFixed(2);
    console.log(`✅ Optimal signature:`);
    console.log(`   Size: ${targetWidth}x${targetHeight}`);
    console.log(`   File: ${sizeKB} KB`);
    console.log(`   Text: Crystal clear\n`);

    await fs.promises.writeFile(OUTPUT, final);
    console.log('💾 Saved: email-signatures/Orly-Signature-With-NMLS.png\n');
    console.log('✅ Good size for Gmail - readable and professional!\n');
}

createOptimalSignature().catch(e => {
    console.error('❌ Error:', e.message);
    process.exit(1);
});
