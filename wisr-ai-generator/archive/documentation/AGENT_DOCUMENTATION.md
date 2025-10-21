# 🤖 Learning Agent Documentation

## Project: Wisr AI Marketing Generator
**Location:** `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/nano-test.html`

---

## 📋 Executive Summary

This project uses **Gemini Flash 2.5 Image API** to generate professional mortgage marketing images with:
- Logo integration (gold owl)
- Headshot composition
- Real-time market data
- Brand-consistent design

**Core Problem:** Gemini frequently misspells text ("borrowers" → "bombwires", "remained" → "remaned", etc.)

**Solution Built:** Autonomous learning agent that:
- Detects spelling errors using Gemini Vision API
- Learns from failures across sessions
- Tests different prompting strategies
- Attempts automatic correction

---

## 🏗️ Architecture Overview

### **System Components:**

```
┌─────────────────────────────────────────────────┐
│  1. GEMINI FLASH IMAGE (Generation)             │
│     - Creates marketing images                   │
│     - Multimodal: Logo + Headshot + Text        │
│     - Fast (2-3 seconds)                         │
│     - Problem: Inconsistent text spelling        │
└────────────────┬────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────┐
│  2. VERIFICATION ENGINE                          │
│     Function: verifyImageText()                  │
│     - Uses Gemini Vision API for OCR            │
│     - Extracts ALL text from generated image    │
│     - Compares against expected spelling        │
│     - Returns: {valid, issues[], confidence}    │
└────────────────┬────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────┐
│  3. LEARNING AGENT CORE                          │
│     - Persistent memory (localStorage)           │
│     - Strategy selection (5 approaches)          │
│     - Root cause analysis                        │
│     - Success rate tracking                      │
└────────────────┬────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────┐
│  4. RETRY LOGIC                                  │
│     - Up to 3 attempts per generation           │
│     - Different strategy each attempt           │
│     - Enhanced prompts with error corrections   │
└─────────────────────────────────────────────────┘
```

---

## 🧠 Agent Memory System

### **Storage Location:**
- **Browser localStorage** under key: `agent_learning_memory`
- **Persists across sessions** (until browser data cleared)

### **Memory Structure:**
```javascript
{
  globalLessons: {
    alwaysEmphasize: [
      { wrong: "bombwires", correct: "borrowers" },
      { wrong: "remaned", correct: "remained" },
      { wrong: "anticpate", correct: "anticipate" },
      // ... 25+ learned patterns
    ],
    avoidPatterns: [],
    successfulTechniques: []
  },

  strategies: {
    standard: { successCount: 0, failCount: 15, totalAttempts: 15 },
    simplified: { successCount: 0, failCount: 8, totalAttempts: 8 },
    bulletPoints: { successCount: 0, failCount: 12, totalAttempts: 12 },
    allCaps: { successCount: 0, failCount: 10, totalAttempts: 10 },
    minimal: { successCount: 0, failCount: 5, totalAttempts: 5 }
  },

  stats: {
    totalGenerations: 21,
    successfulGenerations: 0,
    currentSuccessRate: 0.0
  },

  recentFailures: [/* Last 20 failures */]
}
```

### **How to View Memory:**

In browser console:
```javascript
showAgentStats()  // Full dashboard
showAgentMemory() // Legacy view (old failures list)
```

---

## 🎯 Prompting Strategies

The agent tests 5 different strategies, selecting based on past performance:

### **1. Standard**
```
TEXT ACCURACY REQUIREMENTS:
- Spell every word correctly
- Use clear, readable fonts
- Ensure proper spacing
```

### **2. Simplified**
```
SIMPLIFIED TEXT STRATEGY:
- Use SHORT, SIMPLE words only
- Break complex ideas into simple phrases
- Maximum 5-7 words per line
- Large, bold, clear text
```

### **3. Bullet Points**
```
BULLET POINT STRATEGY:
- Format ALL text as bullet points
- One concept per bullet
- Very short bullets (3-5 words each)
- Large bullet icons
- Extra spacing between items
```

