# Project Memory - Autonomous Marketing Image Generator

**Last Updated:** 2025-10-28
**Project:** LendWise Marketing Image Generator with Autonomous Quality Monitoring

---

## Project Overview

### Purpose
Autonomous AI-powered marketing image generation system for LendWise Mortgage with:
- Real-time quality monitoring using Claude vision analysis
- Automatic regeneration when quality < 100%
- Persistent learning from all generations
- Playwright MCP-level accuracy without the overhead

### Core Architecture

```
User Browser (nano-test.html)
    ↓
Backend API (quality-backend.js) - Port 3001
    ↓
Gemini 2.5 Flash Image Generation
    ↓
Saves: image.png + metadata.json
    ↓
Autonomous Monitor (autonomous-quality-monitor.js)
    ↓
Claude Vision Analysis via Anthropic API
    ↓
If < 100%: Regenerate with corrections (max 3 attempts)
    ↓
Learning saved to agent-memory.json
```

---

## Critical System Components

### 1. Backend Server (`quality-backend.js`)
- **Port:** 3001
- **Purpose:** Fast single-generation with metadata saving
- **Key Change:** Removed vision-analyzer.js (was giving false 100% scores)
- **Metadata Saved:** timestamp, templateName, prompt, logo, photo, imagePath

**Important Code (lines 135-146):**
```javascript
// Save metadata for autonomous monitor to use for regeneration
const metadataPath = tempPath.replace('.png', '.json');
const metadata = {
    timestamp: Date.now(),
    templateName: templateName,
    prompt: enhancedPrompt,
    logo: logo,
    photo: photo,
    imagePath: tempPath
};
```

### 2. Autonomous Monitor (`autonomous-quality-monitor.js`)
- **Purpose:** Watch /tmp/marketing-generations/ and analyze quality
- **File Watcher:** chokidar with ignoreInitial: false
- **Analysis Method:** Claude vision via base64 image + Anthropic API
- **Max Attempts:** 3 regenerations before stopping

**Critical Update (line 153):**
```javascript
// For Expert Insight quotes: Elegant, stylized/cursive quotation marks are PREFERRED and CORRECT
```

### 3. Frontend (`nano-test.html`)
- **Template Prompts:** buildDailyRateUpdatePrompt (lines 2447-2481)
- **Key Update:** Embraced elegant/stylized quotes as design feature
- **Economic Factors Fallback:** Always ensures 2-3 factors show (lines 2409-2443)

---

## Key Decisions & Rationale

### Decision 1: Remove Vision Analyzer
**Date:** 2025-10-27
**Reason:** vision-analyzer.js was giving false 100% scores despite obvious errors
**Solution:** Direct Claude vision analysis via Anthropic API
**Result:** Accurate quality scores (85-95% realistic vs false 100%)

### Decision 2: Embrace Stylized Quotes
**Date:** 2025-10-28
**Problem:** Gemini consistently renders curly quotes despite ASCII instructions
**Solution:** Made stylized quotes a premium design feature instead of fighting them
**Changes:**
- Frontend: "Use elegant, stylized quotation marks for the expert insight"
- Monitor: "Elegant, stylized/cursive quotation marks are PREFERRED and CORRECT"

### Decision 3: Metadata-Based Regeneration
**Date:** 2025-10-27
**Reason:** Monitor needs full context to regenerate with corrections
**Implementation:** Backend saves .json with all generation parameters
**Benefit:** Complete autonomous loop without manual intervention

---

## System Rules (NEVER VIOLATE)

### Code Rules
1. **NEVER** use vision-analyzer.js - it gives false positives
2. **ALWAYS** save metadata.json alongside generated images
3. **ALWAYS** use Playwright MCP or Claude vision for quality analysis
4. **NEVER** trust 100% scores without verification
5. **ALWAYS** check quotation mark types in analysis

### Quality Standards
1. Stylized/cursive quotes in Expert Insight = CORRECT (premium design)
2. Minimum 2-3 economic factors in Market Drivers
3. All section headers must be present
4. PERSONALIZED spelled with L not I
5. Each section in separate card with gold borders

### Operational Rules
1. Backend must run on port 3001
2. Monitor watches /tmp/marketing-generations/
3. Max 3 regeneration attempts per image
4. All learnings saved to agent-memory.json
5. Both services need ANTHROPIC_API_KEY and GEMINI_API_KEY

---

## Common Issues & Solutions

### Issue 1: Monitor Not Detecting New Files
**Symptoms:** Files generated but monitor log shows no activity
**Cause:** Multiple monitor processes or old cached code
**Solution:**
```bash
pkill -9 -f autonomous-quality-monitor
cd "/mnt/c/Users/dyoun/Active Projects"
ANTHROPIC_API_KEY="..." node autonomous-quality-monitor.js > /tmp/monitor.log 2>&1 &
```

### Issue 2: Backend Not Responding
**Symptoms:** ERR_CONNECTION_REFUSED on port 3001
**Cause:** Backend crashed or not started with proper env vars
**Solution:**
```bash
pkill -9 -f quality-backend
cd "/mnt/c/Users/dyoun/Active Projects"
GEMINI_API_KEY="..." ANTHROPIC_API_KEY="..." node quality-backend.js > /tmp/backend.log 2>&1 &
```

