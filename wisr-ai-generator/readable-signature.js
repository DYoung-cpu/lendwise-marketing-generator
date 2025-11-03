import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Go back to the ORIGINAL PNG (not the reduced one)
const INPUT = '/mnt/c/Users/dyoun/Downloads/Generated Image October 29, 2025 - 2_54PM (1) (1).png';
const OUTPUT = path.join(__dirname, 'email-signatures/Orly-Signature-With-NMLS.png');

async function createReadableSignature() {
    console.log('📐 Creating signature with READABLE text...\n');

    // Start with original, trim white space
    const trimmed = await sharp(INPUT)
        .trim({ background: 'white', threshold: 10 })
        .toBuffer();

    const metadata = await sharp(trimmed).metadata();
    console.log(`After trimming: ${metadata.width}x${metadata.height}`);

    // Target: 420px wide (sweet spot - readable text, reasonable size)
    const targetWidth = 420;
    const targetHeight = Math.round((metadata.height / metadata.width) * targetWidth);

    console.log(`Target size: ${targetWidth}x${targetHeight}`);
    console.log('This keeps text sharp and readable!\n');

    const final = await sharp(trimmed)
        .resize(targetWidth, targetHeight, {
            kernel: sharp.kernel.lanczos3  // High quality resize
        })
        .png({
            quality: 100,  // Maximum quality for text clarity
            compressionLevel: 6  // Less compression = better quality
        })
        .toBuffer();

    const sizeKB = (final.length / 1024).toFixed(2);
    console.log(`✅ Readable signature:`);
    console.log(`   Size: ${targetWidth}x${targetHeight}`);
    console.log(`   File: ${sizeKB} KB`);
    console.log(`   Text: READABLE (high quality resize)`);
    console.log(`   Gmail display: Perfect size\n`);

    await fs.promises.writeFile(OUTPUT, final);
    console.log('💾 Saved: email-signatures/Orly-Signature-With-NMLS.png\n');
    console.log('✅ Text will be sharp and easy to read!\n');
}

createReadableSignature().catch(e => {
    console.error('❌ Error:', e.message);
    process.exit(1);
});
