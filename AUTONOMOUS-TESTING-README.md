# Autonomous Template Testing System

## Overview

Fully automated backend testing system that:
- Generates images via Gemini API (no browser needed)
- Analyzes images using Claude vision API
- Automatically fixes issues after 3 failures
- Learns from mistakes
- Generates comprehensive reports

## Quick Start

```bash
cd "/mnt/c/Users/dyoun/Active Projects"
node autonomous-tester.js
```

That's it! The system runs completely autonomously.

## What It Does

1. **Tests 3 Templates:**
   - Daily Rate Update
   - Market Report
   - Rate Trends

2. **For Each Template:**
   - Attempt 1: Generate → Analyze → Pass/Fail
   - Attempt 2: (if needed) Regenerate → Analyze
   - Attempt 3: (if needed) Regenerate → Analyze
   - Attempt 4: (if still failing) Apply automated fix → Test again

3. **Visual Analysis:**
   - Checks for typos (OUTLOK, MAPKATE, LOL)
   - Verifies all data present
   - Confirms formatting correct
   - Validates design quality

4. **Automated Fixing:**
   - Replaces problematic words
   - Simplifies complex sections
   - Updates prompt-builder.js
   - Retests automatically

5. **Learning System:**
   - Tracks success rates
   - Documents fixes applied
   - Improves over time

## Output

All results saved to: `/mnt/c/Users/dyoun/Active Projects/test-results/`

```
test-results/
├── daily-rate-update/
│   ├── attempt-1.png
│   ├── attempt-2.png
│   └── ...
├── market-report/
│   ├── attempt-1.png
│   └── ...
├── rate-trends/
│   ├── attempt-1.png
│   └── ...
└── FINAL-REPORT.json
```

## Expected Results

**Success Indicators:**
- ✅ All 3 templates pass (100% score)
- 🔧 Automated fixes applied if needed
- 💾 Learning database updated
- 📊 Final report generated

**What You'll See:**
```
🤖 AUTONOMOUS TEMPLATE TESTING SYSTEM
================================================================

📋 TESTING: Daily Rate Update
...
✅ SUCCESS! Template passed all checks.

📋 TESTING: Market Report
...
⚠️ Issues found (Score: 85%)
🔧 All 3 attempts failed. Initiating automated fix...
✅ SUCCESS after fix!

📋 TESTING: Rate Trends
...
✅ SUCCESS! Template passed all checks.

================================================================
📊 FINAL RESULTS
================================================================

⏱️  Duration: 45.2 seconds
📊 Total Attempts: 7
✅ Successful Templates: 3/3
🔧 Fixes Applied: 1

🎉 ALL TEMPLATES PRODUCTION READY!
```

## Requirements

**Environment Variables:**
- `GEMINI_API_KEY` or `GOOGLE_API_KEY` - For image generation
- `ANTHROPIC_API_KEY` - For image analysis

**Verify setup:**
```bash
echo $GEMINI_API_KEY
echo $ANTHROPIC_API_KEY
```

## Files Created

- `gemini-client.js` - Gemini API wrapper
- `vision-analyzer.js` - Claude vision analyzer
- `prompt-builder.js` - Prompt generation functions
- `auto-fixer.js` - Automated fix logic
- `autonomous-tester.js` - Main orchestrator
- `agent-learning.json` - Learning database

## Troubleshooting

**"GEMINI_API_KEY not set"**
```bash
export GEMINI_API_KEY="your-key-here"
```

**"ANTHROPIC_API_KEY not set"**
```bash
export ANTHROPIC_API_KEY="your-key-here"
```

**Image generation fails**
- Check Gemini API quota
- Verify API key is valid
- Check network connection

**Analysis fails**
- Check Anthropic API quota
- Verify API key is valid
- Ensure images were generated successfully

## Advanced Usage

**Test specific template:**
```javascript
const tester = new AutonomousTester();
await tester.testTemplate(tester.templates[0]); // Daily Rate Update only
```

**Adjust retry count:**
Edit `autonomous-tester.js`, change:
```javascript
for (let attempt = 1; attempt <= 3; attempt++) {
```

**Add new template:**
Edit `autonomous-tester.js`, add to `this.templates` array:
```javascript
{
    name: 'Your Template',
    buildPrompt: () => PromptBuilder.buildYourPrompt(this.marketData),
    outputDir: 'test-results/your-template'
}
```

## Learning Database

`agent-learning.json` tracks:
- Problematic words and alternatives
- Success rates per template
- Fixes applied with timestamps
- Confidence scores

Gets updated automatically after each run.

## Next Steps After Testing

**If all tests pass:**
- Templates are production-ready
- Deploy to main application
- Monitor real-world performance

**If some tests fail:**
- Review generated images in test-results/
- Check FINAL-REPORT.json for details
- Share problematic images with Claude for manual analysis
- Apply additional fixes as needed

## Performance

**Typical Run:**
- 3 templates × 3 attempts max = 9 generations
- Each generation: ~3-5 seconds
- Each analysis: ~2-3 seconds
- Total time: ~45-60 seconds (if all need retries)
- Best case: ~15-20 seconds (all pass first try)

## Support

Issues? Check:
1. API keys are set correctly
2. Network connection is stable
3. Quota limits not exceeded
4. Generated images in test-results/
5. FINAL-REPORT.json for error details

---

**Built with ❤️ for LendWise Marketing Automation**
