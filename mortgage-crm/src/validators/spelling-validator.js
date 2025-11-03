class SpellingValidator {
  constructor() {
    this.commonErrors = new Set([
      'morgage', 'morgatge', 'intrest', 'princpal',
      'refi', 'pre-aproval', 'closeing'
    ]);
  }

  async validate(text) {
    if (!text) return { score: 1, errors: [] };

    const words = text.toLowerCase().split(/\s+/);
    const errors = [];

    for (const word of words) {
      const clean = word.replace(/[.,!?;:]/g, '');
      if (this.commonErrors.has(clean)) {
        errors.push(word);
      }
    }

    const score = words.length > 0
      ? (words.length - errors.length) / words.length
      : 1;

    return { score, errors, issues: errors };
  }
}

export default SpellingValidator;
