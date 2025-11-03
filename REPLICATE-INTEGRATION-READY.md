# ✅ REPLICATE INTEGRATION - NOW READY

## Issues Fixed

### 1. Frontend-Backend Connection
**Problem:** Frontend calling old Gemini endpoint
**Fix:** Updated `marketing-crm.html` line 6255 to call `/api/generate-quality`
**Status:** ✅ FIXED

### 2. Model Reference Format
**Problem:** Passing only version hash instead of full `owner/name:version` format
**Fix:** Updated `orchestrator-v2.js` line 376 to use full model reference
**Status:** ✅ FIXED

### 3. Invalid Model Versions
**Problem:** Model versions were outdated/invalid (imagen-3 not available)
**Fix:** Updated to only use verified working models with correct versions
**Status:** ✅ FIXED

## Current Working Setup

### Active Models (Verified Working)

1. **flux-schnell** (DEFAULT for text rendering)
   - ID: `black-forest-labs/flux-schnell`
   - Version: `c846a69991daf4c0e5d016514849d14ee5b2e6846ce6b9d6f21369e564cfe51e`
   - Best for: Text rendering, NMLS IDs, fast generation, free-tier friendly
   - Cost: $0.003 per image

2. **flux-dev** (Quality priority)
   - ID: `black-forest-labs/flux-dev`
   - Version: `6e4a938f85952bdabcc15aa329178c4d681c52bf25a0342403287dc26944661d`
   - Best for: Balanced quality, general purpose
   - Cost: $0.02 per image

3. **sdxl** (Cost priority)
   - ID: `stability-ai/sdxl`
   - Version: `7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc`
   - Best for: Cost-effective generation
   - Cost: $0.002 per image

### Model Selection Logic

```javascript
// From orchestrator-v2.js:384-410

selectOptimalModel(prompt, requirements) {
    const promptLower = prompt.toLowerCase();

    // Text/NMLS detection - use flux-schnell (fast, free-tier friendly)
    if (requirements.needs_text ||
        /nmls|id#|text|number|rate|\d{4,}/.test(promptLower)) {
        return 'flux-schnell';  // ← Changed from imagen-3
    }

    // Speed priority
    if (requirements.speed_priority) {
        return 'flux-schnell';
    }

    // Quality priority - use flux-dev (best available)
    if (requirements.quality_priority) {
        return 'flux-dev';  // ← Changed from flux-1.1-pro
    }

    // Cost priority
    if (requirements.cost_priority) {
        return 'sdxl';
    }

    // Default: balanced flux-dev
    return 'flux-dev';
}
```

### For Marketing Materials
Frontend sends:
```javascript
requirements: {
    width: 1080,
    height: 1350,
    needs_text: true,      // ← Triggers flux-schnell
    quality_priority: true  // ← Would trigger flux-dev if needs_text was false
}
```

**Expected Model:** `flux-schnell` (because `needs_text: true`)

## System Status

### Running Services
- ✅ Backend API: http://localhost:3001 (PID 40738)
- ✅ Frontend UI: http://localhost:8080
- ✅ Master Orchestrator: ACTIVE
- ✅ Replicate Models: 3 verified working models
- ✅ Supabase Memory: CONNECTED
- ⚠️  Redis Cache: Not available (gracefully handled)

### Health Check
```bash
$ curl http://localhost:3001/api/health
{"status":"ok","service":"Quality-Guaranteed Image Generator","timestamp":"2025-11-02T15:36:31.537Z"}
```

## Testing Instructions

### 1. Refresh Browser
Open http://localhost:8080 and **hard refresh** (Ctrl+Shift+R or Cmd+Shift+R)

### 2. Generate Test Image
Use this prompt:
```
Daily rate update with NMLS ID# 62043
Professional mortgage marketing
```

### 3. Expected Behavior

**Frontend Console:**
```
🎯 Using Replicate with Quality Control Loop (Orchestrator v2)
```

**Backend Logs:**
```
🎯 HIGH-QUALITY GENERATION WITH ORCHESTRATOR
📸 Using model: flux-schnell
📡 Model reference: black-forest-labs/flux-schnell:c846a69991daf4c0e5d016514849d14ee5b2e6846ce6b9d6f21369e564cfe51e
✅ Image generated: https://replicate.delivery/pbxt/...
```

**Expected Time:** 10-30 seconds
**Expected Cost:** $0.003 per image

### 4. What to Check

✅ **Success Indicators:**
- No 422 error (invalid version)
- No 500 error (internal server error)
- Model reference shows correct version
- Image is generated and displayed
- Backend logs show Replicate URL

❌ **Potential Issues:**
- **429 Error (Rate Limiting):** This means your Replicate account needs a payment method added
  - Solution: Visit https://replicate.com/account/billing
  - Add a payment method to increase rate limits
- **Network Error:** Check if Replicate API is accessible from your network

## Rate Limiting Notice

Your Replicate account currently has:
- **Rate Limit:** 6 requests per minute (burst of 1)
- **Restriction:** "Request was throttled... until you add a payment method"

**To Remove Rate Limits:**
1. Visit https://replicate.com/account/billing
2. Add a payment method
3. Rate limits will increase significantly

**Free Tier Workaround:**
- Wait 10 seconds between requests
- Use flux-schnell (cheapest at $0.003 per image)

## Debugging Commands

### Check backend is running
```bash
curl http://localhost:3001/api/health
```

### Watch backend logs
```bash
tail -f /tmp/quality-backend.log
```

### Test model availability
```bash
cd "/mnt/c/Users/dyoun/Active Projects"
node test-replicate-models.js
```

### Check Replicate account
```bash
curl -H "Authorization: Token $REPLICATE_API_TOKEN" https://api.replicate.com/v1/account
```

## Files Modified

1. **marketing-crm.html** (line 6255)
   - Changed: `/api/generate` → `/api/generate-quality`
   - Changed log message to mention Replicate

2. **orchestrator-v2.js** (lines 64-85, 374-379, 384-410)
   - Updated model registry to only include 3 working models
   - Updated version IDs to current working versions
   - Changed model reference format to `owner/name:version`
   - Updated selectOptimalModel to use flux-schnell for text

3. **quality-backend.js** (no changes needed)
   - Already has `/api/generate-quality` endpoint
   - Already calls orchestrator correctly

## Success Criteria

✅ System is ready when:
1. Frontend calls `/api/generate-quality`
2. Backend uses correct model reference format
3. Replicate API responds successfully (no 422 errors)
4. Image is generated and displayed
5. Backend logs show full request flow

---

**Last Updated:** November 2, 2025
**Status:** READY FOR TESTING
**Next Step:** Test generation at http://localhost:8080

**Known Limitation:** Rate limiting active - needs payment method for full functionality