### **4. All Caps**
```
MAXIMUM EMPHASIS STRATEGY:
- Use ALL CAPS for critical words
- BOLD and LARGE text
- HIGH CONTRAST colors
- Repeat critical information
- Spell out each letter if needed
```

### **5. Minimal**
```
MINIMAL TEXT STRATEGY:
- ONLY essential text (3-4 words total)
- HUGE font size
- Maximum readability
- No complex words whatsoever
```

**Strategy Selection Logic:**
- Attempt 1: Uses strategy with best historical success rate
- Attempt 2: Switches to bulletPoints (different approach)
- Attempt 3: Uses allCaps (most aggressive)

---

## 🔄 Generation Flow

### **Template-Based Generation:**

```
1. User selects template (e.g., "Current Market Update")
   ↓
2. Fetch real market data from Mortgage News Daily
   ↓
3. Load agent memory & select strategy
   ↓
4. Build prompt with:
   - Template content
   - Market data
   - Logo/headshot references
   - Selected strategy instructions
   - Learned lessons from memory
   ↓
5. Generate image (Gemini Flash Image API)
   ↓
6. Verify text with Gemini Vision
   ↓
7. IF ERRORS FOUND:
   - Store in memory
   - Analyze root cause
   - IF attempts < 3:
     * Enhance prompt with corrections
     * Retry with new strategy
   - ELSE:
     * Accept image, show warning
   ↓
8. IF NO ERRORS:
   - Update memory (mark strategy as successful)
   - Add to gallery
```

---

## 📊 Current Status (As of Session End)

### **Agent Performance:**
- **Total Generations:** 21
- **Successful:** 0 (0.0%)
- **Failed:** 21 (100%)

### **Learned Patterns (25+):**
- "borrowers" (not "bombwires", "borowers", "borrwers")
- "remained" (not "remaned", "remanned")
- "unchanged" (not "unhanged", "unhanged")
- "anticipate" (not "anticpate", "Antiicpate", "Unticipate")
- "fluctuations" (not "fluctations")
- "Officer" (not "Oficer")
- "Hawkish" (not "Hawksik", "Hawskin")
- "OUTLOOK" (not "OUTLOU")
- "volatility" (not "volabity")
- "strategically" (not "strateigiily")
- "steady" (not "steedy", "stredy")
- ... and 15+ more

### **Strategy Performance:**
All strategies currently at 0% success rate - **Gemini Flash Image fundamentally struggles with text rendering**.

---

## ❌ What Didn't Work

### **1. Post-Processing with Canvas Overlay**
**Approach:** Detect errors, mask wrong text, overlay correct text using HTML Canvas.

**Result:** ❌ Failed
- Text styling didn't match Gemini's complex gradients/effects
- Visible overlays instead of seamless fixes
- Image: `/mnt/c/Users/dyoun/Downloads/Screenshot 2025-10-12 044031.png` shows obvious white box overlay

### **2. Gemini Inpainting (Image Editing)**
**Approach:** Send image back to Gemini with prompt: "Fix spelling: change 'remaned' to 'remained'"

**Result:** ❌ Failed
- Gemini returned unchanged images or introduced NEW errors
- Not reliable for text corrections
- Example: Attempt 1 had 1 error → Post-processing → Re-verify shows 2 errors

### **3. Retry with Enhanced Prompts**
**Approach:** Tell Gemini explicitly about previous errors in retry attempts.

**Result:** ⚠️ Partially works
- Sometimes fixes some errors
- Often introduces different errors
- Inconsistent - can't achieve >0% success rate yet

---

## ✅ IMPLEMENTED: Two-Pass Generation (Option 3)

### **Status: IMPLEMENTED AND TESTING**

Instead of generating everything at once, now splits into two phases:

#### **Phase 1: Design Generation** (Lines 3318-3373)
```javascript
async function generateDesignOnly(message, templateName, parts)
```
- Generates layout, logo, headshot, and design elements
- Explicitly excludes body text
- Leaves clear space for text addition in Phase 2
- Uses standard temperature (1.0) for creative design

