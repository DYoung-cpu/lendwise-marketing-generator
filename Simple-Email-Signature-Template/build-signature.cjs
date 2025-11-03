const fs = require('fs');
const path = require('path');

console.log('Building email signature from template...\n');

// Read config
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

// Read template
let html = fs.readFileSync('./template.html', 'utf8');

// Helper to convert image to base64
function imageToBase64(imagePath) {
    const imageBuffer = fs.readFileSync(imagePath);
    return `data:image/png;base64,${imageBuffer.toString('base64')}`;
}

// Process images to optimized versions
const photoOptimized = './photo-optimized.png';
const logoOptimized = './logo-optimized.png';

try {
    const { execSync } = require('child_process');

    console.log('Optimizing photo...');
    execSync(`convert "${config.person.photo}" -quality 100 "${photoOptimized}"`, { stdio: 'inherit' });

    console.log('Optimizing logo...');
    execSync(`convert "${config.company.logo}" -resize ${config.company.logoWidth}x -quality 95 "${logoOptimized}"`, { stdio: 'inherit' });

    console.log('✓ Images optimized\n');
} catch (error) {
    console.log('ImageMagick not available, copying images directly...\n');
    fs.copyFileSync(config.person.photo, photoOptimized);
    fs.copyFileSync(config.company.logo, logoOptimized);
}

// Convert images to base64
console.log('Converting images to base64...');
const photoBase64 = imageToBase64(photoOptimized).split(',')[1];
const logoBase64 = imageToBase64(logoOptimized).split(',')[1];

// Build website links HTML
const websiteLinks = config.websites.map(site =>
    `<div><strong>W:</strong> <a href="${site.url}" target="_blank" style="color: ${config.branding.royalBlue}; text-decoration: none;">${site.label}</a></div>`
).join('\n                            ');

// Create Google Maps link
const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.company.address)}`;

// Calculate derived sizes
const nameSize = Math.round(config.branding.baseFontSize * 1.64); // 18px from 11px
const footerSize = Math.round(config.branding.baseFontSize * 0.82); // 9px from 11px

// Replace all placeholders
const replacements = {
    '{{PERSON_NAME}}': config.person.name,
    '{{PERSON_TITLE}}': config.person.title,
    '{{PERSON_NMLS}}': config.person.nmls,
    '{{COMPANY_NAME}}': config.company.name,
    '{{PHONE_DIRECT}}': config.contact.direct,
    '{{PHONE_FAX}}': config.contact.fax,
    '{{EMAIL}}': config.contact.email,
    '{{WEBSITE_LINKS}}': websiteLinks,
    '{{APPLY_TEXT}}': config.applyButton.text,
    '{{APPLY_URL}}': config.applyButton.url,
    '{{COMPANY_WEBSITE}}': config.company.website,
    '{{COMPANY_ADDRESS}}': config.company.address,
    '{{COMPANY_EMAIL}}': config.company.companyEmail,
    '{{COMPANY_NMLS}}': config.company.nmls,
    '{{COMPANY_DRE}}': config.company.dre,
    '{{ROYAL_BLUE}}': config.branding.royalBlue,
    '{{GOLD_COLOR}}': config.branding.goldColor,
    '{{FONT_FAMILY}}': config.branding.fontFamily,
    '{{MAX_WIDTH}}': config.branding.maxWidth,
    '{{BASE_FONT_SIZE}}': config.branding.baseFontSize,
    '{{NAME_SIZE}}': nameSize,
    '{{FOOTER_SIZE}}': footerSize,
    '{{LOGO_WIDTH}}': config.company.logoWidth,
    '{{PHOTO_SIZE}}': config.person.photoSize,
    '{{MAPS_LINK}}': mapsLink,
    'PHOTO_PLACEHOLDER': photoBase64,
    'LOGO_PLACEHOLDER': logoBase64
};

// Apply all replacements
Object.entries(replacements).forEach(([placeholder, value]) => {
    html = html.replace(new RegExp(placeholder, 'g'), value);
});

// Write final signature
const outputFile = `./${config.output.filename}.html`;
fs.writeFileSync(outputFile, html);

console.log(`✅ Signature built successfully!`);
console.log(`📄 Output: ${path.resolve(outputFile)}`);
console.log(`\nNext steps:`);
console.log(`1. Run: node server.cjs`);
console.log(`2. Open: http://localhost:3456`);
console.log(`3. Copy the signature and paste into Gmail\n`);
