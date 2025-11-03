class ComplianceValidator {
  async validate(text, intent) {
    const issues = [];
    let score = 1;

    // CRITICAL: Check for European number formatting (comma as decimal separator)
    const europeanNumbers = text.match(/\d+,\d+%/g);
    if (europeanNumbers && europeanNumbers.length > 0) {
      issues.push(`CRITICAL: European number format detected (${europeanNumbers.join(', ')}). Must use US format with periods (e.g., 6.25% not 6,25%)`);
      score -= 0.5; // Major penalty for wrong number format
    }

    // Check NMLS if required
    if (intent.hasNMLS) {
      const hasNMLS = /nmls\s*#?\s*\d+/i.test(text);
      if (!hasNMLS) {
        issues.push('Missing NMLS number');
        score -= 0.3;
      } else if (intent.detectedNMLS) {
        const extractedNMLS = text.match(/nmls\s*#?\s*(\d+)/i)?.[1];
        if (extractedNMLS !== intent.detectedNMLS) {
          issues.push('NMLS number mismatch');
          score -= 0.2;
        }
      }
    }

    // Check Equal Housing if mortgage content
    if (intent.type === 'rate-update' || intent.type === 'property-listing') {
      const hasEqualHousing = /equal\s+housing/i.test(text);
      if (!hasEqualHousing && Math.random() > 0.5) { // Sometimes required
        issues.push('Consider adding Equal Housing disclosure');
        score -= 0.1;
      }
    }

    return {
      score: Math.max(0, score),
      passed: issues.length === 0,
      issues
    };
  }
}

export default ComplianceValidator;
