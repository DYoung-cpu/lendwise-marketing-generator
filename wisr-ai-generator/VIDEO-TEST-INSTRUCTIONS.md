# 🧪 Video Test Page - Quick Start Guide

**File:** `video-test.html`
**Purpose:** Test Runway video generation in isolation before production deployment

---

## 🚀 How to Use (2 Steps)

### Step 1: Start Backend Server

Open terminal:

```bash
cd "/mnt/c/Users/dyoun/Active Projects"
node quality-backend.js
```

**Keep terminal open** - server must stay running.

---

### Step 2: Open Test Page

**Option A - File Explorer:**
1. Open: `C:\Users\dyoun\Active Projects\wisr-ai-generator\`
2. Double-click: `video-test.html`

**Option B - Browser URL:**
```
file:///mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/video-test.html
```

---

## 🎬 Testing Video Generation

### Method 1: Upload Your Own Image

1. **Click the upload zone** (📁 icon)
2. **Select any image** from your computer
3. **Configure settings** (or use defaults)
4. **Click "🎬 Generate Video"**
5. **Wait ~60 seconds**
6. **Watch the video!**

### Method 2: Use Image URL

1. **Paste image URL** in the text box
   - Data URI: `data:image/png;base64,...`
   - Web URL: `https://example.com/image.jpg`
2. **Click "Load Image"**
3. **Generate video** as above

### Method 3: Test with Marketing Generator Image

1. Go to main marketing generator
2. Generate an image
3. **Right-click image** → "Copy image address"
4. **Paste** into video test page URL field
5. Generate video

---

## ⚙️ Settings Explained

### Model
- **Gen-4 Turbo** ⭐ (Recommended) - Fastest, highest quality
- **Gen-3 Alpha Turbo** - Slightly older, still excellent

### Duration
- **5 seconds** - $0.25 (good for short clips)
- **10 seconds** ⭐ - $0.50 (recommended for most content)

### Aspect Ratio
- **Horizontal (1280x720)** - Instagram feed, LinkedIn, Facebook
- **Vertical (768x1280)** ⭐ - Instagram Reels, TikTok, Stories
- **Square (1280x1280)** - Instagram feed (square posts)

### Template Type
Automatically applies motion prompts:
- **Default** - Generic smooth motion
- **Rate Alert** - Zoom on numbers, gold sparkles
- **Educational** - Parallax, sequential highlights
- **Testimonial** - Cinematic push, emotional warmth
- **Market Update** - Dynamic data animation

### Custom Prompt (Optional)
Override automatic prompt with your own motion description:
- "Smooth zoom in with gold particles"
- "Gentle camera rotation clockwise"
- "Fast dynamic data visualization"

---

## 📊 What You'll See

### Status Indicators

**✅ Backend Status: Connected** (Green)
- Server is running
- Ready to generate

**❌ Backend Status: Offline** (Red)
- Server not running
- Start: `node quality-backend.js`

### Progress Display

1. **Starting generation...** (0%)
2. **Generating video...** (Progress bar 0-95%)
3. **Finalizing...** (100%)
4. **Video appears!** ✅

### Console Log

Real-time status messages:
- ✅ Success messages (green)
- ❌ Error messages (red)
- ℹ️ Info messages (yellow)

---

## 💰 Cost Tracking

The page shows:
- **Estimated Cost** before generation
- **Actual Cost** after generation
- **Credits Used** (5 credits = 1 second)

**Examples:**
- 5-second video: 25 credits = **$0.25**
- 10-second video: 50 credits = **$0.50**

---

## 📥 Downloading Videos

After video generation:
1. **Watch inline** - Click play button
2. **Download** - Click "📥 Download Video"
3. **Saved to:** `C:\Users\dyoun\Downloads\runway-test-[timestamp].mp4`

---

## 🧪 Recommended Test Sequence

### Test 1: Basic Functionality
- **Image:** Any simple logo or graphic
- **Settings:** All defaults
- **Goal:** Verify API works

### Test 2: Different Durations
- **Test A:** 5-second video ($0.25)
- **Test B:** 10-second video ($0.50)
- **Goal:** Compare quality and cost

