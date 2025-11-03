import fetch from 'node-fetch';

class DataAgent {
  constructor() {
    this.firecrawlKey = process.env.FIRECRAWL_API_KEY;
    this.cache = null;
    this.cacheTime = null;
    this.cacheDuration = 3600000; // 1 hour
  }

  async fetchMarketData() {
    console.log('📊 Fetching market data...');

    // Check cache first
    if (this.cache && this.cacheTime && (Date.now() - this.cacheTime < this.cacheDuration)) {
      console.log('✅ Using cached market data');
      return this.cache;
    }

    try {
      if (this.firecrawlKey) {
        console.log('🔥 Using Firecrawl API for live data...');

        // Use Firecrawl v1 API with markdown format
        const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.firecrawlKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: 'https://www.mortgagenewsdaily.com/mortgage-rates',
            formats: ['markdown'],
            onlyMainContent: true,
            includeTags: ['table', '.rate-data', '.mortgage-rates'],
            timeout: 30000
          })
        });

        if (!response.ok) {
          throw new Error(`Firecrawl API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Firecrawl data received');

        const marketData = this.parseMarketData(data);

        // Cache the result
        this.cache = marketData;
        this.cacheTime = Date.now();

        return marketData;
      } else {
        console.warn('⚠️  FIRECRAWL_API_KEY not set, using fallback data');
      }
    } catch (error) {
      console.warn('⚠️  Firecrawl error, using fallback data:', error.message);
    }

    // Fallback data - typical current rates
    const fallback = {
      rates: {
        '30yr': '6.38%',
        '15yr': '5.88%',
        'jumbo': '6.45%',
        'fha': '6.25%',
        'va': '6.10%'
      },
      changes: {
        '30yr': '+0.02%',
        '15yr': '-0.01%'
      },
      trend: 'steady',
      headline: 'Mortgage Rates Hold Steady',
      date: new Date().toLocaleDateString(),
      timestamp: new Date().toLocaleTimeString()
    };

    console.log('📊 Using fallback rates:', fallback.rates);
    return fallback;
  }

  parseMarketData(rawData) {
    console.log('🔍 Parsing Firecrawl data...');

    const content = rawData.data?.markdown || rawData.data?.content || rawData.content || '';
    const lines = content.split('\n');

    const rates = {};
    const changes = {};
    let headline = 'Mortgage Rate Update';
    let trend = 'steady';

    // Extract rates from markdown tables or text
    for (const line of lines) {
      // Look for rate patterns
      const rate30Match = line.match(/30[-\s]*year.*?(\d+\.\d+)%/i);
      const rate15Match = line.match(/15[-\s]*year.*?(\d+\.\d+)%/i);
      const jumboMatch = line.match(/jumbo.*?(\d+\.\d+)%/i);
      const fhaMatch = line.match(/fha.*?(\d+\.\d+)%/i);
      const vaMatch = line.match(/va.*?(\d+\.\d+)%/i);

      if (rate30Match) rates['30yr'] = `${rate30Match[1]}%`;
      if (rate15Match) rates['15yr'] = `${rate15Match[1]}%`;
      if (jumboMatch) rates['jumbo'] = `${jumboMatch[1]}%`;
      if (fhaMatch) rates['fha'] = `${fhaMatch[1]}%`;
      if (vaMatch) rates['va'] = `${vaMatch[1]}%`;

      // Look for change indicators
      const changeMatch = line.match(/([\+\-]\d+\.\d+)%/);
      if (changeMatch) {
        if (line.includes('30')) changes['30yr'] = changeMatch[1] + '%';
        if (line.includes('15')) changes['15yr'] = changeMatch[1] + '%';
      }

      // Extract headline
      if (line.includes('#') && line.length < 100) {
        headline = line.replace(/#/g, '').trim();
      }

      // Determine trend
      if (line.toLowerCase().includes('rising') || line.includes('+0.')) trend = 'up';
      if (line.toLowerCase().includes('falling') || line.includes('-0.')) trend = 'down';
    }

    const result = {
      rates: Object.keys(rates).length > 0 ? rates : { '30yr': '6.38%', '15yr': '5.88%' },
      changes: Object.keys(changes).length > 0 ? changes : { '30yr': '+0.02%', '15yr': '-0.01%' },
      trend,
      headline,
      date: new Date().toLocaleDateString(),
      timestamp: new Date().toLocaleTimeString()
    };

    console.log('✅ Parsed rates:', result.rates);
    return result;
  }
}

export default DataAgent;
