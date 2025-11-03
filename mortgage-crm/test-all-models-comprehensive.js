import Replicate from 'replicate';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

function imageToDataURI(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  return `data:image/jpeg;base64,${base64Image}`;
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
    description: 'Google\'s multimodal model with native image+text understanding. Fast, affordable ($0.039/image), excellent for seamless photo integration.',
    id: 'google/gemini-2.5-flash-image',
    input: {
      prompt: prompt,
      image_input: [photoDataURI],
      aspect_ratio: '1:1',
      output_format: 'jpg'
    }
  },
  {
    name: 'HunyuanImage-3.0',
    description: 'Tencent\'s 80B parameter MoE model. State-of-the-art visual quality, exceptional prompt adherence, photorealistic imagery.',
    id: 'tencent/hunyuan-image-3',
    input: {
      prompt: prompt,
      image: photoDataURI,
      aspect_ratio: '1:1'
    }
  },
  {
    name: 'FLUX.1 img2img',
    description: 'Black Forest Labs image-to-image workflow. Blends input image with text prompt for unique visual content.',
    id: 'bxclib2/flux_img2img',
    input: {
      prompt: prompt,
      input_image: photoDataURI,
      aspect_ratio: '1:1'
    }
  },
  {
    name: 'FLUX.1 Kontext Pro',
    description: 'Black Forest Labs\' 12B parameter editing model. Strong character preservation, iterative precise edits, excellent for face consistency.',
    id: 'black-forest-labs/flux-kontext-pro',
    input: {
      prompt: prompt,
      image: photoDataURI,
      aspect_ratio: '1:1'
    }
  },
  {
    name: 'Ideogram v3 Turbo',
    description: 'Fast text-to-image model optimized for typography and text rendering. May not support image input.',
    id: 'ideogram-ai/ideogram-v3-turbo',
    input: {
      prompt: prompt + ' Include the provided headshot photo of the loan officer.',
      image_prompt: photoDataURI,
      aspect_ratio: '1:1'
    }
  }
];

console.log('🎨 COMPREHENSIVE MODEL TESTING\n');
console.log('Testing 5 multimodal AI models with your photo');
console.log('=' .repeat(70));

const results = [];

for (const modelConfig of modelsToTest) {
  console.log(`\n📸 ${modelConfig.name}`);
  console.log(`   ${modelConfig.description}`);
  console.log(`   Model: ${modelConfig.id}`);

  const startTime = Date.now();

  try {
    console.log('   ⏳ Generating...');
    const output = await replicate.run(modelConfig.id, { input: modelConfig.input });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    let imageUrl;
    if (Array.isArray(output)) imageUrl = output[0];
    else if (typeof output === 'string') imageUrl = output;
    else if (output?.url) imageUrl = output.url;
    else imageUrl = String(output);

    console.log(`   ✅ Success! (${duration}s)`);
    console.log(`   🔗 ${imageUrl}`);

    const response = await fetch(imageUrl);
    const buffer = await Buffer.from(await response.arrayBuffer());
    const filename = `/tmp/${modelConfig.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.jpg`;
    fs.writeFileSync(filename, buffer);

    results.push({
      success: true,
      name: modelConfig.name,
      description: modelConfig.description,
      model: modelConfig.id,
      url: imageUrl,
      duration,
      filename,
      fileSize: buffer.length
    });

  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`   ❌ Failed (${duration}s)`);
    console.log(`   Error: ${error.message}`);

    results.push({
      success: false,
      name: modelConfig.name,
      description: modelConfig.description,
      model: modelConfig.id,
      error: error.message,
      duration
    });
  }
}

// Save results to JSON
fs.writeFileSync('/tmp/model-comparison-results.json', JSON.stringify(results, null, 2));

console.log('\n' + '='.repeat(70));
console.log('📊 FINAL RESULTS\n');

const successful = results.filter(r => r.success);
const failed = results.filter(r => !r.success);

console.log(`✅ Successful: ${successful.length}/${results.length}\n`);
successful.forEach(r => {
  const sizeMB = (r.fileSize / 1024).toFixed(0);
  console.log(`   🏆 ${r.name}`);
  console.log(`      Speed: ${r.duration}s | Size: ${sizeMB}KB`);
  console.log(`      ${r.url}\n`);
});

if (failed.length > 0) {
  console.log(`❌ Failed: ${failed.length}/${results.length}\n`);
  failed.forEach(r => {
    console.log(`   ⚠️  ${r.name}`);
    console.log(`      ${r.error}\n`);
  });
}

console.log('💾 Results saved to: /tmp/model-comparison-results.json');
console.log('🖼️  Images saved to: /tmp/');
