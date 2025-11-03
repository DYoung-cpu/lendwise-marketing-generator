/**
 * Veo 3.1 Prompt Optimizer
 * Apply Nano's successful text accuracy strategies to Veo 3.1
 */

/**
 * Nano Success Principles:
 * 1. EXTREME SPECIFICITY - Spell out every word, every position
 * 2. STRUCTURED CONTAINERS - Organize text into clear sections
 * 3. WORD COUNTS - Specify exact number of words per section
 * 4. REPETITION - Repeat critical instructions
 * 5. EXPLICIT LAYOUT - Define exact positioning
 * 6. SYSTEMATIC TESTING - Test different approaches
 */

const textAccuracyStrategies = {

  // Strategy 1: ULTRA-EXPLICIT with phonetic spelling
  ultraExplicit: (mainText, subText) => `
CRITICAL TEXT ACCURACY REQUIREMENT - EVERY WORD MUST BE SPELLED EXACTLY AS WRITTEN BELOW:

TEXT SECTION 1 (Top Center):
Display these exact words: "${mainText}"
Spelling verification: Each word spelled letter by letter:
${mainText.split(' ').map(word => `  - ${word}: ${word.split('').join('-').toUpperCase()}`).join('\n')}

TEXT SECTION 2 (Below Section 1):
Display these exact words: "${subText}"
Spelling verification: Each word spelled letter by letter:
${subText.split(' ').map(word => `  - ${word}: ${word.split('').join('-').toUpperCase()}`).join('\n')}

VISUAL STYLING:
- Background: Dark navy blue gradient
- Text color: Metallic gold with glow effect
- All text must remain perfectly static and sharp
- Camera motion only (zoom toward center)
- Floating gold particles in background
- Professional broadcast lighting

ABSOLUTE REQUIREMENT: The words above must appear EXACTLY as spelled. No substitutions, no alterations, no phonetic interpretations.
`,

  // Strategy 2: CONTAINER-BASED (like Nano success)
  containerBased: (sections) => `
Professional financial video with STRUCTURED LAYOUT using THREE distinct visual containers:

CONTAINER 1 (Top third - Header):
Text to display: "${sections.header}"
Word count: ${sections.header.split(' ').length} words
Container style: Metallic gold border, dark background
Text must be: Crisp, sharp, perfectly readable

CONTAINER 2 (Middle third - Main content):
Text to display: "${sections.main}"
Word count: ${sections.main.split(' ').length} words
Container style: Metallic gold border, dark background
Text must be: Large, bold, perfectly centered

CONTAINER 3 (Bottom third - Footer):
Text to display: "${sections.footer}"
Word count: ${sections.footer.split(' ').length} words
Container style: Metallic gold border, dark background
Text must be: Clean, professional, readable

CRITICAL: Each word in each container must be spelled EXACTLY as written above. Use the word count as verification.

VISUAL EFFECTS:
- Background: Navy blue gradient
- Text color: Metallic gold
- Borders: Thin gold lines
- Camera: Smooth forward dolly
- Particles: Floating gold sparkles
- All text stays STATIC - only camera moves

VIDEO FORMAT: Vertical 1080x1920, 6 seconds, professional broadcast quality.
`,

  // Strategy 3: WORD-BY-WORD SPECIFICATION
  wordByWord: (phrase) => {
    const words = phrase.split(' ');
    return `
TEXT GENERATION REQUIREMENT - SPELL EACH WORD EXACTLY:

Total words to display: ${words.length}

Word-by-word specification:
${words.map((word, i) => `  Word ${i+1}: "${word}" (${word.length} letters: ${word.split('').join('-')})`).join('\n')}

COMPLETE PHRASE:
"${phrase}"

VERIFICATION: The phrase above contains ${words.length} words totaling ${phrase.replace(/\s/g, '').length} letters.

LAYOUT:
- Position: Center of frame
- Style: Large metallic gold text with glow
- Background: Dark navy blue gradient
- Text must remain: Perfectly static and sharp
- Camera movement: Smooth zoom toward text
- Effects: Floating gold particles

CRITICAL ACCURACY REQUIREMENT:
Every single word must match the spelling above EXACTLY. Cross-reference the letter-by-letter breakdown to ensure accuracy.

VIDEO SPECIFICATIONS: 1080x1920 vertical, 6 seconds, professional lighting.
`;
  },

  // Strategy 4: REPETITIVE REINFORCEMENT
  repetitiveReinforcement: (textItems) => `
===== TEXT ACCURACY CRITICAL =====

This video must display the following text with 100% accuracy:

${textItems.map((item, i) => `
TEXT ELEMENT ${i+1}:
"${item}"
Spell check: ${item.toUpperCase()}
Letter count: ${item.replace(/\s/g, '').length} letters
Word count: ${item.split(' ').length} words
Verification: ${item.split(' ').join(' | ')}
`).join('\n')}

===== REPEAT FOR EMPHASIS =====

The text elements listed above MUST appear EXACTLY as written.
NO variations. NO phonetic interpretations. NO substitutions.

VISUAL DESIGN:
- Background: Professional navy blue gradient
- Text styling: Metallic gold with subtle glow
- Layout: Vertically stacked, centered
- Spacing: Even spacing between elements
- All text: Perfectly static and readable
- Camera: Smooth forward motion only
- Particles: Gold sparkles floating in background

VIDEO FORMAT: Vertical 1080x1920, professional broadcast quality, 6 seconds.

===== FINAL VERIFICATION =====
Cross-check each text element above before generating. Every word must be EXACTLY as specified.
`
};

// Export optimized prompts for common mortgage scenarios
export const optimizedPromptsForVeo = {

  rateAlert: textAccuracyStrategies.containerBased({
    header: "LENDWISE MORTGAGE",
    main: "RATES DROPPED 6.25%",
    footer: "30-Year Fixed Rate Lock Today"
  }),

  rateAlertUltraExplicit: textAccuracyStrategies.ultraExplicit(
    "RATES DROPPED",
    "30-Year Fixed"
  ),

  rateAlertWordByWord: textAccuracyStrategies.wordByWord(
    "30-Year Fixed Rate Available Now"
  ),

  comprehensiveRateAlert: textAccuracyStrategies.repetitiveReinforcement([
    "LENDWISE MORTGAGE",
    "RATES DROPPED",
    "6.25%",
    "30-Year Fixed"
  ])
};

// Testing function
export function generateOptimizedPrompt(type, customData) {
  const strategy = optimizedPromptsForVeo[type];
  if (!strategy) {
    console.warn(`Unknown prompt type: ${type}`);
    return optimizedPromptsForVeo.comprehensiveRateAlert;
  }
  return strategy;
}

export default {
  strategies: textAccuracyStrategies,
  prompts: optimizedPromptsForVeo,
  generate: generateOptimizedPrompt
};
