# Email Signature Setup Instructions for Moe Hassan

## Quick Start Guide

### Step 1: Upload the Image
First, you need to host the signature image online:

**Option A - Use Imgur (Easiest, Free)**
1. Go to https://imgur.com
2. Click "New post"
3. Upload the file: `signature-background.png`
4. After upload, right-click the image and select "Copy image address"
5. Save this URL - you'll need it in Step 2

**Option B - Use Google Drive**
1. Upload `signature-background.png` to Google Drive
2. Right-click the file > Get link > Change to "Anyone with the link"
3. Copy the link and modify it (instructions online)

**Option C - Use Your Website**
If LendWise has web hosting, upload the image there and get the URL.

---

### Step 2: Update the Signature Code

1. Open the file: `SIGNATURE-CODE.html`
2. Find this line (near the top of the code):
   ```
   <img src="REPLACE-WITH-YOUR-IMAGE-URL"
   ```
3. Replace `REPLACE-WITH-YOUR-IMAGE-URL` with your image URL from Step 1
4. Example:
   ```
   <img src="https://i.imgur.com/abc123.png"
   ```

---

### Step 3: Install in Your Email Client

**For Gmail:**
1. Open Gmail Settings (gear icon) > See all settings
2. Scroll to "Signature" section
3. Click "Create new" and name it "LendWise"
4. Click the "Insert image" icon in the toolbar
5. Paste your entire signature code
6. Scroll down and click "Save Changes"

**For Outlook (Desktop):**
1. File > Options > Mail > Signatures
2. Click "New" to create a new signature
3. Name it "LendWise"
4. In the editor, click the HTML button (</>) or use Ctrl+Shift+V
5. Paste your signature code
6. Click "OK" to save

**For Outlook (Web):**
1. Settings (gear icon) > View all Outlook settings
2. Mail > Compose and reply > Email signature
3. Click in the signature box
4. Paste your signature code
5. Click "Save"

**For Apple Mail:**
1. Mail > Preferences > Signatures
2. Click the "+" to add a new signature
3. Name it "LendWise"
4. Paste your signature code
5. Close preferences (auto-saves)

---

### Step 4: Test Your Signature

1. Compose a new email to yourself
2. The signature should appear automatically
3. **Test all clickable areas:**
   - Cell phone: 818.741.6969
   - Email: MOE@LendWiseMTG.com
   - Office phone: (818) 723-7376
   - Website: LendWisemtg.com
   - Office location (opens Google Maps)

---

## Troubleshooting

**Image not showing?**
- Make sure the image URL is correct and publicly accessible
- Try opening the URL in a browser to verify it works

**Links not working?**
- Some email clients strip out certain HTML. Try a different client or contact support.

**Signature looks wrong?**
- Make sure you pasted the ENTIRE code from `<div>` to `</div>`
- Some email clients require specific formatting

---

## Files Included

- `signature-background.png` - The signature design image (upload this online)
- `SIGNATURE-CODE.html` - The HTML code to copy/paste
- `index.html` - Preview page (you can delete this after setup)

---

## Need Help?

Contact your IT department or the person who created this signature for assistance.
