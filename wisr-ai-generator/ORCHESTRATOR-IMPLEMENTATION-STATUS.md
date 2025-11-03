# Orchestrator Implementation Status

**Date:** October 29, 2025
**Project:** wisr-ai-generator
**Goal:** Implement memory loop orchestrator to improve 3.6% → 90%+ success rate

---

## ✅ Phase 1 Complete: Core Framework Built

### What's Been Created

#### 1. `.claude/project_instructions.md`
**Purpose:** The operating manual for Claude Code - enforces memory loop protocol

**Key Features:**
- Mandatory 4-step loop: RETRIEVE → EXECUTE → VALIDATE → PERSIST
- Asset-specific workflows for signatures, static images, and videos
- Memory schema for consistent data structure
- Integration points with existing tools
- Playwright MCP validation requirements
- Error recovery strategies

**Impact:** Claude must follow the loop - no more skipping validation or guessing

---

#### 2. `orchestrator.js`
**Purpose:** Main workflow coordinator that executes the memory loop

**Key Features:**
- `generate()` - Main entry point for any generation request
- `retrieveMemory()` - Loads past results, success rates, patterns
- `executeGeneration()` - Routes to signature/image/video generators
- `validateWithPlaywright()` - Enforces visual validation
- `attemptRecovery()` - Tries alternative strategies on failure (up to 3 retries)
- `persistToMemory()` - Saves all results, screenshots, learnings

**Flow:**
```
Request → Retrieve Context → Generate Asset → Validate →
  ↓ (if fail)
Retry with Alternative → Validate Again →
  ↓ (if pass or max retries)
Persist to Memory → Return Result
```

**Impact:** Automated workflow replaces manual prompting and guesswork

---

#### 3. `memory-adapter.js`
**Purpose:** Clean interface to Memory MCP and local storage

**Key Features:**
- `storeGeneration()` - Saves generation results
- `retrieveContext()` - Gets relevant past results and patterns
- `getBestTemplate()` - Finds highest success rate template
- `getRecommendations()` - Suggests fixes for failed generations
- `getStatistics()` - Current success rate, critical issues
- `cleanup()` - Maintains memory database

**Impact:** Easy access to learnings from 168 past generations

---

## 📊 Current State Analysis

### From Exploration Report

**Total Generations:** 168
**Successful:** 6 (3.6%)
**Failed:** 162 (96.4%)

**Top Critical Issues:**
1. Content sections getting mixed up
2. Curly quotes instead of straight quotes
3. Only 1 economic factor instead of 2-3
4. Missing 'Market Drivers Today' section
5. Missing 'Expert Insight' section header
6. **Email signature text alignment/stretching** (most critical)

**Existing Tools Not Being Used:**
- ✅ `clickable-verifier.js` (430 lines) - READY but not integrated
- ✅ `quality-backend.js` (200+ lines) - Express server running but not called
- ✅ `ocr-service.js` (200+ lines) - Text validation ready but not used
- ✅ Playwright MCP - Connected but not enforced in workflows

---

## 🔧 What Still Needs to Be Done

### Phase 2: Integration (Next Steps)

#### Task 1: Wire Signature Validation
**File to modify:** `signature-generator.html`

**Changes needed:**
```javascript
// After signature generation, add:
const orchestrator = new Orchestrator();
const result = await orchestrator.generate({
  assetType: 'signature',
  template: selectedTemplate,
  inputs: formData,
  client: clientName,
  campaign: campaignName
});

// This will automatically:
// - Retrieve past successful patterns
// - Generate with learned settings
// - Validate with Playwright + clickable-verifier.js
// - Persist results to memory
// - Show screenshot of validation
```

---

#### Task 2: Wire Image Validation
**File to modify:** `nano-test.html`

**Changes needed:**
```javascript
// After Gemini image generation, add:
const orchestrator = new Orchestrator();
const result = await orchestrator.generate({
  assetType: 'staticImage',
  template: 'current-style',
  inputs: {
    prompt: enhancedPrompt,
    canvas: canvasData
  }
});

// This will:
// - Load successful word replacements
// - Apply PTCF framework improvements
// - Screenshot canvas output
// - Validate text rendering
// - Learn from failures
```

---

