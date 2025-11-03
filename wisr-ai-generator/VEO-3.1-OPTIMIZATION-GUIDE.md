# Veo 3.1 Optimization Guide
**Advanced Techniques for Clean Text & Awesome Graphics**

## 🎯 Core Philosophy

Veo 3.1 excels at:
1. **Text rendering** - Sharp, readable typography
2. **Camera motion** - Professional cinematic movement
3. **Atmosphere** - Lighting, depth, visual style
4. **Audio generation** - Automatic voiceover/soundtrack

## 📐 Output Controls Reference

### Aspect Ratios Deep Dive

#### 1080:1920 (9:16 Vertical)
**Best for**: Instagram Reels, TikTok, YouTube Shorts
**Optimization tips**:
- Text should be centered vertically
- Keep important content in center 75% (safe zone)
- Use vertical parallax motion
- Duration: 6-8 seconds optimal

**Prompt additions**:
- "Vertical mobile format composition"
- "Text centered for vertical viewing"
- "Optimized for 9:16 smartphone display"

#### 1280:720 (16:9 Horizontal)
**Best for**: Facebook, LinkedIn, Twitter/X
**Optimization tips**:
- Text can span wider horizontally
- Use horizontal camera pans
- Professional "TV news" aesthetic
- Duration: 4-8 seconds

**Prompt additions**:
- "Horizontal widescreen composition"
- "Professional broadcast layout"
- "16:9 television aspect ratio"

#### 1920:1080 (16:9 HD)
**Best for**: YouTube, Premium content
**Optimization tips**:
- Highest quality output
- More detail possible
- Cinematic camera work
- Duration: 8 seconds for full storytelling

**Prompt additions**:
- "Full HD 1080p quality"
- "Cinematic widescreen composition"
- "Premium video production values"

#### 720:1280 (9:16 Vertical SD)
**Best for**: Instagram Stories (bandwidth optimized)
**Optimization tips**:
- Smaller file size
- Faster generation
- Good for quick consumption
- Duration: 6-8 seconds

### Duration Strategies

#### 4 Seconds
**Use for**:
- Quick alerts
- Urgent updates
- Twitter/X posts
- Attention grabbers

**Prompt approach**:
- "Fast dynamic motion"
- "Quick attention-grabbing reveal"
- "Rapid professional movement"

#### 6 Seconds
**Use for**:
- Instagram Reels
- Standard social posts
- Balanced storytelling
- Most versatile

**Prompt approach**:
- "Smooth professional pacing"
- "Medium tempo cinematic motion"
- "Balanced reveal timing"

#### 8 Seconds
**Use for**:
- Complex messages
- Premium content
- YouTube Shorts
- Detailed information

**Prompt approach**:
- "Slow cinematic build"
- "Elegant extended reveal"
- "Premium paced storytelling"

## ✨ Prompt Engineering Masterclass

### The Perfect Prompt Structure

```
[BRANDING] + [TEXT CONTENT] + [TEXT QUALITY] + [BACKGROUND] +
[MOTION] + [LIGHTING] + [EFFECTS] + [STYLE]
```

### Component Breakdown

#### 1. Branding (Required)
```
"LENDWISE MORTGAGE gold metallic logo at top"
"LENDWISE MORTGAGE gold branding prominent top left"
"LENDWISE branding subtle at bottom right"
```

#### 2. Text Content (Required)
```
"Large bold white text displays 'RATES DROPPED!' in center"
"Main headline: 'Your Dream Home Awaits' in elegant serif"
"Bold crisp text shows '6.25%' in huge glowing gold numbers"
```

#### 3. Text Quality Modifiers (Critical!)
```
"All text perfectly sharp, crisp, and readable"
"Text stays completely static and sharp"
"Text remains 100% readable while background moves"
"Ultra-sharp typography, crystal clear"
"Text floats in perfect focus while background blurs"
```

#### 4. Background
```
"Dark navy blue gradient background"
"Sophisticated dark blue to black gradient"
"Luxury real estate atmosphere, dark with gold accent lighting"
"Warm golden hour bokeh blur suggesting home/happiness"
```

#### 5. Motion (Camera only!)
```
"Smooth cinematic zoom pushing toward the 6.25% rate"
"Slow intimate camera push in toward text"
"Gentle horizontal camera pan with parallax"
"Elegant camera dolly forward with depth"
"Subtle vertical camera tilt creating dimension"
```

**DON'T** animate text directly - always camera motion!

#### 6. Lighting
```
"Professional broadcast lighting on text"
"Dramatic lighting with lens flares"
"Cinematic lighting with subtle lens flares"
"Warm professional studio lighting"
```

#### 7. Effects
```
"Floating gold sparkle particles in background"
"Shallow depth of field with bokeh effects"
"Soft glowing light particles"
"Beautiful bokeh blur creating depth"
"Environmental particles creating dimension"
```

