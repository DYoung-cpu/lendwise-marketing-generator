# Vision AI & Brand Learning System - Implementation Complete

## ✅ What's Been Implemented

### 1. Vision AI Validator (`src/validators/vision-ai-validator.js`)
**Status:** ✅ Created

**Features:**
- Google Cloud Vision API integration
- Text detection and NMLS extraction
- Face detection and professionalism scoring
- Brand color consistency checking (LendWise green #2d5f3f, gold #d4af37)
- Logo detection
- Composition and object analysis
- Safe search validation
- Automatic fallback if credentials not configured

**Key Methods:**
- `analyzeImage()` - Main analysis entry point
- `extractNMLS()` - Finds NMLS numbers in images
- `extractRates()` - Finds percentage rates
- `assessFaceProfessionalism()` - Scores facial expressions
- `checkBrandConsistency()` - Validates brand colors
- `assessComposition()` - Evaluates layout quality

### 2. Brand Learning System (`src/memory/brand-learning.js`)
**Status:** ✅ Created

**Features:**
- User feedback collection and analysis
- Automatic issue extraction from critiques
- Solution generation for common problems
- Persistent learning via Supabase
- Frequency-based application (applies after 2+ occurrences)
- Prompt enhancement with learned preferences

**Supported Issues:**
- `color_too_dark` / `color_too_bright`
- `lacks_professionalism`
- `poor_readability`
- `brand_color_mismatch`
- `image_quality_blur`
- `text_too_small`
- `poor_composition`
- `low_resolution`
- `photo_quality_poor`
- `logo_missing`
- `font_mismatch`
- `lacks_visual_interest`
- `unclear_message`

### 3. Database Schema
**Status:** ✅ Created in Supabase

**Tables:**
```sql
vision_analysis      - Stores Vision AI analysis results
brand_feedback       - Stores user critiques and ratings
brand_preferences    - Stores learned preferences
```

### 4. NPM Package
**Status:** ✅ Installed
- `@google-cloud/vision` (76 packages added)

## 🔄 Next Steps Required

### Step 1: Update Quality Agent
**File:** `src/agents/quality-agent.js`

**Changes needed:**
```javascript
// 1. Add imports (after line 3):
import VisionAIValidator from '../validators/vision-ai-validator.js';

// 2. Update constructor (modify line 6):
constructor(supabase) {  // <-- Add supabase parameter
  this.ocr = new OCRService();
  this.spelling = new SpellingValidator();
  this.compliance = new ComplianceValidator();
  this.visionAI = new VisionAIValidator(supabase);  // <-- Add this
}

// 3. Replace assessVisualQuality() method (lines 100-165):
async assessVisualQuality(imageUrl, intent, generationId) {
  // Try Vision AI first
  const visionAnalysis = await this.visionAI.analyzeImage(imageUrl, generationId);

  if (visionAnalysis) {
    console.log('✅ Using Vision AI for visual assessment');

    // Calculate comprehensive score
    let score = 0.5; // Base score
    const issues = [];

    // Text quality
    if (visionAnalysis.text.readable_score > 0.8) {
      score += 0.1;
    } else {
      issues.push('Text readability could be improved');
    }

    // NMLS detection
    if (intent.hasNMLS) {
      if (visionAnalysis.text.nmls_found) {
        score += 0.1;
      } else {
        issues.push(`Missing NMLS number`);
        score -= 0.2;
      }
    }

    // Face quality (if expected)
    if (intent.needsPhoto) {
      if (visionAnalysis.faces.professional > 0.7) {
        score += 0.1;
      } else if (visionAnalysis.faces.count > 0) {
        issues.push('Photo quality could be more professional');
      }
    }

    // Brand consistency
    const brandMatch = visionAnalysis.brand.brand_match;
    if (brandMatch.score > 0.8) {
      score += 0.2;
    } else {
      if (!brandMatch.greenMatch) issues.push('Missing brand green color');
      if (!brandMatch.goldMatch) issues.push('Missing brand gold color');
    }

    // Professional composition
    if (visionAnalysis.composition.professional_score > 0.7) {
      score += 0.1;
    }

    return {
      score: Math.min(Math.max(score, 0), 1.0),
      issues,
      hasDesignElements: visionAnalysis.composition.objects.length > 3,
      hasProperComposition: visionAnalysis.composition.layout_score > 0.7,
      hasGoodContrast: visionAnalysis.text.readable_score > 0.7,
      visionAI: true,
      analysis: visionAnalysis
    };
  }

  // Fallback to heuristic method
  console.log('📊 Vision AI unavailable, using heuristic assessment');
  return this.assessVisualQualityHeuristic(imageUrl, intent);
}

// 4. Rename existing assessVisualQuality to:
async assessVisualQualityHeuristic(imageUrl, intent) {
  // Keep existing code from lines 118-165
}
```

### Step 2: Update Master Orchestrator
**File:** `src/orchestrator/master-orchestrator.js`

**Changes needed:**
```javascript
// 1. Add import (after other imports):
import BrandLearningSystem from '../memory/brand-learning.js';

// 2. In constructor (after line 35):
this.brandLearning = new BrandLearningSystem(this.supabase);

// 3. Update quality agent initialization (around line 33):
this.qualityAgent = new QualityAgent(this.supabase);  // <-- Add supabase

// 4. In brand agent's generatePrompt() - enhance with learning:
// Find the method in brand-generator.js and add:
const enhancedPrompt = this.masterOrchestrator.brandLearning.applyLearnedPreferences(basePrompt);
return enhancedPrompt;
```

### Step 3: Add API Endpoints
**File:** `src/server.js`

**Add after existing endpoints (around line 53):**
```javascript
// Submit critique for a generation
app.post('/api/critique', async (req, res) => {
  const { generation_id, critique, rating } = req.body;

  console.log(`💬 User critique for generation ${generation_id}`);

  try {
    const result = await orchestrator.brandLearning.recordCritique(
      generation_id,
      critique,
      rating
    );

    res.json({
      success: true,
      issues: result.issues,
      improvements: result.improvements,
      learned: result.learned,
      message: result.learned
        ? 'Your feedback will improve future generations'
        : 'Thanks for the positive feedback!'
    });
  } catch (error) {
    console.error('Critique error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current brand preferences
app.get('/api/brand-preferences', async (req, res) => {
  try {
    const prefs = orchestrator.brandLearning.getLearnedPreferences();
    res.json({
      success: true,
      preferences: prefs,
      count: prefs.length,
      active: prefs.filter(p => p.active).length
    });
  } catch (error) {
    console.error('Preferences error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear a specific preference
app.delete('/api/brand-preferences/:issueType', async (req, res) => {
  try {
    await orchestrator.brandLearning.clearPreference(req.params.issueType);
    res.json({ success: true, message: 'Preference cleared' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## 🔑 Google Cloud Vision Setup

### Option 1: Environment Variable (Recommended)
```bash
# 1. Create Google Cloud project
# 2. Enable Vision API
# 3. Create service account
# 4. Download JSON key file
# 5. Set environment variable:

export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"

# Or add to .env:
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

### Option 2: Application Default Credentials
```bash
gcloud auth application-default login
```

### Without Google Cloud Vision
The system will automatically fall back to heuristic analysis if Vision AI is not configured. You'll see:
```
⚠️  Vision AI not configured: Could not load the default credentials
   Set GOOGLE_APPLICATION_CREDENTIALS to enable Vision AI
```

## 📊 How It Works

### Vision AI Flow:
```
1. Image generated → URL received
2. Vision AI analyzes image
3. Extracts: text, faces, colors, objects, composition
4. Checks brand consistency (green #2d5f3f, gold #d4af37)
5. Scores professionalism, readability, quality
6. Saves analysis to vision_analysis table
7. Returns comprehensive assessment
```

### Brand Learning Flow:
```
1. User submits critique + rating (1-5)
2. System extracts issues from text
3. Generates improvement solutions
4. Saves to brand_feedback table
5. If rating ≤ 3: Learn from critique
6. Update brand_preferences table (increase frequency)
7. Next generation: Apply learned preferences to prompt
8. Preferences applied when seen 2+ times
```

### Example User Feedback:
```javascript
// User submits:
POST /api/critique
{
  "generation_id": "abc123",
  "critique": "The text is too small and hard to read",
  "rating": 2
}

// System learns:
- Issue: text_too_small
- Solution: "Minimum font size 18pt for body, 28pt for headers"
- Frequency: 1

// After 2nd similar critique:
- Frequency: 2
- Auto-applies to all future prompts:
  "IMPORTANT (from user feedback): Minimum font size 18pt for body, 28pt for headers"
```

## 🧪 Testing

### Test Vision AI:
```bash
# Generate an image (server must be running)
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{"type": "rate-update", "data": {"rate": "6.5%"}}'

# Check logs for:
# ✅ Vision AI initialized (if configured)
# OR
# ⚠️  Vision AI not configured (falls back to heuristics)
```

### Test Brand Learning:
```bash
# Submit a critique
curl -X POST http://localhost:3001/api/critique \
  -H "Content-Type: application/json" \
  -d '{
    "generation_id": "test-123",
    "critique": "The text is too small and the colors are too dark",
    "rating": 2
  }'

# View learned preferences
curl http://localhost:3001/api/brand-preferences

# Expected response:
{
  "success": true,
  "preferences": [
    {
      "issue": "text_too_small",
      "solution": "Minimum font size 18pt for body, 28pt for headers",
      "frequency": 1,
      "active": false
    },
    {
      "issue": "color_too_dark",
      "solution": "Use brighter shade - forest green #4d8f5f instead of #2d5f3f",
      "frequency": 1,
      "active": false
    }
  ]
}
```

## 📝 Manual Steps Still Required

1. **Update Quality Agent** - Integrate Vision AI (see Step 1 above)
2. **Update Master Orchestrator** - Add Brand Learning (see Step 2 above)
3. **Add API Endpoints** - Enable critique submission (see Step 3 above)
4. **Optional: Set up Google Cloud Vision** - For AI-powered analysis

## 🎯 Benefits

### With Vision AI:
- ✅ Automatic NMLS number detection
- ✅ Face professionalism scoring
- ✅ Brand color consistency checking
- ✅ Composition and layout analysis
- ✅ Text readability assessment
- ✅ Professional quality validation

### With Brand Learning:
- ✅ System learns from every critique
- ✅ Automatically improves over time
- ✅ Applies learned fixes to future generations
- ✅ Tracks frequency of issues
- ✅ Builds institutional knowledge
- ✅ Reduces repetitive feedback needed

### Combined:
- 🚀 Self-improving marketing system
- 📊 Data-driven quality improvements
- 🎨 Consistent brand application
- ⏰ Saves time on manual review
- 💰 Reduces regeneration costs
- 🎓 Perpetual learning from user feedback

Ready to complete the integration?
