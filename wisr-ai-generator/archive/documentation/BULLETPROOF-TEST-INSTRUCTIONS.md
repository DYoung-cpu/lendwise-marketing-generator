# 15-Word Formula Bulletproof Test - Execution Instructions

## Overview

This test validates that the **15-word-per-section formula** produces 100% clean text rendering across ALL scenarios with Gemini 2.5 Flash Image.

**Goal:** Achieve 95-100% success rate (19-20 perfect renders out of 20 tests)

---

## Test Coverage

### 20 Systematic Tests Across:
- ✅ **4 Separation Methods:** Thin Lines, Shadow, Gradient Glow, Top Border
- ✅ **3 Production Templates:** Market Update, Rate Trends, Economic Outlook
- ✅ **Photo Variations:** With photo (15 tests) vs Without photo (5 tests)
- ✅ **All sections:** 3 sections × 15 words each = 45 words total

---

## Execution Steps

### 1. Open the Test File

Open `bulletproof-test.html` in your browser:
```bash
# In your browser, navigate to:
file:///mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/bulletproof-test.html
```

### 2. Configure API Key

1. Enter your Gemini API key in the input field at the top
2. Click "Save Key" button
3. Key will be stored in localStorage for future sessions

### 3. Run Tests

**Option A: Run All 20 Tests**
- Click "▶ Run All 20 Tests" button
- Tests will run sequentially with 2-second delays
- Takes approximately 5-10 minutes total

**Option B: Run by Batch**
- Click individual batch buttons:
  - "Run Batch 1 (Thin Lines)" - 5 tests
  - "Run Batch 2 (Shadow)" - 5 tests
  - "Run Batch 3 (Gradient)" - 5 tests
  - "Run Batch 4 (Top Border)" - 5 tests

### 4. Monitor Progress

Watch the live dashboard:
- **Progress Bar:** Visual completion percentage
- **Stats Cards:** Total tests, perfect count, errors, success rate
- **Test Grid:** Individual test status and results

### 5. Verify Text Accuracy

For EACH generated image:

1. **Click the image** to view full size
2. **Check EVERY word** against expected text
3. **Look for common errors:**
   - Misspellings (e.g., "Navigte" instead of "Navigate")
   - Missing letters (e.g., "Contac" instead of "Contact")
   - Word repetition (e.g., "for for" or "the the")
   - Number errors (e.g., "310-954-771" instead of "310-954-7771")

4. **Record any errors immediately**

---

## Test Scenarios

### Batch 1: Thin Lines Method (5 tests)
- Test 1: Market Update, 3×15 words, with photo
- Test 2: Market Update, 3×15 words, no photo
- Test 3: Rate Trends, 3×15 words, with photo
- Test 4: Economic Outlook, 3×15 words, with photo
- Test 5: Custom content, 3×15 words, with photo

### Batch 2: Shadow Method (5 tests)
- Test 6: Market Update, 3×15 words, with photo
- Test 7: Market Update, 3×15 words, no photo
- Test 8: Rate Trends, 3×15 words, with photo
- Test 9: Economic Outlook, 3×15 words, with photo
- Test 10: Custom content, 3×15 words, with photo

### Batch 3: Gradient Glow Method (5 tests)
- Test 11: Market Update, 3×15 words, with photo
- Test 12: Market Update, 3×15 words, no photo
- Test 13: Rate Trends, 3×15 words, with photo
- Test 14: Economic Outlook, 3×15 words, with photo
- Test 15: Custom content, 3×15 words, with photo

### Batch 4: Top Border Method (5 tests)
- Test 16: Market Update, 3×15 words, with photo
- Test 17: Market Update, 3×15 words, no photo
- Test 18: Rate Trends, 3×15 words, with photo
- Test 19: Economic Outlook, 3×15 words, with photo
- Test 20: Custom content, 3×15 words, with photo

---

## Validation Criteria

### What Counts as "Perfect"

✅ **PASS:** All words spelled correctly, no errors
- All 45 words rendered accurately
- No missing or truncated letters
- No word repetition
- Numbers accurate (310-954-7771, NMLS 62043, etc.)

❌ **FAIL:** Any spelling error, no matter how small
- Even one misspelled word = test fails
- Missing letters = test fails
- Word duplication = test fails
- Number errors = test fails

---

## Expected Words Per Test

Each test contains approximately 45 words across 3 sections:

**Common Section 3 (Contact Info):**
- "Contact David Young NMLS 62043 Phone 310-954-7771 for quick response call now or visit our office today"

**Section 1 & 2 vary by template:**
- Market Update: Rate information
- Rate Trends: Market movement analysis
- Economic Outlook: Economic factors
- Custom: Loan program information

