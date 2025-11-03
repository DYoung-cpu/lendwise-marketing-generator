import { scrapeLiveMarketData } from './market-data-scraper.js';

console.log('🧪 Testing market-data-scraper.js with new Firecrawl API key...\n');

try {
  const marketData = await scrapeLiveMarketData();
  
  console.log('✅ Live scraping successful!\n');
  console.log('📅 Date:', marketData.date);
  console.log('📊 Rates:');
  console.log('   30-Year Fixed:', marketData.rates['30yr'], marketData.changes['30yr']);
  console.log('   15-Year Fixed:', marketData.rates['15yr'], marketData.changes['15yr']);
  console.log('   Jumbo:', marketData.rates['jumbo'], marketData.changes['jumbo']);
  console.log('\n💡 Expert Insight:', marketData.expertInsight);
  console.log('📈 Trend:', marketData.trend);
  
} catch (error) {
  console.error('❌ Scraping failed:', error.message);
  console.error('Stack:', error.stack);
}
