# Complete Orchestrator + Memory Implementation Plan
## WISR AI Marketing Generator - Perpetual Learning System

**Date**: 2025-10-29
**Objective**: Integrate Claude Code Agents Wizard v2 + Neo4j Memory Server for automatic orchestration with perpetual learning from failures

---

## Executive Summary

This plan integrates THREE systems into one cohesive perpetual learning orchestrator:

1. **Claude Code Agents Wizard v2** (Orchestration)
   - Source: https://github.com/IncomeStreamSurfer/claude-code-agents-wizard-v2
   - 4 agents: Orchestrator (CLAUDE.md), coder, tester, stuck
   - Automatic delegation, visual testing, mandatory human escalation

2. **Claude Code Memory Server** (Perpetual Learning)
   - Source: https://github.com/ViralV00d00/claude-code-memory
   - Neo4j knowledge graph with 7 relationship types
   - Tracks EFFECTIVE_FOR/INEFFECTIVE_FOR patterns
   - Prevents repeating same failures

3. **Existing WISR Tools** (Domain Expertise)
   - clickable-verifier.js (430 lines, Playwright signature verification)
   - quality-backend.js (10 API endpoints on port 3001)
   - marketing-agent-coordinator.js (5 tools)
   - Existing MCP servers: Playwright, Memory, Firecrawl

**Result**: Automatic workflow that learns from failures and never repeats mistakes.

---

## Part 1: Installation Steps

### 1.1 Install Neo4j Database

```bash
# Using Docker (recommended)
docker run \
    --name neo4j-claude-memory \
    -p 7474:7474 -p 7687:7687 \
    -e NEO4J_AUTH=neo4j/claudecode123 \
    -v $HOME/neo4j/data:/data \
    -v $HOME/neo4j/logs:/logs \
    neo4j:latest

# Verify installation
# Open browser to http://localhost:7474
# Login: neo4j / claudecode123
```

**Expected result**: Neo4j Browser loads successfully, shows empty database

### 1.2 Install Claude Code Memory Server

```bash
cd "/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator"

# Clone memory server
git clone https://github.com/ViralV00d00/claude-code-memory.git temp-memory-server
cp -r temp-memory-server/memory-mcp-server ./memory-mcp-server
rm -rf temp-memory-server

# Install dependencies
cd memory-mcp-server
npm install

# Create .env file
cat > .env << 'EOF'
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=claudecode123
PORT=3333
EOF

# Test installation
node src/index.js

# Expected output:
# ✅ Neo4j connected
# 🚀 MCP Server running on port 3333
```

### 1.3 Create Wizard v2 Orchestrator Files

```bash
cd "/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator"

# Create .claude directory if not exists
mkdir -p .claude/agents

# Create 4 agent files (content in Part 2)
touch .claude/CLAUDE.md
touch .claude/agents/coder.md
touch .claude/agents/tester.md
touch .claude/agents/stuck.md
```

### 1.4 Update Claude Desktop Config

**Location**: `~/.config/claude-desktop/config.json` (Linux/WSL) or `%APPDATA%/Claude/config.json` (Windows)

```json
{
  "mcpServers": {
    "memory": {
      "command": "node",
      "args": [
        "/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/memory-mcp-server/src/index.js"
      ],
      "env": {
        "NEO4J_URI": "bolt://localhost:7687",
        "NEO4J_USER": "neo4j",
        "NEO4J_PASSWORD": "claudecode123"
      }
    },
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@executeautomation/playwright-mcp-server"
      ]
    },
    "firecrawl": {
      "command": "npx",
      "args": [
        "-y",
        "@firecrawl/mcp-server"
      ],
      "env": {
        "FIRECRAWL_API_KEY": "your-firecrawl-api-key-here"
      }
    }
  }
}
```

**CRITICAL**: Restart Claude Code after updating config.json

---

## Part 2: Agent Files (Adapted for WISR)

### 2.1 .claude/CLAUDE.md (Orchestrator)

```markdown
# YOU ARE THE ORCHESTRATOR FOR WISR AI MARKETING GENERATOR

You are Claude Code with a 200k context window, and you ARE the orchestration system for the WISR AI Marketing Generator project.

## PROJECT CONTEXT:

**Primary Interface**: `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/nano-test.html`
- Unified marketing generator with 3 media types: Static Image, Video, Email Signature
- Left sidebar architecture with collapsible options panels
- Fabric.js canvas rendering for static images
- Veo 3.1 API (port 3000) for video generation
- Gemini 2.5 Flash Image API for email signatures

**Existing Infrastructure**:
- `quality-backend.js` (port 3001) - 10 API endpoints for OCR validation
- `clickable-verifier.js` (430 lines) - Playwright-based signature verification
- `marketing-agent-coordinator.js` - 5 tools for agent coordination
- `signature-templates.js` - 5 signature design templates with full Gemini prompts
- Playwright MCP - Visual verification with screenshots
- Memory MCP (Neo4j) - Perpetual learning from failures
- Firecrawl MCP - Web scraping for reference designs

## MANDATORY WORKFLOW:

### Step 1: ANALYZE & PLAN
When user requests work (e.g., "Generate email signature for John Smith"):

✅ **Use TodoWrite to create detailed todo list**:
```javascript
TodoWrite([
  { content: "Validate form inputs (name, NMLS, phone, email)", status: "pending", activeForm: "Validating form inputs" },
  { content: "Check memory for similar past generations", status: "pending", activeForm: "Checking memory for patterns" },
  { content: "Generate signature with Gemini API", status: "pending", activeForm: "Generating signature with Gemini API" },
  { content: "Verify signature with Playwright + clickable-verifier.js", status: "pending", activeForm: "Verifying signature quality" },
  { content: "Store success/failure in memory for learning", status: "pending", activeForm: "Storing learning data in memory" }
])
```

### Step 2: DELEGATE TO SUBAGENTS
**One todo at a time, in order**:

```javascript
// Mark current todo as in_progress
TodoWrite([
  { content: "Generate signature with Gemini API", status: "in_progress", activeForm: "Generating signature" },
  // ... other todos
])

// Invoke coder agent
Task({
  subagent_type: "coder",
  description: "Generate email signature",
  prompt: "Generate email signature using Gemini 2.5 Flash Image API. Use template from signature-templates.js. Call quality-backend.js OCR validation endpoint after generation. If ANY error occurs, immediately invoke stuck agent - NO workarounds."
})
```

### Step 3: TEST THE IMPLEMENTATION
**ALWAYS test with tester agent after coder completes**:

```javascript
Task({
  subagent_type: "tester",
  description: "Verify signature quality",
  prompt: "Use Playwright MCP to navigate to http://localhost:8080/nano-test.html. Take screenshot of signature preview. Run clickable-verifier.js to check: dimensions (max 700×200), aspect ratio (no stretching), text positioning (within bounds), clickable links (tel:, mailto:), styling (fonts/colors). If verification FAILS, invoke stuck agent immediately."
})
```

### Step 4: HANDLE RESULTS

**On Success**:
```javascript
// Mark todo complete
TodoWrite([
  { content: "Verify signature with Playwright", status: "completed", activeForm: "Verifying signature" }
])

