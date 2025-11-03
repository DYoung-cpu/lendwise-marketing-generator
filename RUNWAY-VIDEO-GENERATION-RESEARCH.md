# Runway Video Generation Research - Complete Findings

**Date:** October 27, 2025
**Status:** IMPLEMENTATION COMPLETE - Testing Phase
**User Request:** "I don't want to go through this again" - All findings must be permanently stored

---

## Executive Summary

Runway provides unified API access to multiple AI video generation models. Critical discovery: Google Veo 3/3.1 (available through Runway) has superior text and typography handling compared to Runway Gen-4 Turbo, making it potentially ideal for LendWise mortgage marketing where accurate rate numbers and branding are essential.

**Current Status:**
- ✅ Implementation complete (Gen-4 Turbo working)
- ⚠️ Quality insufficient for text-heavy content (Gen-4 only does camera motion)
- 🎯 Next step: Test Google Veo 3.1 through Runway API

---

## Platform: Runway ML

### Overview
- **Website:** https://runwayml.com
- **Type:** Unified API aggregator for multiple AI video providers
- **Purpose:** Image-to-video generation for marketing content

### Available Models Through Runway API

| Model | Provider | Best For | Cost |
|-------|----------|----------|------|
| gen4_turbo | Runway | Fast camera motion, general animation | $0.50 per 10s video |
| gen4_aleph | Runway | Higher quality, slower | Unknown |
| gen3_turbo | Runway | Previous generation | Unknown |
| google/veo 3 | Google | **TEXT ANIMATION** - Superior typography handling | Unknown (TEST NEEDED) |
| google/veo 3.1 | Google | **TEXT ANIMATION** - Latest, best text handling | Unknown (TEST NEEDED) |
| google/gemini 2.5 flash | Google | Fast generation | Unknown |

### Critical Credit System Discovery

Runway has **TWO COMPLETELY SEPARATE** credit systems:

#### Browser Credits (Unlimited Plan)
- **Cost:** $95/month
- **Access:** Web interface only (runwayml.com)
- **API Access:** ❌ NONE - Cannot be used with API
- **Purpose:** Manual video generation through website

#### API Credits (Pay-as-you-go)
- **Cost:** $0.01 per credit
- **Access:** API automation only
- **Purchase:** Separate from Unlimited plan
- **Required For:** Any automated video generation

**IMPORTANT:** User spent 2+ hours troubleshooting "not enough credits" error before Runway support explained these are separate systems. The $95 Unlimited plan does NOT include API access.

---

## Model Comparison

### Runway Gen-4 Turbo
**Status:** ✅ Tested and working

**Capabilities:**
- Fast generation (5-10 seconds)
- Camera motion only (zoom, pan, dolly)
- Background effects (sparkles, lighting)
- Depth of field, lens flares

**Limitations:**
- ❌ Cannot animate text accurately
- ❌ Text must remain completely static
- ❌ Only camera moves around static text
- ❌ Insufficient for mortgage marketing with rate numbers

**Pricing:**
- 5 credits per second = $0.05/second
- 10-second video = $0.50
- 45 videos/month = $22.50/month

**User Feedback:** "this animation is nothing special, no need to pay for it"

### Google Veo 3 (via Runway)
**Status:** ⏳ NOT YET TESTED - High Priority

**Capabilities (from research):**
- ✅ Excellent text and typography handling
- ✅ Text stays sharp and readable with complex backgrounds
- ✅ Can create complex typography transitions
- ✅ Can animate company logos
- ✅ 72% preference rate vs Sora (23%) for prompt fulfillment
- ✅ Automatically generates audio/voiceover with video
- ✅ Described as "top tier brand building tool"

**User Confirmation:**
User stated: "I have generated text that looks great with veo 3"

**Pricing:**
- Unknown through Runway API (NEEDS TESTING)
- User currently pays $250/month for direct Veo subscription

**Critical Question:**
Can Veo 3.1 through Runway API replace the $250/month direct Veo subscription?

---

## Current User Status

