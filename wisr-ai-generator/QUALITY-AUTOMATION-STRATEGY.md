# Quality Automation Strategy for Marketing Agent

## Overview
Just like ESLint automatically checks code quality, the marketing agent needs automated quality checks for generated marketing content.

## The Problem
- Current success rate: **1.74%** (2/115 generations)
- Manual review is slow and error-prone
- Quality issues repeat across generations
- No automated enforcement of quality standards

## ESLint Parallel: Code Quality → Content Quality

### ESLint for Code
```javascript
// ESLint catches:
- Syntax errors
- Style inconsistencies
- Undefined variables
- Unused imports
- Type errors
```

### Content Validator for Marketing Images
```javascript
// Marketing validator should catch:
- Spelling errors ("PERSONAIIZED" → "PERSONALIZED")
- Missing required sections (Market Drivers, Expert Insight)
- Data completeness (1/3 vs 3/3 economic factors)
- Quote formatting (curly vs straight quotes)
- Logo/branding errors
- Color scheme violations
```

---

## Implementation Strategy

### 1. **Pre-Generation Validation** (ESLint equivalent: Parse-time checks)

**Tool:** `prompt-validator.js`

```javascript
// Before sending prompt to AI, validate:
- All required data fields present
- No placeholder text remaining
- Character limits respected
- Brand assets loaded
- Template structure correct

// Like ESLint's --fix, auto-correct common issues:
- Convert curly quotes to straight quotes
- Trim whitespace
- Normalize capitalization
```

**Integration Point:**
```javascript
// In quality-backend.js generate endpoint
async function generate(req, res) {
  const prompt = req.body.prompt;

  // VALIDATE BEFORE GENERATION
  const validation = await promptValidator.validate(prompt);
  if (!validation.passed) {
    return res.status(400).json({
      error: 'Invalid prompt',
      issues: validation.issues
    });
  }

  // Proceed with generation...
}
```

### 2. **Real-Time Generation Monitoring** (ESLint equivalent: Watch mode)

**Tool:** Playwright MCP + `vision-analyzer.js`

```javascript
// Marketing agent watches generation in real-time:
1. Navigate to localhost:8080/nano-test.html
2. Click Initialize button
3. Wait for generation (check console for completion)
4. Screenshot immediately
5. Run vision-analyzer.js on screenshot
6. If score < 100%, trigger regeneration with specific feedback
7. Repeat until 100% or max attempts (3)
```

**Automation Script:** `autonomous-quality-monitor.js`
```javascript
// Runs continuously like ESLint watch mode
while (true) {
  const generation = await watchForNewGeneration();
  const analysis = await analyzeGeneration(generation);

  if (analysis.score < 100) {
    await regenerateWithFeedback(analysis.errors);
  }

  await saveToMemory(generation, analysis);
}
```

### 3. **Post-Generation Validation** (ESLint equivalent: CI/CD checks)

**Tool:** `content-validator.js` (enhanced vision-analyzer)

```javascript
// After generation completes, run comprehensive checks:
const validation = {
  textAccuracy: checkSpelling(image),
  dataCompleteness: checkRequiredFields(image),
  layoutCorrectness: checkSectionStructure(image),
  brandCompliance: checkLogoAndColors(image),
  visualQuality: checkImageQuality(image)
};

// FAIL if ANY check < 100%
if (validation.overallScore < 100) {
  throw new QualityError(validation);
}
```

**Integration Point:**
```javascript
// Before returning result to user
const validationResult = await contentValidator.validate(generatedImage);

if (!validationResult.passed) {
  // Auto-retry with specific fixes
  return await regenerateWithFixes(validationResult.issues);
}
```

### 4. **Learning System** (ESLint equivalent: Custom rules)

**Tool:** `agent-memory.json` + `rules.md`

```javascript
// Like adding custom ESLint rules, agent learns from failures:
{
  "knownIssues": [
    {
      "pattern": "PERSONAIIZED",
      "fix": "PERSONALIZED",
      "occurrences": 47,
      "preventionRule": "Add explicit spelling to prompt"
    },
    {
      "pattern": "Only 1 of 3 economic factors shown",
      "fix": "Enumerate all 3 factors in prompt",
      "occurrences": 82,
      "preventionRule": "Use bulleted list format"
    }
  ]
}
```

**Auto-Update Prompts:**
```javascript
// Based on learned patterns, auto-enhance prompts
function enhancePrompt(basePrompt) {
  const rules = learningSystem.getActiveRules();

  rules.forEach(rule => {
    if (rule.pattern in basePrompt) {
      basePrompt = applyFix(basePrompt, rule.fix);
    }
  });

  return basePrompt;
}
```

---

## Recommended Tools

### Option 1: Build Custom Validator (Like ESLint Config)
```bash
npm install eslint --save-dev  # For code
# Create similar for content:
npm install @google/generative-ai tesseract.js sharp
```

**Create:** `marketing-content-lint.js`
```javascript
// Define rules like ESLint
const rules = {
  'no-spelling-errors': 'error',
  'require-all-sections': 'error',
  'require-straight-quotes': 'error',
  'brand-logo-present': 'error',
  'data-completeness': 'error'
};

// Run validator
const result = await marketingLint.validate(image, rules);
```

### Option 2: Enhanced Vision Analyzer (Current Approach)

**Upgrade `vision-analyzer.js` to be ESLint-equivalent:**

```javascript
// Add configurable rules (like .eslintrc)
const config = {
  rules: {
    spelling: {
      enabled: true,
      severity: 'error',
      dictionary: ['PERSONALIZED', 'LENDWISE', 'MORTGAGE']
    },
    sections: {
      enabled: true,
      severity: 'error',
      required: ['Market Drivers Today', 'Expert Insight']
    },
    quotes: {
      enabled: true,
      severity: 'error',
      style: 'straight'
    }
  }
};

// Auto-fix mode (like eslint --fix)
const result = await visionAnalyzer.validate(image, {
  fix: true,
  maxAttempts: 3
});
```

