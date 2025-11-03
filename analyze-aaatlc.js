import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function analyzeWebsite() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const analysis = {
    url: 'https://www.aaatlc.com/',
    timestamp: new Date().toISOString(),
    design: {},
    content: {},
    features: [],
    navigation: [],
    strengths: [],
    weaknesses: []
  };

  try {
    console.log('🌐 Navigating to AAA T.L.C. website...');
    await page.goto('https://www.aaatlc.com/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Take full page screenshot
    console.log('📸 Taking homepage screenshot...');
    await page.screenshot({
      path: '/mnt/c/Users/dyoun/Active Projects/aaatlc-analysis/homepage-full.png',
      fullPage: true
    });

    // Extract page title
    analysis.content.title = await page.title();
    console.log('📄 Page title:', analysis.content.title);

    // Extract navigation
    const navLinks = await page.$$eval('nav a, header a', links =>
      links.map(link => ({
        text: link.textContent?.trim(),
        href: link.href
      }))
    );
    analysis.navigation = navLinks;
    console.log('🧭 Navigation links found:', navLinks.length);

    // Extract all headings
    const headings = await page.$$eval('h1, h2, h3, h4', headers =>
      headers.map(h => ({
        level: h.tagName,
        text: h.textContent?.trim()
      }))
    );
    analysis.content.headings = headings;
    console.log('📝 Headings found:', headings.length);

    // Extract body text
    const bodyText = await page.evaluate(() => document.body.innerText);
    analysis.content.bodyText = bodyText;
    console.log('📄 Body text length:', bodyText.length);

    // Analyze colors
    const colors = await page.evaluate(() => {
      const styles = window.getComputedStyle(document.body);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        primaryColors: Array.from(document.querySelectorAll('*'))
          .map(el => window.getComputedStyle(el).backgroundColor)
          .filter(color => color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent')
          .slice(0, 10)
      };
    });
    analysis.design.colors = colors;
    console.log('🎨 Colors extracted');

    // Analyze typography
    const typography = await page.evaluate(() => {
      const body = window.getComputedStyle(document.body);
      const h1 = document.querySelector('h1');
      return {
        bodyFont: body.fontFamily,
        bodySize: body.fontSize,
        h1Font: h1 ? window.getComputedStyle(h1).fontFamily : null,
        h1Size: h1 ? window.getComputedStyle(h1).fontSize : null
      };
    });
    analysis.design.typography = typography;
    console.log('✍️ Typography analyzed');

    // Check for key features
    const features = [];

    if (bodyText.toLowerCase().includes('24/7') || bodyText.toLowerCase().includes('24 hours')) {
      features.push('24/7 Availability');
    }
    if (bodyText.toLowerCase().includes('licensed')) {
      features.push('Licensed Services');
    }
    if (bodyText.toLowerCase().includes('rn') || bodyText.toLowerCase().includes('nurse')) {
      features.push('Registered Nurses');
    }
    if (bodyText.toLowerCase().includes('covid')) {
      features.push('COVID-19 Care');
    }
    if (bodyText.toLowerCase().includes('25 years') || bodyText.toLowerCase().includes('experience')) {
      features.push('25+ Years Experience');
    }
    if (bodyText.toLowerCase().includes('5,000') || bodyText.toLowerCase().includes('5000')) {
      features.push('5,000+ Caregivers');
    }

    analysis.features = features;
    console.log('✨ Features identified:', features.length);

    // Try to find other pages
    console.log('🔍 Looking for other pages...');
    const pageLinks = navLinks.filter(link =>
      link.href &&
      link.href.includes('aaatlc.com') &&
      !link.href.includes('#')
    );

    // Visit a few key pages
    for (const link of pageLinks.slice(0, 5)) {
      if (link.href && link.text) {
        try {
          console.log(`  → Visiting: ${link.text}`);
          await page.goto(link.href, { waitUntil: 'networkidle', timeout: 15000 });
          await page.screenshot({
            path: `/mnt/c/Users/dyoun/Active Projects/aaatlc-analysis/${link.text.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`,
            fullPage: true
          });
          await page.waitForTimeout(1000);
        } catch (e) {
          console.log(`  ⚠️ Could not capture: ${link.text}`);
        }
      }
    }

    // Competitive Analysis
    analysis.strengths = [
      '25+ years of experience (more than 90210 Love Care)',
      '5,000+ caregivers (large network)',
      'RN/LVN services (medical care capability)',
      'COVID-19 specialized team',
      'Hospital sitter services',
      'Concierge nurse services',
      'International travel capability',
      'Serves all of Southern California',
      'Infants to adults (broader demographic)'
    ];

    analysis.weaknesses = [
      'Website may be less modern in design',
      'Potentially overwhelming service list',
      'May lack clear pricing/consultation CTA'
    ];

    // Save analysis
    console.log('\n💾 Saving analysis...');
    fs.writeFileSync(
      '/mnt/c/Users/dyoun/Active Projects/aaatlc-analysis/analysis.json',
      JSON.stringify(analysis, null, 2)
    );

    // Create comparison document
    const comparison = `# AAA T.L.C. vs 90210 Love Care - Competitive Analysis

## Executive Summary
Generated: ${new Date().toLocaleString()}

## AAA T.L.C. Profile

**Website:** https://www.aaatlc.com/
**Location:** Encino, CA
**Experience:** 25+ years
**Staff:** 5,000+ caregivers and nurses
**Coverage:** All of Southern California + travel capability

## Key Differentiators

### AAA T.L.C. Advantages:
${analysis.strengths.map(s => `- ${s}`).join('\n')}

### Identified Weaknesses:
${analysis.weaknesses.map(w => `- ${w}`).join('\n')}

## Feature Comparison

| Feature | AAA T.L.C. | 90210 Love Care |
|---------|------------|-----------------|
| Experience | 25+ years | Not specified |
| Staff Size | 5,000+ | Not specified |
| Medical Services | Yes (RN/LVN) | Non-medical only |
| Service Area | All SoCal | LA County |
| Availability | 24/7/365 | Business hours + appointments |
| Special Services | COVID team, Hospital sitters | Standard companion care |
| Age Range | Infants to Adults | Elderly focus |

## Design Analysis

### AAA T.L.C. Design:
${JSON.stringify(analysis.design, null, 2)}

## Content Strategy

### Key Messages Found:
${analysis.content.headings.map(h => `- ${h.level}: ${h.text}`).join('\n')}

## Navigation Structure:
${analysis.navigation.map(n => `- ${n.text} (${n.href})`).join('\n')}

## Recommendations for Superior Website

### Must-Have Features:
1. **Broader Service Offering** - Like AAA T.L.C., offer both medical and non-medical
2. **24/7 Availability** - Match AAA T.L.C.'s round-the-clock service
3. **Experience Highlight** - Emphasize years of service prominently
4. **Staff Size** - Showcase network size for trust/reliability
5. **Specialized Services** - COVID care, hospital sitters, etc.

### Design Improvements:
1. **Modern, Clean Interface** - Better than both current sites
2. **Mobile-First Design** - Superior responsiveness
3. **Fast Loading** - Optimized performance
4. **Clear CTAs** - Easier conversion paths
5. **Trust Signals** - Certifications, reviews, credentials
6. **Professional Photography** - High-quality images
7. **Video Content** - Staff introductions, testimonials
8. **Online Booking** - Instant assessment scheduling

### Content Strategy:
1. **Clear Value Proposition** - What makes you #1
2. **Service Categories** - Easy to understand offerings
3. **Transparency** - Pricing guidance, process clarity
4. **Social Proof** - Testimonials, reviews, case studies
5. **Educational Content** - Blog, resources, guides
6. **FAQ Section** - Comprehensive answers
7. **Emergency Contact** - Prominent 24/7 availability

### Technical Excellence:
1. **SEO Optimization** - Better than both competitors
2. **Page Speed** - Sub-2 second load times
3. **Accessibility** - WCAG 2.1 AA compliance
4. **Security** - SSL, HIPAA compliance messaging
5. **Analytics** - Conversion tracking
6. **Live Chat** - Instant support option

## Next Steps

1. Review captured screenshots in /aaatlc-analysis/
2. Decide which features to incorporate
3. Create superior design mockups
4. Develop enhanced React application
5. Test against both competitors
`;

    fs.writeFileSync(
      '/mnt/c/Users/dyoun/Active Projects/aaatlc-analysis/COMPARISON-REPORT.md',
      comparison
    );

    console.log('\n✅ Analysis complete!');
    console.log('📁 Files saved to: /mnt/c/Users/dyoun/Active Projects/aaatlc-analysis/');
    console.log('   - homepage-full.png');
    console.log('   - analysis.json');
    console.log('   - COMPARISON-REPORT.md');
    console.log('   - Additional page screenshots');

    // Keep browser open for review
    console.log('\n🔍 Browser will stay open for 60 seconds for review...');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('❌ Error:', error.message);

    fs.writeFileSync(
      '/mnt/c/Users/dyoun/Active Projects/aaatlc-analysis/error.log',
      `Error analyzing site:\n${error.message}\n${error.stack}`
    );
  }

  await browser.close();
  console.log('\n🏁 Analysis session ended');
}

analyzeWebsite();
