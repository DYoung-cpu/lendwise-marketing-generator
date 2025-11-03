/**
 * Video Compositor
 *
 * Composites styled text overlays onto Veo-generated videos using FFmpeg
 * Solves the "Firted" text error problem by overlaying perfect text
 */

import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import { generateTextOverlay, generateMultipleOverlays } from './text-overlay-renderer.js';
import { fadeInOut, slideIn, EFFECT_PRESETS, buildOverlayFilter } from './animation-effects-library.js';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegPath.path);

/**
 * Composite single text overlay onto video
 *
 * @param {string} videoPath - Path to background video
 * @param {Object} textConfig - Text overlay configuration
 * @param {string} outputPath - Output video path
 * @returns {Promise<string>} Output path
 */
export async function compositeSingleText(videoPath, textConfig, outputPath) {
  const {
    text,
    style = 'headline',
    x = 100,
    y = 100,
    startTime = 0.5,
    duration = 3.0,
    effect = 'fadeInOut'
  } = textConfig;

  console.log(`[COMPOSITOR] Generating text overlay: "${text}"`);

  // Generate text PNG
  const textBuffer = await generateTextOverlay({
    text,
    style,
    width: 1080,
    height: 1920
  });

  // Save to temp file
  const tempTextPath = join(tmpdir(), `text-overlay-${Date.now()}.png`);
  await writeFile(tempTextPath, textBuffer);

  console.log(`[COMPOSITOR] Text overlay saved: ${tempTextPath}`);
  console.log(`[COMPOSITOR] Compositing onto video...`);

  // Build effect filter
  let effectFilter;
  if (effect === 'fadeInOut') {
    effectFilter = fadeInOut(startTime, duration);
  } else if (effect === 'slideInRight') {
    const slideEffect = slideIn('right', startTime, 0.5, x, y);
    effectFilter = slideEffect.filter;
  } else if (typeof effect === 'string' && EFFECT_PRESETS[effect]) {
    effectFilter = EFFECT_PRESETS[effect](startTime, x, y).filter || EFFECT_PRESETS[effect](startTime);
  } else {
    effectFilter = fadeInOut(startTime, duration);
  }

  const endTime = startTime + duration;

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .input(tempTextPath)
      .complexFilter([
        // Apply effect to text overlay
        `[1:v]${effectFilter}[text]`,
        // Overlay text on video with timing
        `[0:v][text]overlay=x=${x}:y=${y}:enable='between(t,${startTime},${endTime})'`
      ])
      .outputOptions([
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-c:a', 'copy'
      ])
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log(`[COMPOSITOR] FFmpeg command: ${commandLine}`);
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`[COMPOSITOR] Progress: ${Math.round(progress.percent)}%`);
        }
      })
      .on('end', async () => {
        console.log(`[COMPOSITOR] ✅ Video composited successfully!`);
        // Clean up temp file
        await unlink(tempTextPath).catch(() => {});
        resolve(outputPath);
      })
      .on('error', async (err) => {
        console.error(`[COMPOSITOR] ❌ Error:`, err.message);
        // Clean up temp file
        await unlink(tempTextPath).catch(() => {});
        reject(err);
      })
      .run();
  });
}

/**
 * Composite multiple text overlays onto video
 *
 * @param {string} videoPath - Path to background video
 * @param {Array} textLayers - Array of text layer configurations
 * @param {string} outputPath - Output video path
 * @returns {Promise<string>} Output path
 */
