# OCR Service - Text Extraction & Verification

## 🎯 Purpose

Automatically extract and verify text from generated videos and images to catch spelling errors, typos, and ensure text accuracy in AI-generated marketing materials.

## ✅ What We Installed

1. **Tesseract OCR** - Industry-standard open-source OCR engine
2. **tesseract.js** - JavaScript wrapper for Tesseract
3. **sharp** - Image preprocessing library

## 🔧 Key Features

### 1. Image Text Extraction
```javascript
import { extractTextFromImage } from './ocr-service.js';

const result = await extractTextFromImage('screenshot.png', {
  language: 'eng',
  preprocessing: true  // Enhances accuracy
});

console.log(result.text);         // Extracted text
console.log(result.confidence);   // OCR confidence %
```

### 2. Text Verification
```javascript
import { verifyText } from './ocr-service.js';

const verification = verifyText(result.text, [
  'RATES DROPPED',
  '6.25%',
  '30-Year Fixed'
], {
  caseSensitive: false,
  allowPartialMatch: true
});

console.log(verification.foundCount);    // How many found
console.log(verification.percentage);    // % found
```

### 3. Spelling Check
```javascript
import { checkSpelling } from './ocr-service.js';

const spellingCheck = checkSpelling(result.text, {
  'Fixed': ['Firted', 'Fixd', 'Fixxed'],  // Correct: [common typos]
  'Rates': ['Rats', 'Raets'],
  'Dropped': ['Droped', 'Dropt']
});

// Shows which words have typos
spellingCheck.results.forEach(([word, status]) => {
  if (status.status === 'typo') {
    console.log(`❌ "${word}" has typos: ${status.typosFound}`);
  }
});
```

### 4. Batch Processing
```javascript
import { extractTextBatch } from './ocr-service.js';

const results = await extractTextBatch([
  'screenshot1.png',
  'screenshot2.png',
  'https://example.com/image.jpg'
]);
```

## 🎯 Real-World Test Result

**Test Image**: Screenshot from Veo 3.1 generated video

**Extracted Text:**
```
RATES
DROPPEL    ← OCR read "DROPPED" incorrectly
6.25'      ← Detected rate (read % as ')
30-Year Firted  ← **SPELLING ERROR DETECTED!**
```

**Spelling Check Result:**
```
❌ "Fixed" has typos: Firted
✅ "Rates" spelled correctly
⚠️  "Dropped" not found in text
```

## 🚀 Usage Examples

### Example 1: Verify Video Screenshot

```javascript
import { extractTextFromImage, checkSpelling } from './ocr-service.js';

// Extract text from generated video screenshot
const result = await extractTextFromImage('video-screenshot.png');

// Check for common mortgage term misspellings
const spellingCheck = checkSpelling(result.text, {
  'Fixed': ['Firted', 'Fixd'],
  'Mortgage': ['Mortage', 'Morgage'],
  'Rates': ['Rats', 'Raets'],
  'Annual': ['Anual', 'Annuall'],
  'Percentage': ['Precentage', 'Percantage']
});

if (!spellingCheck.success) {
  console.log(`⚠️ Found ${spellingCheck.errorsFound} spelling errors!`);
}
```

### Example 2: Automated Quality Check

```javascript
async function verifyVideoQuality(videoScreenshot) {
  // Extract text
  const ocr = await extractTextFromImage(videoScreenshot);

  // Verify required elements
  const verification = verifyText(ocr.text, [
    'LENDWISE',           // Brand name
    '6.25%',              // Rate
    '30-Year Fixed'       // Product type
  ]);

  // Check spelling
  const spelling = checkSpelling(ocr.text, {
    'Fixed': ['Firted'],
    'Year': ['Yaer', 'Yera']
  });

  return {
    textFound: verification.success,
    spellingCorrect: spelling.success,
    confidence: ocr.confidence,
    passed: verification.success && spelling.success
  };
}
```

### Example 3: Integration with Testing Framework

