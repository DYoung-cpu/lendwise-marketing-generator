/**
 * Orly Hakim Email Signature - Image Processor
 * Crops, resizes, and converts the background image to base64
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_IMAGE = '/mnt/c/Users/dyoun/Downloads/Generated Image October 29, 2025 - 11_43AM (1).png';
const OUTPUT_DIR = '/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator';
const OUTPUT_IMAGE = path.join(OUTPUT_DIR, 'orly-hakim-bg.png');
const OUTPUT_BASE64 = path.join(OUTPUT_DIR, 'orly-hakim-bg-base64.txt');

// Target dimensions for email signature
const TARGET_WIDTH = 700;
const TARGET_HEIGHT = 200;

async function processImage() {
    console.log('🖼️  Processing Orly Hakim signature background image...\n');

    try {
        // Step 1: Load image and get metadata
        const image = sharp(INPUT_IMAGE);
        const metadata = await image.metadata();

        console.log(`📐 Original dimensions: ${metadata.width}x${metadata.height}`);
        console.log(`📦 Original size: ${(fs.statSync(INPUT_IMAGE).size / 1024).toFixed(2)} KB\n`);

        // Step 2: Crop to card area
        // The card appears centered in the 1024x1024 square
        // Visual inspection shows card is roughly 900x600 in the center
        // We'll crop with some padding
        const cropLeft = 60;   // Start 60px from left
        const cropTop = 160;   // Start 160px from top
        const cropWidth = 900; // Card width
        const cropHeight = 540; // Card height (maintains ~16:9 ratio)

        console.log(`✂️  Cropping to card area: ${cropWidth}x${cropHeight}`);
        console.log(`   Position: left=${cropLeft}, top=${cropTop}\n`);

        // Step 3: Resize to email-safe dimensions
        console.log(`📏 Resizing to: ${TARGET_WIDTH}x${TARGET_HEIGHT}`);

        const processedImage = await image
            .extract({
                left: cropLeft,
                top: cropTop,
                width: cropWidth,
                height: cropHeight
            })
            .resize(TARGET_WIDTH, TARGET_HEIGHT, {
                fit: 'fill',  // Force exact dimensions
                kernel: sharp.kernel.lanczos3  // High-quality resize
            })
            .png({
                quality: 95,
                compressionLevel: 9,  // Maximum compression
                palette: false  // Keep full color
            })
            .toBuffer();

        // Step 4: Save processed PNG
        await fs.promises.writeFile(OUTPUT_IMAGE, processedImage);
        const outputSize = (processedImage.length / 1024).toFixed(2);
        console.log(`✅ Saved resized image: ${OUTPUT_IMAGE}`);
        console.log(`   Size: ${outputSize} KB\n`);

        // Step 5: Convert to base64
        console.log('🔄 Converting to base64...');
        const base64 = processedImage.toString('base64');
        await fs.promises.writeFile(OUTPUT_BASE64, base64);

        console.log(`✅ Saved base64: ${OUTPUT_BASE64}`);
        console.log(`   Base64 length: ${base64.length} characters\n`);

        // Step 6: Summary
        console.log('📊 SUMMARY:');
        console.log(`   Original: ${metadata.width}x${metadata.height} (${(fs.statSync(INPUT_IMAGE).size / 1024).toFixed(2)} KB)`);
        console.log(`   Processed: ${TARGET_WIDTH}x${TARGET_HEIGHT} (${outputSize} KB)`);
        console.log(`   Compression: ${(100 - (processedImage.length / fs.statSync(INPUT_IMAGE).size * 100)).toFixed(1)}% reduction`);
        console.log('\n✨ Image processing complete!\n');

        return {
            success: true,
            imagePath: OUTPUT_IMAGE,
            base64Path: OUTPUT_BASE64,
            dimensions: { width: TARGET_WIDTH, height: TARGET_HEIGHT },
            size: outputSize
        };

    } catch (error) {
        console.error('❌ Error processing image:', error.message);
        throw error;
    }
}

// Run the processing
processImage()
    .then(result => {
        console.log('🎉 Success!');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Failed:', error);
        process.exit(1);
    });

export { processImage };
