/**
 * Runway Prompt Templates
 * Template-specific motion prompts for brand-consistent video generation
 *
 * Each template has:
 * - base: Core visual description (branding, style)
 * - motion: Camera movement and animation description
 * - style: Aesthetic and tone
 *
 * Max prompt length: 512 characters (Runway API limit)
 */

export const videoPrompts = {
  // Market Intelligence & Rate Alerts
  rateAlert: {
    base: "Professional financial presentation with LENDWISE MORTGAGE gold metallic branding. All text perfectly crisp and readable.",
    motion: "Smooth cinematic zoom toward center rate numbers. Floating gold sparkle particles in background. Shallow depth of field. Camera motion only - text stays completely static and sharp. Professional broadcast quality.",
    style: "Premium financial news aesthetic. Dramatic lighting with lens flares. High-end corporate presentation. Social media optimized for instant attention."
  },

  marketIntelligence: {
    base: "Financial market data with LENDWISE MORTGAGE gold branding. Professional business intelligence aesthetic.",
    motion: "Subtle parallax camera pan across data. Background layers shift independently creating depth. Soft bokeh particles. Camera movement only - all text remains perfectly readable. Cinematic professional motion.",
    style: "Modern tech presentation. Clean corporate design. TV broadcast quality. Authority and trust visual language."
  },

  // Educational Content
  educational: {
    base: "Educational mortgage content with LENDWISE branding. Clear readable professional design.",
    motion: "Gentle horizontal camera pan with parallax depth effect. Soft focus particles floating in foreground. Smooth elegant motion. Text remains 100% static and readable. Professional instructional style.",
    style: "Premium educational video. Apple keynote aesthetic. Clean modern design. Approachable expert authority."
  },

  downPaymentMyths: {
    base: "Myth-busting educational content. LENDWISE MORTGAGE gold branding prominent.",
    motion: "Slow camera push forward with dramatic depth of field. Environmental particles creating dimension. Cinematic reveal. Camera only moves - text stays perfectly crisp. Engaging visual storytelling.",
    style: "Modern explainer video. Professional financial education. Trust-building aesthetic. Social media scroll-stopping design."
  },

  preApprovalGuide: {
    base: "Step-by-step home buying guide. LENDWISE branding with premium real estate aesthetic.",
    motion: "Smooth vertical camera tilt creating depth. Subtle parallax between foreground and background. Elegant professional pacing. Text completely static. Broadcast quality motion.",
    style: "High-end instructional design. Premium real estate video. Professional guide aesthetic. TV commercial quality."
  },

  // Client Testimonials & Success Stories
  testimonial: {
    base: "Client testimonial with LENDWISE MORTGAGE branding. Warm emotional professional atmosphere.",
    motion: "Slow cinematic push in toward subject. Beautiful bokeh blur in background. Emotional camera movement. Shallow depth of field creating intimacy. Text stays sharp and readable. Premium documentary style.",
    style: "Cinematic testimonial video. Netflix documentary quality. Emotional warmth with premium feel. Trust and authenticity visual language."
  },

  clientSuccess: {
    base: "Success story celebration. LENDWISE gold branding. Joyful professional aesthetic.",
    motion: "Gentle uplifting camera rise with soft rotation. Celebratory light particles floating. Smooth inspirational movement. Text remains perfectly static. Premium celebration video style.",
    style: "Emotional success story. Premium real estate celebration. Warm inviting tone. Social media viral quality."
  },

  // Personal Branding
  personalBranding: {
    base: "Professional mortgage expert presentation. LENDWISE MORTGAGE gold metallic branding.",
    motion: "Confident smooth camera push with subtle horizontal drift. Professional depth of field. Executive presentation motion. Text completely static and sharp. TV interview quality.",
    style: "Executive professional video. Premium luxury real estate. Authority and trust. High-end personal branding. LinkedIn optimized."
  },

  aboutDavid: {
    base: "Personal introduction. LENDWISE MORTGAGE branding. Professional approachable aesthetic.",
    motion: "Warm inviting camera movement with gentle parallax. Soft environmental effects. Personal yet authoritative motion. Text stays perfectly readable. Premium bio video style.",
    style: "Professional personal branding. About Us page quality. Approachable expert. Premium mortgage industry leader aesthetic."
  },

  // Loan Journey & Milestones
  loanJourney: {
    base: "Loan process visualization. LENDWISE MORTGAGE gold branding.",
    motion: "Forward camera movement suggesting progress. Subtle parallax creating journey feel. Smooth professional pacing. Text remains static and readable. Motivational visual style.",
    style: "Professional progress video. Clean modern design. Encouraging forward momentum. Premium process visualization."
  },

  milestoneCelebration: {
    base: "Loan milestone celebration. LENDWISE branding. Achievement moment.",
    motion: "Uplifting camera rise with celebratory light effects. Joyful smooth motion. Gold particle effects. Text stays sharp. Premium celebration style.",
    style: "Celebratory professional video. Warm joyful aesthetic. Social media shareability. Premium real estate milestone."
  },

  // Reverse Mortgages (Senior-focused)
  reverseMortgage: {
    base: "Senior-focused reverse mortgage information. LENDWISE MORTGAGE branding.",
    motion: "Calm steady camera movement. Gentle reassuring pace. Dignified smooth motion. Soft focus effects. Text perfectly readable. Senior-appropriate professional style.",
    style: "Senior-friendly design. Calm trustworthy tone. Clear accessible. Premium financial advisory for mature audience."
  },

  // Time-Sensitive Alerts
  urgentAlert: {
    base: "Time-sensitive mortgage alert. LENDWISE MORTGAGE gold branding.",
    motion: "Attention-grabbing camera zoom with subtle pulse. Professional urgency without aggression. Dynamic yet controlled. Text stays completely static and readable. News broadcast style.",
    style: "Professional breaking news aesthetic. Clean urgent design. Authority and immediacy. Social media scroll-stopper."
  },

  // Default/Fallback
  default: {
    base: "Professional mortgage marketing content with LENDWISE MORTGAGE gold metallic branding.",
    motion: "Smooth cinematic camera motion with depth. Professional subtle parallax. Elegant floating particles. Camera only moves - text stays perfectly sharp and readable. Premium broadcast quality.",
    style: "Premium professional video. Clean modern design. Trust and authority. High-end mortgage industry. Social media optimized."
  }
};

