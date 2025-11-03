/**
 * Market Intelligence Agent
 * Gathers real-time mortgage rates, news, and market data
 * Sources: Mortgage News Daily, HousingWire, Federal Reserve, Realtor.com, FRED
 */

import fetch from 'node-fetch';

class MarketIntelligenceAgent {
  constructor() {
    this.firecrawlKey = process.env.FIRECRAWL_API_KEY;
    this.cache = new Map();
    this.cacheLifetime = 15 * 60 * 1000; // 15 minutes

    this.sources = {
      rates: 'https://www.mortgagenewsdaily.com/mortgage-rates',
      news: 'https://www.mortgagenewsdaily.com/news',
      analysis: 'https://www.housingwire.com/articles/',
      fedUpdates: 'https://www.federalreserve.gov/newsevents/pressreleases.htm',
      marketTrends: 'https://www.realtor.com/research/data/',
      economicData: 'https://fred.stlouisfed.org/series/MORTGAGE30US'
    };

    console.log('🌐 Market Intelligence Agent initialized');
  }

  /**
   * Main entry point - gather all relevant market intelligence
   */
  async gatherMarketIntelligence(contentType = 'general') {
    console.log('🌐 Gathering market intelligence for:', contentType);

    try {
      const intelligence = {
        timestamp: new Date().toISOString(),
        rates: await this.getCurrentRates(),
        breakingNews: await this.getBreakingNews(),
        marketTrends: await this.getMarketTrends(),
        fedPolicy: await this.getFedUpdates(),
        contentSuggestions: []
      };

      // Generate content suggestions based on data
      intelligence.contentSuggestions = this.generateContentSuggestions(intelligence);

      // Prioritize data for specific content type
      const prioritized = this.prioritizeForContent(intelligence, contentType);

      console.log('✅ Market intelligence gathered');
      return prioritized;

    } catch (error) {
      console.error('❌ Failed to gather market intelligence:', error.message);
      return this.getFallbackData(contentType);
    }
  }

  /**
   * Get current mortgage rates
   */
  async getCurrentRates() {
    const cached = this.getFromCache('rates');
    if (cached) return cached;

    try {
      const data = await this.scrapeWithFirecrawl(this.sources.rates);

      const rates = {
        '30yr': this.extractRate(data, '30-year', '6.5'),
        '15yr': this.extractRate(data, '15-year', '5.75'),
        'arm': this.extractRate(data, '5/1 ARM', '6.0'),
        'fha': this.extractRate(data, 'FHA', '6.25'),
        'va': this.extractRate(data, 'VA', '6.0'),
        'jumbo': this.extractRate(data, 'Jumbo', '6.75'),
        trend: this.extractTrend(data),
        change: this.extractChange(data),
        lastUpdated: new Date().toISOString()
      };

      this.setCache('rates', rates);
      return rates;

    } catch (error) {
      console.warn('Using fallback rates:', error.message);
      return this.getFallbackRates();
    }
  }

  /**
   * Get breaking news headlines
   */
  async getBreakingNews() {
    const cached = this.getFromCache('news');
    if (cached) return cached;

    try {
      const data = await this.scrapeWithFirecrawl(this.sources.news);
      const headlines = this.extractHeadlines(data);

      const categorized = {
        urgent: headlines.filter(h =>
          h.toLowerCase().includes('fed') ||
          h.toLowerCase().includes('breaking') ||
          h.toLowerCase().includes('alert')
        ),
        rateRelated: headlines.filter(h =>
          h.toLowerCase().includes('rate') ||
          h.toLowerCase().includes('mortgage')
        ),
        marketMovers: headlines.filter(h =>
          h.toLowerCase().includes('housing') ||
          h.toLowerCase().includes('inventory') ||
          h.toLowerCase().includes('prices')
        ),
        regulatory: headlines.filter(h =>
          h.toLowerCase().includes('cfpb') ||
          h.toLowerCase().includes('regulation')
        ),
        all: headlines
      };

      this.setCache('news', categorized);
      return categorized;

    } catch (error) {
      console.warn('Using fallback news:', error.message);
      return this.getFallbackNews();
    }
  }

  /**
   * Get market trends data
   */
  async getMarketTrends() {
    const cached = this.getFromCache('trends');
    if (cached) return cached;

    try {
      const data = await this.scrapeWithFirecrawl(this.sources.marketTrends);

      const trends = {
        inventoryLevel: this.extractMetric(data, 'inventory', 'moderate'),
        medianPrice: this.extractMetric(data, 'median price', '$425,000'),
        daysOnMarket: this.extractMetric(data, 'days on market', '35'),
        priceDirection: this.extractTrend(data, 'up'),
        buyerDemand: this.extractMetric(data, 'demand', 'moderate'),
        forecast: this.extractForecast(data, 'stable')
      };

      this.setCache('trends', trends);
      return trends;

    } catch (error) {
      console.warn('Using fallback trends:', error.message);
      return this.getFallbackTrends();
    }
  }

