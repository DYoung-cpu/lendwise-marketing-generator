# Simple Email Signature Template

A reusable, Gmail-safe email signature generator for creating professional email signatures with photos, logos, and company branding.

## Features

- **Gmail-Compatible**: Uses inline CSS and base64-encoded images
- **Fully Customizable**: Easy configuration via JSON
- **Professional Design**: Circular photo, company logo, gradient buttons, styled footer
- **Responsive Layout**: Works across email clients
- **One-Click Copy**: Built-in copy button for easy Gmail integration

## Quick Start

### 1. Install Dependencies

```bash
npm init -y
npm install
```

Make sure you have ImageMagick installed for image processing:
- **Ubuntu/WSL**: `sudo apt install imagemagick`
- **Mac**: `brew install imagemagick`
- **Windows**: Download from https://imagemagick.org/

### 2. Configure Your Signature

Edit `config.json` with your information:

```json
{
  "person": {
    "name": "Your Name",
    "title": "Your Title",
    "photo": "/path/to/your/photo.png",
    "photoSize": 79,
    "nmls": "123456"
  },
  "contact": {
    "direct": "555-123-4567",
    "fax": "555-987-6543",
    "email": "you@company.com"
  },
  "websites": [
    {
      "label": "Your Website",
      "url": "https://yourwebsite.com"
    }
  ],
  "company": {
    "name": "Your Company",
    "logo": "/path/to/logo.png",
    "logoWidth": 166,
    "website": "yourcompany.com",
    "address": "123 Main St, City, State 12345",
    "companyEmail": "info@yourcompany.com",
    "nmls": "123456",
    "dre": "123456"
  },
  "applyButton": {
    "text": "APPLY NOW",
    "url": "https://your-application-url.com"
  },
  "branding": {
    "goldColor": "#DAA520",
    "fontFamily": "Roboto, Arial, sans-serif",
    "maxWidth": 473,
    "baseFontSize": 11
  },
  "output": {
    "filename": "email-signature"
  }
}
```

### 3. Build Your Signature

```bash
node build-signature.cjs
```

This will:
- Process and optimize your images
- Convert images to base64
- Generate the final HTML signature
- Output to `email-signature.html`

### 4. Preview Your Signature

```bash
node server.cjs
```

Open http://localhost:3456 in your browser to preview.

### 5. Copy to Gmail

1. Click the "Copy Signature to Clipboard" button on the preview page
2. Open Gmail Settings → See all settings → General
3. Scroll to "Signature" section
4. Create new signature or edit existing
5. Paste the signature (Ctrl+V or Cmd+V)
6. Scroll down and click "Save Changes"

## Configuration Guide

### Person Settings

- **name**: Full name (appears in gold at top)
- **title**: Job title (appears under name)
- **photo**: Absolute path to headshot photo
- **photoSize**: Photo size in pixels (79px recommended)
- **nmls**: NMLS license number

### Contact Information

- **direct**: Direct phone number (clickable)
- **fax**: Fax number
- **email**: Email address (clickable)

### Websites

Array of website links to display. Each entry has:
- **label**: Display text
- **url**: Full URL

### Company Information

- **name**: Company name
- **logo**: Absolute path to company logo
- **logoWidth**: Logo width in pixels (166px recommended)
- **website**: Website domain (without https://)
- **address**: Physical address (becomes clickable Google Maps link)
- **companyEmail**: Company contact email
- **nmls**: Company NMLS number
- **dre**: Company DRE number

### Apply Button

- **text**: Button text (e.g., "APPLY NOW")
- **url**: Application URL

### Branding

- **goldColor**: Primary brand color (hex code)
- **fontFamily**: Font stack
- **maxWidth**: Maximum signature width in pixels
- **baseFontSize**: Base font size in pixels

### Output

- **filename**: Output HTML filename (without .html extension)

## File Structure

```
Simple-Email-Signature-Template/
├── config.json              # Your configuration
├── template.html            # HTML template with placeholders
├── build-signature.cjs      # Build script
├── server.cjs               # Preview server
├── screenshot.cjs           # Screenshot generator
├── README.md               # This file
├── email-signature.html    # Generated signature (after build)
├── photo-optimized.png     # Optimized photo (after build)
└── logo-optimized.png      # Optimized logo (after build)
```

## Creating Signatures for Multiple People

To create signatures for different people:

1. **Copy the template directory**:
   ```bash
   cp -r Simple-Email-Signature-Template Person-Name-Signature
   ```

2. **Edit the new config.json** with the person's information

3. **Build the new signature**:
   ```bash
   cd Person-Name-Signature
   node build-signature.cjs
   ```

4. **Preview and copy** as usual

## Tips

- **Image Quality**: Use high-resolution images (300x300px minimum for photos)
- **Logo Format**: PNG with transparent background works best
- **Testing**: Always test in Gmail before deploying
- **Size Limit**: Keep signature under 10KB for best compatibility
- **Colors**: Use the same gold color throughout for brand consistency

## Troubleshooting

### Images not showing in Gmail

- Make sure base64 encoding is working
- Check image file paths in config.json
- Verify images exist at specified paths

### Layout breaks in Gmail

- Avoid increasing max-width beyond 500px
- Keep inline CSS only
- Test with different Gmail themes

### Build fails

- Verify ImageMagick is installed: `convert --version`
- Check all file paths in config.json are absolute paths
- Ensure images are PNG format

## Example Configurations

### Minimal Configuration

```json
{
  "person": {
    "name": "John Doe",
    "title": "Loan Officer",
    "photo": "/path/to/photo.png",
    "photoSize": 79,
    "nmls": "123456"
  },
  "contact": {
    "direct": "555-0100",
    "fax": "555-0101",
    "email": "john@example.com"
  },
  "websites": [],
  "company": {
    "name": "Example Mortgage",
    "logo": "/path/to/logo.png",
    "logoWidth": 166,
    "website": "example.com",
    "address": "123 Main St, City, ST 12345",
    "companyEmail": "info@example.com",
    "nmls": "654321",
    "dre": "111111"
  },
  "applyButton": {
    "text": "APPLY",
    "url": "https://example.com/apply"
  },
  "branding": {
    "goldColor": "#DAA520",
    "fontFamily": "Arial, sans-serif",
    "maxWidth": 473,
    "baseFontSize": 11
  },
  "output": {
    "filename": "signature"
  }
}
```

## License

Free to use and modify for your organization.

## Support

For issues or questions, refer to the build output messages or check that:
1. All file paths are absolute (not relative)
2. Images are PNG format
3. ImageMagick is installed
4. Node.js is installed