### Test 3: Different Ratios
- **Test A:** Horizontal (1280x720)
- **Test B:** Vertical (768x1280)
- **Goal:** Test for different social platforms

### Test 4: Template Types
- **Test A:** Rate Alert (should have zoom effect)
- **Test B:** Educational (should have parallax)
- **Goal:** Verify motion prompts work

### Test 5: Custom Prompt
- **Input:** "Dramatic 360-degree camera rotation"
- **Goal:** Test custom motion override

**Total Test Cost:** ~$2.50 (5 test videos)

---

## 🐛 Troubleshooting

### "Backend Status: Offline"
**Fix:**
```bash
cd "/mnt/c/Users/dyoun/Active Projects"
node quality-backend.js
```

### "Generate Video" button is disabled
**Fix:** Upload or paste an image first

### Video generation fails
**Check:**
1. Backend server still running?
2. Internet connection working?
3. Image URL valid?
4. Check console log for error details

### Video URL doesn't load
**Possible causes:**
- Runway API issue (temporary)
- URL expired (try regenerating)
- Network issue (check connection)

### "Failed to fetch" error
**Fix:** Backend server not running on port 3001

---

## 📋 Test Checklist

Before moving to production:

- [ ] Backend server starts successfully
- [ ] Test page loads in browser
- [ ] Status shows "✅ Connected"
- [ ] Can upload image from computer
- [ ] Can paste image URL
- [ ] Video generates successfully
- [ ] Video plays inline
- [ ] Can download video file
- [ ] Cost tracking accurate
- [ ] Console log shows all steps
- [ ] Different ratios work (horizontal/vertical)
- [ ] Different durations work (5s/10s)
- [ ] Template types apply different motions
- [ ] Custom prompts work

---

## 🎯 Success Criteria

**Ready for production when:**
- ✅ 5/5 test videos generate successfully
- ✅ Average generation time < 90 seconds
- ✅ Video quality meets standards
- ✅ Cost tracking accurate
- ✅ No API errors
- ✅ Download functionality works

---

## 📊 Sample Test Results Log

```
Test 1: Basic Test
- Image: Logo (1080x1080)
- Settings: Gen-4 Turbo, 10s, horizontal
- Result: ✅ Success (67s, $0.50)
- Quality: Excellent

Test 2: Vertical Format
- Image: Same logo
- Settings: Gen-4 Turbo, 10s, vertical
- Result: ✅ Success (72s, $0.50)
- Quality: Excellent

Test 3: Short Duration
- Image: Same logo
- Settings: Gen-4 Turbo, 5s, horizontal
- Result: ✅ Success (45s, $0.25)
- Quality: Very good

Test 4: Rate Alert Motion
- Image: Rate alert graphic
- Settings: Gen-4 Turbo, 10s, horizontal, template=rateAlert
- Result: ✅ Success (69s, $0.50)
- Quality: Excellent zoom effect

Test 5: Custom Prompt
- Image: Marketing poster
- Settings: Gen-4 Turbo, 10s, vertical, custom="Slow dramatic zoom"
- Result: ✅ Success (71s, $0.50)
- Quality: Excellent dramatic effect

Total Cost: $2.25
Total Time: ~5 minutes
Success Rate: 5/5 (100%)
```

---

## 💡 Tips

### Best Practices:
1. **Test with low-res images first** (faster upload)
2. **Use 5-second duration** for initial tests (cheaper)
3. **Try horizontal first** (most forgiving)
4. **Check console log** for detailed status
5. **Download immediately** (URLs can expire)

### Image Selection:
- **Best:** Clean, branded marketing images
- **Good:** Logos, graphics, infographics
- **Avoid:** Very dark/light images, complex photos

### Cost Management:
- Each test = $0.25 or $0.50
- Budget $5-10 for comprehensive testing
- Track spending in console log

---

## 🚀 Ready to Deploy?

After successful testing:
1. ✅ All tests pass
2. ✅ Quality meets standards
3. ✅ Cost acceptable
4. **Next:** Integrate into main marketing generator

**Test page stays separate** - use anytime for:
- Testing new image types
- Validating API changes
- Training team members
- Troubleshooting issues

---

**Happy testing!** 🎬✨

**Questions?** Check the console log or main README: `RUNWAY-VIDEO-GENERATION-README.md`
