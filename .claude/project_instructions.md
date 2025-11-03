# Project Instructions — Marketing Generator with Memory Loop

You are the orchestrator inside Claude Code using MCP tools for asset generation with persistent learning.

## Connected MCP Tools

- **Playwright MCP** (`@playwright/mcp@latest`) → Open preview pages, capture screenshots, run visual assertions
- **Firecrawl MCP** (`firecrawl-mcp`) → Fetch external brand assets, competitor research
- **Memory MCP** (`@modelcontextprotocol/server-memory`) → Store/retrieve durable project context and asset history

## MANDATORY Memory Loop Protocol

**For EVERY task, you MUST follow this sequence:**

### 1. RETRIEVE Memory First
```
- Determine relevant tags for the task
- Use Memory MCP to retrieve prior context
- Summarize findings to context window
- Proceed even if no prior memory exists
```

### 2. EXECUTE Task
```
- Generate the asset (HTML, image API call, video spec)
- Use appropriate tools (code generation, API calls, file writes)
- Create preview if applicable
```

### 3. VALIDATE with Playwright
```
- Open asset in browser (if visual)
- Capture full-page screenshot
- Run assertions (text present, links valid, layout correct)
- Document pass/fail results
```

### 4. PERSIST Results
```
- Store ALL context back to Memory MCP
- Include: inputs, outputs, artifacts, assertions, pass/fail, notes
- Version bump appropriately
- Save screenshot paths and file locations
```

**NEVER skip validation. NEVER skip persistence.**

---

## Memory Schema (Enforce Consistency)

Use this structure for ALL memory operations:

```json
{
  "project": "string (e.g., MarketingGen)",
  "client": "string (e.g., MarxGolod)",
  "campaign": "string (e.g., RefiWatcher_Oct2025)",
  "assetType": "emailSignature | staticImage | video | copy | landingPage",
  "version": "string (semantic: v1.0.0, v1.1.0)",
  "tags": ["array", "of", "tags"],
  "data": {
    "brand": {"primary": "#hex", "secondary": "#hex"},
    "fontFamily": "string",
    "inputs": {},
    "outputs": {},
    "apiCalls": []
  },
  "artifacts": [
    {"kind": "html|png|mp4|url", "pathOrUrl": "string", "note": "string"}
  ],
  "assertions": [
    "string descriptions of what was tested"
  ],
  "pass": true,
  "timestamp": "ISO-8601 string",
  "notes": "string (summary of what happened)"
}
```

---

## Asset Workflows

### A) Email Signature (HTML)

**Inputs:**
- Brand colors (primary, secondary)
- Logo URL or local path
- Contact fields (name, title, phone, email, address)
- Legal footer text
- CTA URL

**Steps:**
1. **Retrieve** memory: tags `["assets/emailSignature", "ui/theme"]`
2. **Generate** HTML signature:
   - 600-700px wide, table layout
   - Retina-safe images (@2x)
   - Inline CSS for email client compatibility
   - Include all contact fields + logo + legal footer
3. **Validate** with Playwright:
   - Open HTML file in browser
   - Full-page screenshot → `artifacts/email-signature_[version].png`
   - Assertions:
     - Contact name present
     - Phone number formatted correctly
     - CTA link href matches expected URL
     - Logo loads (check naturalWidth > 0)
4. **Persist**:
   - HTML file path
   - Screenshot path
   - All assertions results
   - Version bump
   - Brand colors used
   - Any issues found

---

### B) Static Image (Hero/Social)

**Inputs:**
- Prompt/description
- Brand palette
- Output size (e.g., 1600x900)
- Overlay text (optional)
- API endpoint for image generation

**Steps:**
1. **Retrieve** memory: tags `["assets/staticImage", "ui/theme"]`
2. **Generate** image:
   - Call image generation API with prompt + palette
   - Store returned URL or file path
3. **Validate** (if preview page exists):
   - Open preview in Playwright
   - Screenshot the rendered image
   - Check image loads correctly
4. **Persist**:
   - API request payload (without secrets)
   - Response URL/path
   - Screenshot path
   - Generation time
   - Version bump
   - Quality notes

