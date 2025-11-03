# 🎯 Nano-Optimized Veo 3.1 Testing Guide

## Overview

This guide helps you test the **4 Nano-inspired prompting strategies** designed to achieve 100% text accuracy with Veo 3.1, just like your Nano marketing generator.

## 🎬 Live Testing Interface

**Your testing interface is now running at:**
```
http://localhost:3000
```

The interface now includes a dedicated **"Nano-Inspired Optimized Prompts"** section with 4 strategies.

---

## 🧪 The 4 Strategies

### ⭐ **Strategy 1: Container-Based** (RECOMMENDED START)
**Why this first?** Most similar to Nano's proven success method

**What it does:**
- Organizes content into 3 distinct visual containers
- Specifies exact word counts per section
- Provides letter-by-letter spelling verification
- Uses structured layout just like Nano

**Best for:** Complex multi-element videos with headers, main content, and footers

**Example output:** "LENDWISE MORTGAGE" (top) + "RATES DROPPED 6.25%" (center) + "30-Year Fixed Rate Lock Today" (bottom)

---

### 🔁 **Strategy 2: Repetitive Reinforcement** (IF STRATEGY 1 FAILS)
**What it does:**
- Lists each text element multiple times
- Provides spell check, letter count, word count for each
- Uses verification bars (word | word | word)
- Repeats critical instructions

**Best for:** When you need absolute certainty on 3-4 key text elements

**Example:** Each text element gets verified 4 different ways before AI generates

---

### 📝 **Strategy 3: Word-by-Word Specification**
**What it does:**
- Breaks down EVERY word into individual specifications
- Shows character count and letter-by-letter breakdown per word
- Provides verification of total character count
- Cross-references each word individually

**Best for:** Single phrases where every word must be perfect

**Example:** "30-Year Fixed Rate" gets broken into:
- Word 1: "30-Year" (7 chars: 3-0-dash-Y-e-a-r)
- Word 2: "Fixed" (5 letters: F-I-X-E-D)
- etc.

---

### 🔬 **Strategy 4: Ultra-Explicit** (LAST RESORT)
**What it does:**
- Most verbose, letter-by-letter for every word
- Special emphasis on problem words (like "Fixed")
- Explicit checks (e.g., "I before X, E before D")
- Maximum detail, maximum prompt length

**Best for:** When all other strategies fail

**Warning:** Uses most of your 1000-character prompt limit

---

## 💰 Testing Budget (195 Credits Remaining)

### Recommended Testing Plan

**Option A: Conservative Testing (Recommended)**
Test the Container-Based strategy only:
- 1x veo3.1_fast @ 8s = 160 credits ($1.60)
- **Remaining:** 35 credits

**Option B: Two-Strategy Comparison**
Test both top strategies:
1. Container-Based: veo3.1_fast @ 4s = 80 credits ($0.80)
2. Repetitive: veo3.1_fast @ 4s = 80 credits ($0.80)
- **Remaining:** 35 credits

**Option C: Quality vs Speed Test**
Compare models with best strategy:
1. Container-Based: veo3.1 @ 4s = 160 credits ($1.60)
2. Container-Based: veo3.1_fast @ 4s = 80 credits ($0.80)
- **Remaining:** -45 credits ❌ (NOT ENOUGH)

### If You Want More Testing
**Add $25 in credits** (2,500 credits) to run comprehensive 8-video test suite:
- All 4 strategies
- Both model qualities
- Multiple durations

---

## 📋 Step-by-Step Testing Process

### Step 1: Open the Interface
```bash
# Server should already be running
# Open in browser: http://localhost:3000
```

### Step 2: Configure Your Test
1. **Select Model:**
   - `veo3.1_fast` for initial tests (half price)
   - `veo3.1` only after confirming strategy works

2. **Select Aspect Ratio:**
   - `1080:1920` for Instagram Reels/TikTok (most common)

3. **Select Duration:**
   - `4s` to conserve credits
   - `8s` if you want longer video

### Step 3: Load Optimized Prompt
1. Click **"⭐ Container-Based"** button (the gold-highlighted one)
2. Review the prompt in the text area
3. Note the character count (should be well under 1000)

### Step 4: Generate
1. Check the **Estimated Cost** display
2. Click **"🎬 Generate Video"**
3. Wait 30-60 seconds for generation
4. Video will appear in right panel when ready

### Step 5: Verify Text Accuracy

**Manual Check:**
- Pause video at key frames
- Look for: "30-Year **Fixed**" (not "Firted" or other misspellings)
- Check: "LENDWISE MORTGAGE" (correct spelling)
- Verify: "6.25%" (correct formatting)

**OCR Verification (Optional):**
```bash
# Download video from interface
# Take screenshot of key frame
node test-ocr.js /path/to/screenshot.png
```

### Step 6: Record Results
Create a simple log:
```
Strategy: Container-Based
Model: veo3.1_fast
Duration: 4s
Cost: $0.80 (80 credits)

Text Accuracy:
✅ "LENDWISE MORTGAGE" - Perfect
❌ "30-Year Firted" - Still wrong (or ✅ if fixed!)
✅ "6.25%" - Perfect

Visual Quality: [Your notes]
Animation: [Your notes]

Recommendation: [Try next strategy? Use this in production?]
```

