import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Original high-res source
const INPUT = '/mnt/c/Users/dyoun/Downloads/Generated Image October 29, 2025 - 2_54PM (1) (1).png';
const OUTPUT = path.join(__dirname, 'email-signatures/Orly-Hakim-Signature.png');  // NEW FILENAME

async function createFinalSignature() {
    console.log('📐 Creating FINAL signature with NEW filename (no cache issues)...\n');

    // Trim white space
    const trimmed = await sharp(INPUT)
        .trim({ background: 'white', threshold: 10 })
        .toBuffer();

    const metadata = await sharp(trimmed).metadata();
    console.log(`After trimming: ${metadata.width}x${metadata.height}`);

    // Target: 600px wide (bigger = more readable)
    const targetWidth = 600;
    const targetHeight = Math.round((metadata.height / metadata.width) * targetWidth);

    console.log(`Target size: ${targetWidth}x${targetHeight}`);
    console.log('Large enough to be perfectly readable!\n');

    const final = await sharp(trimmed)
        .resize(targetWidth, targetHeight, {
            kernel: sharp.kernel.lanczos3  // Highest quality
        })
        .png({
            quality: 100,  // Maximum quality
            compressionLevel: 5  // Less compression for better quality
        })
        .toBuffer();

    const sizeKB = (final.length / 1024).toFixed(2);
    console.log(`✅ Final signature:`);
    console.log(`   Size: ${targetWidth}x${targetHeight}`);
    console.log(`   File: ${sizeKB} KB`);
    console.log(`   Filename: Orly-Hakim-Signature.png (NEW - no cache!)\n`);

    await fs.promises.writeFile(OUTPUT, final);
    console.log('💾 Saved: email-signatures/Orly-Hakim-Signature.png\n');
    console.log('✅ This is a NEW file - no GitHub cache issues!\n');
}

createFinalSignature().catch(e => {
    console.error('❌ Error:', e.message);
    process.exit(1);
});