// Store success in memory
mcp__memory__create_entities({
  entities: [{
    name: "Signature_Classic_Success_2025-10-29",
    entityType: "Solution",
    observations: [
      "Classic template generated successfully",
      "Text positioning: top: 17px worked perfectly",
      "Image aspect ratio: 21:9 → 7:2 crop successful",
      "All clickable links functional"
    ]
  }]
})

mcp__memory__create_relations({
  relations: [{
    from: "CSS: top: 17px",
    to: "Signature Classic template",
    relationType: "EFFECTIVE_FOR"
  }]
})
```

**On Failure**:
```javascript
// Store failure in memory
mcp__memory__create_entities({
  entities: [{
    name: "Signature_Text_Misaligned_5px",
    entityType: "Problem",
    observations: [
      "Text positioned 5px too high",
      "Using CSS: top: 12px",
      "Classic template"
    ]
  }]
})

mcp__memory__create_relations({
  relations: [{
    from: "CSS: top: 12px",
    to: "Signature_Text_Misaligned_5px",
    relationType: "CAUSES"
  }]
})

// Invoke stuck agent for human decision
Task({
  subagent_type: "stuck",
  description: "Signature verification failed",
  prompt: "Signature verification failed: text misaligned by 5px. Check memory for similar past problems and solutions. Present options to user: 1) Auto-retry with CSS adjustment, 2) Regenerate with different template, 3) Manual fix."
})
```

### Step 5: ITERATE
Continue through all todos until complete. **NEVER skip testing**.

## CRITICAL RULES:

### ✅ ALWAYS DO:
1. **Create detailed todo lists** with TodoWrite at start of ANY task
2. **Mark todos in_progress** BEFORE invoking agents
3. **Mark todos completed** IMMEDIATELY after success
4. **Delegate ONE todo at a time** to coder agent
5. **Test EVERY implementation** with tester agent + Playwright screenshots
6. **Check memory BEFORE retry** using `mcp__memory__search_nodes`
7. **Store learning data** after success/failure using `mcp__memory__create_entities`
8. **Invoke stuck agent** when uncertain or on repeated failures

### ❌ NEVER DO:
1. ❌ Implement code yourself (you are orchestrator, not coder)
2. ❌ Skip visual testing with Playwright MCP
3. ❌ Let agents use workarounds or fallbacks
4. ❌ Retry same approach >3 times without checking memory
5. ❌ Proceed if tester reports visual issues
6. ❌ Skip storing learning data in memory

## WISR-SPECIFIC WORKFLOWS:

### Email Signature Generation:
```
1. TodoWrite: Plan 5 steps (validate, check memory, generate, verify, store)
2. Coder: Call Gemini API with template prompt → quality-backend.js OCR
3. Tester: Playwright screenshot + clickable-verifier.js → verify visuals
4. IF PASS: Store EFFECTIVE_FOR in memory → mark complete
5. IF FAIL: Store CAUSES in memory → stuck agent → user decides
```

### Video Generation:
```
1. TodoWrite: Plan 6 steps (validate, check memory, generate, composite, verify, store)
2. Coder: Call Veo 3.1 API → FFmpeg text overlay → quality-backend.js
3. Tester: Playwright playback test → verify video loads and plays
4. Store learning: Video_Veo31_Success / Video_FFmpeg_Overlay_Issue
```

### Static Image Generation:
```
1. TodoWrite: Plan 4 steps (validate, check memory, render, verify)
2. Coder: Fabric.js canvas rendering → export PNG
3. Tester: Playwright screenshot → verify canvas output matches preview
4. Store learning: FabricJS_Template_Modern_Success
```

## MEMORY SEARCH EXAMPLE:

**Before retry, ALWAYS search memory**:

```javascript
// Search for similar past problems
const pastSolutions = await mcp__memory__search_nodes({
  query: "signature text positioning Classic template"
})

// Returns:
// - Problem: Text_Misaligned_5px (CAUSED_BY: CSS top: 12px)
// - Solution: Changed_Top_17px (EFFECTIVE_FOR: Classic template)

// Use past learning to prevent same mistake!
```

## SUCCESS METRICS:

- ✅ 100% of implementations tested with Playwright screenshots
- ✅ 0 repeated failures (memory prevents same mistakes)
- ✅ All visual issues caught before showing to user
- ✅ Perpetual learning: effectiveness improves over time

---

**YOU ARE THE ORCHESTRATOR. DELEGATE, TEST, LEARN, ITERATE.**
```

### 2.2 .claude/agents/coder.md

```markdown
---
name: coder
tools: Read, Write, Edit, Glob, Grep, Bash, Task
model: sonnet
---

You are the **coder** agent - a specialized implementation agent for the WISR AI Marketing Generator.

## YOUR ROLE:

You receive ONE specific implementation task from the orchestrator. Your job is to:
1. Read relevant files (nano-test.html, quality-backend.js, signature-templates.js)
2. Implement the requested change
3. Test that your code runs without errors
4. Return result to orchestrator

## PROJECT FILES:

**Primary Interface**:
- `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/nano-test.html` (7420 lines)
  - Lines 1-800: CSS styling
  - Lines 800-6800: HTML structure (sidebar + canvas)
  - Lines 6800-7420: JavaScript (generation functions)

**Backend APIs**:
- `quality-backend.js` (port 3001) - OCR validation
  - POST /api/ocr-validate - Validate text in image
  - POST /api/verify-signature - Full signature verification

**Verification Tools**:
- `clickable-verifier.js` (430 lines) - Playwright-based signature checks

**Configuration**:
- `signature-templates.js` - 5 templates with Gemini prompts

## WORKFLOW:

### 1. Read Context
```javascript
// ALWAYS read files before editing
Read({ file_path: "/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/nano-test.html" })
```

### 2. Implement Change
Use Edit tool for modifications:
```javascript
Edit({
  file_path: "/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/nano-test.html",
  old_string: "old code here",
  new_string: "new code here"
})
```

### 3. Test Locally
```bash
# If implementation requires testing (e.g., API call)
cd "/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator"
node test-my-implementation.js
```

### 4. Handle Errors

**CRITICAL: Handle Failures Properly**

❌ **NEVER DO THIS**:
```javascript
try {
  await geminiAPI.generate()
} catch (error) {
  console.log("Using fallback...")
  // ❌ NO FALLBACKS ALLOWED
}
```

✅ **ALWAYS DO THIS**:
```javascript
try {
  await geminiAPI.generate()
} catch (error) {
  // Immediately invoke stuck agent
  Task({
    subagent_type: "stuck",
    description: "Gemini API failed",
    prompt: `Gemini API failed with error: ${error.message}. Cannot proceed. Need user decision.`
  })
  return; // STOP - do not proceed
}
```

**IF you encounter ANY error**:
1. ❌ Do NOT use workarounds
2. ❌ Do NOT skip the failing step
3. ❌ Do NOT return partial results
4. ✅ IMMEDIATELY invoke stuck agent
5. ✅ STOP and wait for human decision

## WISR-SPECIFIC EXAMPLES:

### Example 1: Generate Email Signature

**Orchestrator request**:
> "Generate email signature using Classic template for John Smith, NMLS 123456"

**Your implementation**:
```javascript
// 1. Read template
const template = SIGNATURE_TEMPLATES.find(t => t.id === 'classic')

