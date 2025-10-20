/**
 * Prompt Builder Functions
 * Extracted from nano-test.html for standalone use in autonomous testing
 */

// Mock Market data (same structure as HTML)
export function getMarketData() {
    return {
        rates: {
            '30yr': '6.38%',
            '15yr': '5.88%',
            'jumbo': '6.29%',
            'arm': '5.85%',
            'fha': '6.05%',
            'va': '6.07%'
        },
        changes: {
            '30yr': '+0.02%',
            '15yr': '-0.01%',
            'jumbo': '+0.02%',
            'arm': '+0.02%',
            'fha': 'unchanged',
            'va': '-0.01%'
        },
        treasuries: {
            '10yr': '4.132',
            '30yr': '4.721'
        },
        trend: 'Rates showing minimal movement. Most rates increased slightly or remained unchanged from yesterday.',
        commentary: '"It\'s getting pretty tough to weave an interesting narrative on mortgage rates over the past 3 weeks. During that time, they just haven\'t changed that much for the average lender."',
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        economicFactors: [
            { factor: 'Fed Chair Powell suggests potential continued cuts through end of year', impact: 'positive' },
            { factor: 'Inflation expectations rising according to New York Federal Reserve survey data', impact: 'negative' },
            { factor: 'Markets hovering near multi-week lows showing cautious optimism from investors', impact: 'positive' }
        ],
        lockRecommendation: 'Near recent lows - favorable time to lock today'
    };
}

// Format rate change with emoji indicator
export function formatRateChangeWithArrow(changeValue) {
    if (!changeValue || changeValue === '—' || changeValue === 'unchanged') {
        return '—';
    }

    if (changeValue.startsWith('+')) {
        return `🟢 ${changeValue}`;
    } else if (changeValue.startsWith('-')) {
        return `🔴 ${changeValue}`;
    }

    return changeValue;
}

