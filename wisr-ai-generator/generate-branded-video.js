/**
 * Generate Branded Video with Logo & Photo
 * Image-to-Video approach for Veo 3
 */

import { generateVideo } from './runway-service.js';
import path from 'path';
import fs from 'fs';
import https from 'https';

// Brand asset paths
const LOGO_PATH = '/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/lendwise-logo.png';
const DEFAULT_PHOTO = null; // User can provide photo path as argument

// Image-to-video prompts - Advertisement Style with Dynamic Animation
const brandedPrompts = {
  dynamicAd: {
    name: 'Dynamic Advertisement',
    description: 'Fast-paced commercial style with animated elements',
    prompt: `Create a dynamic mortgage advertisement with professional motion graphics.

ANIMATED ELEMENTS (Move these):
- "MORTGAGE RATE UPDATE" text: Swoops in from right side with gold glow trail
- LendWise owl logo: Pulses with energy burst at 0.5s, then subtle breathing glow
- "30-Year Fixed: 6.13%" rate: Numbers count up from 0.00% to 6.13% (spell F-I-X-E-D)
- Rate change "(-0.06%)": Slides in from left with green positive indicator
- Contact info: Fades in at bottom with subtle gold shimmer
- Gold particles: Burst outward from logo, then float gently upward
- Background gradient: Forest green (#2d5f3f to #1a3d2e) flows diagonally

MOTION STYLE:
- Fast-paced like TV commercial (energetic but professional)
- Text animations: Quick swoosh, elastic ease-out
- Logo: Strong pulsing heartbeat effect
- Numbers: Dynamic counting animation
- Overall: High-energy financial broadcast

LOOPING:
- Start: Elements off-screen/invisible
- End: All elements visible and settled
- Final frame matches starting position for seamless loop

TEXT ACCURACY (Critical spelling):
"MORTGAGE RATE UPDATE"
"30-Year Fixed: 6.13%" (F-I-X-E-D not Firted)
"(-0.06%)"
"Contact David Young NMLS 62043"
"Phone 310-954-7771"

Format: Vertical 1080x1920, premium quality, 4 seconds`
  },

  kinetic: {
    name: 'Kinetic Typography',
    description: 'Text-focused motion graphics with animated rates',
    prompt: `Dynamic kinetic typography advertisement for mortgage rates.

TEXT ANIMATION SEQUENCE:
0-1s: "MORTGAGE RATE UPDATE" flies in from top (bold, gold metallic)
1-2s: LendWise owl logo zooms in from center with energy burst
2-3s: "30-Year Fixed: 6.13%" rates animate in (numbers count up dramatically)
      - Spell F-I-X-E-D with each letter appearing in sequence
      - "(-0.06%)" slides in with down arrow
3-4s: "Contact David Young" appears with phone number fading in

VISUAL EFFECTS:
- Gold metallic text with shine sweep
- Energy bursts when elements appear
- Floating gold particles throughout
- Forest green gradient background (#2d5f3f) with subtle wave motion
- Light rays emanating from logo
- All text has subtle glow and depth

MOTION CHARACTERISTICS:
- Quick, snappy animations (200-300ms per element)
- Elastic easing for bounce effect
- Professional broadcast quality
- High contrast for readability
- Designed to loop: ends fade to starting state

SPELLING VERIFICATION:
"30-Year Fixed" = F-I-X-E-D (not Firted, Fired, or Finted)

Format: Vertical portrait 1080x1920, commercial quality`
  },

  broadcast: {
    name: 'Broadcast News Style',
    description: 'News ticker animation with professional photo',
    prompt: `Professional financial news broadcast animation.

LAYERED ANIMATION:
Bottom Layer: Forest green gradient background - gentle wave motion
Middle Layer: Professional photo in circular gold frame - slides in from left at 0.5s
Top Layer: Animated text overlays

TEXT ANIMATION TIMELINE:
0.0s: Background appears
0.5s: Photo frame slides in from left with motion blur
1.0s: "MORTGAGE RATE UPDATE - OCT 28, 2025" scrolls across top like news ticker
1.5s: LendWise owl logo drops down from top with bounce
2.0s: Rate box appears center: "30-Year Fixed: 6.13%" (numbers animate from 0)
      - Spell each letter: F-I-X-E-D
2.5s: Other rates fade in below: "15-Year: 5.45% | Jumbo: 6.75%"
3.0s: Contact bar slides up from bottom: "David Young NMLS 62043 | 310-954-7771"
3.5s: All elements settle with subtle pulse

VISUAL STYLE:
- Gold metallic borders around all text boxes
- News broadcast lower-thirds style
- Professional lighting with soft glow
- Floating gold sparkle particles
- Cinematic depth and shadows

LOOPING DESIGN:
- Elements animate OUT in reverse at 3.8-4.0s
- Ready to loop seamlessly

CRITICAL TEXT SPELLING:
"30-Year Fixed" = Must spell F-I-X-E-D exactly
All numbers must be clear and accurate

Format: Vertical 1080x1920, broadcast quality, 4 seconds`
  },

  energetic: {
    name: 'High-Energy Commercial',
    description: 'Fast-paced social media ad style',
    prompt: `High-energy social media advertisement with rapid motion graphics.

RAPID SEQUENCE:
0.0-0.5s: Screen starts black, gold light burst reveals LendWise owl logo
0.5-1.0s: "RATES DROPPED!" text explodes onto screen with impact effect
1.0-1.5s: Logo zooms to top-left, "30-Year Fixed" text flies in from right
1.5-2.0s: "6.13%" numbers scale up massively (spell F-I-X-E-D correctly)
2.0-2.5s: "(-0.06%)" badge bounces in with green checkmark
2.5-3.0s: Additional rates appear in grid: "15-Year: 5.45%" etc.
3.0-3.5s: Professional photo fades in as background with overlay
3.5-4.0s: "Contact David Young" call-to-action pulses at bottom

MOTION EFFECTS:
- Screen shake on impact moments
- Zoom punches for emphasis
- Particle explosions with each text entry
- Gold sparkle trails
- Light flares and lens effects
- Fast elastic easing (bouncy, energetic)

COLOR & STYLE:
- Forest green background gradient (#2d5f3f to #1a3d2e)
- Metallic gold text (#DAA520) with bevels
- High contrast, vibrant
- Instagram/TikTok commercial aesthetic
- Modern, attention-grabbing

LOOPING:
- Quick fade to black at 3.9s
- Loops to opening light burst

TEXT ACCURACY:
"30-Year Fixed: 6.13%" - F-I-X-E-D (each letter clear)
"Contact David Young NMLS 62043"
"Phone 310-954-7771"

Format: Vertical 1080x1920, social media quality, 4 seconds, fast-paced`
  }
};

