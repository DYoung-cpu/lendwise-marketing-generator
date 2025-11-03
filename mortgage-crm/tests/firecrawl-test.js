#!/usr/bin/env node

/**
 * Firecrawl Market Data Test
 *
 * Tests the Firecrawl integration for fetching live mortgage rate data:
 * 1. Checks if Firecrawl API key is configured
 * 2. Tests market data fetching (real or fallback)
 * 3. Validates data structure
 * 4. Verifies graceful fallback when API unavailable
 */

import DataAgent from '../src/agents/data-agent.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('🧪 Testing Firecrawl Market Data Integration\n');
console.log('─'.repeat(50));

class FirecrawlTester {
  constructor() {
    this.dataAgent = new DataAgent();
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0
    };
  }

  pass(test, details = '') {
    this.results.passed++;
    console.log(`✅ ${test}`);
    if (details) console.log(`   ${details}`);
  }

  fail(test, error) {
    this.results.failed++;
    console.log(`❌ ${test}`);
    console.log(`   Error: ${error}`);
  }

  warn(message) {
    this.results.warnings++;
    console.log(`⚠️  ${message}`);
  }

  // Test 1: Check API Key Configuration
  async testAPIKeyConfiguration() {
    console.log('\n📋 Test 1: Firecrawl API Key Configuration');
    console.log('─'.repeat(50));

    const apiKey = process.env.FIRECRAWL_API_KEY;

    if (apiKey && apiKey.length > 0) {
      this.pass('FIRECRAWL_API_KEY is configured');
      console.log(`   Length: ${apiKey.length} characters`);
      console.log(`   Prefix: ${apiKey.substring(0, 10)}...`);

      if (this.dataAgent.firecrawlKey === apiKey) {
        this.pass('DataAgent loaded the API key correctly');
      } else {
        this.fail('DataAgent API key', 'Not loaded from environment');
      }
    } else {
      this.warn('FIRECRAWL_API_KEY not configured');
      console.log('   System will use fallback market data');
      console.log('   To enable live data: Add FIRECRAWL_API_KEY to .env');
    }

    console.log('');
  }

  // Test 2: Test Market Data Fetching
  async testMarketDataFetch() {
    console.log('📋 Test 2: Market Data Fetching');
    console.log('─'.repeat(50));

    try {
      console.log('Fetching market data...');

      const startTime = Date.now();
      const marketData = await this.dataAgent.fetchMarketData();
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`✅ Data fetched in ${duration}s\n`);

      if (!marketData) {
        this.fail('Market data fetch', 'Returned null or undefined');
        console.log('');
        return;
      }

      this.pass('Market data returned');

      // Validate structure
      if (marketData.rates) {
        this.pass('Rates data present');
        console.log(`   30-year: ${marketData.rates['30yr'] || 'N/A'}`);
        console.log(`   15-year: ${marketData.rates['15yr'] || 'N/A'}`);
        console.log(`   FHA: ${marketData.rates['fha'] || 'N/A'}`);
      } else {
        this.fail('Rates data', 'Missing from response');
      }

      if (marketData.trend) {
        this.pass('Trend data present', `Trend: ${marketData.trend}`);
      } else {
        this.warn('Trend data missing');
      }

      if (marketData.date) {
        this.pass('Date data present', `Date: ${marketData.date}`);
      } else {
        this.warn('Date data missing');
      }

      console.log('');

      // Check if using Firecrawl or fallback
      const usingFirecrawl = process.env.FIRECRAWL_API_KEY && duration > 1;

      if (usingFirecrawl) {
        console.log('📡 Using live Firecrawl data');
      } else {
        console.log('💾 Using fallback data (no Firecrawl API key or fast response)');
      }

      console.log('');

    } catch (error) {
      this.fail('Market data fetch', error.message);
      console.log('');
    }
  }

  // Test 3: Test Data Parsing
  async testDataParsing() {
    console.log('📋 Test 3: Data Parsing Methods');
    console.log('─'.repeat(50));

    try {
      // Test extractRate method
      const mockData = {
        content: 'Today\'s rates: 30-year fixed at 6.45% and 15-year at 5.85%'
      };

      const rate30 = this.dataAgent.extractRate(mockData, '30-year');
      const rate15 = this.dataAgent.extractRate(mockData, '15-year');

      if (rate30 && rate30.includes('6.45')) {
        this.pass('30-year rate extraction works', `Extracted: ${rate30}`);
      } else {
        this.fail('30-year rate extraction', `Got: ${rate30}`);
      }

      if (rate15 && rate15.includes('5.85')) {
        this.pass('15-year rate extraction works', `Extracted: ${rate15}`);
      } else {
        this.fail('15-year rate extraction', `Got: ${rate15}`);
      }

      // Test trend extraction
      const trendUpData = { content: 'Rates are rising today' };
      const trendDownData = { content: 'Rates are falling' };
      const trendSteadyData = { content: 'Rates remain stable' };

      const trendUp = this.dataAgent.extractTrend(trendUpData);
      const trendDown = this.dataAgent.extractTrend(trendDownData);
      const trendSteady = this.dataAgent.extractTrend(trendSteadyData);

      if (trendUp === 'up') {
        this.pass('Upward trend detection works');
      } else {
        this.fail('Upward trend detection', `Got: ${trendUp}`);
      }

      if (trendDown === 'down') {
        this.pass('Downward trend detection works');
      } else {
        this.fail('Downward trend detection', `Got: ${trendDown}`);
      }

      if (trendSteady === 'steady') {
        this.pass('Steady trend detection works');
      } else {
        this.fail('Steady trend detection', `Got: ${trendSteady}`);
      }

      console.log('');

    } catch (error) {
      this.fail('Data parsing', error.message);
      console.log('');
    }
  }

  // Test 4: Test Fallback Mechanism
  async testFallbackMechanism() {
    console.log('📋 Test 4: Fallback Mechanism');
    console.log('─'.repeat(50));

    try {
      // Temporarily remove API key to test fallback
      const originalKey = this.dataAgent.firecrawlKey;
      this.dataAgent.firecrawlKey = null;

      console.log('Testing with API key disabled...');

      const fallbackData = await this.dataAgent.fetchMarketData();

      if (fallbackData && fallbackData.rates) {
        this.pass('Fallback data works when API unavailable');
        console.log(`   Fallback rates: ${JSON.stringify(fallbackData.rates)}`);
      } else {
        this.fail('Fallback mechanism', 'Did not return valid data');
      }

      // Restore original key
      this.dataAgent.firecrawlKey = originalKey;

      console.log('');

    } catch (error) {
      this.fail('Fallback mechanism', error.message);
      console.log('');
    }
  }

  // Final Report
  printSummary() {
    console.log('═'.repeat(50));
    console.log('📊 Firecrawl Test Summary');
    console.log('═'.repeat(50));
    console.log('');

    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log('');

    const total = this.results.passed + this.results.failed;
    const successRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;
    console.log(`Success Rate: ${successRate}%`);
    console.log('');

    if (this.results.failed === 0) {
      console.log('🎉 Firecrawl integration is working properly!');
      console.log('');

      if (this.results.warnings > 0) {
        console.log('⚠️  Notes:');
        console.log('- System will use fallback data if Firecrawl is unavailable');
        console.log('- Add FIRECRAWL_API_KEY to .env for live market data');
        console.log('');
      }

      console.log('Next steps:');
      console.log('1. Monitor Firecrawl API usage and costs');
      console.log('2. Consider caching market data (updates once per hour)');
      console.log('3. Add more data sources (Bankrate, etc.)');
      console.log('');

      return 0;
    } else {
      console.log('⚠️  Some tests failed.');
      console.log('');
      console.log('Troubleshooting:');
      console.log('1. Check FIRECRAWL_API_KEY in .env');
      console.log('2. Verify Firecrawl API endpoint: https://api.firecrawl.dev');
      console.log('3. Check API quota/billing status');
      console.log('4. Test fallback mechanism works as backup');
      console.log('');

      return 1;
    }
  }

  // Main test runner
  async run() {
    await this.testAPIKeyConfiguration();
    await this.testMarketDataFetch();
    await this.testDataParsing();
    await this.testFallbackMechanism();

    return this.printSummary();
  }
}

// Run tests
const tester = new FirecrawlTester();

tester.run()
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('\n💥 Fatal test error:', error);
    process.exit(1);
  });