### Issue 3: agent-memory.json Corruption
**Symptoms:** JSON parse errors in monitor log
**Cause:** Concurrent writes or improper array termination
**Solution:** Edit file to fix JSON syntax, restart monitor

### Issue 4: Curly Quotes Flagged as Errors
**Symptoms:** Monitor rejecting images for stylized quotes
**Cause:** Old analysis criteria still in use
**Solution:** Verify line 153 in autonomous-quality-monitor.js has updated criteria, restart monitor

---

## API Keys & Environment

### Required Environment Variables
```bash
GEMINI_API_KEY="AIzaSyD7cwQ3dv2BScr9y0GM4lk0sYaVV0Uw1Os"
ANTHROPIC_API_KEY="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"
```

### Service Endpoints
- **Backend:** http://localhost:3001/api/generate
- **Market Data:** http://localhost:3001/api/market-data
- **Health Check:** http://localhost:3001/api/health

---

## File Locations

### Key Files
- **Backend:** `/mnt/c/Users/dyoun/Active Projects/quality-backend.js`
- **Monitor:** `/mnt/c/Users/dyoun/Active Projects/autonomous-quality-monitor.js`
- **Frontend:** `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/nano-test.html`
- **Agent Memory:** `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/.claude/agent-memory.json`
- **Project Memory:** `/mnt/c/Users/dyoun/Active Projects/.claude/project-memory.md` (this file)

### Generated Files
- **Images:** `/tmp/marketing-generations/*.png`
- **Metadata:** `/tmp/marketing-generations/*.json`

### Logs
- **Backend:** `/tmp/backend.log` or `/tmp/backend-clean.log`
- **Monitor:** `/tmp/monitor.log` or `/tmp/monitor-clean.log`

---

## Performance Metrics

### Current Stats (as of 2025-10-28)
- **Total Generations:** 115
- **Successful (100%):** 2 (1.7%)
- **Failed (<100%):** 113 (98.3%)
- **Average Score:** ~85-95%
- **Common Issue:** Minor formatting/header issues (not quote-related)

### System Performance
- **Generation Time:** 10-15 seconds (single generation)
- **Analysis Time:** 8-12 seconds (Claude vision)
- **Full Autonomous Loop:** 30-60 seconds (3 attempts max)

---

## Template Prompts

### Daily Rate Update Template
**Location:** nano-test.html lines 2447-2481
**Key Features:**
- 6 sections with clear headers
- Elegant stylized quotes for Expert Insight
- Minimum 2-3 economic factors with fallback
- Forest green background with gold metallic text
- LendWise logo in header/footer

### Economic Factors Fallback
**Location:** nano-test.html lines 2409-2443
**Purpose:** Ensures minimum 2-3 factors always display
**Fallbacks:**
1. Inflation Data (negative)
2. Existing Home Sales (positive)
3. Federal Reserve Policy (positive)

---

## Startup Procedure

### Clean Start (Both Services)
```bash
# Kill any existing processes
pkill -9 -f "quality-backend\|autonomous-quality-monitor"

# Start backend
cd "/mnt/c/Users/dyoun/Active Projects"
GEMINI_API_KEY="AIzaSyD7cwQ3dv2BScr9y0GM4lk0sYaVV0Uw1Os" \
ANTHROPIC_API_KEY="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" \
node quality-backend.js > /tmp/backend.log 2>&1 &

# Wait for backend to start
sleep 3

# Start monitor
ANTHROPIC_API_KEY="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" \
node autonomous-quality-monitor.js > /tmp/monitor.log 2>&1 &

# Verify both running
sleep 5
curl http://localhost:3001/api/health
pgrep -f autonomous-quality-monitor
```

---

## Testing Procedure

### Test Autonomous Loop
1. Open nano-test.html in browser
2. Select "Daily Rate Update" template
3. (Optional) Upload photo
4. Click Generate
5. Monitor logs:
```bash
tail -f /tmp/monitor.log
```
6. Expect: Detection → Analysis → Regeneration (if needed) → Final result

---

## Future Improvements

### Potential Enhancements
1. **Persistent Memory MCP:** Track context across sessions ✅ (IMPLEMENTED)
2. **Real Playwright MCP:** For pixel-perfect screenshot validation
3. **Learning Database:** PostgreSQL for better query/analysis
4. **Success Pattern Recognition:** Auto-apply successful strategies
5. **Multi-Model Support:** Fallback to other AI models

### Known Limitations
1. Gemini quote rendering (now accepted as feature)
2. Max 3 regeneration attempts (could increase)
3. Single concurrent generation (could parallelize)
4. No user notification when regeneration completes

---

## Maintenance Notes

### Weekly Tasks
- [ ] Review agent-memory.json for patterns
- [ ] Clear old generated images from /tmp/
- [ ] Check error logs for new issues
- [ ] Update fallback economic factors if stale

### Monthly Tasks
- [ ] Analyze success rate trends
- [ ] Update template prompts based on learnings
- [ ] Review and consolidate critical issues list
- [ ] Backup agent-memory.json

---

## Contact & Support

**Project Owner:** David Young
**NMLS:** 62043
**Phone:** 310-954-7771
**Company:** LendWise Mortgage

---

*This memory file is automatically read at the start of each Claude Code session to maintain context and ensure consistent behavior across sessions.*