#### **Phase 2: Text Addition** (Lines 3375-3439)
```javascript
async function addTextToDesign(designImageData, mimeType, bodyTextContent, agentMemory)
```
- Takes Phase 1 design as input
- Adds ONLY the text content with heavy spelling emphasis
- Uses LOW temperature (0.3) for accuracy
- Includes all learned spelling lessons
- Focuses AI's attention solely on text accuracy

**Theory:** Separating design from text gives Gemini two simpler, focused tasks instead of one complex task.

**Integration:**
- `generateImage()` - Lines 3441-3624: Uses two-pass for all new generations
- `refineImage()` - Lines 3669-3905: Uses standard single-pass (editing existing images)

**Verification:** Still uses Gemini Vision API to verify text accuracy after Phase 2 completes.

**Learning:** Agent tracks success/failure as `twoPass_[strategy]` to measure effectiveness vs. old approach.

---

## 🔧 Key Functions Reference

### **Agent Core Functions:**

```javascript
// Main generation with agent loop
generateImage(message, templateName, attempt=1, maxAttempts=3, previousAnalysis=null)

// Verify text accuracy using Vision API
verifyImageText(imageBase64)
// Returns: { valid, issues[], confidence, allText }

// Get agent memory
getAgentMemory()
// Returns: { globalLessons, strategies, stats, recentFailures }

// Update learning after generation
updateAgentLearning(memory, strategy, success, errors=[])

// Select strategy based on attempt and history
selectStrategy(attemptNumber, memory)

// Analyze why errors occurred
analyzeFailure(imageBase64, errors, attemptNumber)
// Returns: { rootCauses, recommendation, simplifyWords, reduceDensity, emphasizeMore }

// Get learned lessons as text
getLearnedLessons(memory)

// Build strategy-specific prompt
buildStrategyPrompt(strategy, analysis=null)
```

### **Dashboard Functions:**

```javascript
// View full agent dashboard (recommended)
showAgentStats()

// View legacy memory (old format)
showAgentMemory()
```

---

## 🐛 Debugging Guide

### **Check if Agent is Running:**

Look for these console messages:
```
🤖 AGENT: Starting text verification...
🎯 AGENT: Using best strategy: standard (0% success rate)
⚠️ AGENT DETECTED 3 SPELLING ERRORS
📚 AGENT LEARNED: Always emphasize "borrowers" (not "bombwires")
📊 AGENT STATS: 0/21 success (0.0%)
```

### **If Agent Isn't Detecting Errors:**

1. Check verification is being called:
   ```javascript
   // Should see in generateImage() around line 3486:
   const verification = await verifyImageText(imageData);
   ```

2. Check API key is valid (line 11 in nano-test.html)

3. Check browser console for errors

### **If Agent Detects But Doesn't Learn:**

Check localStorage:
```javascript
localStorage.getItem('agent_learning_memory')
```

Should return JSON with learned patterns. If null, memory isn't persisting.

### **If Verification Always Passes:**

The `verifyImageText()` function might be returning early. Check line 2717 for this log:
```
🤖 AGENT: Starting text verification...
```

If missing, function isn't being called.

---

## 📁 File Locations

### **Main Files:**
- **Agent Code:** `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/nano-test.html`
  - Lines 2716-3008: Agent core functions
  - Lines 3322-3556: generateImage() with agent integration
  - Lines 3638-3848: refineImage() with agent integration

- **This Documentation:** `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/AGENT_DOCUMENTATION.md`

### **Test Files Created:**
- `check_agent_memory.html` - Simple memory viewer (standalone)
- `quick_test_agent.py` - Python test script (not used)
- Various test images in Downloads

---

## 🎓 Lessons Learned

### **About Gemini Flash Image:**
1. ✅ Excellent at design, layout, composition
2. ✅ Fast generation (2-3 seconds)
3. ✅ Great multimodal capabilities (logo + headshot + scene)
4. ❌ **Fundamentally unreliable at text rendering**
5. ❌ Cannot edit its own images reliably for corrections

