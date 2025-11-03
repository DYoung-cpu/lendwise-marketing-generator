# WISR AI Generator - Orchestrator Instructions

## Project Overview

AI-powered marketing material generator with 3 asset types:
1. **Video** - Runway/Google Veo 3.1 with Gemini Flash 2.5 text overlays
2. **Static Images** - Gemini 2.5 Flash with Fabric.js canvas
3. **Email Signatures** - Gemini 2.5 background + HTML text overlays

**Current Problem:** 3.6% success rate (6/168 successful generations)
**Root Cause:** No visual validation, no learning from failures, text alignment guesswork

## MANDATORY Memory Loop Protocol

**For EVERY generation, you MUST follow this exact sequence:**

### 1. RETRIEVE Memory (Always First)
```javascript
// Query existing learnings
const context = await memoryMCP.retrieve({
  project: "wisr-ai-generator",
  assetType: "signature" | "video" | "staticImage",
  tags: ["template/classic", "issue/textAlignment", etc.]
});

// Analyze past failures
const knownIssues = context.criticalIssues;
const successfulPatterns = context.filter(r => r.pass === true);
```

**Load before generation:**
- What templates work best for this content type
- What text alignment strategies succeeded
- What prompts caused failures
- What aspect ratios were validated

### 2. EXECUTE Generation
```javascript
// Use loaded context + new inputs
const result = await generator.create({
  template: selectedFromMemory,
  avoidPatterns: knownIssues,
  ...userInputs
});
```

### 3. VALIDATE with Playwright (MANDATORY)
```javascript
// For Signatures - use existing clickable-verifier.js
const validation = await playwrightMCP.verify({
  file: result.path,
  checks: [
    "dimensions match 21:9 aspect ratio",
    "text not stretched or distorted",
    "all links clickable",
    "logo positioned correctly",
    "text readable and aligned"
  ]
});

// Capture screenshot
const screenshot = await playwrightMCP.screenshot({
  path: result.path,
  output: `artifacts/${assetType}_${version}_validation.png`
});
```

**You MUST capture Playwright screenshot - NO EXCEPTIONS**
**You MUST run visual assertions - NO GUESSING**

### 4. PERSIST Results (Always Last)
```javascript
await memoryMCP.upsert({
  project: "wisr-ai-generator",
  assetType,
  version,
  pass: validation.allPassed,
  artifacts: [
    { kind: "html|png|mp4", path: result.path },
    { kind: "screenshot", path: screenshot.path }
  ],
  assertions: validation.results,
  data: {
    template: selectedTemplate,
    prompt: usedPrompt,
    apiCalls: apiMetadata,
    issues: validation.failures
  },
  timestamp: new Date().toISOString()
});
```

---

## Asset-Specific Workflows

### A) Email Signature Generation

**Files:**
- Generator: `signature-generator.html`
- Templates: `signature-templates.js` (5 templates)
- Validation: `clickable-verifier.js` (EXISTS - must integrate)
- Backend: `quality-backend.js` port 3001

**Critical Requirements:**
- **Aspect ratio: 21:9** (cropped to 7:2 for email clients)
- **No text stretching** - #1 failure mode
- **Clickable links** - phone, email, website
- **Template consistency** - Classic, Modern, Elegant, Corporate, Tech

**Memory Loop Steps:**

1. **RETRIEVE**
   ```javascript
   tags: ["assets/signature", "template/{templateName}", "client/{clientName}"]
   ```
   Load: Past text alignment solutions, successful CSS positioning, template effectiveness

2. **EXECUTE**
   - Generate background via Gemini 2.5 Flash Image (21:9 aspect ratio)
   - Apply HTML overlay with contact info
   - Use CSS from successful past generations (from memory)

3. **VALIDATE with clickable-verifier.js**
   ```javascript
   await playwrightMCP.call('clickable-verifier.js', {
     signaturePath: outputPath,
     checks: [
       'aspect-ratio-21-9',
       'text-not-stretched',
       'links-clickable',
       'dimensions-correct',
       'logo-positioned'
     ]
   });
   ```

4. **PERSIST**
   - Save HTML file path
   - Save screenshot path
   - Save validation results
   - Save CSS positioning values that worked
   - Link to template used

**Known Issues (from agent-memory.json):**
- Text stretching when aspect ratio wrong
- Missing clickable links
- Logo misalignment
- Incorrect dimensions

---

### B) Static Image Generation

**Files:**
- Generator: `nano-test.html`
- Prompt Enhancer: `gemini-prompt-enhancer.js`
- Templates: Style presets in nano-test.html