### Active Subscriptions
- **Direct Veo Subscription:** $250/month (handles text well)
- **Runway API Credits:** Loaded and active
- **API Key:** key_956c0c00d20ac25f7c760934600ff1e2d046c8fa4cf60e71477ad23afce1ab15bda2af797f668d0a611385502629aae91161103606f2215c48d9207c1716d376

### Implementation Completed

#### Files Created/Modified

**1. runway-service.js**
- Core Runway API integration
- Lazy initialization pattern (fixes env var loading)
- Functions: generateVideo(), estimateCost(), pollTaskCompletion()
- Location: `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/runway-service.js`

**2. runway-prompts.js**
- Template-specific motion prompts
- Optimized for text preservation ("camera motion only - text stays static")
- Functions: buildRunwayPrompt(), getVideoSettings(), getPromptTypeFromTemplateId()
- Location: `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/runway-prompts.js`

**3. quality-backend.js**
- Added POST /api/generate-video endpoint
- Integrated runway-service and runway-prompts
- Added dotenv import for API key loading
- Location: `/mnt/c/Users/dyoun/Active Projects/quality-backend.js`

**4. video-test.html**
- Standalone test interface
- Automatic image compression (handles 413 errors)
- Template selection, model options
- Location: `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/video-test.html`

**5. .env**
- Updated with Runway API key
- Location: `/mnt/c/Users/dyoun/Active Projects/.env`

**6. VIDEO-TEST-INSTRUCTIONS.md**
- Complete testing guide
- Location: `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/VIDEO-TEST-INSTRUCTIONS.md`

---

## Technical Issues Encountered and Resolved

### Issue 1: Environment Variable Loading
**Error:** "RUNWAYML_API_SECRET environment variable is missing"
**Cause:** Runway client initialized before dotenv.config() executed
**Fix:** Implemented lazy initialization pattern in runway-service.js

### Issue 2: Credit System Confusion
**Error:** "You do not have enough credits" despite Unlimited plan
**Cause:** Unlimited plan ($95/month) is browser-only, separate from API credits
**Fix:** User purchased separate API credits ($0.01/credit)
**Time Lost:** 2+ hours of troubleshooting

### Issue 3: Image Size Limits
**Error:** "413 Request Entity Too Large"
**Cause:** 1.3MB image became ~1.7MB when base64-encoded
**Fix:** Automatic image compression in video-test.html (resize to 1280x1280, JPEG 85%)

### Issue 4: Incorrect AI Video Capabilities Assessment
**Initial Statement:** "ALL AI video models can't animate text accurately"
**User Correction:** "you are incorrect" - showed Runway dashboard with Veo 3 access
**Research Correction:** Veo 3 IS excellent at text handling (animate text, logos, typography)
**Lesson:** Don't make blanket statements about AI capabilities without thorough research

---

## Cost Analysis

### Current Spending
- **Direct Veo:** $250/month
- **Potential Runway Gen-4:** $22.50/month (45 videos)
- **Potential Runway Veo 3.1:** Unknown (needs testing)

### Savings Opportunity
If Veo 3.1 through Runway matches quality of direct Veo subscription:
- Potential savings: $227.50/month ($2,730/year)
- OR: More videos for same budget
- OR: Mix of models (Gen-4 for simple, Veo 3.1 for text-heavy)

---

## Next Steps (Priority Order)

### 1. Test Google Veo 3.1 Model - HIGH PRIORITY
**Action:** Modify runway-service.js to support google/veo 3.1 model selection

```javascript
// Change model from 'gen4_turbo' to 'google/veo 3.1'
const task = await getClient().imageToVideo.create({
  model: 'google/veo 3.1',
  promptImage: imageUrl,
  promptText: promptText,
  // Determine Veo-specific options
});
```

**Test Criteria:**
- Generate same marketing image with both Gen-4 and Veo 3.1
- Compare text quality (sharpness, accuracy)
- Compare animation quality (is text animated or just camera motion?)
- Measure actual cost per video
- Determine if quality matches $250/month subscription

