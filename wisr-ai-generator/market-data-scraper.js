/**
 * Market Data Scraper - Live Mortgage Rates from Mortgage News Daily
 * Uses Firecrawl API for robust, JS-rendered scraping
 */

import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import Firecrawl from '@mendable/firecrawl-js';

// Load environment variables from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

// Initialize Firecrawl with API key (correct class name: Firecrawl, not FirecrawlApp)
const firecrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY
});

// Cache for 1 hour (avoid burning through API credits)
let cachedData = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in ms

/**
 * Returns random market commentary to prevent repetitive taglines
 * @returns {string} Random creative market commentary
 */
function getRandomMarketCommentary() {
  const creative = [
    "Market opportunities emerging today",
    "Rates responding to economic signals",
    "Strategic timing for rate decisions",
    "Favorable conditions developing now",
    "Market showing dynamic shifts",
    "Economic factors creating opportunities",
    "Rate environment evolving strategically",
    "Current conditions favor borrowers",
    "Rates reflecting market trends",
    "Opportunity window opening now",
    "Market movement benefits buyers",
    "Strategic rate positioning available",
    "Conditions align for decisions",
    "Market signals point to action",
    "Economic trends support timing",
    "Rate landscape shifts favorably",
    "Optimal conditions for locking",
    "Market creates strategic openings",
    "Timing favors rate decisions",
    "Economic climate supports buyers",
    "Rate positioning benefits clients",
    "Market environment rewards timing",
    "Strategic advantage emerging today",
    "Conditions create buyer opportunities",
    "Rate trends favor quick action"
  ];
  return creative[Math.floor(Math.random() * creative.length)];
}

/**
 * Scrape live mortgage rates from Mortgage News Daily
 * @returns {Promise<Object>} Structured market data
 */
export async function scrapeLiveMarketData() {
  // Check cache first
  const now = Date.now();
  if (cachedData && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('[MARKET-DATA] Using cached data (age: ' + Math.round((now - cacheTimestamp) / 1000 / 60) + ' minutes)');
    return cachedData;
  }

  try {
    console.log('[MARKET-DATA] Scraping live data from mortgagenewsdaily.com...');

    // Scrape the rates page using Firecrawl SDK
    const result = await firecrawl.scrape('https://www.mortgagenewsdaily.com/mortgage-rates', {
      formats: ['markdown']
    });

    // SDK returns data directly (not wrapped in success object)
    if (!result || !result.markdown) {
      throw new Error('Failed to scrape mortgage rates page');
    }

    // Parse the markdown to extract rates
    const markdown = result.markdown;
    const data = parseMarketData(markdown);

    // Cache the result
    cachedData = data;
    cacheTimestamp = now;

    console.log('[MARKET-DATA] ✅ Live data scraped successfully');
    console.log(`   30-Year Fixed: ${data.rates['30yr']} ${data.changes['30yr']}`);

    return data;

  } catch (error) {
    console.error('[MARKET-DATA] ❌ Scraping error:', error.message);

    // Fallback to cached data if available
    if (cachedData) {
      console.log('[MARKET-DATA] Using stale cached data as fallback');
      return cachedData;
    }

    // If no cache, return hardcoded fallback
    console.log('[MARKET-DATA] No cache available, using hardcoded fallback');
    return getFallbackData();
  }
}

/**
 * Parse markdown from mortgagenewsdaily.com to extract rates
 * @param {string} markdown - The scraped markdown content
 * @returns {Object} Structured market data
 */