**Critical Requirements:**
- **15 words max per section** (Gemini limitation)
- **Problem word avoidance** (Navigate→Guide, Steady→Stable)
- **PTCF framework** (Product, Traits, Context, Format)
- **Text limit optimization**

**Memory Loop Steps:**

1. **RETRIEVE**
   ```javascript
   tags: ["assets/staticImage", "issue/textRendering", "prompt/successful"]
   ```
   Load: Successful prompts, word replacements that worked, layout patterns

2. **EXECUTE**
   - Enhance prompt via `gemini-prompt-enhancer.js`
   - Apply problem word replacements
   - Generate via Gemini 2.5 Flash Image
   - Render on Fabric.js canvas

3. **VALIDATE**
   ```javascript
   await playwrightMCP.screenshot({
     selector: '#canvas-preview',
     output: `artifacts/staticImage_${version}.png`
   });

   // Visual assertions
   await playwrightMCP.assert([
     'text is readable and not cut off',
     'layout matches requested structure',
     'no missing text sections',
     'image quality acceptable'
   ]);
   ```

4. **PERSIST**
   - Save enhanced prompt
   - Save word replacements used
   - Save canvas output
   - Save screenshot
   - Link to prompt effectiveness

**Known Issues:**
- Content sections getting mixed up
- Curly quotes instead of straight quotes
- Missing sections (Market Drivers, Expert Insight)
- Only 1 economic factor instead of 2-3

---

### C) Video Generation

**Files:**
- Runway Service: `runway-service.js`
- Veo Service: `google-veo-service.js`
- Text Compositor: `video-compositor.js` (FFmpeg)
- Prompt Optimizer: `veo-prompt-optimizer.js`

**Critical Requirements:**
- **Moving text overlays** (complex - FFmpeg + Gemini)
- **Cost optimization** ($0.75/sec for Veo, $0.01/credit for Runway)
- **Polling for completion** (60 attempts, 5 min max)
- **Quality validation**

**Memory Loop Steps:**

1. **RETRIEVE**
   ```javascript
   tags: ["assets/video", "service/{runway|veo}", "prompt/successful"]
   ```
   Load: Cost-effective service choices, successful prompts, text overlay positions

2. **EXECUTE**
   - Select service (Runway vs Veo) based on past cost/quality data
   - Generate video via selected API
   - Poll until ready
   - Apply text overlays via `video-compositor.js`

3. **VALIDATE**
   ```javascript
   // Play video in Playwright
   await playwrightMCP.navigate('video-preview.html');
   await playwrightMCP.assert([
     'video element present',
     'readyState >= 2 (can play)',
     'duration matches expected',
     'text overlays readable at key frames'
   ]);

   // Screenshot key frames
   await playwrightMCP.screenshot({
     at: [0, duration/2, duration],
     output: `artifacts/video_${version}_frames.png`
   });
   ```

4. **PERSIST**
   - Save video URL/path
   - Save service used + cost
   - Save prompt + text overlay config
   - Save frame screenshots
   - Link to quality score

---

## Memory Schema

**Consistent structure for all assets:**

```json
{
  "project": "wisr-ai-generator",
  "assetType": "signature | staticImage | video",
  "version": "vX.Y.Z",
  "template": "classic | modern | elegant | corporate | tech",
  "pass": true | false,
  "tags": [
    "assets/{type}",
    "template/{name}",
    "client/{name}",
    "issue/{type}",
    "status/{draft|approved}"
  ],
  "data": {
    "inputs": {},
    "prompt": "string",
    "apiCalls": {
      "service": "gemini | runway | veo",
      "model": "string",
      "cost": 0.00
    },
    "cssPositioning": {}, // for signatures
    "wordReplacements": {}, // for static images
    "textOverlays": [] // for videos
  },
  "artifacts": [
    { "kind": "html|png|mp4", "path": "string", "note": "string" },
    { "kind": "screenshot", "path": "string", "note": "validation screenshot" }
  ],
  "assertions": [
    "string descriptions of checks performed"
  ],
  "issues": [
    "string descriptions of failures"
  ],
  "timestamp": "ISO-8601"
}
```

---

## Integration Points

### Existing Tools to Wire In

**1. clickable-verifier.js** (430 lines - READY)
- Validates signature dimensions, aspect ratio, text positioning, clickable links
- Outputs to `verification-screenshots/`
- **Status:** Built but NOT called from signature-generator.html
- **Action:** Add call after signature generation