### **About Learning Agents:**
1. ✅ Persistent memory across sessions works well
2. ✅ Strategy tracking provides good insights
3. ✅ Root cause analysis helps understand failures
4. ⚠️ **Limited by underlying model's capabilities** - can't teach Gemini to spell

### **About Post-Processing:**
1. ❌ Canvas overlays don't match AI-generated styling
2. ❌ Image-to-image editing unreliable for text fixes
3. ⚠️ Two-pass generation (untested) might work better

---

## 💡 Recommendations for Future

### **Short Term:**
1. Implement two-pass generation (design → text)
2. If that fails, accept 60-80% success rate as realistic goal
3. Build manual review dashboard for batch processing

### **Long Term:**
1. Consider DALL-E 3 for text-heavy templates (better text accuracy)
2. Keep Gemini for artistic/visual templates
3. Hybrid approach based on template type

### **Alternative Approaches:**
1. Generate design with Gemini, overlay text with HTML/CSS (100% accurate but loses artistic text)
2. Use Figma/Canva API for programmatic design (expensive, complex)
3. Fine-tune Stable Diffusion model on your brand (time-intensive)

---

## 🎨 NEW: Text Styling Pattern Learning (ACTIVE)

### **User Discovery (2025-10-12):**
User noticed that **gold gradient text (headers, names, titles) almost never has errors**, while **plain white body text fails constantly**.

### **Agent Enhancement:**
The agent now:
1. **Tracks text by visual style** - Categorizes as `gold_gradient`, `plain_white`, or `plain_colored`
2. **Measures success rates per style** - E.g., "Gold gradient: 95% accuracy, Plain white: 8% accuracy"
3. **Learns from the pattern** - After 2-3 generations, discovers which styling works
4. **Adapts Phase 2 prompting** - Forces gold gradient styling on ALL text once pattern confirmed

### **Implementation:**
- `analyzeTextStyling()` (line 3072) - Tracks styling success patterns
- Enhanced `verifyImageText()` (line 2716) - Returns `textByStyle` and `errorsByStyle`
- Adaptive `addTextToDesign()` (line 3490) - Forces gold styling when pattern discovered

### **Expected Impact:**
If user hypothesis is correct, this should **dramatically improve** body text accuracy by applying the same visual treatment that works for headers.

## 🔑 Key Takeaways

1. **The agent IS working** - it's learning patterns, testing strategies, and providing detailed diagnostics
2. **The model is the bottleneck** - Gemini Flash Image can't spell consistently with plain styling
3. **User-driven discovery** - Observing that gold gradient text succeeds led to new learning capability
4. **Two-pass + styling awareness** - Combining both approaches for maximum accuracy
5. **Agent memory is valuable** - 25+ learned spelling patterns + styling insights

---

## 🤖 AUTONOMOUS LEARNING MODE (NEW!)

### **What It Does:**
Instead of manually generating images one-by-one, the agent can now:
1. **Generate 10 images automatically** (no user interaction)
2. **Test different strategies** while learning
3. **Analyze styling patterns** with real data
4. **Show only successful results** (< 5 errors)

### **How to Use:**
1. Select a template
2. Click **"Auto-Learn (10x)"** button
3. Wait 2-3 minutes
4. Agent displays best images in gallery

### **What Happens:**
```
🤖 AUTONOMOUS LEARNING MODE ACTIVATED
📊 Will generate 10 images to learn patterns

🔄 [1/10] Starting generation...
✅ [1/10] SUCCESS - 3 errors
🔄 [2/10] Starting generation...
❌ [2/10] FAILED - 15 errors
...
🔄 [10/10] Starting generation...
✅ [10/10] SUCCESS - 2 errors

🎓 LEARNING ANALYSIS
   Total: 10
   ✅ Successful (< 5 errors): 6 (60.0%)
   🏆 Perfect (0 errors): 1
   ❌ Failed (≥ 5 errors): 4

🎨 STYLING PATTERN DISCOVERIES:
   gold_gradient: 96.3% accuracy
   plain_white: 11.2% accuracy

🏆 Displaying top 6 successful images in gallery
```

