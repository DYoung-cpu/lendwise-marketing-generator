# Google Veo 3.1 Testing Guide
**Complete API Documentation & Social Media Optimization**

## 📊 Supported Video Specifications

### Aspect Ratios (Veo 3.1 & Veo 3.1 Fast)
| Ratio | Resolution | Platform | Use Case |
|-------|-----------|----------|----------|
| `1280:720` | 720p Horizontal | Facebook, LinkedIn, Twitter/X, YouTube | General social feed posts |
| `720:1280` | 720p Vertical | Instagram Reels/Stories, TikTok, Shorts | Mobile-first vertical video |
| `1920:1080` | 1080p Horizontal | YouTube, Premium Facebook | High quality horizontal |
| `1080:1920` | 1080p Vertical | Instagram Reels/Stories, TikTok, Shorts | High quality vertical |

### Duration Options
- **4 seconds** - Quick attention-grabbing alerts
- **6 seconds** - Standard social media length
- **8 seconds** - Extended storytelling

### Prompt Limits
- **Maximum: 1000 characters** (much more than Gen-4's 512!)
- **Recommended: 500-700 characters** for optimal results
- Focus on: Visual style, motion, lighting, atmosphere

### Additional Controls
- **Seed**: Integer (0-4294967295) for reproducible results
- **Model Options**:
  - `veo3.1` - Full quality ($0.40/sec)
  - `veo3.1_fast` - Fast generation ($0.20/sec, half price)

## 🎯 Social Media Platform Mapping

### Instagram
- **Feed Posts**: `1080:1080` ❌ NOT SUPPORTED (use 1080:1920 cropped)
- **Reels**: `1080:1920` ✅ PERFECT
- **Stories**: `1080:1920` ✅ PERFECT
- **Recommended**: Veo 3.1 at 1080:1920, 6-8 seconds

### TikTok
- **Standard**: `1080:1920` ✅ PERFECT
- **Recommended**: Veo 3.1 Fast at 1080:1920, 6 seconds

### YouTube
- **Shorts**: `1080:1920` ✅ PERFECT
- **Regular**: `1920:1080` ✅ PERFECT
- **Recommended**: Veo 3.1 at 1920:1080, 8 seconds

### Facebook
- **Feed**: `1280:720` ✅ PERFECT
- **Recommended**: Veo 3.1 Fast at 1280:720, 6 seconds

### LinkedIn
- **Feed**: `1280:720` ✅ PERFECT
- **Recommended**: Veo 3.1 at 1280:720, 6-8 seconds (professional)

### Twitter/X
- **Feed**: `1280:720` ✅ PERFECT
- **Recommended**: Veo 3.1 Fast at 1280:720, 4 seconds (quick)

## 💰 Cost Analysis

### Veo 3.1 (Full Quality)
- **4 seconds**: $1.60 per video
- **6 seconds**: $2.40 per video
- **8 seconds**: $3.20 per video

### Veo 3.1 Fast (Half Price)
- **4 seconds**: $0.80 per video
- **6 seconds**: $1.20 per video
- **8 seconds**: $1.60 per video

### Monthly Cost Estimates (45 videos)
| Duration | Veo 3.1 | Veo 3.1 Fast | Your Current ($250) |
|----------|---------|--------------|---------------------|
| 4 sec    | $72     | $36          | Save $178-214       |
| 6 sec    | $108    | $54          | Save $142-196       |
| 8 sec    | $144    | $72          | Save $106-178       |

## 🎨 Prompt Engineering for Clean Text

### Key Principles
1. **Specify Text Clarity**: "All text perfectly crisp, sharp, and readable"
2. **Control Motion**: "Text stays completely static - camera moves only"
3. **Background Separation**: "Text floats above blurred background"
4. **Lighting**: "Professional broadcast lighting on text"
5. **Style**: Describe visual aesthetic in detail

### Bad vs Good Prompts

❌ **Bad**: "Show mortgage rates"
✅ **Good**: "Professional financial presentation with LENDWISE MORTGAGE gold metallic branding at top. Large crisp white numbers showing 6.25% rate in center. Text perfectly sharp and readable against dark gradient background. Smooth cinematic zoom toward rate numbers. Floating gold sparkle particles. Shallow depth of field. Professional broadcast quality lighting."

## 🧪 Test Suite

The testing framework includes 8 different scenarios:

1. **Rate Alert (Urgent)** - Vertical 1080:1920, 6 sec
2. **Rate Alert (Professional)** - Horizontal 1280:720, 8 sec
3. **Market Intelligence** - Horizontal 1920:1080, 8 sec
4. **Educational Content** - Vertical 1080:1920, 6 sec
5. **Client Testimonial** - Vertical 1080:1920, 8 sec
6. **Quick Social Alert** - Horizontal 1280:720, 4 sec
7. **Premium Branding** - Vertical 720:1280, 8 sec
8. **Fast Test Comparison** - Same as #1 but using veo3.1_fast

## 📈 Quality Testing Checklist

When reviewing generated videos, check:

### Text Quality
- [ ] All text is sharp and readable
- [ ] Text remains static (doesn't warp or distort)
- [ ] Numbers are accurate and clear
- [ ] Brand name (LENDWISE) is prominent and crisp

### Motion Quality
- [ ] Camera motion is smooth and professional
- [ ] Depth of field effect works correctly
- [ ] Particle effects are visible and attractive
- [ ] No unwanted warping or artifacts

### Branding Quality
- [ ] Gold metallic branding looks premium
- [ ] Color scheme matches LendWise brand
- [ ] Professional financial aesthetic maintained
- [ ] Social media optimized (eye-catching)

### Technical Quality
- [ ] Correct aspect ratio for target platform
- [ ] No compression artifacts
- [ ] Smooth framerate
- [ ] Appropriate duration for platform

## 🚀 Next Steps After Testing

1. **Review all 8 test videos**
2. **Compare Veo 3.1 vs Veo 3.1 Fast quality**
3. **Identify best model + settings for each use case**
4. **Integrate winning configurations into WISR AI generator**
5. **Set up automated video generation pipeline**

## 📝 Notes
- Veo 3.1 excels at text rendering vs Gen-4 Turbo
- Veo 3.1 Fast is half price - test if quality difference is worth it
- Longer prompts (up to 1000 chars) give more control
- Seed parameter allows you to regenerate identical videos
- All videos include automatic audio generation (bonus!)
