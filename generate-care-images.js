import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IDEOGRAM_API_KEY = 'OzO_BqudwCQ8fIcywhSJa2noX0YL4WQm77ymd71nYl8yKN5zZDC2cA4NbJpvU7dYyW5XLRzhGkuWFJqrgWpItA';

// Image prompts for sophisticated companion care scenes
const imagePrompts = [
  {
    name: 'hero-companionship',
    prompt: 'Professional photograph of an elegant elderly woman with silver hair smiling warmly while having tea with a professional female caregiver in a luxurious Beverly Hills home interior, natural window lighting, sophisticated and warm atmosphere, high-end home care, photorealistic, 8k quality'
  },
  {
    name: 'reading-together',
    prompt: 'Professional photograph of a distinguished elderly gentleman and his professional male companion reading together in a sophisticated library setting, warm natural lighting, leather chairs, elegant interior, companionship and dignity, photorealistic, 8k quality'
  },
  {
    name: 'garden-walk',
    prompt: 'Professional photograph of a cheerful elderly woman walking through a beautiful garden with her professional caregiver, both smiling, upscale residential setting, golden hour lighting, flowers and greenery, companionship and wellbeing, photorealistic, 8k quality'
  },
  {
    name: 'conversation',
    prompt: 'Professional photograph of two diverse elderly people enjoying conversation with their professional caregiver in a modern, sophisticated living room, warm and inviting atmosphere, natural light, premium home care service, photorealistic, 8k quality'
  },
  {
    name: 'activities',
    prompt: 'Professional photograph of an elderly woman and professional caregiver working on a puzzle together at an elegant dining table, joyful expressions, luxury home interior, warm lighting, companionship and mental engagement, photorealistic, 8k quality'
  },
  {
    name: 'meal-prep',
    prompt: 'Professional photograph of a caregiver preparing a healthy meal with an elderly gentleman in a high-end modern kitchen, both smiling, natural interaction, upscale Beverly Hills home, companionship in daily activities, photorealistic, 8k quality'
  }
];

async function generateImage(prompt, filename) {
  console.log(`\n🎨 Generating: ${filename}...`);

  try {
    const response = await fetch('https://api.ideogram.ai/generate', {
      method: 'POST',
      headers: {
        'Api-Key': IDEOGRAM_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_request: {
          prompt: prompt,
          aspect_ratio: 'ASPECT_16_9',
          model: 'V_2',
          magic_prompt_option: 'AUTO',
          style_type: 'REALISTIC'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error generating ${filename}:`, response.status, errorText);
      return false;
    }

    const data = await response.json();
    console.log(`📥 Response received for ${filename}`);

    if (data.data && data.data.length > 0) {
      const imageUrl = data.data[0].url;
      console.log(`🔗 Image URL: ${imageUrl}`);

      // Download the image
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();

      const outputDir = path.join(__dirname, '90210lovecare-content', 'ai-generated-images');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputPath = path.join(outputDir, `${filename}.jpg`);
      fs.writeFileSync(outputPath, Buffer.from(imageBuffer));

      console.log(`✅ Saved: ${filename}.jpg`);
      return true;
    } else {
      console.error(`❌ No image data returned for ${filename}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error with ${filename}:`, error.message);
    return false;
  }
}

async function generateAllImages() {
  console.log('🎨 Starting AI image generation for 90210 Love Care...\n');
  console.log(`📋 Generating ${imagePrompts.length} professional care images\n`);

  const results = [];

  for (const { name, prompt } of imagePrompts) {
    const success = await generateImage(prompt, name);
    results.push({ name, success });

    // Wait 2 seconds between requests to avoid rate limiting
    if (imagePrompts.indexOf({ name, prompt }) < imagePrompts.length - 1) {
      console.log('⏳ Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n\n📊 Generation Summary:');
  console.log('═══════════════════════════════════════');
  const successful = results.filter(r => r.success).length;
  console.log(`✅ Successful: ${successful}/${results.length}`);

  if (successful < results.length) {
    console.log('\n❌ Failed images:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.name}`);
    });
  }

  console.log('\n✨ Image generation complete!');
}

// Run the generation
generateAllImages().catch(console.error);
