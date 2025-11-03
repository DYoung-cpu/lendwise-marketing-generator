/**
 * OCR Service - Text Extraction from Images and Videos
 * Uses Tesseract.js for optical character recognition
 */

import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

/**
 * Download image from URL
 */
async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const file = fs.createWriteStream(outputPath);
    protocol.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(outputPath);
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

/**
 * Extract text from image file or URL
 *
 * @param {string} imageSource - File path or URL to image
 * @param {Object} options - OCR options
 * @returns {Promise<Object>} - OCR result with text and confidence
 */
export async function extractTextFromImage(imageSource, options = {}) {
  const {
    language = 'eng',
    preprocessing = true,
    enhance = true
  } = options;

  console.log(`[OCR] Starting text extraction...`);
  console.log(`[OCR] Source: ${imageSource.substring(0, 100)}...`);

  let imagePath = imageSource;
  let isTemporary = false;

  // Download if URL
  if (imageSource.startsWith('http')) {
    const tempPath = path.join('/tmp', `ocr-${Date.now()}.png`);
    console.log(`[OCR] Downloading image to ${tempPath}...`);
    imagePath = await downloadImage(imageSource, tempPath);
    isTemporary = true;
  }

  // Preprocess image for better OCR
  if (preprocessing) {
    console.log(`[OCR] Preprocessing image for better accuracy...`);
    const processedPath = path.join('/tmp', `ocr-processed-${Date.now()}.png`);

    try {
      await sharp(imagePath)
        .grayscale()                    // Convert to grayscale
        .normalize()                    // Normalize contrast
        .sharpen()                      // Sharpen text
        .threshold(128)                 // Apply threshold for clean b&w
        .toFile(processedPath);

      // Clean up original temp file if it was downloaded
      if (isTemporary) {
        fs.unlinkSync(imagePath);
      }

      imagePath = processedPath;
      isTemporary = true;
    } catch (error) {
      console.warn(`[OCR] Preprocessing failed, using original image:`, error.message);
    }
  }

  // Create Tesseract worker
  const worker = await createWorker(language);

  try {
    console.log(`[OCR] Running OCR with language: ${language}...`);

    const { data } = await worker.recognize(imagePath);

    console.log(`[OCR] ✅ Text extraction complete!`);
    console.log(`[OCR] Confidence: ${data.confidence.toFixed(2)}%`);
    console.log(`[OCR] Extracted text length: ${data.text.length} characters`);

    // Clean up temp file
    if (isTemporary) {
      try {
        fs.unlinkSync(imagePath);
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    await worker.terminate();

    return {
      success: true,
      text: data.text,
      confidence: data.confidence,
      words: data.words,
      lines: data.lines,
      paragraphs: data.paragraphs,
      symbols: data.symbols
    };

  } catch (error) {
    console.error(`[OCR] ❌ Error during text extraction:`, error);

    // Clean up
    if (isTemporary) {
      try {
        fs.unlinkSync(imagePath);
      } catch (cleanupError) {
        // Ignore
      }
    }

    await worker.terminate();

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verify expected text exists in extracted text
 *
 * @param {string} extractedText - Text extracted by OCR
 * @param {Array<string>} expectedTexts - Array of expected text strings
 * @param {Object} options - Verification options
 * @returns {Object} - Verification result
 */
export function verifyText(extractedText, expectedTexts, options = {}) {
  const {
    caseSensitive = false,
    allowPartialMatch = true,
    fuzzyMatch = false
  } = options;

  const normalizedExtracted = caseSensitive
    ? extractedText
    : extractedText.toLowerCase();

  const results = expectedTexts.map(expected => {
    const normalizedExpected = caseSensitive
      ? expected
      : expected.toLowerCase();

    // Clean whitespace
    const cleanExtracted = normalizedExtracted.replace(/\s+/g, ' ').trim();
    const cleanExpected = normalizedExpected.replace(/\s+/g, ' ').trim();

    let found = false;
    let matchType = 'none';

    // Exact match
    if (cleanExtracted.includes(cleanExpected)) {
      found = true;
      matchType = 'exact';
    }
    // Partial match (words present but maybe not exact order)
    else if (allowPartialMatch) {
      const expectedWords = cleanExpected.split(' ');
      const foundWords = expectedWords.filter(word =>
        cleanExtracted.includes(word)
      );

      if (foundWords.length === expectedWords.length) {
        found = true;
        matchType = 'partial';
      } else if (foundWords.length > 0) {
        matchType = 'partial-incomplete';
      }
    }

    return {
      expected,
      found,
      matchType,
      confidence: found ? (matchType === 'exact' ? 100 : 75) : 0
    };
  });

  const allFound = results.every(r => r.found);
  const foundCount = results.filter(r => r.found).length;

  return {
    success: allFound,
    foundCount,
    totalExpected: expectedTexts.length,
    percentage: Math.round((foundCount / expectedTexts.length) * 100),
    results,
    extractedText: extractedText.substring(0, 500) // First 500 chars for reference
  };
}

/**
 * Extract text from video frame (requires ffmpeg)
 *
 * @param {string} videoUrl - URL to video file
 * @param {number} timeSeconds - Time in video to capture frame (default: middle)
 * @returns {Promise<Object>} - OCR result
 */
export async function extractTextFromVideoFrame(videoUrl, timeSeconds = null) {
  console.log(`[OCR] Video frame text extraction not yet implemented`);
  console.log(`[OCR] Would extract frame at ${timeSeconds}s from ${videoUrl}`);

  // Note: This requires ffmpeg to be installed
  // Implementation would:
  // 1. Download video to temp location
  // 2. Use ffmpeg to extract frame at specific time
  // 3. Run OCR on extracted frame
  // 4. Clean up temp files

  return {
    success: false,
    error: 'Video frame extraction requires ffmpeg - not yet implemented'
  };
}

/**
 * Batch text extraction from multiple images
 *
 * @param {Array<string>} imageSources - Array of image URLs or paths
 * @param {Object} options - OCR options
 * @returns {Promise<Array>} - Array of OCR results
 */
export async function extractTextBatch(imageSources, options = {}) {
  console.log(`[OCR] Starting batch extraction for ${imageSources.length} images...`);

  const results = [];

  for (let i = 0; i < imageSources.length; i++) {
    console.log(`[OCR] Processing image ${i + 1}/${imageSources.length}...`);

    const result = await extractTextFromImage(imageSources[i], options);
    results.push({
      source: imageSources[i],
      index: i,
      ...result
    });

    // Small delay to avoid overwhelming system
    if (i < imageSources.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const successful = results.filter(r => r.success).length;
  console.log(`[OCR] Batch complete: ${successful}/${imageSources.length} successful`);

  return results;
}

/**
 * Quick spelling check for specific words
 *
 * @param {string} extractedText - Text from OCR
 * @param {Object} expectedWords - Object with correct spellings
 * @returns {Object} - Spelling verification result
 */
export function checkSpelling(extractedText, expectedWords) {
  const normalizedText = extractedText.toLowerCase();

  const results = {};
  let errorsFound = 0;

  for (const [correct, common_typos] of Object.entries(expectedWords)) {
    const correctLower = correct.toLowerCase();
    const hasCorrect = normalizedText.includes(correctLower);

    const typosFound = common_typos.filter(typo =>
      normalizedText.includes(typo.toLowerCase())
    );

    results[correct] = {
      correctSpelling: hasCorrect,
      typosFound: typosFound,
      status: hasCorrect ? 'correct' : (typosFound.length > 0 ? 'typo' : 'missing')
    };

    if (typosFound.length > 0 || !hasCorrect) {
      errorsFound++;
    }
  }

  return {
    success: errorsFound === 0,
    errorsFound,
    totalChecked: Object.keys(expectedWords).length,
    results
  };
}

// Export all functions
export default {
  extractTextFromImage,
  extractTextFromVideoFrame,
  extractTextBatch,
  verifyText,
  checkSpelling
};