#### 8. Style/Aesthetic
```
"Premium financial news aesthetic"
"Professional broadcast quality"
"Netflix documentary quality"
"Apple keynote presentation aesthetic"
"High-end corporate presentation"
```

## 🎨 Advanced Techniques

### For Maximum Text Clarity

1. **Contrast is King**
   - Light text on dark background (or vice versa)
   - Add subtle text shadows for separation
   - Use gold/white on dark blue/black

2. **Depth Separation**
   ```
   "Text in sharp focus on foreground layer, background
   elements in soft bokeh blur, creating clear depth
   separation between readable text and atmospheric effects"
   ```

3. **Static Text Mandate**
   ```
   "Text remains completely static and sharp - only camera
   moves through the scene. No text animation, warping, or
   distortion. Text stays perfectly crisp throughout."
   ```

### For Awesome Graphics

1. **Particle Systems**
   ```
   "Floating gold metallic particle effects creating depth
   and dimension. Subtle bokeh light orbs drifting in
   background. Environmental sparkle effects suggesting
   premium quality and celebration."
   ```

2. **Camera Motion Techniques**
   - **Dolly**: "Camera pushes forward through the scene"
   - **Zoom**: "Smooth cinematic zoom toward center"
   - **Pan**: "Horizontal camera pan revealing elements"
   - **Tilt**: "Gentle vertical camera tilt upward"
   - **Parallax**: "Foreground and background move at different speeds"

3. **Lighting Drama**
   ```
   "Dramatic rim lighting on edges. Subtle lens flares from
   light sources. Professional three-point lighting creating
   depth. Atmospheric haze with god rays. Golden hour warm
   tones."
   ```

## 🔧 Technical Optimizations

### Seed Usage

Use the `seed` parameter for:
- **Consistency**: Same seed = similar results
- **Variations**: Change seed slightly for variations
- **A/B Testing**: Compare different seeds for same prompt

Example:
```javascript
{
  model: 'veo3.1',
  seed: 12345, // Your lucky number
  duration: 6,
  ratio: '1080:1920'
}
```

### Model Selection Matrix

| Content Type | Speed Need | Budget | Recommended Model |
|--------------|-----------|--------|-------------------|
| Premium brand video | Normal | Higher | veo3.1 |
| Quick social post | Fast | Lower | veo3.1_fast |
| Client testimonial | Normal | Higher | veo3.1 |
| Rate alert | Fast | Lower | veo3.1_fast |
| Educational | Normal | Medium | Test both |
| YouTube content | Normal | Higher | veo3.1 |

## 📊 Quality Checklist

Before accepting a video:

### Text (Most Important)
- [ ] Every word is readable
- [ ] Numbers are accurate and clear
- [ ] Text doesn't warp or blur during motion
- [ ] Brand name is prominent and sharp
- [ ] Text contrast is strong enough

### Motion
- [ ] Camera movement is smooth (no jitter)
- [ ] Motion speed feels professional
- [ ] Parallax effects work correctly
- [ ] No unwanted camera shake

### Visual Effects
- [ ] Particles are visible and attractive
- [ ] Bokeh/depth of field looks natural
- [ ] Lighting creates proper mood
- [ ] Colors match brand (gold, blue, white)

### Technical
- [ ] Correct aspect ratio
- [ ] No compression artifacts
- [ ] Smooth framerate (no stuttering)
- [ ] Audio complements visuals (if present)

## 🚀 Pro Tips

1. **Longer Prompts Are Better**
   - Use 500-800 characters
   - More detail = more control
   - Veo 3.1 supports up to 1000 chars!

2. **Repetition Reinforces**
   - Mention "text stays sharp" multiple times
   - Repeat "perfectly readable" in prompt
   - Emphasize "crystal clear" for text

3. **Reference Professional Media**
   - "Netflix documentary quality"
   - "Apple keynote aesthetic"
   - "Bloomberg financial news style"
   - These set quality expectations

4. **Atmospheric Descriptors**
   - Don't just say "dark background"
   - Say "sophisticated dark blue gradient with atmospheric depth"
   - Richer descriptions = better results

5. **Test Variations**
   - Same prompt + different seeds = variations
   - Pick the best result
   - Use winning seed for future similar content

## 📈 Continuous Improvement

### Track Your Results
Keep notes on:
- Which prompts produced best text clarity
- Which motion styles worked best
- Which aspect ratios performed best per platform
- Which model (veo3.1 vs veo3.1_fast) was worth it

### Build Your Prompt Library
Save successful prompts by category:
- Rate alerts
- Educational content
- Testimonials
- Market updates

Iterate and improve based on results.

## 🎓 Learning Resources

After your test run:
1. Identify the 2-3 best videos
2. Analyze what made them work
3. Extract common patterns
4. Create template prompts
5. Apply learnings to future videos

---

**Remember**: Veo 3.1's strength is **text + cinematic motion**. Focus prompts on:
1. Text clarity and readability
2. Professional camera work
3. Atmospheric effects
4. Brand-consistent styling