export async function compositeMultipleTexts(videoPath, textLayers, outputPath) {
  console.log(`[COMPOSITOR] Generating ${textLayers.length} text overlays...`);

  // Generate all text overlays
  const overlays = await generateMultipleOverlays(textLayers.map(layer => ({
    text: layer.text,
    style: layer.style || 'headline',
    width: 1080,
    height: 1920,
    customStyle: layer.customStyle
  })));

  // Save to temp files
  const tempPaths = [];
  for (const [index, { buffer }] of overlays.entries()) {
    const tempPath = join(tmpdir(), `text-overlay-${Date.now()}-${index}.png`);
    await writeFile(tempPath, buffer);
    tempPaths.push(tempPath);
    console.log(`[COMPOSITOR] Text ${index + 1} saved: ${tempPath}`);
  }

  console.log(`[COMPOSITOR] Compositing ${textLayers.length} layers onto video...`);

  // Build complex filter
  const filters = [];
  let lastOutput = '[0:v]';

  for (const [index, layer] of textLayers.entries()) {
    const {
      x = 100,
      y = 100 + (index * 150),
      startTime = 0.5 + (index * 0.5),
      duration = 3.0,
      effect = 'fadeInOut'
    } = layer;

    const endTime = startTime + duration;
    const layerNum = index + 1;

    // Build effect filter
    let effectFilter;
    if (effect === 'fadeInOut') {
      effectFilter = fadeInOut(startTime, duration);
    } else if (effect === 'slideInRight') {
      effectFilter = fadeInOut(startTime, duration, 0.3, 0.3); // Simplified for multiple layers
    } else if (typeof effect === 'string' && EFFECT_PRESETS[effect]) {
      effectFilter = EFFECT_PRESETS[effect](startTime);
    } else {
      effectFilter = fadeInOut(startTime, duration);
    }

    // Add fade filter for this layer
    filters.push(`[${layerNum}:v]${effectFilter}[text${index}]`);

    // Add overlay filter
    const nextOutput = index < textLayers.length - 1 ? `[v${index + 1}]` : '';
    filters.push(`${lastOutput}[text${index}]overlay=x=${x}:y=${y}:enable='between(t,${startTime},${endTime})'${nextOutput}`);

    lastOutput = `[v${index + 1}]`;
  }

  return new Promise((resolve, reject) => {
    let command = ffmpeg(videoPath);

    // Add all text overlay inputs
    for (const tempPath of tempPaths) {
      command = command.input(tempPath);
    }

    command
      .complexFilter(filters)
      .outputOptions([
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-c:a', 'copy'
      ])
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log(`[COMPOSITOR] FFmpeg command: ${commandLine.substring(0, 200)}...`);
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`[COMPOSITOR] Progress: ${Math.round(progress.percent)}%`);
        }
      })
      .on('end', async () => {
        console.log(`[COMPOSITOR] ✅ Video composited successfully with ${textLayers.length} layers!`);
        // Clean up temp files
        for (const tempPath of tempPaths) {
          await unlink(tempPath).catch(() => {});
        }
        resolve(outputPath);
      })
      .on('error', async (err) => {
        console.error(`[COMPOSITOR] ❌ Error:`, err.message);
        // Clean up temp files
        for (const tempPath of tempPaths) {
          await unlink(tempPath).catch(() => {});
        }
        reject(err);
      })
      .run();
  });
}

/**
 * Quick composite with Nano-style defaults for rate alerts
 *
 * @param {string} videoPath - Background video
 * @param {Object} rateData - Rate data
 * @param {string} outputPath - Output path
 * @returns {Promise<string>} Output path
 */
export async function compositeRateAlert(videoPath, rateData, outputPath) {
  const {
    headline = 'MORTGAGE RATE UPDATE',
    mainRate = '30-Year Fixed: 6.13%',
    additionalRates = '15-Year: 5.45% | Jumbo: 6.75%',
    contact = 'Contact David Young NMLS 62043'
  } = rateData;

  const textLayers = [
    {
      text: headline,
      style: 'headline',
      x: 100,
      y: 200,
      startTime: 0.5,
      duration: 3.5,
      effect: 'fadeZoomIn'
    },
    {
      text: mainRate,
      style: 'rateLarge',
      x: 100,
      y: 400,
      startTime: 1.0,
      duration: 3.0,
      effect: 'energyBounce'
    },
    {
      text: additionalRates,
      style: 'rateSmall',
      x: 100,
      y: 600,
      startTime: 1.5,
      duration: 2.5,
      effect: 'fadeInOut'
    },
    {
      text: contact,
      style: 'contact',
      x: 100,
      y: 1700,
      startTime: 2.0,
      duration: 2.0,
      effect: 'fadeInOut'
    }
  ];

  return compositeMultipleTexts(videoPath, textLayers, outputPath);
}

export default {
  compositeSingleText,
  compositeMultipleTexts,
  compositeRateAlert
};
