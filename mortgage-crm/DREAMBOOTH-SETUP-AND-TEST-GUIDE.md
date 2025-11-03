# Dreambooth Implementation - Setup and Testing Guide

## What Was Implemented

Complete Dreambooth face training system with Vision AI validation for generating professional loan officer headshots.

### Components Created

1. **DreamboothTrainingAgent** (`src/agents/dreambooth-training-agent.js`)
   - Train Dreambooth models with Replicate API
   - Generate images with automatic retry (up to 3 attempts)
   - Validate training quality with test prompts
   - Learn from failures and adjust parameters
   - Database persistence

2. **DreamboothValidator** (`src/validators/dreambooth-validator.js`)
   - **STRICT validation**: Face confidence must be ≥90% (vs ≥70% for general images)
   - Weighted scoring: Face 40%, Professional 25%, Brand 20%, Text 10%, Safety 5%
   - Comprehensive quality checks

3. **Quality Agent Integration** (`src/agents/quality-agent.js`)
   - Automatic detection of Dreambooth outputs
   - Specialized validation routing
   - STRICT passing criteria

4. **Database Schema** (`DREAMBOOTH-DATABASE-SCHEMA.sql`)
   - 5 tables for tracking trainings, generations, validations, failures, adjustments
   - 4 views for analytics
   - 2 functions for optimization

## Setup Steps

### 1. Database Setup

Run the SQL schema in your Supabase dashboard:

```bash
# Copy the SQL file content
cat DREAMBOOTH-DATABASE-SCHEMA.sql

# Then paste and run in:
# Supabase Dashboard → SQL Editor → New Query → Run
```

### 2. Environment Variables

Ensure your `.env` has:

```env
REPLICATE_API_TOKEN=your_replicate_token
GOOGLE_CLOUD_API_KEY=your_google_cloud_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### 3. Run Tests

```bash
# Test the implementation
node test-dreambooth.js
```

Expected output:
- ✅ Agents initialized
- ✅ Dreambooth detection working
- ✅ Vision AI validation working
- ✅ Quality Agent integration active
- ⚠️  Database tables status (run SQL if not exists)

## API Endpoints

### Train a Dreambooth Model

```bash
POST /api/officers/train
Content-Type: application/json

{
  "officerId": "officer_001",
  "trainingImages": [
    "https://example.com/photo1.jpg",
    "https://example.com/photo2.jpg",
    "https://example.com/photo3.jpg"
  ],
  "options": {
    "steps": 1000
  }
}
```

Response:
```json
{
  "success": true,
  "training_id": "abc123",
  "status": "training",
  "message": "Training started successfully",
  "validation": {
    "all_valid": true,
    "results": [...]
  }
}
```

### Generate Image with Validation

```bash
POST /api/officers/officer_001/generate
Content-Type: application/json

{
  "prompt": "professional headshot in business attire",
  "style": "professional"
}
```

Response:
```json
{
  "success": true,
  "generation_id": "dreambooth_officer_001_12345",
  "image_url": "https://replicate.delivery/...",
  "validation": {
    "score": 0.87,
    "passed": true,
    "face_confidence": 0.94,
    "issues": [],
    "recommendation": "Excellent quality - ready for production use"
  },
  "attempts": 1
}
```

### Validate Training Quality

```bash
GET /api/officers/officer_001/validate-training
```

Response:
```json
{
  "success": true,
  "officerId": "officer_001",
  "quality": "excellent",
  "passed": true,
  "face_confidence": 0.92,
  "recommendations": [],
  "test_results": [...]
}
```

### Get Officer Statistics

```bash
GET /api/officers/officer_001/stats
```

Response:
```json
{
  "success": true,
  "stats": {
    "officer_id": "officer_001",
    "total_generations": 15,
    "passed": 13,
    "failed": 2,
    "pass_rate": "86.7",
    "avg_face_confidence": "92.3",
    "avg_validation_score": "84.5",
    "recent_generations": [...]
  }
}
```

## How It Works

### 1. Training Flow

```
Upload Training Images
    ↓
Validate Images (single face, >90% confidence)
    ↓
Train Dreambooth Model via Replicate
    ↓
Validate Training Quality (generate test images)
    ↓
Save to Database
```

### 2. Generation Flow with Retry

```
Generate Request
    ↓
Generate with Dreambooth (Attempt 1)
    ↓
Validate with Vision AI
    ↓
Face < 90%? → Adjust Parameters → Retry (up to 3 times)
    ↓
Face ≥ 90%? → Save Success → Return Image
```

### 3. Validation Criteria

**General Images:**
- Overall score ≥ 70%

**Dreambooth Images (STRICTER):**
- Overall score ≥ 70% AND
- Face confidence ≥ 90% AND
- Face score ≥ 90%

If face quality < 90%, the overall score is capped at 69% (automatic failure).

## Key Features

- **Automatic Retry**: Up to 3 attempts with parameter adjustment
- **90% Face Threshold**: Stricter than general images (70%)
- **Learning System**: Saves all failures for pattern detection
- **Parameter Optimization**: Adjusts based on validation feedback
- **Training Quality**: Tests models before production use
- **Database Analytics**: Track performance, identify officers needing retraining

## Testing Recommendations

### Test 1: Validate Components
```bash
node test-dreambooth.js
```

### Test 2: Start Server and Test API
```bash
# Terminal 1: Start server
node src/server.js

# Terminal 2: Test health
curl http://localhost:3001/api/health

# Test with sample data (will fail without actual Replicate model)
curl -X POST http://localhost:3001/api/officers/test_001/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "professional headshot", "style": "professional"}'
```

### Test 3: Database Queries
```sql
-- Check recent generations
SELECT * FROM dreambooth_generations ORDER BY timestamp DESC LIMIT 10;

-- View officer quality summary
SELECT * FROM dreambooth_officer_quality;

-- Find officers needing retraining
SELECT * FROM get_officers_needing_retraining();

-- Get best parameters
SELECT * FROM get_best_dreambooth_parameters('officer_001');
```

## Troubleshooting

### "Table does not exist" Error
→ Run `DREAMBOOTH-DATABASE-SCHEMA.sql` in Supabase SQL Editor

### "Face confidence too low" Error
→ This is expected! Dreambooth requires high-quality training images. Use:
- Professional headshots
- Good lighting
- Single person
- Clear face
- High resolution

### "Model not found" Error
→ Train a model first with `/api/officers/train`

### "Replicate API error"
→ Check your `REPLICATE_API_TOKEN` in `.env`

## Next Steps

1. ✅ Run `test-dreambooth.js` to verify installation
2. ⚠️  Run `DREAMBOOTH-DATABASE-SCHEMA.sql` in Supabase
3. 📸 Upload training images for a test officer
4. 🎯 Train your first Dreambooth model
5. 🖼️  Generate and validate professional headshots
6. 📊 Monitor quality metrics in database

## Architecture

```
Client Request
    ↓
Server API (/api/officers/*)
    ↓
Master Orchestrator
    ↓
DreamboothTrainingAgent
    ↓
├─ Replicate API (Training/Generation)
├─ DreamboothValidator (Face quality check)
├─ Quality Agent (Overall validation)
└─ Database (Learning & Analytics)
```

## Success Metrics

- Face confidence ≥ 90% (required)
- Pass rate ≥ 70% per officer
- Average validation score ≥ 80%
- < 3 attempts per successful generation

Monitor these in the database views and statistics endpoint.