### 2. Cost Comparison Spreadsheet
- Gen-4 Turbo: $22.50/month (45 videos)
- Veo 3.1: TBD per video
- Current Veo direct: $250/month
- Make decision based on quality + cost

### 3. Integration Decision
Based on test results:
- **Option A:** Use Veo 3.1 exclusively (if quality matches + cost is lower)
- **Option B:** Mix Gen-4 (simple animations) + Veo 3.1 (text-heavy)
- **Option C:** Keep direct Veo subscription (if Runway version insufficient)

### 4. Test ElevenLabs TTS (Future)
Runway also provides access to ElevenLabs:
- Text-to-speech
- Voice isolation
- Sound effects
Could add voiceovers to marketing videos

---

## Strategic Insights for LendWise

### Business Impact
**Current Problem:** Static mortgage rate alerts lack engagement
**Solution:** Animated video alerts with accurate rate numbers and branding

**Competitive Advantage:**
- Other lenders use static images or generic stock video
- LendWise can send personalized, branded, animated rate alerts
- Higher engagement = more loan applications

### ROI Calculation
If Veo 3.1 through Runway works:
- **Investment:** $22.50-$250/month (depending on model/volume)
- **Return:** Higher engagement on rate alerts → more applications → more closed loans
- **Savings:** Up to $2,730/year if Runway Veo replaces direct subscription

### Use Cases for LendWise
1. **Daily Rate Alerts** - Animated rate drops with LENDWISE branding
2. **Market Updates** - Video commentary on mortgage trends
3. **Client Education** - Animated explainer videos
4. **Social Media** - Eye-catching video posts
5. **Email Campaigns** - Embedded video previews

---

## Knowledge Graph Entities (For Memory MCP)

When transferring to knowledge graph, create these entities:

### Companies
1. **Runway ML**
   - Type: AI Video Platform
   - Observations: Unified API for multiple providers, two separate credit systems, connects to Google Veo

2. **Google (Veo Division)**
   - Type: AI Provider
   - Observations: Veo 3/3.1 excellent for text animation, 72% preference rate

### Tools/Services
1. **Runway Gen-4 Turbo**
   - Type: AI Video Model
   - Observations: $0.50 per 10s video, camera motion only, insufficient for text animation

2. **Google Veo 3.1**
   - Type: AI Video Model
   - Observations: Superior text handling, can animate logos, pricing TBD through Runway

3. **Runway API Credits**
   - Type: Pricing Model
   - Observations: $0.01/credit, separate from browser credits, required for automation

### Projects
1. **WISR AI Marketing Generator**
   - Type: LendWise Project
   - Observations: Video generation feature added, needs text-accurate models

### Relations
- Runway ML → provides access to → Google Veo 3.1
- Google Veo 3.1 → better than → Runway Gen-4 Turbo (for text)
- WISR AI Marketing Generator → uses → Runway API
- LendWise → needs → Text-accurate video generation (for rate alerts)

### User Preferences
- David Young → prefers → Accurate text rendering in videos
- David Young → wants to avoid → Repeating research ("I don't want to go through this again")
- David Young → current spend → $250/month on Veo
- David Young → seeks → Cost savings without quality loss

---

## Files to Reference

All implementation files in: `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/`

Key documentation:
- This file: `RUNWAY-VIDEO-GENERATION-RESEARCH.md`
- Setup guide: `VIDEO-TEST-INSTRUCTIONS.md`
- MCP setup: `MCP-IMPLEMENTATION-STATUS.md`
- Firecrawl guide: `FIRECRAWL-API-SETUP.md`

---

## Research Sources

- Runway ML documentation: https://docs.runwayml.com
- Runway pricing: https://runwayml.com/pricing
- Veo 3 capabilities: Web research (October 27, 2025)
- User testing feedback: Direct experience with both Gen-4 and Veo 3

---

**IMPORTANT:** This research took significant time and troubleshooting. User explicitly requested: "I don't want to go through this again." All findings must be preserved in both:
1. This markdown file (immediate persistence)
2. MCP Memory knowledge graph (for agent recall across sessions)

Next conversation with /helpdesk should immediately transfer all entities from this file into the knowledge graph.
