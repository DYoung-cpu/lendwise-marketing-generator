# Autonomous Testing & Self-Healing Agent - Instructions

## MISSION
Test 3 templates until they achieve 100% success rate. Learn from failures. Fix prompts automatically. Never break what works.

---

## TEMPLATES TO TEST
1. **Daily Rate Update** (id: `daily-rate-update`)
2. **Market Report** (id: `market-update`)
3. **Rate Trends** (id: `rate-trends`)

---

## TESTING PROTOCOL

### For Each Template:

**ATTEMPT 1:**
1. Open nano-test.html in browser
2. Navigate to template
3. Generate image
4. Save as: `test-[template-name]-attempt1.png`
5. Analyze image (see criteria below)
6. If 100% correct → ✅ DONE, move to next template
7. If errors found → Document errors → ATTEMPT 2

**ATTEMPT 2:**
1. Regenerate same template
2. Save as: `test-[template-name]-attempt2.png`
3. Analyze image
4. If 100% correct → ✅ DONE, move to next template
5. If errors found → Document errors → ATTEMPT 3

**ATTEMPT 3:**
1. Regenerate same template
2. Save as: `test-[template-name]-attempt3.png`
3. Analyze image
4. If 100% correct → ✅ DONE, move to next template
5. If errors found → **INITIATE AUTOMATED FIX**

---

## ANALYSIS CRITERIA (100% = ALL Must Pass)

### ✅ **Text Accuracy**
- [ ] No typos in ANY word
- [ ] Common failures to check:
  - "OUTLOOK" corrupting to "OUTLOK" or "OUTLUK"
  - "MARKET" corrupting to "MAPKATE"
  - "LOAN" corrupting to "LOL"
  - "UPDATE" corrupting to "UPBATE"
- [ ] All words spelled correctly
- [ ] All sentences complete (no cut-off text)

### ✅ **Data Completeness**
**Daily Rate Update:**
- [ ] Header: "Daily Rate Update [Date]"
- [ ] 30-Year rate displayed: "6.38%"
- [ ] Green/red emoji indicator present
- [ ] 3 economic factor bullets visible
- [ ] Each bullet has 🟢 or 🔴 emoji
- [ ] Lock strategy text present
- [ ] Expert insight quote with opening and closing marks
- [ ] Contact: "David Young NMLS 62043 Phone 310-954-7771"

**Market Report:**
- [ ] Header: "Mortgage Market Update [Date]" or "MORTGAGE MARKET UPDATE"
- [ ] 30-Year Fixed rate: "6.38%" with change indicator
- [ ] 15-Year Fixed rate: "5.88%" with change indicator
- [ ] Jumbo rate: "6.29%" with change
- [ ] "Other" line with ARM, FHA, VA rates
- [ ] All percent signs (%) visible
- [ ] Treasury section present
- [ ] Market insight text
- [ ] Expert note quote with opening and closing marks
- [ ] Contact info

**Rate Trends:**
- [ ] Header: "MORTGAGE RATE TRENDS"
- [ ] Current rate: "6.38%" large and prominent
- [ ] 4-Week Range visible
- [ ] 52-Week Range visible
- [ ] Position vs. high visible
- [ ] Trend status (Stable/Volatile)
- [ ] Outlook/Forecast section present (check if "OUTLOOK" corrupted)
- [ ] Commentary quote
- [ ] Contact info

### ✅ **Visual Elements**
- [ ] LendWise logo visible (gold owl)
- [ ] Photo integrated (if uploaded by user)
- [ ] Forest green gradient background
- [ ] Metallic gold accents
- [ ] Design has depth (not flat)
- [ ] Sections have shadows/3D effects
- [ ] Professional Forbes/Bloomberg style

