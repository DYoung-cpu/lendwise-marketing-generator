# Marketing Template Redesign Plan
**Problem**: All templates show the same content with minor wording changes
**Solution**: Each template serves a distinct marketing purpose with unique content

---

## Template Comparison Matrix

| Template | Current (❌ Generic) | Redesigned (✅ Distinct) | Unique Content Source |
|----------|---------------------|-------------------------|----------------------|
| **Market Report** | "Rates are 6.13%" | Multi-rate data grid | All loan types (30yr, 15yr, Jumbo, FHA, VA, ARM) |
| **Rate Alert** | "Rates are 6.13%" | Urgency + milestone | "Lowest in a year!" / "Rates jumped 0.25%" |
| **Economic Outlook** | "Rates are 6.13%" | Big picture context | Fed policy, inflation trends, predictions |
| **Daily Rate Update** | "Rates are 6.13%" | Clean, consistent numbers | Simple daily snapshot (same format daily) |
| **Market Analysis** | "Rates are 6.13%" | Expert commentary | Technical analysis (bonds, MBS, spreads) |
| **Timing Guidance** | "Rates are 6.13%" | Action recommendation | "Lock now" vs "Wait for Fed" |

---

## Detailed Template Redesigns

### 1. Market Report (Data-Focused Snapshot)
**Purpose**: Comprehensive rate overview for clients comparing options

**Unique Content**:
```
CURRENT RATES - October 28, 2025

30-Year Fixed:  6.13%  ▼ 0.06%
15-Year Fixed:  5.45%  ▼ 0.03%
Jumbo:          6.38%  ▼ 0.08%
FHA:            5.95%  ▼ 0.04%
VA:             5.75%  ▼ 0.05%
ARM (5/1):      5.25%  ▼ 0.02%
```

**Visual Style**: Clean data grid, professional, Bloomberg-style
**Call-to-Action**: "Compare your options with David Young"

---

### 2. Rate Alert (Urgency + Action)
**Purpose**: Break through noise with timely, actionable news

**Unique Content**:
```
🚨 RATE ALERT: LOWEST IN A YEAR!

Rates hit 6.13% - lowest since Sept 2024
This won't last - Fed meets tomorrow
Lock your rate before volatility hits
```

**Visual Style**: Bold, high-contrast, alert design with warning colors
**Call-to-Action**: "Lock your rate today before opportunity closes"

---

### 3. Economic Outlook (Big Picture Context)
**Purpose**: Position you as a market expert, not just a loan officer

**Unique Content**:
```
MARKET OUTLOOK: Fed Decision Tomorrow

What's Driving Rates:
• Fed cutting rates (confirmed)
• Bond yields improving
• Inflation moderating

What's Next:
Fed announcement at 2pm could move rates
EITHER direction - volatility expected
```

**Visual Style**: Editorial, charts/graphs, Forbes-style
**Call-to-Action**: "Stay ahead with expert guidance"

---

### 4. Daily Rate Update (Simple, Clean, Consistent)
**Purpose**: Reliable daily touchpoint, builds trust through consistency

**Unique Content**:
```
TODAY'S RATE
October 28, 2025

30-Year Fixed
6.13%
Down 0.06%
```

**Visual Style**: Minimalist, same layout every day, stock ticker aesthetic
**Call-to-Action**: "Track daily with David Young NMLS 62043"

---

### 5. Market Analysis (Deep Dive Commentary)
**Purpose**: Sophisticated clients want technical insights

**Unique Content**:
```
TECHNICAL ANALYSIS

Bond Market: UMBS 30YR up +0.10
Treasury 10yr down -0.031
Spread tightening = lower rates

Why It Matters:
Yesterday's bond gains finally reached
mortgage rates today. Similar pattern
forming - expect another drop tomorrow.
```

**Visual Style**: Professional, Wall Street Journal editorial
**Call-to-Action**: "Get institutional-grade insights"

---

### 6. Timing Guidance (NEW - Action Recommendation)
**Purpose**: Answer "Should I lock now or wait?"

**Unique Content**:
```
LOCK OR WAIT?

Current Rate: 6.13% (excellent)
Tomorrow: Fed announcement = volatility
Recommendation: Lock today

Reasoning:
✓ Already at year lows
✓ Fed won't improve mortgage rates
✗ Risk of sudden spike
```

**Visual Style**: Decision matrix, traffic light colors (red/yellow/green)
**Call-to-Action**: "Lock your rate with confidence"

---

## Implementation Strategy

### Phase 1: Backend Data Enrichment
Current `/api/market-data` returns:
```json
{
  "rates": { "30yr": "6.13%" },
  "changes": { "30yr": "-0.06%" },
  "date": "October 28, 2025"
}
```

**Need to add**:
```json
{
  "rates": { /* all 6 loan types */ },
  "headline": "Lowest Rates in a Year",
  "prediction": "Fed Announcement Could Push Them EITHER Direction",
  "context": "lowest it's been since September 2024",
  "timing": "lock_recommended",
  "bondData": {
    "umbs30": "+0.10",
    "treasury10": "-0.031"
  },
  "economicDrivers": [
    "Fed cutting rates (confirmed)",
    "Bond yields improving",
    "Inflation moderating"
  ]
}
```

### Phase 2: Update quality-backend.js
Add new scraping functions:
- `scrapeHeadline()` - Extract main story
- `scrapePrediction()` - Extract forward-looking commentary
- `scrapeContext()` - Extract historical comparisons
- `scrapeBondData()` - Extract MBS/Treasury prices
- `scrapeEconomicDrivers()` - Extract key market factors

### Phase 3: Template-Specific Content Mapping
Update nano-test.html templates to request specific content:

```javascript
templates = [
  {
    id: "market-report",
    contentNeeded: ["rates", "changes", "date"],
    format: "data_grid"
  },
  {
    id: "rate-alert",
    contentNeeded: ["headline", "urgency", "timing"],
    format: "alert_design"
  },
  {
    id: "economic-outlook",
    contentNeeded: ["prediction", "economicDrivers", "context"],
    format: "editorial_analysis"
  },
  // ... etc
]
```

---

## Success Metrics

**Current State**: All templates → same image
**Target State**: Each template → visually AND content distinct

**Measuring Success**:
1. Can user tell templates apart without reading text? (Visual distinction)
2. Does each template serve a different client need? (Purpose distinction)
3. Would you send different templates to different clients? (Usefulness distinction)

**Expected Results**:
- Market Report → Clients comparing loan types
- Rate Alert → Hot leads who need urgency
- Economic Outlook → Sophisticated/wealthy clients
- Daily Update → Everyone (daily touchpoint)
- Market Analysis → Real estate investors, high-net-worth
- Timing Guidance → Fence-sitters needing a push

---

## Next Steps

1. ✅ Document current problem (completed)
2. ⏳ Update backend to scrape rich content
3. ⏳ Redesign template prompts with specific content
4. ⏳ Test each template generates visually distinct images
5. ⏳ Validate with /marketing agent review