function parseMarketData(markdown) {
  const data = {
    date: new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
    timestamp: new Date().toISOString(),
    rates: {},
    changes: {},
    treasuries: {},
    economicFactors: [],
    lockStrategy: '',
    expertInsight: '',
    trend: '',
    commentary: ''
  };

  // Extract 30-Year Fixed rate
  const match30yr = markdown.match(/30 Yr\. Fixed.*?(\d+\.\d+)%.*?Change:\s*([\+\-]\d+\.\d+)/s);
  if (match30yr) {
    data.rates['30yr'] = match30yr[1] + '%';
    data.changes['30yr'] = match30yr[2] + '%';
  }

  // Extract 15-Year Fixed rate
  const match15yr = markdown.match(/15 Yr\. Fixed.*?(\d+\.\d+)%.*?Change:\s*([\+\-]\d+\.\d+)/s);
  if (match15yr) {
    data.rates['15yr'] = match15yr[1] + '%';
    data.changes['15yr'] = match15yr[2] + '%';
  }

  // Extract Jumbo rate
  const matchJumbo = markdown.match(/30 Yr\. Jumbo.*?(\d+\.\d+)%.*?Change:\s*([\+\-]\d+\.\d+)/s);
  if (matchJumbo) {
    data.rates['jumbo'] = matchJumbo[1] + '%';
    data.changes['jumbo'] = matchJumbo[2] + '%';
  }

  // Extract 10-year treasury (if available)
  const matchTreasury = markdown.match(/10[- ]?(?:yr|year|YR|Year).*?(\d+\.\d+)%/i);
  if (matchTreasury) {
    data.treasuries['10yr'] = matchTreasury[1] + '%';
  }

  // Extract market commentary
  const commentaryMatch = markdown.match(/Yet Again, Mortgage Rates.*?(?:today|Today|rates|Rates).*?\.([^\.]+\.)/s);
  if (commentaryMatch) {
    data.commentary = commentaryMatch[1].trim();
  } else {
    data.commentary = 'Rates showing movement today';
  }

  // Extract trend from rate changes
  const rate30 = parseFloat(data.rates['30yr']);
  const change30 = parseFloat(data.changes['30yr']);

  if (change30 > 0.05) {
    data.trend = 'Mortgage rates moving higher after recent Fed actions';
    data.economicFactors = [
      { factor: 'Fed policy expectations shift', impact: 'negative' },
      { factor: 'Bond market volatility', impact: 'negative' },
      { factor: 'Economic data influence', impact: 'mixed' }
    ];
  } else if (change30 < -0.05) {
    data.trend = 'Mortgage rates declining on favorable bond market conditions';
    data.economicFactors = [
      { factor: 'Bond yields falling', impact: 'positive' },
      { factor: 'Economic data supporting lower rates', impact: 'positive' },
      { factor: 'Market sentiment improving', impact: 'positive' }
    ];
  } else {
    data.trend = 'Mortgage rates showing minimal movement';
    data.economicFactors = [
      { factor: 'Fed policy holding steady', impact: 'neutral' },
      { factor: 'Markets near recent levels', impact: 'neutral' },
      { factor: 'Bond yields stable', impact: 'neutral' }
    ];
  }

  // Lock strategy based on current rate level
  if (rate30 < 6.2) {
    data.lockStrategy = 'Rates near recent lows - favorable time to lock today';
    data.expertInsight = getRandomMarketCommentary().toUpperCase();
  } else if (rate30 > 6.5) {
    data.lockStrategy = 'Consider floating if expecting improvement, or lock to avoid further increases';
    data.expertInsight = getRandomMarketCommentary().toUpperCase();
  } else {
    data.lockStrategy = 'Consult with loan officer for personalized strategy based on your timeline';
    data.expertInsight = getRandomMarketCommentary().toUpperCase();
  }

  return data;
}

/**
 * Fallback data if scraping fails
 * @returns {Object} Static fallback market data
 */
function getFallbackData() {
  return {
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    timestamp: new Date().toISOString(),
    rates: {
      '30yr': '6.30%',
      '15yr': '5.75%',
      'jumbo': '6.25%'
    },
    changes: {
      '30yr': '+0.05%',
      '15yr': '+0.03%',
      'jumbo': '+0.04%'
    },
    treasuries: {
      '10yr': '4.25%'
    },
    economicFactors: [
      { factor: 'Fed policy expectations', impact: 'neutral' },
      { factor: 'Economic data mixed', impact: 'neutral' },
      { factor: 'Markets near recent levels', impact: 'neutral' }
    ],
    lockStrategy: 'Consult with loan officer for personalized strategy',
    expertInsight: 'MARKET DATA TEMPORARILY UNAVAILABLE - CONTACT FOR CURRENT RATES',
    trend: 'Live data unavailable - static estimate provided',
    commentary: 'Unable to fetch live rates - using estimated data'
  };
}

export default { scrapeLiveMarketData };
