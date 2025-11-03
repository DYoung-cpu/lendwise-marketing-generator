const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Processing images for email signature...\n');

// Paths
const photoInput = '/mnt/c/Users/dyoun/Downloads/download - 2025-10-29T100242.253.png';
const logoInput = '/mnt/c/Users/dyoun/OneDrive/Documents/Desktop/LOGOS/Screenshot 2025-10-10 201612-Picsart-BackgroundRemover.png';
const outputDir = '/mnt/c/Users/dyoun/Active Projects/email-signature';
const photoOutput = path.join(outputDir, 'orly-photo-optimized.png');
const logoOutput = path.join(outputDir, 'lendwise-logo-optimized.png');

try {
    // Keep Orly's photo at original 100x100 size to avoid pixelation from upscaling
    console.log('Optimizing Orly\'s photo at native 100x100 resolution...');
    execSync(`convert "${photoInput}" -quality 100 "${photoOutput}"`, {
        stdio: 'inherit'
    });
    console.log('✓ Photo optimized (100x100 native resolution)');

    // Resize logo to width 166px (5% increase from 158px)
    console.log('Resizing LendWise logo to 166px width...');
    execSync(`convert "${logoInput}" -resize 166x -quality 95 "${logoOutput}"`, {
        stdio: 'inherit'
    });
    console.log('✓ Logo optimized');

    console.log('\n✅ Image processing complete!');
    console.log(`Photo: ${photoOutput}`);
    console.log(`Logo: ${logoOutput}`);
} catch (error) {
    console.error('Error processing images:', error.message);
    console.log('\nFalling back to direct copy...');

    // Fallback: just copy the files
    fs.copyFileSync(photoInput, photoOutput);
    fs.copyFileSync(logoInput, logoOutput);
    console.log('✓ Files copied (no optimization)');
}