  /**
   * Get Federal Reserve updates
   */
  async getFedUpdates() {
    const cached = this.getFromCache('fed');
    if (cached) return cached;

    try {
      const data = await this.scrapeWithFirecrawl(this.sources.fedUpdates);

      const fedData = {
        nextMeeting: this.extractDate(data, 'FOMC', 'TBD'),
        rateExpectation: this.extractExpectation(data, 'stable'),
        recentStatement: this.extractStatement(data, 'Monitoring economic conditions'),
        economicOutlook: this.extractOutlook(data, 'cautiously optimistic')
      };

      this.setCache('fed', fedData);
      return fedData;

    } catch (error) {
      console.warn('Using fallback Fed data:', error.message);
      return this.getFallbackFedData();
    }
  }

  /**
   * Scrape URL using Firecrawl API
   */
  async scrapeWithFirecrawl(url) {
    if (!this.firecrawlKey) {
      throw new Error('FIRECRAWL_API_KEY not configured');
    }

    try {
      const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.firecrawlKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url,
          pageOptions: {
            onlyMainContent: true,
            includeHtml: false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Firecrawl API error: ${response.status}`);
      }

      const result = await response.json();
      return result.data?.content || '';

    } catch (error) {
      console.error(`Failed to scrape ${url}:`, error.message);
      throw error;
    }
  }

  /**
   * Extract rate from scraped data
   */
  extractRate(data, rateType, fallback) {
    try {
      // Look for patterns like "6.5%" or "6.50%"
      const pattern = new RegExp(`${rateType}[^\\d]*(\\d+\\.\\d+)%`, 'i');
      const match = data.match(pattern);
      return match ? match[1] + '%' : fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * Extract trend direction
   */
  extractTrend(data, fallback = 'stable') {
    const dataLower = data.toLowerCase();

    if (dataLower.includes('falling') || dataLower.includes('down') || dataLower.includes('lower')) {
      return 'down';
    }
    if (dataLower.includes('rising') || dataLower.includes('up') || dataLower.includes('higher')) {
      return 'up';
    }
    return fallback;
  }

  /**
   * Extract rate change
   */
  extractChange(data) {
    try {
      const pattern = /([+-]?\d+\.\d+)%?\s*(basis points|bps)/i;
      const match = data.match(pattern);
      return match ? parseFloat(match[1]) / 100 : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Extract headlines from news page
   */
  extractHeadlines(data) {
    try {
      // Split by newlines and filter for headline-like text
      const lines = data.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 20 && line.length < 150)
        .filter(line => !line.includes('http'))
        .filter(line => /^[A-Z]/.test(line));

      return lines.slice(0, 10); // Top 10 headlines
    } catch {
      return [];
    }
  }

  /**
   * Extract metric value
   */
  extractMetric(data, metricName, fallback) {
    try {
      const pattern = new RegExp(`${metricName}[^\\d]*([\\d,]+)`, 'i');
      const match = data.match(pattern);
      return match ? match[1] : fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * Extract forecast
   */
  extractForecast(data, fallback) {
    const dataLower = data.toLowerCase();

    if (dataLower.includes('expect') && dataLower.includes('rise')) return 'rising';
    if (dataLower.includes('expect') && dataLower.includes('fall')) return 'falling';
    if (dataLower.includes('forecast') && dataLower.includes('stable')) return 'stable';

    return fallback;
  }

  /**
   * Extract date
   */
  extractDate(data, context, fallback) {
    try {
      const pattern = new RegExp(`${context}[^\\d]*([A-Z][a-z]+ \\d{1,2},? \\d{4})`, 'i');
      const match = data.match(pattern);
      return match ? match[1] : fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * Extract expectation
   */
  extractExpectation(data, fallback) {
    const dataLower = data.toLowerCase();

    if (dataLower.includes('cut') || dataLower.includes('lower')) return 'cut';
    if (dataLower.includes('raise') || dataLower.includes('hike')) return 'hike';
    if (dataLower.includes('hold') || dataLower.includes('maintain')) return 'hold';

    return fallback;
  }

  /**
   * Extract statement
   */
  extractStatement(data, fallback) {
    try {
      // Look for quoted text
      const pattern = /"([^"]{30,200})"/;
      const match = data.match(pattern);
      return match ? match[1] : fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * Extract outlook
   */
  extractOutlook(data, fallback) {
    const dataLower = data.toLowerCase();

    if (dataLower.includes('positive') || dataLower.includes('optimistic')) return 'positive';
    if (dataLower.includes('negative') || dataLower.includes('pessimistic')) return 'negative';
    if (dataLower.includes('cautious')) return 'cautiously optimistic';

    return fallback;
  }

  /**
   * Prioritize data based on content type
   */
  prioritizeForContent(intelligence, contentType) {
    switch(contentType) {
      case 'rate-update':
        return {
          primary: intelligence.rates,
          secondary: intelligence.marketTrends,
          headline: intelligence.breakingNews.rateRelated[0] || 'Current mortgage rates',
          suggestions: intelligence.contentSuggestions.filter(s => s.type === 'rate-alert')
        };

      case 'market-analysis':
        return {
          primary: intelligence.marketTrends,
          secondary: intelligence.rates,
          context: intelligence.fedPolicy,
          suggestions: intelligence.contentSuggestions.filter(s => s.type === 'market-shift')
        };

      case 'social-media':
        return {
          hook: intelligence.breakingNews.urgent[0] || intelligence.breakingNews.rateRelated[0] || 'Market Update',
          data: intelligence.rates['30yr'],
          trend: intelligence.marketTrends.priceDirection,
          suggestions: intelligence.contentSuggestions.slice(0, 1)
        };

      default:
        return intelligence;
    }
  }

  /**
   * Generate smart content suggestions based on market conditions
   */
  generateContentSuggestions(intelligence) {
    const suggestions = [];

    // Rate-based suggestions
    if (intelligence.rates.trend === 'down' && Math.abs(intelligence.rates.change) > 0.125) {
      suggestions.push({
        type: 'rate-alert',
        urgency: 'high',
        message: `Rates dropping ${Math.abs(intelligence.rates.change * 100).toFixed(0)} basis points - perfect time to refinance`,
        cta: 'Lock in lower rates today',
        data: intelligence.rates['30yr']
      });
    }

    // Breaking news suggestions
    if (intelligence.breakingNews.urgent.length > 0) {
      suggestions.push({
        type: 'breaking-news',
        urgency: 'immediate',
        message: intelligence.breakingNews.urgent[0],
        cta: 'What this means for your mortgage',
        headline: intelligence.breakingNews.urgent[0]
      });
    }

    // Market-based suggestions
    if (intelligence.marketTrends.inventoryLevel === 'low') {
      suggestions.push({
        type: 'buyer-alert',
        urgency: 'medium',
        message: 'Low inventory - act fast on new listings',
        cta: 'Get pre-approved today',
        data: intelligence.marketTrends
      });
    }

    // Fed-based suggestions
    if (intelligence.fedPolicy.rateExpectation === 'cut') {
      suggestions.push({
        type: 'fed-update',
        urgency: 'high',
        message: 'Fed expected to cut rates - mortgage rates may follow',
        cta: 'Prepare for lower rates',
        data: intelligence.fedPolicy
      });
    }

    return suggestions;
  }

  /**
   * Cache management
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.cacheLifetime) {
      this.cache.delete(key);
      return null;
    }

    console.log(`📦 Using cached ${key} (${Math.round(age / 1000)}s old)`);
    return cached.data;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Fallback data when scraping fails
   */
  getFallbackData(contentType) {
    return {
      timestamp: new Date().toISOString(),
      rates: this.getFallbackRates(),
      breakingNews: this.getFallbackNews(),
      marketTrends: this.getFallbackTrends(),
      fedPolicy: this.getFallbackFedData(),
      contentSuggestions: [],
      fallback: true
    };
  }

  getFallbackRates() {
    return {
      '30yr': '6.5%',
      '15yr': '5.75%',
      'arm': '6.0%',
      'fha': '6.25%',
      'va': '6.0%',
      'jumbo': '6.75%',
      trend: 'stable',
      change: 0,
      lastUpdated: new Date().toISOString(),
      fallback: true
    };
  }

  getFallbackNews() {
    return {
      urgent: [],
      rateRelated: ['Mortgage rates remain steady'],
      marketMovers: ['Housing market shows resilience'],
      regulatory: [],
      all: ['Mortgage rates remain steady', 'Housing market shows resilience'],
      fallback: true
    };
  }

  getFallbackTrends() {
    return {
      inventoryLevel: 'moderate',
      medianPrice: '$425,000',
      daysOnMarket: '35',
      priceDirection: 'stable',
      buyerDemand: 'moderate',
      forecast: 'stable',
      fallback: true
    };
  }

  getFallbackFedData() {
    return {
      nextMeeting: 'TBD',
      rateExpectation: 'stable',
      recentStatement: 'Monitoring economic conditions',
      economicOutlook: 'cautiously optimistic',
      fallback: true
    };
  }
}

export default MarketIntelligenceAgent;
