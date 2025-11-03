class BrandGenerator {
  constructor(replicate) {
    this.replicate = replicate;
    this.brandSpec = {
      company: 'LendWise Mortgage',
      logo: 'golden owl mascot with emerald green eyes',
      colors: {
        primary: '#2d5f3f',  // Forest green
        accent: '#d4af37'    // Metallic gold
      },
      style: 'professional, trustworthy, premium'
    };

    // Rich design templates for different content types
    this.templates = {
      'rate-update': this.createRateUpdateTemplate.bind(this),
      'property-listing': this.createPropertyListingTemplate.bind(this),
      'social-media': this.createSocialMediaTemplate.bind(this),
      'general': this.createGeneralTemplate.bind(this)
    };
  }

  async applyBranding(originalPrompt, context) {
    // Detect content type from prompt or context
    const contentType = this.detectContentType(originalPrompt, context);

    // Get appropriate template
    const template = this.templates[contentType] || this.templates.general;

    // Generate rich design prompt using template
    return template(originalPrompt, context);
  }

  detectContentType(prompt, context) {
    const p = prompt.toLowerCase();

    if (/rate|mortgage|apr|percent|interest/i.test(p)) return 'rate-update';
    if (/property|house|listing|home|real estate/i.test(p)) return 'property-listing';
    if (/social|post|instagram|facebook/i.test(p)) return 'social-media';

    return 'general';
  }

  createRateUpdateTemplate(originalPrompt, context) {
    // Extract or use default rate information
    const rates = context.marketData?.rates || { '30yr': '6.25%', '15yr': '5.88%' };
    const mainRate = rates['30yr'];
    const change = context.marketData?.changes?.['30yr'] || '+0.02%';
    const trend = change.startsWith('+') ? 'up' : 'down';
    const trendColor = trend === 'up' ? 'red' : 'green';
    const trendArrow = trend === 'up' ? 'upward' : 'downward';

    // Build loan officer section if present
    let loanOfficerSection = '';
    if (context.personalization) {
      if (context.personalization.photo) {
        loanOfficerSection = `At the bottom, a frosted glass banner contains a professional circular headshot photo of the loan officer on the left side (80x80px, border radius 50%), followed by ${context.personalization.name} in white text with NMLS ${context.personalization.nmls} in smaller gold text below. On the right side displays ${context.personalization.phone} in white text.`;
      } else {
        loanOfficerSection = `At the bottom, a frosted glass banner contains ${context.personalization.name} on the left with NMLS ${context.personalization.nmls} in smaller gold text below, and ${context.personalization.phone} on the right in white text.`;
      }
    }

    return `Professional Instagram mortgage rate announcement graphic. Square 1080x1080 image showing a forest green gradient background transitioning from darker green at top to slightly lighter at bottom.

A premium frosted glass card floats in the center with subtle transparency and soft shadows creating depth. The golden LendWise owl mascot logo glows softly in the top left corner.

The centerpiece displays ${mainRate} in enormous metallic gold numbers with shine and gradient effects. A ${trendColor} ${trendArrow} trending arrow sits beside the rate. Below it shows ${change} in smaller red text.

Underneath, a simple horizontal bar chart compares rates: a taller golden bar labeled "30-Year Fixed ${rates['30yr']}" next to a shorter golden bar labeled "15-Year Fixed ${rates['15yr']}" with white text labels.

${loanOfficerSection}

At the very bottom, "LendWise" appears in elegant gold serif typography with wide letter spacing, with "MORTGAGE" in small white uppercase letters below it. A tiny Equal Housing Lender logo sits in the bottom right corner.

The overall aesthetic is premium banking with photorealistic glass materials, metallic finishes, professional depth and shadows, clean modern typography, and high contrast for maximum readability. Instagram-optimized professional marketing quality.`;
  }

  createPropertyListingTemplate(originalPrompt, context) {
    return `Professional real estate listing graphic, vertical 1080x1350 format. A modern property showcase with forest green accent bars framing the layout. Property details appear in a premium floating card with subtle shadows and depth.

The price displays prominently in large metallic gold numbers at the top. Key property features are shown with elegant icons in a clean grid below. White text on dark green backgrounds ensures high readability.

The LendWise golden owl logo appears subtly in the corner. At the bottom, professional contact information is displayed clearly with the LendWise branding and Equal Housing disclosure.

Clean modern real estate marketing aesthetic with premium typography, layered depth effects, and trust-building professional design. Photorealistic materials with gold metallic finishes and forest green accents.`;
  }

  createSocialMediaTemplate(originalPrompt, context) {
    return `Eye-catching Instagram square social media graphic 1080x1080. Forest green background with dynamic gradient creates energy. ${originalPrompt}

Modern geometric shapes and patterns add visual interest. The LendWise golden owl logo stands out prominently. Premium frosted glass cards float with layered shadows creating depth.

Headlines appear in large bold metallic gold typography. Supporting text in crisp white maintains readability. Professional font pairing combines strong sans-serif headlines with elegant body text.

At the bottom, the LendWise signature anchors the composition. Premium banking aesthetic optimized for Instagram engagement with professional trustworthy design and high visual impact.`;
  }

  createGeneralTemplate(originalPrompt, context) {
    return `Professional marketing graphic for LendWise Mortgage showcasing ${originalPrompt}

The design features a forest green background with elegant gradient providing a premium foundation. Metallic gold accents draw attention to key information. The LendWise golden owl mascot logo integrates naturally into the composition.

Frosted glass card effects create a premium floating appearance with professional shadows and highlights adding depth. Clean visual hierarchy guides the eye through the content.

Typography uses bold headlines in gold metallic finish, with crisp white body text ensuring high contrast and readability. Elegant spacing and professional font choices reinforce trust.

The aesthetic embodies premium banking and financial services with photorealistic materials, modern professional lighting, and sophisticated composition. LendWise branding appears prominently at the bottom with logo and signature colors. Marketing-grade quality throughout.`;
  }
}

export default BrandGenerator;
