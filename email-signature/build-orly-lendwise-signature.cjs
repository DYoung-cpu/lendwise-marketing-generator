const fs = require('fs');
const path = require('path');

// Function to convert image to base64
function imageToBase64(imagePath) {
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64 = imageBuffer.toString('base64');
        const ext = path.extname(imagePath).toLowerCase();
        let mimeType = 'image/png';

        if (ext === '.jpg' || ext === '.jpeg') {
            mimeType = 'image/jpeg';
        } else if (ext === '.gif') {
            mimeType = 'image/gif';
        }

        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        console.error(`Error converting ${imagePath}:`, error.message);
        return null;
    }
}

console.log('Building Orly Hakimi LendWise Signature...\n');

// Use optimized images if they exist, otherwise use originals
const photoPath = fs.existsSync('/mnt/c/Users/dyoun/Active Projects/email-signature/orly-photo-optimized.png')
    ? '/mnt/c/Users/dyoun/Active Projects/email-signature/orly-photo-optimized.png'
    : '/mnt/c/Users/dyoun/Downloads/download - 2025-10-29T100242.253.png';

const logoPath = fs.existsSync('/mnt/c/Users/dyoun/Active Projects/email-signature/lendwise-logo-optimized.png')
    ? '/mnt/c/Users/dyoun/Active Projects/email-signature/lendwise-logo-optimized.png'
    : '/mnt/c/Users/dyoun/OneDrive/Documents/Desktop/LOGOS/Screenshot 2025-10-10 201612-Picsart-BackgroundRemover.png';

console.log('Converting Orly\'s photo...');
const photoBase64 = imageToBase64(photoPath);

console.log('Converting LendWise logo...');
const logoBase64 = imageToBase64(logoPath);

// Read the template HTML
const templatePath = '/mnt/c/Users/dyoun/Active Projects/email-signature/orly-hakimi-lendwise-signature.html';
let html = fs.readFileSync(templatePath, 'utf8');

// Replace placeholders with base64 data
html = html.replace('LOGO_PLACEHOLDER', logoBase64.split(',')[1]);
html = html.replace('PHOTO_PLACEHOLDER', photoBase64.split(',')[1]);

// Write the final HTML
const outputPath = '/mnt/c/Users/dyoun/Active Projects/email-signature/orly-lendwise-final.html';
fs.writeFileSync(outputPath, html);

console.log('\n✅ Signature built successfully!');
console.log(`📄 Output: ${outputPath}`);
console.log('\nNext steps:');
console.log('1. Run: node orly-signature-server.js');
console.log('2. Open: http://localhost:3456');
console.log('3. Copy the signature and paste into Gmail');
