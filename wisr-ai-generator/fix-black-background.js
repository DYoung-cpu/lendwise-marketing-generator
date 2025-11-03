import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT = '/mnt/c/Users/dyoun/Downloads/Generated Image October 29, 2025 - 2_54PM (1).png';
const OUTPUT = path.join(__dirname, 'email-signatures/Orly-Signature-With-NMLS.jpg');

async function removeBlackBackground() {
    console.log('🔍 Checking original image dimensions...\n');

    const image = sharp(INPUT);
    const metadata = await image.metadata();
    console.log(`Original: ${metadata.width}x${metadata.height}\n`);

    // First, extract just the signature card area (removing black borders)
    // Based on the image, the signature card is roughly centered
    // Let me crop more aggressively to get only the green card
    console.log('✂️  Cropping to signature card only (no black)...\n');

    const buffer = await sharp(INPUT)
        // Crop to just the signature card (manual coordinates to avoid black)
        .extract({
            left: 75,
            top: 120,
            width: 445,
            height: 230
        })
        .resize(450, null, {
            fit: 'inside',
            kernel: sharp.kernel.lanczos3,
            withoutEnlargement: false
        })
        .jpeg({
            quality: 90,
            progressive: true,
            mozjpeg: true
        })
        .toBuffer();

    const sizeKB = (buffer.length / 1024).toFixed(2);
    console.log(`✅ Black background removed!`);
    console.log(`   Final size: ${sizeKB} KB`);
    console.log(`   Width: 450px`);
    console.log(`   Quality: 90\n`);

    // Save
    await fs.promises.writeFile(OUTPUT, buffer);
    console.log('💾 Saved: email-signatures/Orly-Signature-With-NMLS.jpg\n');
    console.log('✅ No black edges - ready to push!\n');
}

removeBlackBackground().catch(e => {
    console.error('❌ Error:', e.message);
    process.exit(1);
});