#### Task 3: Wire Video Validation
**Files to modify:** `runway-service.js`, `google-veo-service.js`

**Changes needed:**
```javascript
// After video generation, add:
const orchestrator = new Orchestrator();
const result = await orchestrator.generate({
  assetType: 'video',
  template: 'standard',
  inputs: {
    prompt: videoPrompt,
    textOverlays: overlayConfig
  }
});

// This will:
// - Choose Runway vs Veo based on past cost/quality
// - Generate with learned prompt patterns
// - Screenshot key frames
// - Validate text overlay readability
// - Track costs per successful output
```

---

### Phase 3: Connect Existing Validation Tools

#### Task 4: Integrate clickable-verifier.js
**Changes to orchestrator.js:**

```javascript
async validateSignature(signaturePath, screenshotPath, checks) {
  // ACTUAL implementation (currently placeholder):
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);

  // Run clickable-verifier.js
  const result = await execAsync(
    `node clickable-verifier.js "${signaturePath}"`
  );

  // Parse results
  const validation = JSON.parse(result.stdout);

  return {
    pass: validation.allPassed,
    passedCount: validation.passedChecks.length,
    totalCount: validation.totalChecks,
    screenshotPath: validation.screenshotPath,
    assertions: validation.passedChecks,
    failures: validation.failedChecks
  };
}
```

---

#### Task 5: Call Quality Backend API
**Changes to orchestrator.js:**

```javascript
async validateWithPlaywright({ assetType, outputPath, checks }) {
  // Call quality-backend.js API
  const response = await fetch('http://localhost:3001/api/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      assetType,
      filePath: outputPath,
      checks
    })
  });

  const validation = await response.json();

  return validation;
}
```

---

### Phase 4: Playwright MCP Enforcement

#### Task 6: Add Actual Playwright MCP Calls
**Replace placeholders in orchestrator.js with real MCP calls:**

```javascript
// For signatures:
await mcp__playwright__browser_navigate({
  url: `file://${absolutePath}`
});

const screenshotPath = await mcp__playwright__browser_take_screenshot({
  filename: `artifacts/signature_${Date.now()}.png`,
  fullPage: true
});

// Run assertions via clickable-verifier.js
// ...

// For images:
await mcp__playwright__browser_navigate({
  url: `file://${nanoTestHtmlPath}`
});

await mcp__playwright__browser_take_screenshot({
  element: "Canvas preview area",
  ref: "#canvas-preview",
  filename: `artifacts/image_${Date.now()}.png`
});

// Evaluate canvas
const canvasCheck = await mcp__playwright__browser_evaluate({
  function: `() => {
    const canvas = document.querySelector('canvas');
    return {
      width: canvas.width,
      height: canvas.height,
      hasContent: canvas.toDataURL() !== 'data:image/png;base64,...'
    };
  }`
});
```

---

## 🎯 Expected Outcomes

### Before Orchestrator
- ❌ 3.6% success rate
- ❌ No visual validation
- ❌ Repeated failures (text alignment)
- ❌ No learning from past attempts
- ❌ Manual debugging required
- ❌ Guessing based on code

### After Full Implementation
- ✅ 90%+ success rate (goal)
- ✅ Mandatory Playwright screenshots
- ✅ Automatic error recovery
- ✅ Learning from 168 past generations
- ✅ Self-correcting workflows
- ✅ Visual verification before delivery

---

## 📁 File Structure

```
wisr-ai-generator/
├── .claude/
│   ├── project_instructions.md      ✅ CREATED
│   └── agent-memory.json             (existing, will be automated)
├── orchestrator.js                   ✅ CREATED
├── memory-adapter.js                 ✅ CREATED
├── signature-generator.html          (needs orchestrator integration)
├── nano-test.html                    (needs orchestrator integration)
├── clickable-verifier.js             (needs to be called by orchestrator)
├── quality-backend.js                (needs to be called by orchestrator)
├── runway-service.js                 (needs orchestrator integration)
├── google-veo-service.js             (needs orchestrator integration)
└── artifacts/                        (screenshots will be saved here)
```

---

## 🚀 Quick Start Guide

### To Test the Orchestrator Now:

```bash
# 1. Navigate to project
cd "/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator"

# 2. Check current memory stats
node memory-adapter.js