### ✅ **Formatting**
- [ ] No character corruption (0→O, %→")
- [ ] No missing decimal points
- [ ] Green emoji 🟢 is GREEN (not gray)
- [ ] Red emoji 🔴 is RED (not gray)
- [ ] Text readable (not cut off at edges)

---

## ERROR LOGGING

### Create Error Log Entry:
```json
{
  "template": "daily-rate-update",
  "attempt": 1,
  "timestamp": "2025-10-15T05:30:00Z",
  "errors": [
    {
      "type": "typo",
      "issue": "OUTLOOK corrupted to OUTLOK",
      "location": "bottom section",
      "severity": "high"
    },
    {
      "type": "missing_data",
      "issue": "Missing percent sign on ARM rate",
      "location": "Other line",
      "severity": "medium"
    }
  ],
  "success": false
}
```

### Error Types:
- `typo` - Spelling corruption
- `missing_data` - Expected element not present
- `formatting` - Wrong format (decimal, percent, etc.)
- `visual` - Logo missing, photo not integrated, flat design
- `corruption` - Character substitution (0→O, etc.)

---

## PATTERN RECOGNITION

### After Each Test Cycle, Check For Patterns:

**Frequency Analysis:**
```
Word "OUTLOOK" → Failed 3/3 times (100% failure)
Bullet position 4 → Missing % sign 2/3 times (67% failure)
Emoji colors → Failed 1/3 times (33% failure)
```

**Identify Root Causes:**
- Problematic words that consistently corrupt
- Position-based failures (bullet 4+, last section, etc.)
- Complexity issues (too many data points)
- Format issues (specific characters failing)

---

## AUTOMATED FIX PROCESS

### When Template Fails 3 Attempts:

**STEP 1: Analyze Accumulated Errors**
- Review all 3 attempts
- Identify consistent failures
- Determine root cause

**STEP 2: Determine Fix Strategy**

**If Typo/Corruption (e.g., "OUTLOOK" → "OUTLOK"):**
- Replace problematic word with alternative
- Examples:
  - "OUTLOOK" → "FORECAST" or "WHAT'S NEXT"
  - "LOAN" → "FINANCING" or omit word
  - "MARKET UPDATE" → "RATE UPDATE"

**If Missing Data (e.g., missing % sign):**
- Simplify format
- Remove parentheses if on bullet 4+
- Use prose instead of bullet
- Shorten text (under 10 words)

**If Position-Based (e.g., bullet 4 always fails):**
- Reduce total bullets to 3 max
- Move failing content to prose format
- Simplify bullet 4 (no complex formatting)

**If Complexity (too much info):**
- Remove least important data point
- Combine sections
- Simplify language

**STEP 3: Apply Fix**
- Read current prompt function (e.g., `buildDailyRateUpdatePrompt`)
- Identify exact line to modify
- Make minimal change (don't break other parts)
- Document what changed and why

**STEP 4: Protective Checks**
Before applying fix, verify you're NOT:
- ❌ Removing live MND data integration
- ❌ Breaking photo upload
- ❌ Removing emoji indicators
- ❌ Changing 3-bullet safe zone structure
- ❌ Removing critical data (rates, dates, contact)

**STEP 5: Apply & Test**
- Use Edit tool to update nano-test.html
- Refresh browser
- Generate test image
- Analyze result
- If still fails → Document as "unable to fix automatically"
- If succeeds → ✅ Log success and move on

---

## LEARNING DATABASE

### Maintain Knowledge Base:

**File: /mnt/c/Users/dyoun/Active Projects/agent-learning.json**

```json
{
  "problematic_words": {
    "OUTLOOK": {
      "failure_rate": 100,
      "safe_alternative": "FORECAST",
      "last_tested": "2025-10-15"
    },
    "LOAN": {
      "failure_rate": 50,
      "safe_alternative": "FINANCING",
      "last_tested": "2025-10-15"
    }
  },
  "position_failures": {
    "bullet_4": {
      "failure_rate": 67,
      "fix": "Simplify formatting, no parentheses",
      "success_after_fix": 95
    }
  },
  "template_success_rates": {
    "daily-rate-update": {
      "attempts": 5,
      "successes": 5,
      "rate": 100
    },
    "market-update": {
      "attempts": 5,
      "successes": 4,
      "rate": 80
    },
    "rate-trends": {
      "attempts": 5,
      "successes": 3,
      "rate": 60
    }
  },
  "fixes_applied": [
    {
      "timestamp": "2025-10-15T06:00:00Z",
      "template": "rate-trends",
      "issue": "OUTLOOK corruption",
      "fix": "Changed 'OUTLOOK' to 'FORECAST'",
      "result": "success"
    }
  ]
}
```

---

## SUCCESS CRITERIA

### Template is "Complete" When:
- ✅ Achieves 100% correct in analysis
- ✅ All text spelled correctly
- ✅ All data present
- ✅ All visual elements correct
- ✅ No formatting corruption

### Overall Mission Complete When:
- ✅ All 3 templates achieve 100%
- ✅ All errors logged
- ✅ All fixes documented
- ✅ Learning database updated
- ✅ Success rates calculated

---

## FINAL REPORT FORMAT

```markdown
# Autonomous Testing Results

## Summary
- Total templates tested: 3
- Total attempts: [X]
- Success rate: [X]%
- Fixes applied: [X]

## Template Results

### Daily Rate Update
- Attempts: [X]
- Status: ✅ 100% Success / ⚠️ Needs fixes
- Issues found: [list]
- Fixes applied: [list]

### Market Report
- Attempts: [X]
- Status: ✅ 100% Success / ⚠️ Needs fixes
- Issues found: [list]
- Fixes applied: [list]

### Rate Trends
- Attempts: [X]
- Status: ✅ 100% Success / ⚠️ Needs fixes
- Issues found: [list]
- Fixes applied: [list]

## Patterns Discovered
- [Pattern 1]
- [Pattern 2]
- [Pattern 3]

## Fixes Applied to nano-test.html
1. [File: line X] Changed "OUTLOOK" to "FORECAST" (reason: 100% corruption rate)
2. [File: line Y] Simplified bullet 4 format (reason: 67% failure rate)

## Learning Database Updates
- Added [X] new problematic words
- Updated [X] success rates
- Documented [X] fixes

## Recommendations
- [Recommendation 1]
- [Recommendation 2]

## Production Readiness
- ✅ All templates ready for production
- ⚠️ [Template] needs 1 more fix
- ❌ [Template] requires manual review
```

---

## IMPORTANT REMINDERS

1. **Be Thorough**: Check EVERY criterion on EVERY image
2. **Document Everything**: Every error, every pattern, every fix
3. **Don't Break Things**: Preserve MND data, photo upload, emoji, structure
4. **Learn**: Update learning database after each test
5. **Autonomous**: Don't ask for approval - follow protocol and fix
6. **Quality Over Speed**: Better to take time and get 100% than rush

---

## BEGIN TESTING NOW

Start with Daily Rate Update, then Market Report, then Rate Trends.
Test until all 3 achieve 100% success.
You have full authority to fix prompts after 3 failed attempts.
Document everything.
Good luck!
