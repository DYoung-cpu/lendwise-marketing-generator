import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';
import path from 'path';

/**
 * Gemini API Client for Image Generation
 * Generates marketing template images using Gemini's imagen-3.0-generate-002 model
 */

class GeminiClient {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY or GOOGLE_API_KEY environment variable not set');
        }

        this.ai = new GoogleGenAI({ apiKey });
    }

    /**
     * Generate an image from a text prompt
     * @param {string} prompt - The text prompt for image generation
     * @param {string} outputPath - Path to save the generated image
     * @param {object} options - Generation options (temperature, topK, topP, logo, photo)
     * @returns {Promise<{success: boolean, imagePath: string, error?: string}>}
     */
    async generateImage(prompt, outputPath, options = {}) {
        try {
            // Default to low temperature for text accuracy
            const temperature = options.temperature !== undefined ? options.temperature : 0.1;
            const topK = options.topK !== undefined ? options.topK : 40;
            const topP = options.topP !== undefined ? options.topP : 0.95;
            const logo = options.logo || null;
            const photo = options.photo || null;

            console.log(`🎨 Generating image with Gemini 2.5 Flash (Banana Nano)...`);
            console.log(`📝 Prompt length: ${prompt.length} characters`);
            console.log(`🌡️  Temperature: ${temperature} (lower = more consistent text)`);
            console.log(`📊 topK: ${topK}, topP: ${topP}`);
            if (logo) {
                console.log(`🖼️  Logo included (${logo.mimeType})`);
            }
            if (photo) {
                console.log(`📸 Photo included (${photo.mimeType})`);
            }

            // Build contents array with images and text
            const parts = [];

            // Add logo first if provided
            if (logo) {
                parts.push({
                    inlineData: {
                        mimeType: logo.mimeType,
                        data: logo.data
                    }
                });
            }

            // Add photo second if provided
            if (photo) {
                parts.push({
                    inlineData: {
                        mimeType: photo.mimeType,
                        data: photo.data
                    }
                });
            }

            // Add text prompt (always)
            parts.push({
                text: prompt
            });

            // Generate image using Gemini 2.5 Flash Image (Banana Nano)
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: parts,
                generationConfig: {
                    temperature: temperature,
                    topK: topK,
                    topP: topP
                }
            });

            // Check if image was generated
            if (!response || !response.candidates || response.candidates.length === 0) {
                throw new Error('No image generated from Gemini');
            }

            // Get the generated image data from response parts
            const candidate = response.candidates[0];
            const responseParts = candidate.content.parts;

            const imagePart = responseParts.find(part => part.inlineData);
            if (!imagePart || !imagePart.inlineData) {
                throw new Error('No image data in response');
            }

            // Decode base64 image data
            const imageData = Buffer.from(imagePart.inlineData.data, 'base64');

            // Ensure output directory exists
            const outputDir = path.dirname(outputPath);
            await fs.mkdir(outputDir, { recursive: true });

            // Save image to file
            await fs.writeFile(outputPath, imageData);

            console.log(`✅ Image saved to: ${outputPath}`);
            console.log(`📊 Image size: ${(imageData.length / 1024).toFixed(2)} KB`);

            // PERFORMANCE OPTIMIZATION: Keep image data in memory to avoid re-reading from disk
            return {
                success: true,
                imagePath: outputPath,
                imageBuffer: imageData,                          // Binary data for analysis
                imageBase64: imagePart.inlineData.data,         // Original base64 for response
                sizeKB: (imageData.length / 1024).toFixed(2)
            };

        } catch (error) {
            console.error(`❌ Error generating image: ${error.message}`);
            return {
                success: false,
                imagePath: null,
                error: error.message
            };
        }
    }

    /**
     * Generate image with retry logic
     * @param {string} prompt - The text prompt
     * @param {string} outputPath - Output file path
     * @param {number} maxRetries - Maximum number of retry attempts
     * @param {object} options - Generation options (temperature, topK, topP)
     * @returns {Promise<{success: boolean, imagePath: string, attempts: number, error?: string}>}
     */
    async generateImageWithRetry(prompt, outputPath, maxRetries = 3, options = {}) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            console.log(`\n🔄 Attempt ${attempt}/${maxRetries}...`);

            const result = await this.generateImage(prompt, outputPath, options);

            if (result.success) {
                return {
                    ...result,
                    attempts: attempt
                };
            }

            if (attempt < maxRetries) {
                console.log(`⏳ Waiting 2 seconds before retry...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        return {
            success: false,
            imagePath: null,
            attempts: maxRetries,
            error: `Failed after ${maxRetries} attempts`
        };
    }
}

export default GeminiClient;