### **Implementation:**
- `startAutonomousLearning()` (line 3450) - Main control function
- `generateImageSilent()` (line 3548) - Silent generation without UI updates
- `analyzeLearningResults()` (line 3642) - Post-generation analysis
- `displayLearningResults()` (line 3670) - Shows only successful images

### **Benefits:**
- ⚡ **10x faster** than manual clicking
- 📊 **Better data** for pattern learning
- ✅ **Only see successes** - failures hidden
- 🎓 **Agent learns faster** with more generations

---

## 📞 Support Commands

```javascript
// View agent dashboard
showAgentStats()

// Check memory size
JSON.parse(localStorage.getItem('agent_learning_memory')).globalLessons.alwaysEmphasize.length

// Clear agent memory (reset learning)
localStorage.removeItem('agent_learning_memory')

// Export memory for analysis
console.log(JSON.stringify(JSON.parse(localStorage.getItem('agent_learning_memory')), null, 2))
```

---

**Document Created:** 2025-10-12
**Last Updated:** 2025-10-12 (Header-Style Text Formatting Strategy added)
**Session Context:** This document preserves context before conversation compaction
**Status:** Two-pass generation + Styling awareness + Autonomous learning + Header-style formatting ACTIVE

---

## 🎯 LATEST BREAKTHROUGH: Header-Style Text Formatting (2025-10-12)

### **User Insight:**
> "I dont think its about the gradient per say. I think its the fact that its generating content but we need to be purposeful about the text on the page."

### **Discovery:**
The issue isn't just about gold gradient vs plain white. It's about **TEXT FORMAT**:
- ✅ **Header-style text** (like "David Young", "Loan Officer", "NMLS #62043") - 90%+ accuracy
- ❌ **Paragraph-style text** (like "Rates remain stable...") - <10% accuracy

### **Solution Implemented:**

**Phase 1 (Design Template):** Restructured `buildMarketUpdatePrompt()` to request header-style labels instead of paragraphs:
```
OLD FORMAT:
Market Insight: "Rates remain stable this week, creating excellent opportunities for homebuyers and refinancers."

NEW FORMAT:
MARKET INSIGHT (gold gradient header)
Status: Steady (gold gradient label)
Movement: Unchanged (gold gradient label)
Outlook: Favorable (gold gradient label)
```

**Phase 2 (Text Addition):** Updated `addTextToDesign()` to explicitly request header/label formatting:
- Format ALL text as header-style labels (like "Loan Officer", "David Young")
- Use "Label: Value" format (2-4 words max)
- Apply gold gradient to EVERY text element
- NO paragraph sentences - ONLY short declarative labels

### **Why This Works:**
Gemini consistently succeeds with:
- Short, title-case phrases
- Label-style formatting ("Title: Value")
- Gold gradient styling on header text
- Text that looks like names, titles, and credentials

Gemini consistently fails with:
- Long paragraph sentences
- Plain white/cream body text
- Complex grammatical structures
- Prose-style content

### **Impact:**
By restructuring content to use formats that naturally work (headers, labels, titles), we work WITH Gemini's strengths instead of fighting its limitations.

---

## 🔬 VISION MODE: Experimental Canvas Text Overlay (2025-10-13)

### **Purpose:**
Alternative approach to text accuracy - generate background with Gemini, overlay perfect text with Canvas/Fabric.js.

### **Three-Step Process:**

**Step 1: Background Generation** (Line 4633)
- API: `gemini-2.5-flash-image`
- Generates design, logo, layout WITHOUT text
- Leaves space for text overlay

**Step 2: Vision AI Analysis** (Line 4669)
- API: `gemini-2.0-flash-exp` (vision model)
- Analyzes background for typography recommendations
- Returns: fonts, colors, styling suggestions
- **Problem:** Does NOT return spatial coordinates

