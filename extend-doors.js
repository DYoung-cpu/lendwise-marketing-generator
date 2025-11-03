import { createCanvas, loadImage } from 'canvas';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extend door image width by cloning edge patterns
 * Preserves center content (LENDWISE text + owl emblem)
 */

async function extendDoorWidth() {
    console.log('🚪 Door Width Extension Script');
    console.log('================================\n');

    try {
        // Paths
        const inputPath = path.join(__dirname, 'LendWise-Onboarding/frontend/public/lendwise-doors-new.png');
        const outputPath = path.join(__dirname, 'LendWise-Onboarding/frontend/public/lendwise-doors-wide-final.png');

        console.log('📂 Loading original door image...');
        const originalImage = await loadImage(inputPath);

        const originalWidth = originalImage.width;
        const originalHeight = originalImage.height;

        console.log(`✅ Loaded: ${originalWidth}x${originalHeight}px\n`);

        // Calculate new dimensions
        // Frame is stretched 40% wider (scaleX 1.4), so doors need to match
        const widthIncrease = Math.floor(originalWidth * 0.5);
        const newWidth = originalWidth + widthIncrease;

        // How much to add on each side
        const leftExtension = Math.floor(widthIncrease / 2);
        const rightExtension = widthIncrease - leftExtension;

        console.log(`🎯 Target dimensions: ${newWidth}x${originalHeight}px`);
        console.log(`📏 Adding ${leftExtension}px to left, ${rightExtension}px to right\n`);

        // Create new canvas
        const canvas = createCanvas(newWidth, originalHeight);
        const ctx = canvas.getContext('2d');

        // Strategy: Clone edge strips and tile them
        const edgeWidth = 50; // Width of edge pattern to clone

        console.log('🎨 Extending left edge...');
        // Left edge extension - clone and tile the leftmost pattern
        for (let x = 0; x < leftExtension; x += edgeWidth) {
            const tileWidth = Math.min(edgeWidth, leftExtension - x);
            ctx.drawImage(
                originalImage,
                0, 0, tileWidth, originalHeight,  // Source: leftmost edge
                x, 0, tileWidth, originalHeight   // Dest: fill left extension
            );
        }

        console.log('🎨 Drawing original door in center...');
        // Draw original image in the middle
        ctx.drawImage(originalImage, leftExtension, 0);

        console.log('🎨 Extending right edge...');
        // Right edge extension - clone and tile the rightmost pattern
        const rightStartX = leftExtension + originalWidth;
        for (let x = 0; x < rightExtension; x += edgeWidth) {
            const tileWidth = Math.min(edgeWidth, rightExtension - x);
            ctx.drawImage(
                originalImage,
                originalWidth - edgeWidth, 0, tileWidth, originalHeight,  // Source: rightmost edge
                rightStartX + x, 0, tileWidth, originalHeight             // Dest: fill right extension
            );
        }

        // Save to file
        console.log('\n💾 Saving extended image...');
        const buffer = canvas.toBuffer('image/png');
        await fs.writeFile(outputPath, buffer);

        console.log('✅ SUCCESS! Extended door saved to:');
        console.log(`   ${outputPath}`);
        console.log(`\n📊 New dimensions: ${newWidth}x${originalHeight}px`);
        console.log(`📦 File size: ${(buffer.length / 1024).toFixed(2)} KB`);

        console.log('\n🎯 Next steps:');
        console.log('1. Check the extended image: frontend/public/lendwise-doors-extended.png');
        console.log('2. If it looks good, update card-curtain-reveal.tsx to use it');
        console.log('3. Adjust extension percentage if needed and re-run');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run the extension
extendDoorWidth();