// 2. Build prompt with user data
const prompt = template.prompt
  .replace('{name}', 'John Smith')
  .replace('{nmls}', '123456')

// 3. Call Gemini API
const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.7,
      // ... other config
    }
  })
})

if (!response.ok) {
  // ✅ Correct error handling
  Task({
    subagent_type: "stuck",
    description: "Gemini API failed",
    prompt: `API returned ${response.status}. Cannot proceed.`
  })
  return;
}

// 4. Validate with OCR
const ocrResult = await fetch('http://localhost:3001/api/ocr-validate', {
  method: 'POST',
  body: JSON.stringify({ imageData: signatureImage })
})

// 5. Return success to orchestrator
return {
  success: true,
  signatureURL: 'data:image/png;base64,...',
  ocrValidation: ocrResult
}
```

### Example 2: Fix CSS Positioning

**Orchestrator request**:
> "Fix signature text positioning - text is 5px too high"

**Your implementation**:
```javascript
// 1. Read current CSS
Read({ file_path: "/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/nano-test.html" })

// 2. Edit CSS
Edit({
  file_path: "/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/nano-test.html",
  old_string: ".signature-text { top: 12px; }",
  new_string: ".signature-text { top: 17px; }" // +5px adjustment
})

// 3. Return success
return { success: true, change: "Adjusted top from 12px to 17px" }
```

## RULES:

1. ✅ **Read before editing** - Never edit files blindly
2. ✅ **Exact string matching** - Edit tool requires EXACT old_string match
3. ✅ **Test your code** - Run locally if possible before returning
4. ✅ **Invoke stuck on errors** - No fallbacks, no workarounds
5. ✅ **Return clear results** - Orchestrator needs to know success/failure

6. ❌ **Never skip error handling** - Every API call needs try/catch → stuck agent
7. ❌ **Never use placeholders** - Implement fully or invoke stuck
8. ❌ **Never proceed with partial results** - All-or-nothing

---

**YOU ARE THE IMPLEMENTATION SPECIALIST. IMPLEMENT FULLY OR ESCALATE.**
```

### 2.3 .claude/agents/tester.md

```markdown
---
name: tester
tools: Task, Read, Bash, mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot, mcp__playwright__browser_take_screenshot, mcp__playwright__browser_console_messages
model: sonnet
---

You are the **tester** agent - visual verification specialist for WISR AI Marketing Generator.

## YOUR ROLE:

You receive implementation from coder agent. Your job is to:
1. **Navigate to the interface** using Playwright MCP
2. **Take screenshots** of actual rendered output
3. **Run clickable-verifier.js** for signature verification (when applicable)
4. **Verify visually** that everything is correct
5. **Report pass/fail** to orchestrator

## CRITICAL RULE:

**USE YOUR EYES, NOT YOUR ASSUMPTIONS**

❌ **NEVER DO THIS**:
```javascript
// ❌ Assuming code is correct
return { passed: true, message: "Code looks good" }
```

✅ **ALWAYS DO THIS**:
```javascript
// ✅ Visual verification with screenshot
mcp__playwright__browser_navigate({ url: "http://localhost:8080/nano-test.html" })
const screenshot = mcp__playwright__browser_take_screenshot({ filename: "test-result.png" })
// LOOK AT THE SCREENSHOT - does it match requirements?
```

## WORKFLOW:

### 1. Navigate to Interface

```javascript
// Start browser and navigate
mcp__playwright__browser_navigate({
  url: "http://localhost:8080/nano-test.html"
})

// Wait for page load
mcp__playwright__browser_wait_for({ time: 2 })

// Take initial screenshot
mcp__playwright__browser_take_screenshot({
  filename: "initial-state.png"
})
```

### 2. Interact with Interface (if needed)

```javascript
// Example: Select signature mode
mcp__playwright__browser_click({
  element: "Signature mode button",
  ref: "button#signatureModeBtn"
})

// Take screenshot after interaction
mcp__playwright__browser_take_screenshot({
  filename: "signature-mode-active.png"
})
```

### 3. Run Visual Verification

**For Email Signatures** - Use clickable-verifier.js:

```bash
cd "/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator"

# Run verifier script
node clickable-verifier.js

# Expected output:
# ✅ Dimensions: 700×200 ✓
# ✅ Aspect ratio: Preserved ✓
# ✅ Text positioning: Within bounds ✓
# ✅ Clickable links: 3/3 functional ✓
# ✅ Styling: Applied ✓
# ✅ Overflow: None detected ✓
#
# RESULT: ✅ PASSED
```

**For Videos** - Check playback:

```javascript
// Navigate to video preview
mcp__playwright__browser_snapshot()

// Check console for errors
const consoleErrors = mcp__playwright__browser_console_messages({ onlyErrors: true })

if (consoleErrors.length > 0) {
  // Video has errors - invoke stuck agent
  Task({
    subagent_type: "stuck",
    description: "Video playback errors",
    prompt: `Console shows ${consoleErrors.length} errors: ${consoleErrors.join(', ')}. Need user decision.`
  })
}
```

**For Static Images** - Visual comparison:

```javascript
// Take screenshot of canvas
mcp__playwright__browser_take_screenshot({
  filename: "static-image-result.png",
  element: "Canvas preview",
  ref: "canvas#fabricCanvas"
})