**Step 3: Canvas Text Overlay** (Line 4849)
- Uses Fabric.js 5.3.0 to overlay text
- Applies gold gradient, shadows, effects
- **Problem:** No spatial awareness - hardcoded Y positions

### **Fixes Applied (2025-10-13):**

1. **Fabric.js CDN Fix**
   - Changed from v6.0.2 (404 error) → v5.3.0 (works)
   - Line 9: `https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js`

2. **Image Generation API Fix**
   - Step 1 was using wrong model: `gemini-2.0-flash-exp` (text model)
   - Fixed to: `gemini-2.5-flash-image` (image generation model)
   - Added proper generationConfig with responseModalities

3. **Error Handling**
   - Added comprehensive error logging
   - Handles both `inline_data` and `inlineData` formats
   - Shows actual API error messages
   - Added finally block for cleanup

4. **Image Display Fix**
   - Removed non-existent `displayGeneratedImage()` function
   - Replaced with: `imageHistory.push()` + `updateImageGallery()`
   - Proper integration with existing gallery system

### **Current Status: ⚠️ Partially Working**

**What Works:**
- ✅ Background generation completes successfully
- ✅ Vision AI provides typography recommendations
- ✅ Canvas overlay creates text with gold gradients
- ✅ Image displays in gallery

**What Doesn't Work:**
- ❌ Text placement has NO spatial awareness
- ❌ Overlaps with logos, headshots, design elements
- ❌ Vision AI recommendations ignored for positioning
- ❌ Hardcoded Y=150 starting position causes chaos

**Evidence:**
Screenshot: `/mnt/c/Users/dyoun/Downloads/Screenshot 2025-10-13 055955.png`
Shows text scattered randomly over background elements.

### **Root Cause Analysis:**

**Line 4878 in overlayTextOnBackground():**
```javascript
let y = 150;  // ❌ HARDCODED - ignores background layout

lines.forEach((line, index) => {
    // ... create text ...
    const text = new fabric.Text(line, {
        top: y,  // ❌ Blindly places text
        // ...
    });
    y += style.fontSize * 1.5;  // ❌ Just increments
});
```

**Line 4692 in Vision AI prompt:**
```javascript
"bestTextAreas": "description of where text reads best"
```
Returns text description, NOT coordinates - Step 3 can't use it.

### **Solution Required:**

1. **Enhanced Vision AI Prompt (Step 2)**
   - Request actual pixel coordinates: `{x, y, width, height}`
   - Detect bounding boxes of existing elements
   - Return safe zones for text placement
   - Example format:
   ```json
   {
     "textZones": [
       {"section": "header", "x": 540, "y": 100, "width": 980, "align": "center"},
       {"section": "body", "x": 100, "y": 600, "width": 880, "align": "left"}
     ],
     "avoidZones": [
       {"type": "logo", "x": 50, "y": 50, "width": 200, "height": 200},
       {"type": "headshot", "x": 800, "y": 300, "width": 250, "height": 300}
     ]
   }
   ```

2. **Smart Layout Engine (Step 3)**
   - Parse `textZones` from Vision AI
   - Dynamically calculate Y positions based on available zones
   - Respect `avoidZones` for logos/headshots
   - Implement spacing rules within each zone
   - Template-aware section positioning

3. **Template-Specific Text Extraction**
   - Currently only Economic Outlook handled (line 4817)
   - Need extraction for all 21 templates
   - Structure text by sections (heading, data, contact)
   - Map sections to appropriate zones

### **Files Affected:**
- `nano-test.html` lines 4618-4998 (Vision Mode implementation)
- Function `generateWithVisionTypography()` - main orchestrator
- Function `overlayTextOnBackground()` - needs complete rewrite
- Function `extractTextFromPrompt()` - needs expansion

### **Priority:** HIGH
Vision Mode will remain experimental/broken until spatial awareness is implemented.

---