---

## 🎯 Success Criteria

### Perfect Success ✅
- ALL text spelled exactly as intended
- Professional animation quality
- Gold metallic text styling achieved
- Camera movement smooth
- Visual effects present (particles, glow, etc.)

**Decision:** Use this prompt strategy in production

### Partial Success ⚠️
- Most text correct, 1-2 minor issues
- Animation quality good
- Styling mostly there

**Decision:** Try next more explicit strategy

### Failure ❌
- Major spelling errors persist
- Animation poor quality
- Missing key visual elements

**Decision:** Try more explicit strategy OR add credits and try veo3.1 full quality

---

## 🔄 What to Do Based on Results

### Scenario 1: Container-Based Works! 🎉
**Next Steps:**
1. Test veo3.1 full quality vs veo3.1_fast with same prompt
2. Compare visual quality difference
3. Decide which to use for production
4. Integrate winning strategy into WISR AI generator

### Scenario 2: Container-Based Fails 😞
**Next Steps:**
1. Try **Repetitive Reinforcement** strategy
2. If that fails, try **Word-by-Word**
3. Last resort: **Ultra-Explicit**
4. If all fail: Consider adding $25 in credits for more comprehensive testing

### Scenario 3: Out of Credits 💸
**Options:**
1. **Add $25** → Get 2,500 credits → Run full 8-video test suite
2. **Add $10** → Get 1,000 credits → Test 2-3 more strategies
3. **Wait** → Analyze results from current tests, decide if Veo is worth investing more

---

## 📊 Expected Outcomes

### If Nano Principles Apply to Veo
We expect **Container-Based** or **Repetitive Reinforcement** to work, giving us:
- 100% text accuracy (just like Nano)
- Professional animated gold metallic text
- Smooth camera movements
- Particle effects and depth

### If Veo Has Different Constraints
We may need:
- More explicit strategies (Word-by-Word or Ultra-Explicit)
- Different prompting approach entirely
- Hybrid solution (Veo for animation, post-processing for text accuracy)

---

## 🚀 Production Integration (If Successful)

Once you find a working strategy:

1. **Update runway-prompts.js:**
   ```javascript
   export const optimizedRateAlert = `
   [Your winning prompt strategy]
   `;
   ```

2. **Modify gemini-client.js:**
   - Remove text accuracy problems from prompt engineering
   - Use proven Nano-inspired template

3. **Update quality-backend.js:**
   - Add prompt validation
   - Ensure all generated prompts follow winning pattern

4. **Test in production:**
   - Generate 5-10 videos with real mortgage data
   - Verify consistency
   - Deploy to client demos

---

## 💡 Key Insights from Nano Success

**What made Nano work:**
1. ✅ Extreme specificity (spell out everything)
2. ✅ Structured containers (organize visually)
3. ✅ Word counts (verification mechanism)
4. ✅ Repetition (reinforce critical instructions)
5. ✅ Systematic testing (try different approaches)

**Applying to Veo:**
- Nano uses Chrome built-in AI (optimized for text)
- Veo uses Google's video model (optimized for motion)
- **Key question:** Can Veo's text rendering match Nano's with right prompting?

**Your belief:** YES, with right prompting strategy! 🎯

---

## 🆘 Troubleshooting

### Video Generation Fails
- Check server is running: Should see "Server running at http://localhost:3000"
- Check credits: You have 195 remaining (as of last check)
- Check API key: Should be set in veo-test-server.js

### Text Still Wrong After All Strategies
- Consider that Veo may have inherent text rendering limitations
- Explore hybrid approaches:
  - Generate video with Veo (animation, motion)
  - Add text overlay in post-processing (guaranteed accuracy)
- Contact Runway support about text accuracy best practices

### Running Low on Credits Mid-Test
- Stop testing immediately
- Analyze results from completed tests
- Decide if pattern is emerging
- Add credits only if you see progress

---

## 📞 Need Help?

**Server not responding:**
```bash
# Check if server is running
ps aux | grep veo-test-server

# Restart if needed
cd "/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator"
export RUNWAYML_API_SECRET="your_key_here"
node veo-test-server.js
```

**Want to check credits programmatically:**
```bash
node check-credits.js
```

**Need to test OCR:**
```bash
node test-ocr.js /path/to/image.png
```

---

## 🎬 Ready to Test!

**Current Status:**
- ✅ Server running at http://localhost:3000
- ✅ 4 optimized prompts loaded
- ✅ 195 credits available
- ✅ OCR verification ready
- ✅ Cost estimation working

**Next Action:**
1. Open http://localhost:3000
2. Click **"⭐ Container-Based"** (gold button)
3. Select **veo3.1_fast** model
4. Select **4 seconds** duration
5. Click **"🎬 Generate Video"**
6. Wait for magic! ✨

---

**Good luck! You're testing cutting-edge AI video generation with proven text accuracy strategies.** 🚀
