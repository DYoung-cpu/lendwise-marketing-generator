import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT = '/mnt/c/Users/dyoun/Downloads/Generated Image October 29, 2025 - 2_54PM (1).png';
const OUTPUT = path.join(__dirname, 'email-signatures/Orly-Signature-With-NMLS.jpg');

async function processNewSignature() {
    console.log('✨ Processing new signature with NMLS...\n');

    // Crop black background and resize to 450px (smaller than before)
    const buffer = await sharp(INPUT)
        .trim({ background: 'black', threshold: 50 })  // Remove black background
        .resize(450, null, {
            fit: 'inside',
            kernel: sharp.kernel.lanczos3,
            withoutEnlargement: true
        })
        .jpeg({
            quality: 88,
            progressive: true,
            mozjpeg: true
        })
        .toBuffer();

    const sizeKB = (buffer.length / 1024).toFixed(2);
    console.log(`✅ Processed signature: ${sizeKB} KB`);
    console.log(`   Width: 450px (smaller for better Gmail display)`);
    console.log(`   Quality: 88 (excellent)`);
    console.log(`   Background: Removed\n`);

    // Save to email-signatures folder
    await fs.promises.writeFile(OUTPUT, buffer);
    console.log('💾 Saved to: email-signatures/Orly-Signature-With-NMLS.jpg\n');

    console.log('🎯 Ready to commit and push to GitHub!\n');
}

processNewSignature().catch(e => {
    console.error('❌ Error:', e.message);
    process.exit(1);
});