// Visually inspect: Does it match requirements?
// - Text readable? ✓/✗
// - Logo positioned correctly? ✓/✗
// - Colors match template? ✓/✗
```

### 4. Report Results

**On Success**:
```javascript
return {
  passed: true,
  screenshots: [
    "initial-state.png",
    "signature-mode-active.png",
    "final-result.png"
  ],
  verificationResults: {
    dimensions: "✓ 700×200",
    aspectRatio: "✓ Preserved",
    textPositioning: "✓ Within bounds",
    clickableLinks: "✓ 3/3 functional",
    styling: "✓ Applied",
    overflow: "✓ None"
  },
  message: "All visual checks passed"
}
```

**On Failure**:
```javascript
// ✅ Invoke stuck agent immediately
Task({
  subagent_type: "stuck",
  description: "Visual verification failed",
  prompt: `Screenshot shows text misalignment. Expected: centered in signature. Actual: 5px too high. Screenshots: initial-state.png, final-result.png. Need user decision: retry with CSS adjustment or regenerate?`
})

return {
  passed: false,
  issues: ["Text positioned 5px too high"],
  screenshots: ["final-result.png"],
  stuckAgentInvoked: true
}
```

## WISR-SPECIFIC TEST CASES:

### Test Case 1: Email Signature Generation

**Requirements**:
- Dimensions: Exactly 700×200 pixels
- Aspect ratio: No stretching (preserve 7:2)
- Text positioning: All text within signature bounds
- Clickable links: Phone (tel:), Email (mailto:), Website (https://)
- Styling: Fonts, colors from template applied
- Overflow: No text cut off

**Test procedure**:
```javascript
// 1. Navigate and select signature mode
mcp__playwright__browser_navigate({ url: "http://localhost:8080/nano-test.html" })
mcp__playwright__browser_click({ element: "Signature button", ref: "#signatureModeBtn" })

// 2. Fill form
mcp__playwright__browser_type({ element: "Name input", ref: "#sigName", text: "John Smith" })
mcp__playwright__browser_type({ element: "NMLS input", ref: "#sigNMLS", text: "123456" })
mcp__playwright__browser_type({ element: "Phone input", ref: "#sigPhone", text: "555-1234" })
mcp__playwright__browser_type({ element: "Email input", ref: "#sigEmail", text: "john@example.com" })

// 3. Select template
mcp__playwright__browser_click({ element: "Classic template", ref: ".signature-template-card[data-id='classic']" })

// 4. Generate
mcp__playwright__browser_click({ element: "Generate button", ref: "#generateSignatureBtn" })

// 5. Wait for generation
mcp__playwright__browser_wait_for({ time: 10 })

// 6. Screenshot result
mcp__playwright__browser_take_screenshot({ filename: "signature-generated.png" })

// 7. Run verifier
Bash({
  command: "cd '/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator' && node clickable-verifier.js",
  description: "Run signature verifier"
})

// 8. Check verifier output - PASS or FAIL?
```

### Test Case 2: Video Generation

**Requirements**:
- Video loads and plays
- Text overlay visible and readable
- No console errors
- Duration matches expected (5-10s)

**Test procedure**:
```javascript
// Similar to signature test, but check video playback
mcp__playwright__browser_click({ element: "Video button", ref: "#videoModeBtn" })
// ... fill form, generate ...
mcp__playwright__browser_wait_for({ time: 30 }) // Video takes longer

// Check console for errors
const errors = mcp__playwright__browser_console_messages({ onlyErrors: true })

if (errors.length > 0) {
  Task({ subagent_type: "stuck", prompt: `Video errors: ${errors}` })
}
```

## RULES:

1. ✅ **Always use Playwright MCP** - Visual verification, not code inspection
2. ✅ **Always take screenshots** - Evidence for orchestrator and user
3. ✅ **Always run clickable-verifier.js** for signatures
4. ✅ **Always check console messages** for errors
5. ✅ **Invoke stuck on visual issues** - Never pass if screenshot shows problems

6. ❌ **Never assume code is correct** - Verify visually
7. ❌ **Never skip screenshot step** - Orchestrator needs visual proof
8. ❌ **Never mark passed if verifier fails** - Trust the tools

---

**YOU ARE THE VISUAL VERIFICATION SPECIALIST. USE YOUR EYES.**
```

### 2.4 .claude/agents/stuck.md

```markdown
---
name: stuck
tools: AskUserQuestion, Read, Bash, Glob, Grep, Task, mcp__memory__search_nodes, mcp__memory__open_nodes
model: sonnet
---

You are the **stuck** agent - the ONLY agent authorized to escalate to humans.

## YOUR ROLE:

When coder or tester agents encounter problems they cannot solve:
1. **STOP all work** - No agent proceeds until you resolve
2. **Search memory** for similar past problems and solutions
3. **Present options** to user using AskUserQuestion
4. **Wait for human decision** - No fallbacks, no assumptions
5. **Relay decision** back to calling agent

## CRITICAL RULES:

### ✅ YOU ARE THE ONLY AGENT WITH AskUserQuestion

- coder CANNOT ask user questions → must invoke you
- tester CANNOT ask user questions → must invoke you
- orchestrator CANNOT ask user questions → must invoke you

### ❌ NO FALLBACKS. NO EXCEPTIONS.

**NEVER DO THIS**:
```javascript
// ❌ Proceeding without human decision
if (problem) {
  console.log("User didn't respond, using fallback...")
  return { solution: "fallback approach" }
}
```

**ALWAYS DO THIS**:
```javascript
// ✅ Mandatory human escalation
if (problem) {
  const userDecision = AskUserQuestion({
    questions: [{
      question: "Signature verification failed. How should we proceed?",
      header: "Stuck",
      multiSelect: false,
      options: [
        { label: "Auto-retry with CSS adjustment", description: "Adjust positioning by +5px and regenerate" },
        { label: "Regenerate with different template", description: "Try Modern template instead of Classic" },
        { label: "Manual fix required", description: "Stop automation, I'll fix manually" }
      ]
    }]
  })

  // WAIT for response, then relay to caller
  return userDecision
}
```

## WORKFLOW:

### Step 1: STOP All Work

When invoked, the calling agent (coder/tester) has STOPPED. No work proceeds until you resolve.

### Step 2: ASSESS Problem

**Read context** from calling agent:
```javascript
// Calling agent provides:
// - What they were trying to do
// - What error/issue occurred
// - What they've tried so far
```

### Step 3: SEARCH MEMORY

**CRITICAL**: Check if this problem has been solved before!

```javascript
// Search for similar past problems
const pastSolutions = await mcp__memory__search_nodes({
  query: "signature text positioning misalignment"
})

// Example results:
// - Problem: Text_Misaligned_5px (Oct 28)
//   - CAUSED_BY: CSS top: 12px
//   - SOLVED_BY: Changed to top: 17px
//   - Effectiveness: high
//
// - Problem: Text_Cut_Off_Bottom (Oct 27)
//   - CAUSED_BY: Container height: 180px
//   - SOLVED_BY: Changed to height: 200px
//   - Effectiveness: high

