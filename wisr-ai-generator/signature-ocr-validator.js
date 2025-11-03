/**
 * Signature OCR Validator
 * Validates generated email signatures contain required branding elements
 * Uses OCR to verify: logo text, officer name, NMLS, title
 */

import { extractTextFromImage, verifyText } from './ocr-service.js';

/**
 * Validate a generated signature image
 *
 * @param {string} imageBase64 - Base64 encoded image (data:image/png;base64,...)
 * @param {Object} expectedData - Expected signature data
 * @param {string} expectedData.name - Officer name (e.g., "David Young")
 * @param {string} expectedData.nmls - NMLS number (e.g., "2222")
 * @param {string} [expectedData.title] - Title (defaults to checking common titles)
 * @returns {Promise<Object>} Validation result with quality score
 */
export async function validateSignatureImage(imageBase64, expectedData) {
  console.log('[Signature Validator] Starting OCR validation...');
  console.log('[Signature Validator] Expected name:', expectedData.name);
  console.log('[Signature Validator] Expected NMLS:', expectedData.nmls);

  const startTime = Date.now();

  // Convert base64 to file path for OCR processing
  // (OCR service can handle base64 data URIs directly)
  const ocrResult = await extractTextFromImage(imageBase64, {
    language: 'eng',
    preprocessing: true,
    enhance: true
  });

  if (!ocrResult.success) {
    console.error('[Signature Validator] ❌ OCR extraction failed:', ocrResult.error);
    return {
      success: false,
      error: 'OCR extraction failed',
      details: ocrResult.error,
      timestamp: new Date().toISOString()
    };
  }

  console.log('[Signature Validator] OCR extracted text:', ocrResult.text.substring(0, 200) + '...');
  console.log('[Signature Validator] OCR confidence:', ocrResult.confidence.toFixed(2) + '%');

  // Perform element checks
  const validation = {
    timestamp: new Date().toISOString(),
    ocrConfidence: ocrResult.confidence,
    extractedText: ocrResult.text,
    elementChecks: {
      lendwiseBrandingFound: checkLendWiseBranding(ocrResult.text),
      officerNameFound: checkOfficerName(ocrResult.text, expectedData.name),
      nmlsFound: checkNMLS(ocrResult.text, expectedData.nmls),
      titleFound: checkTitle(ocrResult.text, expectedData.title)
    },
    issues: [],
    score: 0,
    recommendRegeneration: false,
    processingTimeMs: 0
  };

  // Calculate quality score
  const checks = Object.values(validation.elementChecks);
  const passedChecks = checks.filter(check => check.found).length;
  validation.score = Math.round((passedChecks / checks.length) * 100);

  // Add issues for failed checks
  Object.entries(validation.elementChecks).forEach(([key, check]) => {
    if (!check.found) {
      validation.issues.push(check.issue);
    }
  });

  // Determine if regeneration is needed
  if (validation.score < 70) {
    validation.recommendRegeneration = true;
    validation.issues.push('Overall quality score too low - signature may be unreadable or missing elements');
  }

  if (ocrResult.confidence < 60) {
    validation.recommendRegeneration = true;
    validation.issues.push('OCR confidence too low - text may be blurry or poorly rendered');
  }

  validation.processingTimeMs = Date.now() - startTime;

  console.log('[Signature Validator] ✅ Validation complete');
  console.log('[Signature Validator] Quality score:', validation.score + '%');
  console.log('[Signature Validator] Elements found:', passedChecks + '/' + checks.length);
  console.log('[Signature Validator] Issues:', validation.issues.length);

  return validation;
}

/**
 * Check for LendWise branding in extracted text
 */
function checkLendWiseBranding(extractedText) {
  const normalizedText = extractedText.toLowerCase().replace(/\s+/g, '');

  // Check for variations of LendWise branding
  const brandingPatterns = [
    'lendwise',
    'lendwisemortgage',
    'lendwisemtg'
  ];

  const found = brandingPatterns.some(pattern =>
    normalizedText.includes(pattern.toLowerCase().replace(/\s+/g, ''))
  );

  return {
    found,
    confidence: found ? 100 : 0,
    patterns: brandingPatterns,
    issue: found ? null : 'LendWise branding not detected in signature'
  };
}

/**
 * Check for officer name in extracted text
 * Uses fuzzy matching to account for OCR errors
 */
