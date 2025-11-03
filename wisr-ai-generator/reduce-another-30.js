import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT = path.join(__dirname, 'email-signatures/Orly-Signature-With-NMLS.png');
const OUTPUT = path.join(__dirname, 'email-signatures/Orly-Signature-With-NMLS.png');

async function reduceAnother30() {
    console.log('📏 Reducing by another 30%...\n');

    // Get current dimensions
    const image = sharp(INPUT);
    const metadata = await image.metadata();
    console.log(`Current size: ${metadata.width}x${metadata.height}`);

    // Calculate another 30% reduction
    const newWidth = Math.round(metadata.width * 0.7);
    const newHeight = Math.round(metadata.height * 0.7);

    console.log(`New size (30% smaller): ${newWidth}x${newHeight}\n`);

    // Resize
    const final = await sharp(INPUT)
        .resize(newWidth, newHeight, {
            kernel: sharp.kernel.lanczos3
        })
        .png({ quality: 95, compressionLevel: 9 })
        .toBuffer();

    const sizeKB = (final.length / 1024).toFixed(2);
    console.log(`✅ Reduced signature:`);
    console.log(`   Size: ${newWidth}x${newHeight}`);
    console.log(`   File: ${sizeKB} KB`);
    console.log(`   Total reduction from original: 51% smaller\n`);

    await fs.promises.writeFile(OUTPUT, final);
    console.log('💾 Saved: email-signatures/Orly-Signature-With-NMLS.png\n');
    console.log('✅ This should be perfect for Gmail!\n');
}

reduceAnother30().catch(e => {
    console.error('❌ Error:', e.message);
    process.exit(1);
});