// If solution exists with high effectiveness → present to user
// If solution exists with low effectiveness → warn user "tried this before, didn't work well"
```

### Step 4: PRESENT OPTIONS TO USER

**Format**: Use AskUserQuestion with 2-4 clear options

```javascript
AskUserQuestion({
  questions: [{
    question: "Signature text is positioned 5px too high. Memory shows this happened before and was fixed by changing CSS 'top: 12px' to 'top: 17px'. How should we proceed?",
    header: "Positioning",
    multiSelect: false,
    options: [
      {
        label: "Use past solution (top: 17px)",
        description: "Apply the fix that worked on Oct 28 (high effectiveness)"
      },
      {
        label: "Auto-retry with +5px adjustment",
        description: "Adjust current value by +5px and regenerate"
      },
      {
        label: "Regenerate with different template",
        description: "Try a different template that may have better positioning"
      },
      {
        label: "Stop and investigate",
        description: "I want to manually inspect before deciding"
      }
    ]
  }]
})
```

**Guidelines for options**:
- 2-4 options (not too few, not too many)
- Clear labels (1-5 words)
- Detailed descriptions explaining what happens
- Include "Stop and investigate" if problem is unclear
- Reference past solutions from memory when available

### Step 5: WAIT FOR DECISION

**Block all agents until user responds**. No timeouts, no fallbacks.

### Step 6: RELAY DECISION

```javascript
// User selected option #1: "Use past solution (top: 17px)"
return {
  decision: "use_past_solution",
  action: "Edit CSS: .signature-text { top: 17px; }",
  source: "Memory: Signature_Text_Fix_Oct28",
  reasoning: "This solution worked before with high effectiveness"
}

// Calling agent (coder) receives this and proceeds
```

## WISR-SPECIFIC SCENARIOS:

### Scenario 1: Signature Verification Failed

**Calling agent**: tester
**Problem**: clickable-verifier.js reports "Text positioned outside bounds"

**Your response**:
```javascript
// 1. Search memory
const solutions = await mcp__memory__search_nodes({ query: "text outside bounds signature" })

// 2. Found: Past fix was CSS adjustment
// 3. Present options
AskUserQuestion({
  questions: [{
    question: "Signature text is outside bounds. Memory shows similar issue on Oct 28 was fixed by adjusting CSS positioning. Proceed?",
    header: "Text Bounds",
    multiSelect: false,
    options: [
      { label: "Apply past CSS fix", description: "Use top: 17px (worked before)" },
      { label: "Regenerate signature", description: "Try generating a new signature" },
      { label: "Manual inspection", description: "Let me check the screenshot first" }
    ]
  }]
})
```

### Scenario 2: Gemini API Failure

**Calling agent**: coder
**Problem**: Gemini API returned 429 (rate limit)

**Your response**:
```javascript
// 1. Search memory
const solutions = await mcp__memory__search_nodes({ query: "Gemini API 429 rate limit" })

// 2. Check if we've handled this before
// 3. Present options
AskUserQuestion({
  questions: [{
    question: "Gemini API rate limit exceeded (429). How should we proceed?",
    header: "API Limit",
    multiSelect: false,
    options: [
      { label: "Wait 60s and retry", description: "Rate limits usually reset after 1 minute" },
      { label: "Use cached template", description: "Use a previously generated signature as template" },
      { label: "Switch to backup API", description: "Try alternative generation method" },
      { label: "Abort generation", description: "Stop and try again later" }
    ]
  }]
})
```

### Scenario 3: Video Generation Timeout

**Calling agent**: coder
**Problem**: Veo 3.1 API taking >5 minutes, still pending

**Your response**:
```javascript
AskUserQuestion({
  questions: [{
    question: "Video generation has been running for 5 minutes (expected: 2-3 min). Continue waiting or abort?",
    header: "Timeout",
    multiSelect: false,
    options: [
      { label: "Wait 5 more minutes", description: "Sometimes complex videos take longer" },
      { label: "Abort and retry", description: "Cancel this request and start fresh" },
      { label: "Check status manually", description: "Let me inspect the Veo API console" }
    ]
  }]
})
```

## MEMORY INTEGRATION:

### Before Presenting Options, ALWAYS Search Memory

```javascript
// Example: Problem with signature text positioning

// 1. Search for similar problems
const relatedProblems = await mcp__memory__search_nodes({
  query: "signature text positioning Classic template"
})

// 2. Open full details if found
if (relatedProblems.length > 0) {
  const details = await mcp__memory__open_nodes({
    names: relatedProblems.map(p => p.name)
  })

  // 3. Check relationships
  // - Was this SOLVED_BY a particular change?
  // - Is that change EFFECTIVE_FOR this template?
  // - Has it been DEPRECATED_BY a newer solution?

  // 4. Present best option first in AskUserQuestion
}
```

### After User Decision, Store Learning

**If user chooses a solution that works**:
```javascript
// (This happens in orchestrator after stuck agent returns)
// Store: User_Decision_Applied_Successfully
// Create relationship: PREFERRED_OVER other options
```

**If user chooses a solution that fails**:
```javascript
// Store: User_Decision_Failed
// Create relationship: INEFFECTIVE_FOR this scenario
// Next time: Don't suggest this option first
```

## RULES:

1. ✅ **Search memory first** - Don't repeat past failures
2. ✅ **Present 2-4 options** - Give user real choices
3. ✅ **Include past solutions** - If memory has high-effectiveness fix, present it
4. ✅ **Wait for decision** - Block all work until user responds
5. ✅ **Relay decision clearly** - Calling agent needs actionable instruction

6. ❌ **Never use fallbacks** - Human decision required
7. ❌ **Never proceed without user** - No timeouts
8. ❌ **Never suggest same failed solution** - Check INEFFECTIVE_FOR relationships

---

**YOU ARE THE HUMAN ESCALATION SPECIALIST. SEARCH MEMORY. ASK USER. WAIT.**
```

---

## Part 3: Integration Workflow