# 3. Test orchestrator with example
node orchestrator.js

# 4. View memory file
cat .claude/agent-memory.json
```

### To Integrate with Signature Generator:

1. Open `signature-generator.html`
2. Find the signature generation function
3. Wrap it with orchestrator call (see Task 1 above)
4. Test with real signature request
5. View screenshot in `artifacts/` directory
6. Check memory updated in `.claude/agent-memory.json`

---

## 🔍 How to Verify It's Working

### Test 1: Memory Retrieval
```javascript
const adapter = new MemoryAdapter();
const stats = await adapter.getStatistics();

console.log(stats);
// Expected output:
// {
//   totalGenerations: 168,
//   successfulGenerations: 6,
//   successRate: 3.6%,
//   criticalIssues: [...]
// }
```

### Test 2: Orchestrator Flow
```javascript
const orchestrator = new Orchestrator();
const result = await orchestrator.generate({
  assetType: 'signature',
  template: 'classic',
  inputs: { name: 'Test User', ... }
});

console.log(result);
// Expected output:
// {
//   success: true/false,
//   output: 'assets/email-signature/...',
//   screenshot: 'artifacts/signature_...',
//   validation: { pass: true, assertions: [...] }
// }
```

### Test 3: Playwright Validation
- Generate a signature
- Check `artifacts/` for new screenshot
- Verify screenshot shows the actual rendered signature
- Check `.claude/agent-memory.json` for new entry

---

## 💡 Next Actions

### Immediate (To Complete Phase 1):
1. ✅ Core framework built (DONE)
2. ⏳ Test orchestrator with sample data
3. ⏳ Verify memory adapter reads existing data
4. ⏳ Confirm Playwright MCP is accessible

### Short Term (Phase 2):
1. ⏳ Integrate orchestrator into signature-generator.html
2. ⏳ Replace placeholder validation with real clickable-verifier.js calls
3. ⏳ Add Playwright MCP screenshot captures
4. ⏳ Test with real signature generation
5. ⏳ Verify memory persistence works

### Medium Term (Phase 3 & 4):
1. ⏳ Integrate into nano-test.html (static images)
2. ⏳ Integrate into video generation
3. ⏳ Connect quality-backend.js API calls
4. ⏳ Add OCR validation
5. ⏳ Build error recovery strategies
6. ⏳ Deploy and monitor success rate improvements

---

## 🎓 Key Learnings Applied

### From YouTube Video:
✅ Memory-first retrieval (always load context)
✅ Visual validation with Playwright (no guessing)
✅ Persistent learning across sessions
✅ Enforced workflow (can't skip steps)

### From Your Project History:
✅ 168 generations of failure data to learn from
✅ Text alignment as #1 issue to solve
✅ Existing validation tools ready to use
✅ MCP servers already connected

### Combined Approach:
✅ Framework enforces best practices
✅ Actual visual verification catches issues
✅ Memory persistence enables learning
✅ Error recovery prevents repeated failures

---

## 📞 Support

**If something doesn't work:**
1. Check `.claude/agent-memory.json` exists and is valid JSON
2. Verify Playwright MCP is connected: `claude mcp list`
3. Ensure `artifacts/` directory exists
4. Check orchestrator.js console output for errors
5. Review memory-adapter.js statistics

**Common Issues:**
- Memory file not found → Will create automatically on first persist
- Playwright MCP not found → Run `claude mcp add playwright "npx @playwright/mcp@latest"`
- Screenshot not saving → Check artifacts/ directory exists and has write permissions

---

## ✨ Success Criteria

**The orchestrator is fully working when:**

1. ✅ Signature generation captures Playwright screenshot automatically
2. ✅ Text alignment failures detected before delivery
3. ✅ Memory file updates with each generation
4. ✅ Success rate visible in memory statistics
5. ✅ Alternative templates tried on failure
6. ✅ Past patterns retrieved and applied
7. ✅ 90%+ success rate achieved (goal)

**We're currently at: Phase 1 Complete (Core Framework Built)**

**Next milestone: Phase 2 - Integrate with signature-generator.html**

---

*Generated by Claude Code - Orchestrator Implementation*
*Project: wisr-ai-generator*
*Date: October 29, 2025*