---

### C) Video Asset

**Inputs:**
- Shot list or script
- Voiceover settings
- Brand bumper/intro
- Video generation API endpoint

**Steps:**
1. **Retrieve** memory: tags `["assets/video"]`
2. **Generate** video:
   - Call video API with spec
   - Poll until ready (or async callback)
   - Store output URL(s)
3. **Validate** (if preview available):
   - Open preview page in Playwright
   - Screenshot key frames or summary
   - Check video element loads (readyState >= 2)
4. **Persist**:
   - Job ID
   - Spec hash for reproducibility
   - Output URL(s)
   - QC notes
   - Version bump

---

## Playwright Assertions (Examples)

**Email Signature:**
- ✓ Contact name exists in DOM
- ✓ Phone number matches format: (XXX) XXX-XXXX
- ✓ CTA link `href` matches brand URL
- ✓ Logo image has `naturalWidth > 0` (loaded successfully)

**Static Image:**
- ✓ `<img>` element loads (`naturalWidth > 0`)
- ✓ Image dimensions match requested size
- ✓ Overlay text visible (if applicable)

**Video Preview:**
- ✓ `<video>` element present
- ✓ `readyState >= 2` (can play)
- ✓ Duration matches expected length

---

## Definition of Done

A task is ONLY complete when:

1. ✅ Memory retrieved and summarized
2. ✅ Asset produced (HTML/image/video)
3. ✅ Playwright validation completed with screenshots
4. ✅ Assertions documented (pass/fail)
5. ✅ Memory updated with all artifacts, results, and notes
6. ✅ Clear next action stated if any failures occurred

**If validation fails:**
- Document the failure in memory
- Fix the issue
- Re-run validation
- Persist updated results

---

## Tags to Use Consistently

**By Asset Type:**
- `assets/emailSignature`
- `assets/staticImage`
- `assets/video`
- `assets/copy`
- `assets/landingPage`

**By Domain:**
- `ui/theme` (brand colors, fonts)
- `tests/playwright` (validation results)
- `api/imageGen` (image generation config)
- `api/videoGen` (video generation config)
- `client/[clientName]` (client-specific context)

**By Status:**
- `status/draft`
- `status/review`
- `status/approved`
- `status/deployed`

---

## Current Active Projects

### MarxGolod - RefiWatcher Campaign (Oct 2025)

**Brand Guidelines:**
- Primary: `#0FA36B` (teal green)
- Secondary: `#0C4A6E` (dark blue)
- Font: `Trebuchet MS`
- CTA: `https://lendwisemtg.com/apply`
- Contact: Angela Marx & Eric Golod
- Phone: TBD
- Email: TBD
- Address: TBD

**Assets Needed:**
1. Email signature (HTML)
2. Social media hero image (1600x900)
3. Video introduction (30-60 sec)

---

## Best Practices

1. **Always retrieve before generating** - Don't assume, check memory first
2. **Screenshot everything visual** - Playwright gives you eyes, use them
3. **Version semantically** - v1.0.0 for new, v1.1.0 for minor changes, v2.0.0 for major
4. **Tag consistently** - Makes retrieval easier later
5. **Document failures** - Failed assertions are learning opportunities
6. **Persist immediately** - Don't batch, save after each validation

---

## Error Handling

**If Playwright fails:**
- Capture error message
- Take screenshot of error state
- Persist failure to memory
- Suggest fix based on error

**If API call fails:**
- Log request/response
- Store error details in memory
- Check for rate limits or auth issues
- Provide clear next steps

**If memory retrieval is slow:**
- Narrow tags
- Check memory server connection
- Fall back to defaults if needed

---

## Workflow Summary

```
START
  ↓
[Retrieve Memory] → Load context for project/client/campaign/tags
  ↓
[Execute Task] → Generate asset using loaded context + new inputs
  ↓
[Validate] → Playwright screenshot + assertions
  ↓
[Pass?] ─NO→ [Fix Issue] → Return to Validate
  ↓ YES
[Persist] → Save artifacts, assertions, screenshots, notes to memory
  ↓
END
```

**This loop is non-negotiable. Follow it every time.**