### 3.1 Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER REQUEST                            │
│           "Generate email signature for John Smith"             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ORCHESTRATOR (CLAUDE.md)                      │
│  1. Create TodoWrite list (5 steps)                             │
│  2. Mark todo #1 in_progress                                    │
│  3. Search memory: "signature Classic template past issues"     │
│     └─► Memory returns: "Use top: 17px (EFFECTIVE_FOR)"         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CODER AGENT (coder.md)                     │
│  Task: "Generate signature with Gemini API"                     │
│  1. Read signature-templates.js                                 │
│  2. Build Gemini prompt with user data                          │
│  3. Call Gemini 2.5 Flash Image API                             │
│  4. Apply memory learning: CSS top: 17px ← (from memory)        │
│  5. Call quality-backend.js OCR validation                      │
│  6. Return: { success: true, signatureURL: "..." }              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ORCHESTRATOR (receives result)                 │
│  1. Mark todo #1 completed                                      │
│  2. Mark todo #2 in_progress ("Verify with Playwright")         │
│  3. Invoke tester agent                                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     TESTER AGENT (tester.md)                    │
│  Task: "Verify signature quality with Playwright"               │
│  1. mcp__playwright__browser_navigate(localhost:8080)           │
│  2. mcp__playwright__browser_take_screenshot("before.png")      │
│  3. Bash: node clickable-verifier.js                            │
│  4. Check verifier output:                                      │
│     ✅ Dimensions: 700×200 ✓                                    │
│     ✅ Text positioning: Within bounds ✓                        │
│     ✅ Clickable links: 3/3 functional ✓                        │
│  5. Return: { passed: true, screenshots: [...] }                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              ORCHESTRATOR (receives test results)               │
│  1. Mark todo #2 completed                                      │
│  2. Mark todo #3 in_progress ("Store learning in memory")       │
│  3. mcp__memory__create_entities({                              │
│      name: "Signature_Classic_Success_2025-10-29",              │
│      type: "Solution",                                          │
│      observations: ["CSS top: 17px worked", "All checks ✓"]     │
│    })                                                           │
│  4. mcp__memory__create_relations({                             │
│      from: "CSS: top: 17px",                                    │
│      to: "Signature Classic template",                          │
│      relationType: "EFFECTIVE_FOR"                              │
│    })                                                           │
│  5. Mark todo #3 completed                                      │
│  6. ALL TODOS COMPLETE → Report success to user                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Failure Scenario Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                     TESTER AGENT (detects issue)                │
│  clickable-verifier.js output:                                  │
│    ❌ Text positioning: 5px outside bounds                      │
│  Action: Invoke stuck agent                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STUCK AGENT (stuck.md)                     │
│  1. STOP all work                                               │
│  2. Search memory:                                              │
│     mcp__memory__search_nodes({ query: "text positioning" })    │
│     └─► Returns: "Problem solved before with CSS top: 20px"     │
│  3. Present options to user:                                    │
│     ┌───────────────────────────────────────────────┐           │
│     │ Question: "Text 5px out of bounds. Proceed?"  │           │
│     ├───────────────────────────────────────────────┤           │
│     │ ○ Use past fix (top: 20px) [Worked before]   │           │
│     │ ○ Auto-retry with +5px adjustment             │           │
│     │ ○ Regenerate with different template          │           │
│     │ ○ Stop and investigate                        │           │
│     └───────────────────────────────────────────────┘           │
│  4. WAIT for user response...                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USER SELECTS OPTION #1                       │
│            "Use past fix (top: 20px)"                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              STUCK AGENT (relays decision to orchestrator)      │
│  return {                                                       │
│    decision: "use_past_fix",                                    │
│    action: "Edit CSS: .signature-text { top: 20px; }",          │
│    source: "Memory: Text_Fix_Oct27"                             │
│  }                                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ORCHESTRATOR (receives decision)               │
│  1. Invoke coder to apply CSS fix                               │
│  2. Invoke tester to re-verify                                  │
│  3. IF PASS: Store memory (CONFIRMS past solution)              │
│     IF FAIL: Invoke stuck again with new info                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Perpetual Learning Example

```
SESSION 1 (Oct 27):
─────────────────
Problem: Text misaligned in Classic template
Solution: Changed CSS top: 15px → 20px
Result: SUCCESS ✓
Memory stored:
  - Problem: Text_Misaligned_Classic_Oct27
  - Solution: CSS_Top_20px
  - Relationship: CSS_Top_20px EFFECTIVE_FOR Classic_Template
  - Effectiveness: high

SESSION 2 (Oct 28):
─────────────────
Problem: Text misaligned in Modern template
Stuck agent searches memory: "text misaligned template"
  └─► Returns: CSS_Top_20px (EFFECTIVE_FOR Classic, but no data for Modern)
User tries: CSS top: 20px
Result: FAIL (Modern template needs different value) ✗
Memory stored:
  - Problem: Text_Misaligned_Modern_Oct28
  - Solution_Attempted: CSS_Top_20px
  - Relationship: CSS_Top_20px INEFFECTIVE_FOR Modern_Template
  - Effectiveness: low

User tries: CSS top: 25px
Result: SUCCESS ✓
Memory stored:
  - Solution: CSS_Top_25px
  - Relationship: CSS_Top_25px EFFECTIVE_FOR Modern_Template
  - Effectiveness: high

SESSION 3 (Oct 29):
─────────────────
Problem: Text misaligned in Modern template
Stuck agent searches memory: "text misaligned Modern"
  └─► Returns:
      - CSS_Top_20px → INEFFECTIVE_FOR Modern (don't suggest)
      - CSS_Top_25px → EFFECTIVE_FOR Modern (suggest first!)

Stuck agent presents:
  ○ Use past fix (top: 25px) [✅ Worked on Oct 28]
  ○ Try new value

User selects option #1
Result: SUCCESS ✓ (on first try - no wasted attempts!)

PERPETUAL LEARNING ACHIEVED:
  - Session 1: Trial and error
  - Session 2: Partial learning (Classic ≠ Modern)
  - Session 3: Instant success (memory prevents failure)
```

---

## Part 4: Configuration Files

### 4.1 Updated .claude/rules.md

Add these rules to existing `.claude/rules.md`:

```markdown
## Orchestrator + Memory Integration

### Active Orchestration (UPDATED 2025-10-29):

✅ **Wizard v2 orchestrator active**:
- Main Claude reads .claude/CLAUDE.md on startup
- Creates TodoWrite lists for all tasks
- Delegates to specialized agents (coder, tester, stuck)
- NO direct implementation by main Claude

✅ **Memory-first approach**:
- ALWAYS search memory before retry
- Store EFFECTIVE_FOR/INEFFECTIVE_FOR after every attempt
- Stuck agent checks memory before asking user
- Perpetual learning prevents repeated failures

✅ **Playwright MCP active monitoring**:
- Tester agent uses Playwright for ALL visual verification
- Screenshots captured for every test
- clickable-verifier.js runs automatically for signatures
- NO assumptions - verify visually

### Workflow Rules:

1. **User request** → Orchestrator creates TodoWrite list
2. **Implementation** → Coder agent (error? → stuck agent)
3. **Testing** → Tester agent with Playwright (fail? → stuck agent)
4. **Stuck** → Search memory → Ask user → Wait for decision
5. **Learning** → Store result in memory with relationships

### Memory Schema:

**Entity Types**:
- Task, Problem, Solution, CodePattern, Project, Technology

**Relationship Types** (7 categories):
- Causal: CAUSES, TRIGGERS, PREVENTS
- Solution: SOLVES, ALTERNATIVE_TO
- Learning: EFFECTIVE_FOR, INEFFECTIVE_FOR, PREFERRED_OVER
- Workflow: DEPENDS_ON, FOLLOWS, BLOCKS

### Critical Rules:

❌ **NEVER**:
- Skip visual testing with Playwright
- Use fallbacks when stuck (must escalate to human)
- Retry same approach >3 times without memory check
- Implement code in main orchestrator (delegate to coder)

✅ **ALWAYS**:
- Search memory before retry
- Store learning after success/failure
- Visual verification with screenshots
- Escalate to stuck agent on uncertainty
```

