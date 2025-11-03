import Tesseract from 'tesseract.js';
import fetch from 'node-fetch';
import { writeFileSync, unlinkSync } from 'fs';

class OCRService {
  async validate(imageUrl) {
    try {
      // Download image
      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      const tempPath = `/tmp/temp-${Date.now()}.png`;
      writeFileSync(tempPath, Buffer.from(buffer));

      // Run OCR
      const result = await Tesseract.recognize(tempPath, 'eng');

      // Clean up
      unlinkSync(tempPath);

      return {
        text: result.data.text,
        confidence: result.data.confidence / 100,
        score: result.data.confidence / 100
      };

    } catch (error) {
      console.error('OCR error:', error);
      return {
        text: '',
        confidence: 0,
        score: 0
      };
    }
  }
}

export default OCRService;
