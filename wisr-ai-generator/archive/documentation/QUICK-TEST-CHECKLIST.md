# 15-Word Formula Bulletproof Test - Quick Checklist

## Pre-Flight

- [ ] Open `bulletproof-test.html` in browser
- [ ] Enter Gemini API key and click "Save Key"
- [ ] Verify logo loaded (check console)

## Test Execution

- [ ] Click "▶ Run All 20 Tests" button
- [ ] Wait for completion (~5-10 minutes)
- [ ] Watch progress bar and stats

## Verification (For Each Image)

- [ ] Click image to view full size
- [ ] Check Section 1: All 15 words spelled correctly?
- [ ] Check Section 2: All 15 words spelled correctly?
- [ ] Check Section 3: All 15 words spelled correctly?
- [ ] Verify contact info: "David Young NMLS 62043 Phone 310-954-7771"
- [ ] Check for word repetition (e.g., "for for")
- [ ] Check for truncated words
- [ ] Mark as ✅ PASS or ❌ FAIL

## Record Errors

If any errors found, note:
- Test number
- Misspelled word(s)
- Which section
- Separation method
- Template type

## Calculate Results

```
Perfect Tests: ___/20
Success Rate: ___%

BATCH 1 (Thin Lines): ___/5
BATCH 2 (Shadow): ___/5
BATCH 3 (Gradient): ___/5
BATCH 4 (Top Border): ___/5

With Photo: ___/15
Without Photo: ___/5
```

## Final Determination

- [ ] **95-100% = ✅ BULLETPROOF** - Production ready!
- [ ] **90-94% = ⚠️ GOOD** - Minor refinement needed
- [ ] **< 90% = ❌ NEEDS WORK** - Significant refinement needed

## Expected Result

**19-20 perfect renders = BULLETPROOF FORMULA ✅**

---

## Quick Error Check

Look for these common mistakes:
- "Navigte" → should be "Navigate"
- "Steedy" → should be "Steady"
- "Contac" → should be "Contact"
- "310-954-771" → should be "310-954-7771"
- "for for" → should be "for"
- "the the" → should be "the"
- Truncated words at end of sections

---

## If Something Goes Wrong

**API Error:**
- Check API key is correct
- Wait 60 seconds and retry
- Check quota not exceeded

**No Images:**
- Verify logo file exists
- Check browser console
- Refresh and try again

**Slow Performance:**
- Normal - 2 second delays between tests
- Do not interrupt while running
- Let it complete fully

---

**Time Required:** 5-10 minutes
**Cost:** ~$0.20-$0.40 (20 API calls)
**Expected Success:** 95-100%