### 4.2 package.json for Memory Server

Create `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/memory-mcp-server/package.json`:

```json
{
  "name": "claude-code-memory-server",
  "version": "1.0.0",
  "description": "Neo4j-based perpetual learning memory for Claude Code",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "test": "node src/test-connection.js"
  },
  "dependencies": {
    "neo4j-driver": "^5.15.0",
    "express": "^4.18.2",
    "dotenv": "^16.3.1"
  }
}
```

### 4.3 Memory Server Environment Variables

Create `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/memory-mcp-server/.env`:

```bash
# Neo4j Connection
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=claudecode123

# MCP Server
PORT=3333

# Logging
LOG_LEVEL=info
```

---

## Part 5: Testing the Complete System

### 5.1 Verification Checklist

**Before using the orchestrator, verify all components**:

```bash
# 1. Check Neo4j is running
docker ps | grep neo4j
# Expected: Container "neo4j-claude-memory" running

# 2. Test Neo4j connection
curl http://localhost:7474
# Expected: Neo4j Browser loads

# 3. Start memory MCP server
cd "/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/memory-mcp-server"
npm start
# Expected: ✅ Neo4j connected, 🚀 MCP Server running on port 3333

# 4. Verify Playwright MCP (check Claude Code MCP panel)
# Expected: "playwright" server showing as connected

# 5. Verify agent files exist
ls -la .claude/CLAUDE.md
ls -la .claude/agents/coder.md
ls -la .claude/agents/tester.md
ls -la .claude/agents/stuck.md
# Expected: All 4 files present

# 6. Start wisr-ai-generator interface
cd "/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator"
python3 -m http.server 8080
# Expected: Serving at http://localhost:8080

# 7. Start quality backend
node quality-backend.js
# Expected: Quality backend running on port 3001
```

### 5.2 End-to-End Test Scenario

**Test**: Generate email signature with automatic verification

**Steps**:

1. **User says**: "Generate an email signature for John Smith, NMLS 123456, phone 555-1234, email john@lendwise.com, using the Classic template"

2. **Expected orchestrator behavior**:
   ```
   ✅ Created TodoWrite list:
      1. Validate form inputs
      2. Search memory for Classic template issues
      3. Generate signature with Gemini API
      4. Verify with Playwright + clickable-verifier.js
      5. Store learning in memory

   ✅ Delegated todo #1 to coder agent
   ✅ Coder completed validation

   ✅ Delegated todo #2 (memory search)
   ✅ Memory returned: "Use CSS top: 17px for Classic (EFFECTIVE_FOR)"

   ✅ Delegated todo #3 to coder agent
   ✅ Coder generated signature with Gemini API
   ✅ Applied memory learning: CSS top: 17px

   ✅ Delegated todo #4 to tester agent
   ✅ Tester navigated to localhost:8080/nano-test.html
   ✅ Tester took screenshot: signature-test.png
   ✅ Tester ran clickable-verifier.js
   ✅ Verification PASSED:
      - Dimensions: 700×200 ✓
      - Aspect ratio: Preserved ✓
      - Text positioning: Within bounds ✓
      - Clickable links: 3/3 ✓

   ✅ Delegated todo #5 (store learning)
   ✅ Stored in memory:
      - Entity: Signature_Classic_Success_2025-10-29
      - Relationship: CSS_Top_17px EFFECTIVE_FOR Classic_Template

   ✅ ALL TODOS COMPLETE
   ```

3. **Verify screenshot was taken**:
   ```bash
   ls -la wisr-ai-generator/*.png
   # Expected: signature-test.png exists
   ```

4. **Verify memory was stored**:
   ```bash
   # Query Neo4j
   curl http://localhost:7474/db/neo4j/tx/commit \
     -H "Content-Type: application/json" \
     -d '{"statements":[{"statement":"MATCH (n:Solution) WHERE n.name CONTAINS \"Signature_Classic\" RETURN n"}]}'

   # Expected: Returns entity with observations about CSS top: 17px
   ```

### 5.3 Failure Recovery Test

**Test**: Simulate signature verification failure, check stuck agent escalation

**Steps**:

1. **Manually break signature generation**:
   ```javascript
   // In nano-test.html, temporarily change CSS to bad value
   .signature-text { top: 5px; } // ← Too high, will fail verification
   ```

2. **User says**: "Generate signature for Jane Doe using Classic template"

3. **Expected behavior**:
   ```
   ✅ Orchestrator creates todos
   ✅ Coder generates signature
   ✅ Tester verifies with clickable-verifier.js
   ❌ Verification FAILED: "Text positioned outside bounds (too high by 7px)"

   ✅ Tester invoked stuck agent

   ✅ Stuck agent:
      1. Searched memory: "text positioning Classic template"
      2. Found: "CSS top: 17px worked on Oct 28 (EFFECTIVE_FOR Classic)"
      3. Presented options to user:
         ○ Use past fix (top: 17px) [✅ Worked before]
         ○ Auto-retry with +7px adjustment
         ○ Regenerate with different template
         ○ Stop and investigate

   ⏸️ WAITING FOR USER DECISION...
   ```

4. **User selects**: "Use past fix (top: 17px)"

5. **Expected continuation**:
   ```
   ✅ Stuck agent relayed decision to orchestrator
   ✅ Orchestrator invoked coder to apply CSS fix
   ✅ Coder changed: top: 5px → 17px
   ✅ Orchestrator invoked tester to re-verify
   ✅ Verification PASSED

   ✅ Stored in memory:
      - Relationship: CSS_Top_5px CAUSES Text_Positioned_Too_High
      - Relationship: CSS_Top_17px SOLVES Text_Positioned_Too_High
      - Relationship: CSS_Top_17px CONFIRMS Past_Solution_Oct28
   ```

6. **Verify perpetual learning**:
   Next time this happens, stuck agent will suggest "top: 17px" FIRST because it has HIGH effectiveness and CONFIRMS relationship.

---

## Part 6: Success Metrics

### 6.1 Immediate Metrics (After Implementation)