/**
 * Build complete Runway prompt from template type
 *
 * @param {string} templateType - Type of template (e.g., 'rateAlert', 'educational')
 * @param {string} customText - Additional custom instructions (optional)
 * @returns {string} - Complete prompt (max 512 characters)
 */
export function buildRunwayPrompt(templateType, customText = '') {
  // Get template or fallback to default
  const template = videoPrompts[templateType] || videoPrompts.default;

  // Combine all prompt elements
  let fullPrompt = `${template.base} ${template.motion} ${template.style}`.trim();

  // Add custom text if provided
  if (customText) {
    fullPrompt += ` ${customText}`;
  }

  // Enforce 512 character limit (Runway API requirement)
  if (fullPrompt.length > 512) {
    console.warn(`[Runway Prompts] Prompt too long (${fullPrompt.length} chars). Truncating to 512.`);
    fullPrompt = fullPrompt.substring(0, 512);
  }

  return fullPrompt;
}

/**
 * Get suggested video settings for template type
 *
 * @param {string} templateType - Type of template
 * @returns {Object} - Recommended settings (ratio, duration)
 */
export function getVideoSettings(templateType) {
  const settings = {
    // Horizontal videos (good for general social media)
    rateAlert: { ratio: '1280:720', duration: 5 },
    marketIntelligence: { ratio: '1280:720', duration: 5 },
    urgentAlert: { ratio: '1280:720', duration: 5 },

    // Vertical videos (best for Reels/Stories/TikTok)
    educational: { ratio: '768:1280', duration: 10 },
    downPaymentMyths: { ratio: '768:1280', duration: 10 },
    preApprovalGuide: { ratio: '768:1280', duration: 10 },
    testimonial: { ratio: '768:1280', duration: 10 },
    clientSuccess: { ratio: '768:1280', duration: 10 },
    personalBranding: { ratio: '768:1280', duration: 10 },
    aboutDavid: { ratio: '768:1280', duration: 10 },
    loanJourney: { ratio: '768:1280', duration: 10 },
    milestoneCelebration: { ratio: '768:1280', duration: 10 },
    reverseMortgage: { ratio: '768:1280', duration: 10 },

    // Default
    default: { ratio: '1280:720', duration: 10 }
  };

  return settings[templateType] || settings.default;
}

/**
 * Map HTML template IDs to prompt types
 * (Based on nano-test.html template structure)
 */
export const templateIdMap = {
  // Market Intelligence
  'rate-alert-market-intelligence': 'rateAlert',
  'market-update-housing-trends': 'marketIntelligence',
  'interest-rate-forecast': 'rateAlert',

  // Educational
  'down-payment-myths': 'downPaymentMyths',
  'pre-approval-guide': 'preApprovalGuide',
  'educational-mortgage-basics': 'educational',

  // Testimonials
  'testimonial-showcase': 'testimonial',
  'client-success-story': 'clientSuccess',

  // Personal Branding
  'personal-branding-intro': 'personalBranding',
  'about-david-young': 'aboutDavid',

  // Loan Journey
  'loan-journey-update': 'loanJourney',
  'milestone-celebration': 'milestoneCelebration',

  // Reverse Mortgages
  'reverse-mortgage-info': 'reverseMortgage',

  // Alerts
  'urgent-rate-alert': 'urgentAlert',
  'time-sensitive-offer': 'urgentAlert'
};

/**
 * Get prompt type from template ID
 *
 * @param {string} templateId - HTML template ID
 * @returns {string} - Prompt type
 */
export function getPromptTypeFromTemplateId(templateId) {
  return templateIdMap[templateId] || 'default';
}

// Export all functions and data
export default {
  videoPrompts,
  buildRunwayPrompt,
  getVideoSettings,
  getPromptTypeFromTemplateId,
  templateIdMap
};
