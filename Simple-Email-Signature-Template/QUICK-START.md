# Quick Start Guide

## For a New Person (3 Easy Steps)

### Step 1: Edit config.json

Open `config.json` and update these key fields:

```json
{
  "person": {
    "name": "Jane Smith",                                    // ← Change name
    "title": "Senior Loan Officer",                          // ← Change title
    "photo": "/path/to/jane-photo.png",                      // ← Change photo path
    "nmls": "987654"                                         // ← Change NMLS
  },
  "contact": {
    "direct": "555-1234",                                    // ← Change phone
    "email": "jane@lendwisemtg.com"                         // ← Change email
  },
  "websites": [
    {
      "label": "Zillow Reviews",
      "url": "https://www.zillow.com/lender-profile/jsmith/" // ← Change URL
    },
    {
      "label": "www.janesmith.com",                          // ← Change personal site
      "url": "https://www.janesmith.com"
    }
  ]
}
```

**Company info stays the same** (unless creating for different company)

### Step 2: Build

```bash
node build-signature.cjs
```

### Step 3: Copy to Gmail

```bash
node server.cjs
```

1. Open http://localhost:3456
2. Click "Copy Signature to Clipboard"
3. Paste in Gmail Settings → Signature

Done! 🎉

---

## NPM Scripts (Alternative)

Instead of running Node directly, you can use these shortcuts:

```bash
npm run build      # Build signature
npm run serve      # Start preview server
npm run preview    # Build + serve
npm run screenshot # Build + take screenshot
```

---

## Common Customizations

### Change Gold Color

```json
"branding": {
  "goldColor": "#FF6B35"  // ← Change to any hex color
}
```

### Change Signature Size

```json
"branding": {
  "maxWidth": 500,        // ← Make wider (default: 473)
  "baseFontSize": 12      // ← Make text bigger (default: 11)
}
```

### Remove Websites

```json
"websites": []            // ← Empty array = no website links
```

### Change Button Text

```json
"applyButton": {
  "text": "GET STARTED",  // ← Any text you want
  "url": "https://..."
}
```

---

## File Paths

**IMPORTANT**: Use absolute paths, not relative paths!

✅ **Correct**:
```json
"photo": "/mnt/c/Users/yourname/Pictures/headshot.png"
```

❌ **Wrong**:
```json
"photo": "./headshot.png"
"photo": "headshot.png"
```

---

## Troubleshooting

### "Image not found"
- Check file path is absolute
- Verify file exists at that location
- Try copying file to template directory

### "Convert command not found"
- Install ImageMagick: `sudo apt install imagemagick`
- Or: Script will fallback to copying images directly

### Signature too big in Gmail
- Reduce `maxWidth` to 450 or less
- Reduce `baseFontSize` to 10
- Use smaller/compressed images

---

## Creating for Multiple People

**Option 1: Copy the entire folder**

```bash
cp -r Simple-Email-Signature-Template Jane-Smith-Signature
cd Jane-Smith-Signature
# Edit config.json
node build-signature.cjs
```

**Option 2: Keep multiple config files**

```bash
# Save configs
cp config.json configs/orly-config.json
cp config.json configs/jane-config.json

# Use specific config
cp configs/jane-config.json config.json
node build-signature.cjs
```

---

## Image Recommendations

- **Photo**: 300x300px minimum, PNG format
- **Logo**: Transparent PNG, width ~500px before resize
- **File size**: Keep under 100KB per image
- **Format**: PNG preferred (supports transparency)

---

## Gmail Integration Tips

1. **Clear old signatures** before pasting new one
2. **Scroll down** after pasting and click "Save Changes"
3. **Send test email** to yourself to verify
4. **Check mobile** - test how it looks on phone
5. **Avoid edits** after pasting (rebuild instead)

---

## Need Help?

See the full [README.md](README.md) for detailed documentation.