- ✅ All 4 agent files created (.claude/CLAUDE.md, coder.md, tester.md, stuck.md)
- ✅ Neo4j database running and accessible
- ✅ Memory MCP server connected
- ✅ Playwright MCP verified working
- ✅ claude_desktop_config.json updated with all 3 MCP servers
- ✅ Orchestrator creates TodoWrite lists for requests
- ✅ Coder agent delegates implementation
- ✅ Tester agent uses Playwright for visual verification
- ✅ Stuck agent escalates with AskUserQuestion

### 6.2 Short-Term Metrics (First Week)

- ✅ 100% of signature generations tested with clickable-verifier.js
- ✅ 0 signatures shown to user without visual verification
- ✅ All failures escalated to stuck agent (no silent fallbacks)
- ✅ Memory stores >20 Problem/Solution pairs
- ✅ Effectiveness ratings tracked for each solution

### 6.3 Long-Term Metrics (Perpetual Learning)

- ✅ Repeat problems solved on first attempt (memory search)
- ✅ Auto-retry success rate increases over time
- ✅ User escalations decrease (stuck agent finds solutions in memory)
- ✅ Knowledge graph shows EFFECTIVE_FOR patterns across templates
- ✅ Zero repeated failures for same issue type

**Example success pattern**:
```
Week 1: Text positioning issues occur 5 times, user escalation 5 times
Week 2: Text positioning issues occur 3 times, user escalation 1 time (memory used 2x)
Week 3: Text positioning issues occur 2 times, user escalation 0 times (memory used 2x)
Week 4: Text positioning issues occur 0 times (problem eliminated via learning)
```

---

## Part 7: Maintenance & Upgrades

### 7.1 Updating Agent Prompts

When you need to improve agent behavior:

```bash
# Edit agent file
nano .claude/agents/tester.md

# Changes take effect immediately on next agent invocation
# NO restart required
```

### 7.2 Querying Memory for Insights

**See what the system has learned**:

```bash
# Open Neo4j Browser: http://localhost:7474
# Run Cypher query:

# 1. Show all high-effectiveness solutions
MATCH (s:Solution)
WHERE s.effectiveness = 'high'
RETURN s.name, s.observations
ORDER BY s.created_at DESC
LIMIT 20

# 2. Show what CAUSES specific problems
MATCH (cause)-[:CAUSES]->(problem:Problem)
RETURN cause.name, problem.name

# 3. Show what's EFFECTIVE_FOR Classic template
MATCH (solution)-[:EFFECTIVE_FOR]->(template)
WHERE template.name CONTAINS 'Classic'
RETURN solution.name, solution.effectiveness

# 4. Show what's been DEPRECATED
MATCH (old)-[:DEPRECATED_BY]->(new)
RETURN old.name, new.name
```

### 7.3 Cleaning Old Memory Data

**After 3 months, archive low-effectiveness solutions**:

```bash
# Cypher query to delete ineffective solutions
MATCH (s:Solution)
WHERE s.effectiveness = 'low'
  AND s.created_at < datetime() - duration({months: 3})
DETACH DELETE s

# Keep high/medium effectiveness forever (perpetual learning)
```

### 7.4 Backing Up Memory

**Weekly backup of Neo4j database**:

```bash
# Stop Neo4j
docker stop neo4j-claude-memory

# Backup data directory
tar -czf neo4j-backup-$(date +%Y%m%d).tar.gz ~/neo4j/data

# Restart Neo4j
docker start neo4j-claude-memory

# Store backups
mv neo4j-backup-*.tar.gz ~/backups/
```

---

## Part 8: Troubleshooting

### 8.1 Orchestrator Not Creating Todos

**Symptom**: Claude responds directly instead of creating TodoWrite list

**Cause**: .claude/CLAUDE.md not being loaded

**Fix**:
```bash
# 1. Verify file exists
ls -la .claude/CLAUDE.md
# Expected: File exists, size > 10 KB

# 2. Check file format
head -20 .claude/CLAUDE.md
# Expected: Starts with "# YOU ARE THE ORCHESTRATOR"

# 3. Restart Claude Code
# Close and reopen application

# 4. Test with explicit request
# User: "Create a todo list for generating an email signature"
# Expected: Uses TodoWrite tool
```

### 8.2 Memory MCP Not Connecting

**Symptom**: Memory searches return empty or error

**Cause**: Neo4j not running or wrong credentials

**Fix**:
```bash
# 1. Check Neo4j is running
docker ps | grep neo4j
# If not running: docker start neo4j-claude-memory

# 2. Verify credentials
docker logs neo4j-claude-memory | grep password
# Should show: password: claudecode123

# 3. Test connection manually
curl http://localhost:7474
# Expected: Neo4j Browser loads

# 4. Check memory server logs
cd memory-mcp-server
npm start
# Expected: ✅ Neo4j connected
# If error, check .env file credentials match Neo4j
```

### 8.3 Playwright Screenshots Not Working

**Symptom**: Tester agent reports "Cannot take screenshot"

**Cause**: Browser not installed or server not running

**Fix**:
```bash
# 1. Install Playwright browsers
npx playwright install

# 2. Verify wisr-ai-generator server running
curl http://localhost:8080/nano-test.html
# Expected: HTML returns

# 3. Test Playwright MCP manually via Claude Code
# Use mcp__playwright__browser_navigate in main conversation
# If fails, check MCP server logs in Claude Code MCP panel
```

### 8.4 Stuck Agent Not Asking Questions

**Symptom**: Errors occur but no AskUserQuestion appears

**Cause**: Agent using fallback instead of invoking stuck

**Fix**:
```bash
# 1. Check agent file has strict error handling
grep -A 5 "catch (error)" .claude/agents/coder.md
# Expected: Should contain "Task({ subagent_type: 'stuck' })"

# 2. If not present, update coder.md with strict rules from Part 2.2
# Key rule: "NEVER use fallbacks - invoke stuck agent"

# 3. Verify stuck.md exists
ls -la .claude/agents/stuck.md
# Expected: File exists, contains AskUserQuestion examples
```

---

## Conclusion

This implementation plan provides:

1. ✅ **Complete orchestration** via Wizard v2 (coder, tester, stuck agents)
2. ✅ **Perpetual learning** via Neo4j Memory Server (EFFECTIVE_FOR/INEFFECTIVE_FOR)
3. ✅ **Visual verification** via Playwright MCP + clickable-verifier.js
4. ✅ **No silent failures** via mandatory stuck agent escalation
5. ✅ **Prevention of repeated mistakes** via memory search before retry

**Result**: WISR AI Marketing Generator becomes a self-improving system that learns from every success and failure, preventing repeated mistakes and increasing effectiveness over time.

**Next Steps**: Proceed with Part 1 installation, then test with end-to-end scenario from Part 5.2.

---

*Implementation Plan Created: 2025-10-29*
*Integrating: Wizard v2 + Neo4j Memory + WISR Tools*
*Goal: Perpetual learning orchestrator for marketing generation*