// Parse Market commentary (15-20 words max)
export function parseMarketCommentary(commentaryText) {
    if (!commentaryText) return '';

    let text = commentaryText.replace(/['"]/g, '').trim();
    let firstSentence = text.split(/[.!?]/)[0].trim();

    let words = firstSentence.split(' ').filter(w => w.length > 0);
    if (words.length > 20) {
        let breakPoint = 15;
        for (let i = 15; i < Math.min(18, words.length); i++) {
            if (words[i].endsWith(',') || words[i] === 'and' || words[i] === 'but') {
                breakPoint = i + 1;
                break;
            }
        }
        return words.slice(0, breakPoint).join(' ') + '...';
    }

    return firstSentence;
}

// Build Daily Rate Update prompt
export function buildDailyRateUpdatePrompt(MarketData, uploadedPhoto = false) {
    // Use simpler quote for Daily Rate Update to ensure perfect text rendering
    const commentary = "RATES STABLE NEAR RECENT LOWS";
    const change30yr = formatRateChangeWithArrow(MarketData.changes['30yr']);

    const economicFactors = MarketData.economicFactors || [];
    const topFactors = economicFactors.slice(0, 3);

    let economicBullets = '';
    topFactors.forEach(item => {
        const emoji = item.impact === 'positive' ? '🟢' : '🔴';
        // Simplify complex phrases for AI text rendering
        let simplified = item.factor
            .replace('New York Federal Reserve', 'Fed')
            .replace('Federal Reserve', 'Fed')
            .replace('according to', 'per')
            .replace('survey data', 'data');
        economicBullets += `• ${emoji} ${simplified}\n`;
    });

    const lockRec = MarketData.lockRecommendation || 'Contact me to discuss your lock timing strategy';
    const logoInstruction = 'CRITICAL: The first image provided is the LendWise brand logo. Place this EXACT logo (do NOT draw or generate a new logo) in the top-left corner at approximately 80x80 pixels. Use the provided logo image as-is.';
    const photoInstruction = uploadedPhoto
        ? 'The second image is my professional photo - seamlessly integrate it into the design with background removed and blended naturally. '
        : '';

    return `Create a professional daily mortgage Market update.
${logoInstruction}
${photoInstruction}Forest green gradient background with metallic gold accents.
Use subtle dark shadow beneath and offset to right to create floating sections.
Preserve emoji colors: 🟢 green circle and 🔴 red circle as shown.

Header section (4 words):
Daily Rate Update ${MarketData.date}

Current Rate (large, prominent display - 8 words):
30-Year Fixed ${MarketData.rates['30yr']} ${change30yr} change from yesterday

Market Drivers Today (3 bullets, 8-12 words each):
${economicBullets}
Lock Strategy - TAKE ACTION NOW (bold, urgent, 15 words max):
⚡ ${lockRec} - Contact today for personalized rate quote! ⚡

Expert Insight - Display quoted text in ALL CAPS with BOTH opening " and closing " marks:
${commentary ? '"' + commentary.toUpperCase() + '"' : ''}

Contact (7 words):
David Young NMLS 62043 Phone 310-954-7771

Modern Forbes/Bloomberg magazine style. Portrait 1080x1350.`;
}

// Build Market Report prompt
export function buildMarketUpdatePrompt(MarketData, uploadedPhoto = false) {
    // Use simpler quote for Market Report to ensure perfect text rendering
    const commentary = "RATES STABLE NEAR RECENT LOWS";
    const change30yr = formatRateChangeWithArrow(MarketData.changes['30yr']);
    const change15yr = formatRateChangeWithArrow(MarketData.changes['15yr']);
    const changeJumbo = formatRateChangeWithArrow(MarketData.changes['jumbo']);

    const logoInstruction = 'CRITICAL: The first image provided is the LendWise brand logo. Place this EXACT logo (do NOT draw or generate a new logo) in the top-left corner at approximately 80x80 pixels. Use the provided logo image as-is.';
    const photoInstruction = uploadedPhoto
        ? 'The second image is my professional photo - seamlessly integrate it into the design with background removed and blended naturally. '
        : '';

    return `Create a professional daily mortgage Market update.
${logoInstruction}
${photoInstruction}Forest green gradient background with metallic gold accents.
Use subtle dark shadow beneath and offset to right to create floating sections.
Preserve emoji colors: 🟢 green circle and 🔴 red circle as shown.

Header section (4 words):
Mortgage Rate Update ${MarketData.date}

Current Rates (3 main rates only, 10 words per line):
• 30-Year Fixed: ${MarketData.rates['30yr']} ${change30yr} change from yesterday
• 15-Year Fixed: ${MarketData.rates['15yr']} ${change15yr} change from yesterday
• Jumbo Rate: ${MarketData.rates['jumbo']} ${changeJumbo} change from yesterday

Treasury Yields (10 words):
10-Year ${MarketData.treasuries['10yr']} and 30-Year ${MarketData.treasuries['30yr']}

Market Insight - ACT NOW (bold, urgent, 15 words max):
⚡ ${MarketData.trend.split('.')[0]} - Perfect time to lock rates! ⚡

Expert Insight - Display quoted text in ALL CAPS with BOTH opening " and closing " marks:
${commentary ? '"' + commentary.toUpperCase() + '"' : ''}

Contact (7 words):
David Young NMLS 62043 Phone 310-954-7771

Modern Forbes/Bloomberg magazine style. Portrait 1080x1350.`;
}

// Build Rate Trends prompt
export function buildRateTrendsPrompt(MarketData, uploadedPhoto = false) {
    // Use simpler quote for Rate Trends to ensure perfect text rendering
    const commentary = "RATES STABLE NEAR RECENT LOWS";

    const current30yr = parseFloat(MarketData.rates['30yr']);
    const weekHigh = 7.26;
    const weekLow = 6.13;
    const vsHigh = (weekHigh - current30yr).toFixed(2);

    const fourWeekLow = 6.31;
    const fourWeekHigh = 6.39;
    const rangeDiff = fourWeekHigh - fourWeekLow;
    let trendStatus = rangeDiff < 0.10 ? 'Stable' : 'Volatile';

    const logoInstruction = 'CRITICAL: The first image provided is the LendWise brand logo. Place this EXACT logo (do NOT draw or generate a new logo) in the top-left corner at approximately 80x80 pixels. Use the provided logo image as-is.';
    const photoInstruction = uploadedPhoto
        ? 'The second image is my professional photo - seamlessly integrate it into the design with background removed and blended naturally. '
        : '';

    return `Create an elegant rate trend analysis.
${logoInstruction}
${photoInstruction}Forest green gradient background with metallic gold accents.
Use subtle dark shadow beneath and offset to right to create floating sections.

Header section (4 words):
Rate Trend Analysis ${MarketData.date}

Current Rate Display (8 words, very large):
30-Year Fixed ${MarketData.rates['30yr']} - Competitive Rates Available Today!

Movement Data (3 bullets, 8 words each):
• 4-Week Range ${fourWeekLow} to ${fourWeekHigh}
• 52-Week Range ${weekLow} to ${weekHigh}
• Position ${vsHigh} below the 52-week high

Trend Status (4 words):
Current Status: ${trendStatus}

Action Item - LOCK NOW (bold, urgent, 15 words max):
⚡ Market conditions favorable - Contact today to secure your rate! ⚡

Forward View - Display quoted text with BOTH opening " and closing " marks:
${commentary ? '"' + commentary + '"' : '"Rates showing minimal movement with cautious optimism"'}

Contact (7 words):
David Young NMLS 62043 Phone 310-954-7771

Modern Forbes/Bloomberg magazine style. Portrait 1080x1350.`;
}

// Build Economic Outlook prompt
export function buildEconomicOutlookPrompt(MarketData, uploadedPhoto = false) {
    // Use simpler quote for Economic Outlook to ensure perfect text rendering
    const commentary = "FAVORABLE CONDITIONS FOR BORROWERS";

    const economicFactors = MarketData.economicFactors || [];
    const topFactors = economicFactors.slice(0, 3);

    let economicBullets = '';
    topFactors.forEach(item => {
        const emoji = item.impact === 'positive' ? '🟢' : '🔴';
        // Simplify complex phrases for AI text rendering
        let simplified = item.factor
            .replace('New York Federal Reserve', 'Fed')
            .replace('Federal Reserve', 'Fed')
            .replace('according to', 'per')
            .replace('survey data', 'data');
        economicBullets += `• ${emoji} ${simplified}\n`;
    });

    const logoInstruction = 'CRITICAL: The first image provided is the LendWise brand logo. Place this EXACT logo (do NOT draw or generate a new logo) in the top-left corner at approximately 80x80 pixels. Use the provided logo image as-is.';
    const photoInstruction = uploadedPhoto
        ? 'The second image is my professional photo - seamlessly integrate it into the design with background removed and blended naturally. '
        : '';

    return `Create a professional economic outlook report.
${logoInstruction}
${photoInstruction}Forest green gradient background with metallic gold accents.
Use subtle dark shadow beneath and offset to right to create floating sections.
Preserve emoji colors: 🟢 green circle and 🔴 red circle as shown.

Header section (4 words):
Economic Outlook ${MarketData.date}

Current Rate Display (8 words, large):
30-Year Fixed ${MarketData.rates['30yr']} - Attractive Opportunity for Borrowers!

Key Economic Factors (3 bullets, 10 words each):
${economicBullets}
Treasury Yields (10 words):
10-Year ${MarketData.treasuries['10yr']} and 30-Year ${MarketData.treasuries['30yr']}

Forward View - Display quoted text in ALL CAPS with BOTH opening " and closing " marks:
${commentary ? '"' + commentary.toUpperCase() + '"' : '"STABLE MARKET CONDITIONS EXPECTED"'}

Contact (7 words):
David Young NMLS 62043 Phone 310-954-7771

Modern Forbes/Bloomberg magazine style. Portrait 1080x1350.`;
}

// Export all functions
export default {
    getMarketData,
    formatRateChangeWithArrow,
    parseMarketCommentary,
    buildDailyRateUpdatePrompt,
    buildMarketUpdatePrompt,
    buildRateTrendsPrompt,
    buildEconomicOutlookPrompt
};