function downloadVideo(url, filename) {
  return new Promise((resolve, reject) => {
    console.log(`\n📥 Downloading video...`);
    const file = fs.createWriteStream(filename);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filename);
      });
    }).on('error', (err) => {
      fs.unlink(filename, () => {});
      reject(err);
    });
  });
}

async function generateBrandedVideo(imageSource, promptType = 'logoFocus', model = 'veo3.1_fast', duration = 4) {
  const promptConfig = brandedPrompts[promptType];

  if (!promptConfig) {
    console.error('❌ Unknown prompt type. Use: logoFocus, photoIntegrated, or compositeLayout');
    return;
  }

  // Verify image exists
  if (!fs.existsSync(imageSource)) {
    console.error(`❌ Image not found: ${imageSource}`);
    return;
  }

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log(`║   🎬 BRANDED VIDEO GENERATION                              ║`);
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const cost = duration * (model === 'veo3.1_fast' ? 20 : 40) * 0.01;

  console.log(`📊 Configuration:`);
  console.log(`   Strategy: ${promptConfig.name}`);
  console.log(`   Description: ${promptConfig.description}`);
  console.log(`   Source Image: ${path.basename(imageSource)}`);
  console.log(`   Model: ${model}`);
  console.log(`   Duration: ${duration}s`);
  console.log(`   Cost: $${cost.toFixed(2)}\n`);

  console.log('━'.repeat(60));
  console.log('PROMPT PREVIEW:');
  console.log('━'.repeat(60));
  console.log(promptConfig.prompt.substring(0, 300) + '...\n');

  console.log('🎬 Starting generation...\n');

  const startTime = Date.now();

  try {
    const result = await generateVideo(
      imageSource,
      promptConfig.prompt,
      {
        model: model,
        ratio: '1080:1920',
        duration: duration,
        watermark: false
      }
    );

    const elapsed = Math.round((Date.now() - startTime) / 1000);

    if (result.success) {
      console.log(`\n✅ VIDEO GENERATED! (${elapsed}s)\n`);

      // Download immediately
      const timestamp = Date.now();
      const downloadsPath = '/mnt/c/Users/dyoun/Downloads';
      const filename = path.join(downloadsPath, `veo-branded-${promptType}-${timestamp}.mp4`);

      try {
        await downloadVideo(result.videoUrl, filename);

        console.log('\n════════════════════════════════════════════════════════════');
        console.log('✅ SUCCESS! BRANDED VIDEO SAVED');
        console.log('════════════════════════════════════════════════════════════');
        console.log(`\n📁 Location: ${filename}\n`);
        console.log('✅ CHECK FOR:');
        console.log('   • Logo present and clear?');
        console.log('   • Photo integrated well (if used)?');
        console.log('   • Text spelled correctly: "Fixed" = F-I-X-E-D?');
        console.log('   • Forest green gradient background?');
        console.log('   • Gold metallic accents?');
        console.log('   • Professional animation quality?\n');
        console.log(`💰 Cost: $${cost.toFixed(2)}\n`);

        return { success: true, filename, cost };
      } catch (downloadError) {
        console.error('\n❌ Download failed:', downloadError.message);
        console.log('\nVideo URL (use quickly):');
        console.log(result.videoUrl);
        return { success: true, videoUrl: result.videoUrl, cost };
      }
    } else {
      console.log('\n❌ GENERATION FAILED!\n');
      console.log(`Error: ${result.error}\n`);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('\n💥 ERROR:', error.message, '\n');
    return { success: false, error: error.message };
  }
}

// CLI Usage
const args = process.argv.slice(2);
const promptType = args[0] || 'dynamicAd';
const imageSource = args[1] || LOGO_PATH;
const model = args[2] || 'veo3.1_fast';
const duration = parseInt(args[3]) || 4;

console.log('\n💡 Usage: node generate-branded-video.js [promptType] [imagePath] [model] [duration]');
console.log('   Prompt Types: dynamicAd | kinetic | broadcast | energetic');
console.log('   Models: veo3.1_fast ($0.80) | veo3.1 ($1.60)');
console.log('   Duration: 4, 6, or 8 seconds');
console.log('   Default image: lendwise-logo.png\n');

generateBrandedVideo(imageSource, promptType, model, duration);