```javascript
import { generateVideo } from './runway-service.js';
import { extractTextFromImage, verifyText } from './ocr-service.js';

async function generateAndVerify(prompt, expectedText) {
  // Generate video
  const video = await generateVideo(imageUrl, prompt);

  if (!video.success) {
    return { error: 'Video generation failed' };
  }

  // TODO: Extract frame from video (requires ffmpeg)
  // const frame = await extractVideoFrame(video.videoUrl, 2); // 2 seconds in

  // For now, use screenshot
  const ocr = await extractTextFromImage('screenshot.png');

  // Verify text
  const verification = verifyText(ocr.text, expectedText);

  return {
    videoUrl: video.videoUrl,
    textVerification: verification,
    confidence: ocr.confidence
  };
}
```

## 📊 OCR Accuracy Tips

### 1. Image Preprocessing
The service automatically:
- Converts to grayscale
- Normalizes contrast
- Sharpens text
- Applies threshold for clean B&W

### 2. Best Practices
- ✅ Use high-resolution screenshots
- ✅ Ensure good contrast between text and background
- ✅ Capture frames when text is fully visible (not during transitions)
- ✅ Use clear, readable fonts in prompts
- ✅ Avoid heavily stylized or decorative fonts

### 3. Known Limitations
- Similar characters may be confused (O/0, l/I, 1/l)
- Stylized fonts reduce accuracy
- Text over complex backgrounds is harder to read
- Perspective/rotation reduces accuracy

## 🔧 Configuration Options

### Language Support
```javascript
// English (default)
await extractTextFromImage(image, { language: 'eng' });

// Other languages available:
// 'spa' (Spanish), 'fra' (French), 'deu' (German), etc.
```

### Preprocessing Control
```javascript
// With preprocessing (recommended)
await extractTextFromImage(image, { preprocessing: true });

// Without preprocessing (faster but less accurate)
await extractTextFromImage(image, { preprocessing: false });
```

## 🎯 Integration Points

### 1. Helpdesk Agent
OCR service is now available to the helpdesk agent for:
- Analyzing screenshots from users
- Verifying text in generated content
- Catching spelling errors automatically

### 2. Testing Framework
Can be integrated with:
- `comprehensive-veo-test.js` - Verify text in all 8 test videos
- `veo-test-server.js` - Add OCR endpoint for live verification
- Automated CI/CD pipelines

### 3. Quality Backend
Add OCR verification step:
```javascript
// After video generation
const quality = await verifyVideoQuality(videoScreenshot);
if (!quality.spellingCorrect) {
  console.warn('Spelling errors detected!');
}
```

## 📝 Common Use Cases

### 1. Catch Spelling Errors
```javascript
const errors = {
  'Fixed': ['Firted', 'Fixd'],
  'Annual': ['Anual'],
  'Percentage': ['Precentage']
};

const result = await checkSpelling(extractedText, errors);
```

### 2. Verify Rates Are Correct
```javascript
const verification = verifyText(extractedText, ['6.25%'], {
  caseSensitive: false,
  allowPartialMatch: false  // Must be exact
});
```

### 3. Ensure Brand Consistency
```javascript
const brandCheck = verifyText(extractedText, [
  'LENDWISE MORTGAGE',
  'LENDWISE'
], { allowPartialMatch: true });
```

## 🚀 Next Steps

1. **Video Frame Extraction** - Install ffmpeg to extract frames from videos
2. **Automated Testing** - Integrate OCR into video generation pipeline
3. **Quality Dashboard** - Build UI showing OCR results for all videos
4. **Training Data** - Collect OCR results to improve prompt engineering

## 📖 API Reference

See `ocr-service.js` for complete API documentation.

### Main Functions
- `extractTextFromImage(source, options)` - Extract text from image
- `verifyText(extracted, expected, options)` - Verify expected text exists
- `checkSpelling(text, dictionary)` - Check for common typos
- `extractTextBatch(sources, options)` - Batch processing

## ⚡ Performance

- **Single image**: ~2-5 seconds
- **Batch processing**: ~3-6 seconds per image
- **Memory usage**: ~100-200MB during processing

## 🔒 Security Notes

- Images are temporarily stored in `/tmp` during processing
- Temporary files are automatically cleaned up
- No data is sent to external services (runs locally)

---

**OCR Service v1.0** - Text extraction and verification for AI-generated content
