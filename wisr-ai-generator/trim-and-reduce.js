import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT = '/mnt/c/Users/dyoun/Downloads/Generated Image October 29, 2025 - 2_54PM (1) (1).png';
const OUTPUT = path.join(__dirname, 'email-signatures/Orly-Signature-With-NMLS.png');

async function trimAndReduce() {
    console.log('🔍 Analyzing PNG...\n');

    // First, trim all white space
    const trimmed = await sharp(INPUT)
        .trim({ background: 'white', threshold: 10 })
        .toBuffer();

    // Get dimensions after trimming
    const metadata = await sharp(trimmed).metadata();
    console.log(`After trimming white space: ${metadata.width}x${metadata.height}`);

    // Calculate 30% reduction (multiply by 0.7)
    const newWidth = Math.round(metadata.width * 0.7);
    const newHeight = Math.round(metadata.height * 0.7);

    console.log(`Reducing by 30%: ${newWidth}x${newHeight}\n`);

    // Resize and save as PNG
    const final = await sharp(trimmed)
        .resize(newWidth, newHeight, {
            kernel: sharp.kernel.lanczos3
        })
        .png({ quality: 95, compressionLevel: 9 })
        .toBuffer();

    const sizeKB = (final.length / 1024).toFixed(2);
    console.log(`✅ Final signature:`);
    console.log(`   Size: ${newWidth}x${newHeight}`);
    console.log(`   File: ${sizeKB} KB`);
    console.log(`   White space: REMOVED`);
    console.log(`   Size reduction: 30%\n`);

    await fs.promises.writeFile(OUTPUT, final);
    console.log('💾 Saved: email-signatures/Orly-Signature-With-NMLS.png\n');
    console.log('✅ Ready to push!\n');
}

trimAndReduce().catch(e => {
    console.error('❌ Error:', e.message);
    process.exit(1);
});