---

## Recording Results

### Manual Error Log

For each test with errors, record:

```
Test #X: [Error Details]
- Word misspelled: "Navigte" (should be "Navigate")
- Location: Section 2
- Method: Thin Lines
- Template: Market Update
```

### Calculate Success Rate

```
Success Rate = (Perfect Tests / 20) × 100%

Example:
- 20 perfect tests = 100% ✅ BULLETPROOF
- 19 perfect tests = 95% ✅ BULLETPROOF
- 18 perfect tests = 90% ⚠️ GOOD but not bulletproof
- 17 or less = ❌ Needs refinement
```

---

## Final Report Format

```
BULLETPROOF TEST RESULTS
========================

Total Tests: 20
Perfect Text: X/20 (X%)
Errors Found: Y

BATCH RESULTS:
- BATCH 1 (Thin Lines): X/5 ✅ or ❌
- BATCH 2 (Shadow): X/5 ✅ or ❌
- BATCH 3 (Gradient): X/5 ✅ or ❌
- BATCH 4 (Top Border): X/5 ✅ or ❌

PHOTO BREAKDOWN:
- With Photo: X/15 ✅
- Without Photo: X/5 ✅

TEMPLATE BREAKDOWN:
- Market Update: X/8 tests
- Rate Trends: X/4 tests
- Economic Outlook: X/4 tests
- Custom: X/4 tests

ERROR LOG:
----------
- Test #X: [word misspelled] in [section]
- Test #Y: [word misspelled] in [section]

CONCLUSION:
-----------
✅ BULLETPROOF - Production ready (95-100% success)
OR
❌ NOT BULLETPROOF - Needs refinement (< 95% success)
```

---

## Success Criteria

### BULLETPROOF Status Achieved If:

1. **Success Rate ≥ 95%** (19-20 perfect tests)
2. **No systematic errors** across methods
3. **Consistent performance** with/without photos
4. **All templates validated** (Market Update, Rate Trends, Economic Outlook)

### If < 95% Success:

1. **Analyze error patterns:**
   - Which separation method failed?
   - Which template type failed?
   - With or without photo?
   - Which words consistently fail?

2. **Refine formula:**
   - Reduce word count to 12-13 per section?
   - Add more structural hints?
   - Avoid specific problem words?

3. **Re-run failed tests** to confirm issues

---

## Important Notes

### Photo Testing
- Tests marked "with photo" expect a photo to be uploaded
- For this validation, running without photo is acceptable
- Real production testing should include actual photo uploads

### Rate Limiting
- Tests run with 2-second delays between API calls
- Do not reduce delay to avoid rate limiting
- Total runtime: ~5-10 minutes for all 20 tests

### Image Verification
- Each image can be clicked to view full size
- Zoom in to carefully inspect every word
- Use browser zoom (Ctrl/Cmd +) if needed

### API Costs
- Each test = 1 API call to Gemini 2.5 Flash Image
- 20 tests = 20 API calls
- Estimate: ~$0.20-$0.40 total cost (varies by region)

---

## Troubleshooting

### "Please enter your Gemini API key first!"
- Enter API key in the input field at top
- Click "Save Key" button
- Key must be valid Gemini 2.5 Flash Image API key

### "API Error: 429" (Rate Limit)
- Wait 60 seconds
- Re-run failed tests individually
- Increase delay between tests in code if needed

### "No image in response"
- Check API key is correct
- Verify API quota not exceeded
- Check browser console for detailed error

### Images not loading
- Verify lendwise-logo.png exists in same directory
- Check browser console for 404 errors
- Logo optional but recommended for testing

---

## Next Steps After Testing

### If BULLETPROOF (95-100%):
1. ✅ Mark formula as production-ready
2. ✅ Apply to all remaining templates
3. ✅ Document in main findings file
4. ✅ Create production template library

### If NOT BULLETPROOF (< 95%):
1. 📊 Analyze error patterns thoroughly
2. 🔧 Refine formula based on findings
3. 🧪 Re-run failed scenarios
4. 📝 Update recommendations
5. 🔄 Iterate until 95%+ achieved

---

## File Locations

- **Test HTML:** `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/bulletproof-test.html`
- **Instructions:** `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/BULLETPROOF-TEST-INSTRUCTIONS.md`
- **Findings Doc:** `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/GEMINI-TEXT-RENDERING-FINDINGS.md`
- **Main App:** `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/nano-test.html`

---

## Questions?

Refer to GEMINI-TEXT-RENDERING-FINDINGS.md for:
- Background on the 15-word formula
- Previous test results
- Problem word list
- Working separation methods
- Design best practices

---

**Ready to prove the formula is bulletproof? Let's go! 🚀**
