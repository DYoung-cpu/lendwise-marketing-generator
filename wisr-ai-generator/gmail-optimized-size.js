import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT = path.join(__dirname, 'email-signatures/Orly-Signature-With-NMLS.png');
const OUTPUT = path.join(__dirname, 'email-signatures/Orly-Signature-With-NMLS.png');

async function gmailOptimizedSize() {
    console.log('📐 Creating Gmail-optimized signature...\n');
    console.log('Gmail recommendation: 70-100px height, 300-400px width\n');

    // Get current dimensions
    const metadata = await sharp(INPUT).metadata();
    console.log(`Current size: ${metadata.width}x${metadata.height}`);

    // Target: ~350px wide (Gmail sweet spot)
    // This will make height proportionally around 256px
    // Then we'll also create a 50% reduction option

    // Option 1: 50% reduction
    const width50 = Math.round(metadata.width * 0.5);
    const height50 = Math.round(metadata.height * 0.5);

    console.log(`50% reduction: ${width50}x${height50}`);

    // Option 2: Gmail optimal (350px wide)
    const targetWidth = 350;
    const targetHeight = Math.round((metadata.height / metadata.width) * targetWidth);

    console.log(`Gmail optimal: ${targetWidth}x${targetHeight}\n`);

    // Use 50% reduction (smaller)
    console.log(`Using: ${width50}x${height50}\n`);

    const final = await sharp(INPUT)
        .resize(width50, height50, {
            kernel: sharp.kernel.lanczos3
        })
        .png({ quality: 95, compressionLevel: 9 })
        .toBuffer();

    const sizeKB = (final.length / 1024).toFixed(2);
    console.log(`✅ Gmail-optimized signature:`);
    console.log(`   Size: ${width50}x${height50}`);
    console.log(`   File: ${sizeKB} KB`);
    console.log(`   This will display at actual size in Gmail!\n`);

    await fs.promises.writeFile(OUTPUT, final);
    console.log('💾 Saved: email-signatures/Orly-Signature-With-NMLS.png\n');
    console.log('✅ Native size = Display size in Gmail!\n');
}

gmailOptimizedSize().catch(e => {
    console.error('❌ Error:', e.message);
    process.exit(1);
});