### Option 3: Pre-Commit Hook Style (Git Hooks)

**Prevent bad generations from being saved:**

```javascript
// In quality-backend.js
app.post('/api/generate', async (req, res) => {
  const result = await generateImage(req.body);

  // PRE-COMMIT HOOK EQUIVALENT
  const validation = await qualityGate.check(result);

  if (!validation.passed) {
    // BLOCK like git pre-commit hook
    return res.status(422).json({
      error: 'Quality gate failed',
      issues: validation.issues,
      suggestion: 'Fix issues and regenerate'
    });
  }

  // Only save/return if passed quality gate
  await saveResult(result);
  res.json(result);
});
```

---

## Implementation Priorities

### Phase 1: Immediate (This Week)
1. **Add pre-generation validation** to `quality-backend.js`
   - Check all required data present
   - Validate prompt structure
   - Convert curly quotes to straight

2. **Enhance vision-analyzer.js** with strict rules
   - Zero-tolerance for spelling errors
   - Field count validation (3/3 not 1/3)
   - Section presence checks

3. **Enable auto-retry** with specific feedback
   - Max 3 attempts
   - Pass exact error to regeneration
   - Save all attempts to memory

### Phase 2: Near-term (This Month)
1. **Build Playwright monitoring** (`autonomous-quality-monitor.js`)
   - Watch generations in real-time
   - Screenshot on completion
   - Auto-analyze and retry

2. **Create content-lint CLI tool**
   - Similar to `npx eslint`
   - Run `npx marketing-lint image.png`
   - Get detailed quality report

3. **Add learning system integration**
   - Auto-update prompts based on failures
   - Build rule library
   - Track success rate improvements

### Phase 3: Long-term (Next Quarter)
1. **CI/CD style automation**
   - GitHub Actions equivalent
   - Automated testing on every template change
   - Quality score tracking over time

2. **Visual regression testing**
   - Save "golden" perfect images
   - Compare new generations to golden
   - Flag any differences

3. **A/B testing framework**
   - Test prompt variations
   - Measure quality improvements
   - Auto-select best performing prompts

---

## Success Metrics

### Current State
- **Success Rate:** 1.74% (2/115)
- **Avg Attempts:** Unknown (likely 5+)
- **Manual Review:** 100%
- **Known Issues:** 191

### Target State (After Phase 1)
- **Success Rate:** >80%
- **Avg Attempts:** <2
- **Manual Review:** <10%
- **Known Issues:** <20

### Ultimate Goal (After Phase 3)
- **Success Rate:** >95%
- **Avg Attempts:** 1.2
- **Manual Review:** 0% (full automation)
- **Known Issues:** 0 (all prevented by automation)

---

## Marketing Agent Workflow with Automation

### Before (Manual)
```
1. User: "Generate Daily Rate Update"
2. Agent: Navigates to site
3. Agent: Clicks Initialize
4. Agent: Takes screenshot
5. Agent: Manually reviews... finds errors
6. Agent: Clicks Initialize again
7. Agent: Takes screenshot... still has errors
8. Repeat... eventually gives up or delivers flawed result
```

### After (Automated)
```
1. User: "Generate Daily Rate Update"
2. Agent: Validates prompt (pre-generation check)
3. Agent: Starts autonomous-quality-monitor.js
4. Monitor: Watches generation, detects completion
5. Monitor: Screenshots and analyzes instantly
6. Monitor: If <100%, regenerates with specific fixes
7. Monitor: Repeats until 100% (max 3 attempts)
8. Agent: Delivers perfect result with proof
9. Agent: Updates memory with learnings
```

---

## CLI Commands

```bash
# Like running ESLint
npx eslint *.js --fix

# Marketing equivalent
npx marketing-lint generated-image.png --fix

# Watch mode (like ESLint --watch)
npx marketing-lint --watch localhost:8080

# CI mode (fail on errors)
npx marketing-lint --strict generated-image.png

# Config file (like .eslintrc)
npx marketing-lint --config .marketinglintrc generated-image.png
```

---

## Configuration File Example

**`.marketinglintrc.json`** (ESLint equivalent)
```json
{
  "extends": "lendwise-brand-standards",
  "rules": {
    "text-accuracy/no-spelling-errors": "error",
    "text-accuracy/no-typos": "error",
    "data-completeness/require-all-fields": "error",
    "data-completeness/min-economic-factors": [
      "error",
      { "minimum": 3 }
    ],
    "layout/require-section-headers": [
      "error",
      ["Market Drivers Today", "Expert Insight"]
    ],
    "layout/quote-style": ["error", "straight"],
    "brand/logo-present": "error",
    "brand/color-scheme": [
      "error",
      {
        "primary": "#2d5f3f",
        "accent": "#FFD700"
      }
    ],
    "visual/min-quality-score": ["error", 95]
  },
  "overrides": [
    {
      "files": ["Daily Rate Update"],
      "rules": {
        "data-completeness/require-mortgage-rates": "error"
      }
    }
  ]
}
```

---

## Conclusion

By implementing ESLint-style automation for marketing content, we can:

✅ **Prevent** bad generations before they happen
✅ **Detect** issues instantly during generation
✅ **Fix** automatically based on learned patterns
✅ **Learn** from every failure to prevent future issues
✅ **Scale** to handle more templates and variations
✅ **Guarantee** 100% quality before delivery

The key is treating marketing content generation with the same rigor as code quality - automated checks, strict standards, and continuous improvement.
