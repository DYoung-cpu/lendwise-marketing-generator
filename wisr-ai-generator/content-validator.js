/**
 * Content Validator
 * Validates compliance requirements for mortgage marketing content
 */

class ContentValidator {
    async validateCompliance(params) {
        const issues = [];
        let score = 1;

        if (params.hasNMLS && !params.text.match(/nmls\s*#?\s*\d+/i)) {
            issues.push('Missing NMLS number');
            score -= 0.3;
        }

        if (params.hasEqualHousing && !params.text.toLowerCase().includes('equal housing')) {
            issues.push('Missing Equal Housing disclosure');
            score -= 0.2;
        }

        return {
            score: Math.max(0, score),
            passed: issues.length === 0,
            issues
        };
    }
}

export default ContentValidator;