function checkOfficerName(extractedText, expectedName) {
  if (!expectedName) {
    return {
      found: false,
      confidence: 0,
      issue: 'No expected name provided for validation'
    };
  }

  const normalizedExtracted = extractedText.toLowerCase();
  const normalizedExpected = expectedName.toLowerCase();

  // Check exact match
  if (normalizedExtracted.includes(normalizedExpected)) {
    return {
      found: true,
      confidence: 100,
      matchType: 'exact',
      issue: null
    };
  }

  // Check partial match (first and last name separately)
  const nameParts = normalizedExpected.split(/\s+/);
  const foundParts = nameParts.filter(part =>
    part.length > 2 && normalizedExtracted.includes(part)
  );

  if (foundParts.length === nameParts.length) {
    return {
      found: true,
      confidence: 80,
      matchType: 'partial',
      issue: null
    };
  }

  if (foundParts.length > 0) {
    return {
      found: false,
      confidence: 50,
      matchType: 'incomplete',
      issue: `Officer name partially detected (${foundParts.length}/${nameParts.length} parts found)`
    };
  }

  return {
    found: false,
    confidence: 0,
    matchType: 'none',
    issue: 'Officer name not detected in signature'
  };
}

/**
 * Check for NMLS number in extracted text
 */
function checkNMLS(extractedText, expectedNMLS) {
  if (!expectedNMLS) {
    // NMLS is optional, so absence is not a failure
    return {
      found: true,
      confidence: 100,
      optional: true,
      issue: null
    };
  }

  const normalizedText = extractedText.replace(/\s+/g, ' ');

  // Check for NMLS with various formats
  const nmlsPatterns = [
    `NMLS ${expectedNMLS}`,
    `NMLS: ${expectedNMLS}`,
    `NMLS #${expectedNMLS}`,
    expectedNMLS
  ];

  const found = nmlsPatterns.some(pattern =>
    normalizedText.includes(pattern)
  );

  return {
    found,
    confidence: found ? 100 : 0,
    patterns: nmlsPatterns,
    issue: found ? null : 'NMLS number not detected in signature'
  };
}

/**
 * Check for title in extracted text
 */
function checkTitle(extractedText, expectedTitle) {
  const normalizedText = extractedText.toLowerCase();

  // Common title variations for mortgage industry
  const titlePatterns = [
    'loan officer',
    'mortgage advisor',
    'mortgage adviser',
    'private client advisor',
    'senior loan officer',
    'mortgage consultant',
    'mortgage specialist'
  ];

  // If specific title expected, check that first
  if (expectedTitle) {
    const normalizedExpected = expectedTitle.toLowerCase();
    if (normalizedText.includes(normalizedExpected)) {
      return {
        found: true,
        confidence: 100,
        matchedTitle: expectedTitle,
        issue: null
      };
    }
  }

  // Check common titles
  const matchedTitle = titlePatterns.find(title =>
    normalizedText.includes(title)
  );

  if (matchedTitle) {
    return {
      found: true,
      confidence: 90,
      matchedTitle,
      issue: null
    };
  }

  return {
    found: false,
    confidence: 0,
    issue: 'Professional title not detected in signature'
  };
}

/**
 * Batch validate multiple signatures
 * Useful for testing all templates at once
 */
export async function validateSignatureBatch(signatures) {
  console.log(`[Signature Validator] Starting batch validation for ${signatures.length} signatures...`);

  const results = [];

  for (let i = 0; i < signatures.length; i++) {
    const sig = signatures[i];
    console.log(`[Signature Validator] Validating signature ${i + 1}/${signatures.length} (${sig.template})...`);

    const validation = await validateSignatureImage(sig.imageBase64, {
      name: sig.name,
      nmls: sig.nmls,
      title: sig.title
    });

    results.push({
      template: sig.template,
      ...validation
    });

    // Small delay to avoid overwhelming system
    if (i < signatures.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  const successful = results.filter(r => r.score >= 70).length;
  const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);

  console.log(`[Signature Validator] ✅ Batch validation complete`);
  console.log(`[Signature Validator] Success rate: ${successful}/${signatures.length} (${Math.round((successful/signatures.length)*100)}%)`);
  console.log(`[Signature Validator] Average score: ${avgScore}%`);

  return {
    totalValidated: signatures.length,
    successful,
    failed: signatures.length - successful,
    successRate: Math.round((successful / signatures.length) * 100),
    averageScore: avgScore,
    results
  };
}

/**
 * Get detailed quality report for a validation result
 */
export function generateQualityReport(validation) {
  const report = {
    summary: {
      score: validation.score,
      status: validation.score >= 70 ? 'PASS' : 'FAIL',
      recommendation: validation.recommendRegeneration ? 'REGENERATE' : 'APPROVED'
    },
    elements: {
      branding: validation.elementChecks.lendwiseBrandingFound.found ? '✅' : '❌',
      officerName: validation.elementChecks.officerNameFound.found ? '✅' : '❌',
      nmls: validation.elementChecks.nmlsFound.found ? '✅' : '❌',
      title: validation.elementChecks.titleFound.found ? '✅' : '❌'
    },
    issues: validation.issues,
    ocrConfidence: Math.round(validation.ocrConfidence) + '%',
    processingTime: validation.processingTimeMs + 'ms'
  };

  return report;
}

export default {
  validateSignatureImage,
  validateSignatureBatch,
  generateQualityReport
};
