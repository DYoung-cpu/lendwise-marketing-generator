import Replicate from 'replicate';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

if (!process.env.REPLICATE_API_TOKEN) {
  console.error('❌ REPLICATE_API_TOKEN not found in environment');
  process.exit(1);
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

// Convert local image to data URI
function imageToDataURI(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = 'image/jpeg';
  return `data:${mimeType};base64,${base64Image}`;
}

const photoPath = '/mnt/c/Users/dyoun/Downloads/IMG_2436.jpg';
const photoDataURI = imageToDataURI(photoPath);

const prompt = `Professional Instagram mortgage rate announcement graphic. Square 1080x1080 image showing a forest green gradient background transitioning from darker green at top to slightly lighter at bottom.

A premium frosted glass card floats in the center with subtle transparency and soft shadows creating depth. The golden LendWise owl mascot logo glows softly in the top left corner.

The centerpiece displays 6.25% in enormous metallic gold numbers with shine and gradient effects. A red upward trending arrow sits beside the rate. Below it shows +0.02% in smaller red text.

Underneath, a simple horizontal bar chart compares rates: a taller golden bar labeled "30-Year Fixed 6.25%" next to a shorter golden bar labeled "15-Year Fixed 5.88%" with white text labels.

At the bottom, a frosted glass banner contains a professional circular headshot photo of the loan officer on the left side, followed by David Young in white text with NMLS 123456 in smaller gold text below. On the right side displays (555) 123-4567 in white text.

At the very bottom, "LendWise" appears in elegant gold serif typography with wide letter spacing, with "MORTGAGE" in small white uppercase letters below it. A tiny Equal Housing Lender logo sits in the bottom right corner.

The overall aesthetic is premium banking with photorealistic glass materials, metallic finishes, professional depth and shadows, clean modern typography, and high contrast for maximum readability. Instagram-optimized professional marketing quality.`;

const modelsToTest = [
  {
    name: 'Gemini 2.5 Flash Image',
    id: 'google/gemini-2.5-flash-image',
    input: {
      prompt: prompt,
      image_input: [photoDataURI],
      aspect_ratio: '1:1',
      output_format: 'jpg'
    }
  },
  {
    name: 'FLUX.1 Redux',
    id: 'black-forest-labs/flux-redux-dev',
    input: {
      prompt: prompt,
      image: photoDataURI,
      aspect_ratio: '1:1'
    }
  },
  {
    name: 'FLUX.1 Fill (Inpainting)',
    id: 'black-forest-labs/flux-fill-pro',
    input: {
      prompt: prompt,
      image: photoDataURI,
      aspect_ratio: '1:1'
    }
  },
  {
    name: 'HunyuanImage-3.0',
    id: 'tencent/hunyuan-image-3',
    input: {
      prompt: prompt,
      image: photoDataURI,
      aspect_ratio: '1:1'
    }
  }
];

console.log('🎨 Testing Image-Input Models with Your Photo\n');
console.log('=' .repeat(60));

async function testModel(modelConfig) {
  console.log(`\n📸 Testing: ${modelConfig.name}`);
  console.log(`   Model ID: ${modelConfig.id}`);

  const startTime = Date.now();

  try {
    console.log('   ⏳ Generating...');
    const output = await replicate.run(modelConfig.id, { input: modelConfig.input });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    let imageUrl;
    if (Array.isArray(output)) {
      imageUrl = output[0];
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else if (output && output.url) {
      imageUrl = output.url;
    } else {
      imageUrl = String(output);
    }

    console.log(`   ✅ Success! (${duration}s)`);
    console.log(`   🔗 URL: ${imageUrl}`);

    // Download result
    const response = await fetch(imageUrl);
    const buffer = await Buffer.from(await response.arrayBuffer());
    const filename = `/tmp/${modelConfig.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.jpg`;
    fs.writeFileSync(filename, buffer);
    console.log(`   💾 Saved: ${filename}`);

    return {
      success: true,
      model: modelConfig.name,
      url: imageUrl,
      duration,
      filename
    };

  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`   ❌ Failed (${duration}s)`);
    console.log(`   Error: ${error.message}`);

    return {
      success: false,
      model: modelConfig.name,
      error: error.message,
      duration
    };
  }
}

// Test all models
const results = [];
for (const modelConfig of modelsToTest) {
  const result = await testModel(modelConfig);
  results.push(result);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 RESULTS SUMMARY\n');

const successful = results.filter(r => r.success);
const failed = results.filter(r => !r.success);

console.log(`✅ Successful: ${successful.length}/${results.length}`);
if (successful.length > 0) {
  successful.forEach(r => {
    console.log(`   • ${r.model}: ${r.duration}s`);
    console.log(`     ${r.url}`);
  });
}

if (failed.length > 0) {
  console.log(`\n❌ Failed: ${failed.length}/${results.length}`);
  failed.forEach(r => {
    console.log(`   • ${r.model}: ${r.error}`);
  });
}

console.log('\n' + '='.repeat(60));
console.log('🏆 RECOMMENDATION:');
if (successful.length > 0) {
  // Find fastest
  const fastest = successful.reduce((a, b) => parseFloat(a.duration) < parseFloat(b.duration) ? a : b);
  console.log(`   Fastest: ${fastest.model} (${fastest.duration}s)`);
  console.log(`   Check saved images in /tmp/ to compare quality`);
} else {
  console.log('   All models failed. Check error messages above.');
}
