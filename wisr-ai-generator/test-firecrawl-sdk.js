/**
 * Quick test of Firecrawl SDK
 */

import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import Firecrawl from '@mendable/firecrawl-js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

console.log('🔑 FIRECRAWL_API_KEY:', process.env.FIRECRAWL_API_KEY ? 'LOADED' : 'MISSING');

// Initialize Firecrawl (correct class name)
const firecrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY
});

console.log('📡 Firecrawl instance created');
console.log('📋 Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(firecrawl)));

async function testScrape() {
  try {
    console.log('\n🧪 Testing .scrape() method with correct SDK...');
    const result = await firecrawl.scrape('https://www.mortgagenewsdaily.com/mortgage-rates', {
      formats: ['markdown']
    });

    console.log('✅ Scrape successful!');
    console.log('📊 Result keys:', Object.keys(result));

    if (result.markdown) {
      console.log('📄 Markdown length:', result.markdown.length);
      console.log('📄 First 200 chars:', result.markdown.substring(0, 200));
    }

  } catch (error) {
    console.error('❌ Scrape failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testScrape();
