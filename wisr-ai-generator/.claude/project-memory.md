# Wisr AI Marketing Generator - Project Memory

**Project Type:** Mortgage Marketing Image Generator
**Primary File:** `nano-test.html` (7000+ lines, self-contained web app)
**Tech Stack:** Gemini 2.5 Flash Image API, Fabric.js 5.3.0, JavaScript, HTML/CSS
**Last Updated:** 2025-10-13

---

## 🎯 Project Purpose & Vision

### **The Big Picture**
Build the world's first **seamless, perfect marketing material generator** for mortgage loan officers. This tool doesn't exist in the market - no competitor offers AI-generated marketing materials with guaranteed text accuracy. We're creating something fundamentally new.

### **The User Journey**
1. **Loan Officer (LO) enters the generator**
2. **Optional:** Upload headshot photo (not required)
3. **Select from 21 curated templates** - professionally crafted prompts for:
   - Social media posts (Instagram, Facebook, LinkedIn)
   - Email marketing
   - Rate alerts
   - Market updates
   - Client testimonials
   - And 16+ more scenarios
4. **Click Initialize** - generation happens in 5 seconds
5. **Download perfect marketing material** - ready to post immediately

### **What Makes This Unique**
This tool is building something that **does not exist** for marketing:
- ✅ Completely manicured, professional prompts (no prompt engineering needed)
- ✅ AI-generated copy AND design in one seamless step
- ✅ Perfect text accuracy (the holy grail we're chasing)
- ✅ Professional quality that rivals human designers
- ✅ Instant generation for any marketing need

### **The Core Technical Challenge: 100% Text Accuracy**

**Current Status:** 90% success rate (almost there, but not good enough)

**The Problem:**
- Gemini Flash 2.5 generates **amazing marketing copy and stunning visuals**
- But there is ALWAYS at least one text spelling error per generation
- Even ONE misspelling destroys professional credibility
- 90% success rate = unusable for professional marketing

**What We've Tried (and Failed):**

1. ❌ **Text Overlay Masking** - Tried to cover errors with correct text
   - Result: Visible overlays, didn't match Gemini's styling
   - Evidence: `/mnt/c/Users/dyoun/Downloads/Screenshot 2025-10-12 044031.png`

2. ❌ **Prompt Engineering** - Adjusted prompts hundreds of ways
   - Emphasized spelling, used ALL CAPS, repeated words
   - Created 5 different strategies (standard, simplified, bullets, allCaps, minimal)
   - Learned 25+ common misspellings
   - Result: Improved from 0% to 90%, but **can't break through to 100%**
   - Key Learning: **Regardless of prompt, Gemini always makes at least one mistake**

3. ❌ **Gemini Inpainting** - Send image back to Gemini to fix errors
   - Result: Either unchanged or introduced NEW errors
   - Not reliable for corrections

**Current Solution (Active Development):**

**Vision Mode - Hybrid Approach:**
- ✅ **Let Gemini do what it's good at:** Generate stunning backgrounds and designs
- ✅ **We handle text:** Overlay 100% accurate text using Canvas/Fabric.js
- Theory: Separate the problem - Gemini creates beauty, we ensure accuracy

**Status:** Partially working, needs spatial intelligence (Priority 1 issue)

### **Goal: 100% Success Rate = Production Ready**
We need **perfect text, amazing marketing materials** - both are non-negotiable for professional use.

### **Tools & Approaches to Consider**
The agent should always be aware of:
1. **Alternative AI Models** - Could DALL-E 3, Ideogram, Imagen 3 have better text accuracy?
2. **Hybrid Approaches** - Gemini for design + programmatic text overlay
3. **Post-Processing Tools** - Better text masking/replacement techniques
4. **Prompt Engineering Tools** - Is there tooling to perfect prompts? (User question)
5. **Quality Metrics** - How do we measure and track progress toward 100%?

**The agent's job:** Find creative solutions to achieve 100% text accuracy while maintaining amazing visual quality.

---

## 🚨 Active Issues

### **PRIORITY 1: Vision Mode - Text Placement Has No Spatial Awareness**
**Status:** Identified, not fixed
**Problem:** Vision Mode overlays text chaotically without considering background layout
- Text placed at hardcoded Y positions (starts at 150px)
- Overlaps with logos, headshots, and design elements
- Vision AI recommends "bestTextAreas" but Step 3 ignores it
- No bounding box detection for existing elements

**Evidence:** `/mnt/c/Users/dyoun/Downloads/Screenshot 2025-10-13 055955.png` shows text chaos

**Root Cause:**
- `overlayTextOnBackground()` (line 4849) uses `let y = 150` and increments blindly
- Vision AI analysis (Step 2) provides typography but NO coordinates
- No integration between Vision AI recommendations and Canvas overlay logic

**Solution Needed:**
1. Enhance Vision AI prompt to return spatial coordinates and zones
2. Rewrite `overlayTextOnBackground()` to use dynamic positioning
3. Implement intelligent layout based on background analysis
4. Add fallback logic for safe text placement (avoid top 30%, center content)

**Files Affected:**
- `nano-test.html` lines 4666-4767 (Vision AI analysis)
- `nano-test.html` lines 4849-4998 (Text overlay function)

---

## ✅ Known Solutions (What Works)

### **Text Accuracy Solutions**
1. **Header-Style Text Format** - 90%+ accuracy
   - Short phrases (2-4 words)
   - "Label: Value" format (e.g., "Status: Steady")
   - Title-case styling
   - Gold gradient applied to ALL text
   - NO paragraph sentences

2. **Two-Pass Generation** - Separates concerns
   - Phase 1: Generate design only (no body text)
   - Phase 2: Add text with low temperature (0.3)
   - Phase 3: Targeted error correction if needed
   - Functions: `generateDesignOnly()` and `addTextToDesign()`

3. **Gold Gradient Styling** - Better than plain text
   - Metallic gold gradient (#B8860B → #DAA520 → #FFD700)
   - 3D effects with shadows and highlights
   - Headers and labels almost never have errors

### **Learning Agent Patterns (25+ Learned)**
Common misspellings to emphasize:
- "borrowers" (not "bombwires", "borowers")
- "remained" (not "remaned", "remanned")
- "unchanged" (not "unhanged")
- "anticipate" (not "anticpate", "Antiicpate")
- "Officer" (not "Oficer")
- "OUTLOOK" (not "OUTLOU")

Stored in: Browser localStorage under `agent_learning_memory`

---

## 🏗️ Architecture

### **Core Components**

1. **Image Generation**
   - Model: `gemini-2.5-flash-image`
   - API: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`
   - Function: `generateImage()` (line 6159)

2. **Learning Agent** (JavaScript)
   - Lines 2716-3008 in `nano-test.html`
   - Persistent memory in localStorage
   - 5 strategies: standard, simplified, bulletPoints, allCaps, minimal
   - Auto-retry with enhanced prompts (max 3 attempts)

3. **Vision Verification**
   - Model: `gemini-2.0-flash-exp`
   - Function: `verifyImageText()` (line 2716)
   - Extracts all text, compares with expected
   - Returns issues array with spelling errors

4. **Vision-Driven Typography (Experimental)**
   - Step 1: Generate background only (line 4633)
   - Step 2: Analyze with Vision AI (line 4669)
   - Step 3: Overlay text with Fabric.js (line 4849)
   - **Status:** Partially working, needs spatial intelligence

5. **Prompt Architect Agent**
   - Config: `.claude/agents/prompt-architect.md`
   - Reviews all prompts before sending to Gemini
   - Enforces brand consistency
   - Function: `reviewPrompt()` (line 5975)

### **Key Functions Reference**
```javascript
// Main generation
generateImage(message, templateName, attempt, maxAttempts, previousAnalysis)

// Vision Mode
generateWithVisionTypography(promptText, textContent)
overlayTextOnBackground(backgroundBase64, textContent, typography)

// Agent Core
verifyImageText(imageBase64)
getAgentMemory()
updateAgentLearning(memory, strategy, success, errors)
selectStrategy(attemptNumber, memory)

// Templates
buildMarketUpdatePrompt(marketData)
generateFromTemplate(template, userModifications)
```

---

## 🔒 Don't Change

### **Brand Standards**
- **Default Colors:**
  - Background: Forest green gradient (#1B4D3E to #2D5F4F)
  - Accent: Metallic gold (#B8860B, #DAA520, #FFD700)
  - Logo: Golden owl + "LENDWISE MORTGAGE" text

- **Logo Rules:**
  - MORTGAGE text 50% smaller than LENDWISE
  - MORTGAGE centered below LENDWISE
  - Transparent background (NO black)

- **Typography:**
  - All text must be "crystal clear and perfectly readable"
  - Phone numbers and NMLS must be legible
  - Instagram portrait format (1080x1350)

### **Agent Memory Key**
- localStorage key: `agent_learning_memory`
- Do NOT rename - breaks persistence across sessions

### **API Keys** (line 1072-1074)
- `API_KEY` for Gemini
- `IDEOGRAM_API_KEY` for Ideogram (unused currently)
- `OPENAI_API_KEY` for OpenAI (unused currently)

### **Working Two-Pass Generation**
- Do NOT revert to single-pass generation
- Phase 1/2/3 system is core to current accuracy improvements

---

## 📅 Recent Changes (Last 10)

### **2025-10-13 - Vision Mode Fixes**
- Fixed Fabric.js CDN: v6.0.2 (404 error) → v5.3.0 (works)
- Fixed image generation API: gemini-2.0-flash-exp → gemini-2.5-flash-image
- Added error handling for Vision AI analysis
- Added proper cleanup in `generateImageWithVisionMode()` finally block
- Fixed `displayGeneratedImage()` - replaced with `imageHistory.push()` + `updateImageGallery()`

### **2025-10-12 - Header-Style Text Formatting**
- Restructured `buildMarketUpdatePrompt()` to use label format
- Updated `addTextToDesign()` to force header-style formatting
- Discovered: Headers 90%+ accurate vs paragraphs <10%

### **2025-10-10 - Template Preview Workflow**
- Changed template selection to show synopsis (no auto-generate)
- Added "⚡ Initialize" button for explicit generation
- Added template switching before generation
- Updated UI with gold gradient theme

### **Earlier Sessions**
- Autonomous learning mode (10x batch generation)
- Text styling pattern learning (gold vs plain)
- Three-phase generation (design → text → correction)
- Gemini Vision verification integration
- 21 marketing templates created

---

## ⚠️ Technical Debt

### **Immediate**
1. **Vision Mode spatial awareness** - needs intelligent placement logic
2. **Vision AI prompt enhancement** - must return coordinates, not just fonts
3. **Template-specific text extraction** - only Economic Outlook is handled

### **Short Term**
1. Error recovery in Vision Mode is weak (just returns background on failure)
2. Fabric.js gradient API might be version-specific (test on v6+ when available)
3. No progress indicator during Vision Mode generation
4. Missing error states in UI for Vision Mode failures

### **Long Term**
1. Python marketing agent (marketing_agent.py) not integrated with web UI
2. Agent memory only in browser localStorage (no backend persistence)
3. Market data is hardcoded (no live API integration)
4. No A/B testing framework for strategies
5. Single-threaded generation (can't generate multiple images in parallel)

---

## 🧠 Agent Learnings

### **About Gemini Flash Image**
- ✅ Excellent at design, layout, composition
- ✅ Fast (2-3 seconds per generation)
- ✅ Great with multimodal inputs (logo + headshot + prompt)
- ❌ Unreliable with plain text rendering (misspellings)
- ❌ Cannot reliably edit its own images for corrections

### **About Text Accuracy**
- Header-style labels: 90%+ accuracy
- Paragraph sentences: <10% accuracy
- Gold gradient: Better than plain white
- Longer words: More errors
- Complex grammar: Fails consistently

### **About Post-Processing**
- Canvas overlay: Text styling doesn't match AI-generated aesthetics
- Gemini inpainting: Unreliable, introduces new errors
- Vision AI + Canvas: Promising but needs spatial intelligence

### **About Learning Strategies**
- Memory persistence works well across sessions
- Strategy selection based on success rate is effective
- Agent limited by model's fundamental text rendering capability
- Retry logic helps but can't overcome model limitations

---

## 📋 Next Steps (Prioritized)

### **Priority 1: Fix Vision Mode Spatial Awareness**
1. Enhance Vision AI prompt to return text placement zones with coordinates
2. Update `overlayTextOnBackground()` to parse and use spatial data
3. Implement intelligent layout engine (sections, spacing, safe zones)
4. Add template-aware text extraction for all 21 templates

### **Priority 2: Improve Error Handling**
1. Add progress indicators for Vision Mode
2. Better error messages when Vision AI fails
3. Fallback positioning logic when coordinates missing
4. User-friendly error states in UI

### **Priority 3: Template Expansion**
1. Implement text extraction for all 21 templates (currently only Economic Outlook)
2. Template-specific layout rules for Vision Mode
3. A/B test Vision Mode vs Two-Pass for each template type

### **Priority 4: Integration**
1. Connect Python marketing_agent.py to web UI (optional)
2. Backend persistence for agent memory (beyond localStorage)
3. Real-time market data API integration

---

## 🔍 Debugging Quick Reference

### **Check Agent Status**
Browser console:
```javascript
showAgentStats()  // Full dashboard
localStorage.getItem('agent_learning_memory')  // Raw memory
```

### **Check Vision Mode**
Look for console logs:
```
🎨 VISION MODE: Starting generation...
✅ STEP 1 COMPLETE: Background generated
✅ STEP 2 COMPLETE: Typography recommendations received
✅ STEP 3 COMPLETE: Final image created
```

### **Common Issues**
- "fabric is not defined" → Refresh page to load Fabric.js CDN
- "Failed to generate background" → API key or endpoint issue
- Text overlapping → Vision Mode spatial awareness problem (known issue)
- Spelling errors → Normal, agent tracks in memory

---

## 📚 Related Documentation

- **AGENT_DOCUMENTATION.md** - Comprehensive agent behavior and learnings
- **.claude/agents/prompt-architect.md** - Brand consistency rules
- **nano-test.html** - Main application code (lines 1-7000+)

---

**Memory File Created:** 2025-10-13
**Purpose:** Ensure Claude Code remembers project context, issues, and solutions across all sessions
**Usage:** Reference this file at session start to understand project state