**2. quality-backend.js** (200+ lines - READY)
- Express server on port 3001
- Endpoints: `/api/health`, `/api/agent-memory`, `/api/save-learning`
- **Status:** Running but frontend doesn't call it
- **Action:** Add fetch() calls from generators

**3. ocr-service.js** (200+ lines - READY)
- Tesseract.js OCR for text extraction
- Image preprocessing (grayscale, normalize, sharpen)
- **Status:** Backend exists but not integrated
- **Action:** Call to validate text readability

**4. agent-memory.json** (ACTIVE)
- Currently tracks 168 generations manually
- Has criticalIssues array with known failures
- **Status:** Static file, not automated
- **Action:** Read/write via memory-adapter.js

---

## Playwright MCP Integration

**Connected Server:** `@playwright/mcp@latest --browser chromium`

**Must-Use Functions:**

### For Signatures:
```javascript
// Navigate to generated HTML
await mcp__playwright__browser_navigate({
  url: `file://${absolutePath}`
});

// Take screenshot
await mcp__playwright__browser_take_screenshot({
  filename: `artifacts/signature_${version}.png`,
  fullPage: true
});

// Run assertions
await mcp__playwright__browser_snapshot(); // Get DOM structure
await mcp__playwright__browser_click({
  element: "Apply Now link",
  ref: "..."
}); // Verify clickable
```

### For Static Images:
```javascript
// Navigate to nano-test.html
await mcp__playwright__browser_navigate({
  url: `file://${nano_test_path}`
});

// Screenshot canvas
await mcp__playwright__browser_take_screenshot({
  element: "Canvas preview",
  ref: "#canvas-preview"
});

// Evaluate canvas state
await mcp__playwright__browser_evaluate({
  function: "() => { return document.querySelector('canvas').toDataURL(); }"
});
```

### For Videos:
```javascript
// Navigate to video preview
await mcp__playwright__browser_navigate({
  url: "http://localhost:3001/video-preview.html"
});

// Wait for video load
await mcp__playwright__browser_wait_for({
  text: "Video loaded"
});

// Screenshot at timestamps
await mcp__playwright__browser_evaluate({
  function: "(element) => { element.currentTime = 5.0; }"
});
await mcp__playwright__browser_take_screenshot({});
```

---

## Error Recovery Strategies

### If Validation Fails:

**Signature Text Alignment Issues:**
1. Try alternative template (e.g., Modern instead of Classic)
2. Adjust CSS positioning based on memory of past fixes
3. Regenerate background with different aspect ratio prompt
4. Use fallback HTML-only version (no background image)

**Static Image Text Rendering Issues:**
1. Retry with different word replacements
2. Reduce text length further (from 15 to 10 words)
3. Try alternative PTCF prompt structure
4. Use template from past successful generation

**Video Generation Issues:**
1. Switch service (Veo → Runway or vice versa)
2. Simplify text overlay positioning
3. Try different video generation prompt
4. Fall back to static image + fade transitions

**Escalation:**
- After 3 failed attempts with alternatives, persist failure and request human review
- Log all attempted strategies to memory for future learning

---

## Definition of Done

**A generation is ONLY complete when:**

1. ✅ Memory retrieved and past learnings loaded
2. ✅ Asset generated using context from memory
3. ✅ Playwright screenshot captured
4. ✅ Visual assertions run (all checks documented)
5. ✅ Pass/fail determination made
6. ✅ Results persisted to memory with artifacts
7. ✅ If failed: alternative strategy attempted OR human escalation logged

**Never deliver without Playwright validation screenshot.**
**Never skip memory persistence.**
**Never guess - always verify visually.**

---

## Success Metrics

**Target Improvements:**
- Success rate: 3.6% → 90%+
- Text alignment issues: Common → Rare
- Memory coverage: 0% automated → 100% automated
- Validation: Optional → Mandatory
- Learning: None → Full pattern analysis

**Track in Memory:**
- Generation count by asset type
- Success rate by template
- Cost per successful generation
- Common failure modes
- Effective recovery strategies

---

## Quick Reference

**Memory Retrieve:**
```javascript
mcp__memory__search_nodes({ query: "signature classic successful" })
```

**Playwright Screenshot:**
```javascript
mcp__playwright__browser_take_screenshot({
  filename: "artifacts/..."
})
```

**Memory Persist:**
```javascript
mcp__memory__create_entities({
  entities: [{
    name: "generation_v1.0.0",
    entityType: "signature",
    observations: ["text aligned correctly", "all links clickable"]
  }]
})
```

**This is your operating manual. Follow it every time.**
