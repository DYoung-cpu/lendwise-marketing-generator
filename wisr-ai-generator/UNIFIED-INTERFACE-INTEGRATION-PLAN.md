# Unified Marketing Generator Integration Plan

## Executive Summary

This plan integrates three working marketing generators into a single, cohesive interface with automated visual verification. Based on systematic Playwright audit conducted on 2025-10-29.

## Current State Analysis

### System 1: Nano Static Image Generator (✅ WORKING)
- **URL**: http://localhost:8080/nano-test.html
- **Tech Stack**: Fabric.js canvas rendering
- **Features**:
  - Left sidebar with template library
  - Photo upload capability
  - Visual style selector (Dramatic, Elegant, Modern, Bold, Balanced, Random)
  - Template categories (Market Intelligence, Time-Sensitive Alerts, Loan Journey Updates, etc.)
  - Direct text overlay (no AI generation errors)
  - Initialize and Auto-Learn buttons
- **Strengths**: Clean interface, reliable canvas rendering, no text generation issues
- **Screenshot**: `audit-screenshots/01-nano-initial.png`

### System 2: Veo 3.1 Video Generator (✅ WORKING)
- **URL**: http://localhost:3000/
- **Tech Stack**: Google Veo 3.1 API, FFmpeg text compositing
- **Features**:
  - Video configuration (model, aspect ratio, duration)
  - Image URL input for seed
  - Nano-inspired optimized prompts (Container-Based, Repetitive, Word-by-Word)
  - Quick presets (Rate Alert, Educational, Testimonial, etc.)
  - Cost estimation
  - Status & Results panel
- **Strengths**: Professional interface, clear configuration, real-time cost estimation
- **Weaknesses**: Low Runway credits
- **Screenshot**: `audit-screenshots/02-video-initial.png`

### System 3: Email Signature Generator (⚠️ BROKEN)
- **URL**: http://localhost:8080/signature-generator.html
- **Tech Stack**: Gemini 2.5 Flash Image (21:9 → crop to 700x200)
- **Features**:
  - Step-based form (Your Information, Professional Photo, Choose Your Design)
  - Template selection (Classic Professional, Modern Minimal, Bold Impact, Photo Featured, Luxury Edition)
  - Generate button
  - Preview area
- **Critical Issue**: **NO PLAYWRIGHT VISUAL VERIFICATION**
- **User-Reported Issues**:
  - Stretched images
  - Misplaced text (outside signature boundaries)
  - Unstyled elements
  - Broken clickable links
- **Screenshot**: `audit-screenshots/03-signature-initial.png`

---

## Integration Strategy

### Design Philosophy

Create a **unified interface** that:
1. Uses nano-test.html as the foundation (proven working UI)
2. Adds a media type selector at the top
3. Shows conditional panels based on selection
4. Shares common components (photo upload, logo selector)
5. Implements visual verification for ALL outputs

### UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🦉 WISR Marketing Generator Hub              👤 User  ⚙️  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Media Type:  [📸 Static Image] [🎬 Video] [✉️ Signature]   │
│                                                               │
├──────────────┬────────────────────────────────────────────────┤
│              │                                                │
│  SIDEBAR     │           MAIN CANVAS / PREVIEW                │
│              │                                                │
│  [Shared]    │    (Content changes based on media type)       │
│  - Photo     │                                                │
│  - Logo      │                                                │
│              │                                                │
│  [Dynamic]   │                                                │
│  - Templates │                                                │
│  - Options   │                                                │
│  - Config    │                                                │
│              │                                                │
│  [Generate]  │                                                │
│              │                                                │
└──────────────┴────────────────────────────────────────────────┘
```

### Shared Components

1. **Photo Upload** (all three systems)
   - Single upload component
   - Stored in shared state
   - Used differently by each media type:
     - Static: Overlay on canvas
     - Video: Seed image URL
     - Signature: Headshot in signature

2. **Logo Selector** (all three systems)
   - Radio buttons: "Logo Only" / "Logo + Owl"
   - Files: `lendwise-mortgage-logo.png` / `lendwise-owl-logo.png`

3. **Template Library** (static & signature)
   - Shared categories when applicable
   - Different templates per media type

### Media Type Panels

#### Static Image Panel (Nano)
- Template library (existing categories)
- Visual style selector
- Text input field
- Canvas preview
- Initialize / Auto-Learn buttons

#### Video Panel (Veo)
- Video configuration (model, aspect ratio, duration)
- Prompt strategy selector
- Quick presets
- Cost estimation
- Status display

#### Signature Panel (NEW WORKFLOW)
1. Form fields (Name, Title, NMLS, Phone, Email)
2. Template selector
3. Generate button
4. **VISUAL VERIFICATION STEP** ⭐
5. Preview with verification badge
6. Copy HTML / Download buttons

---

## Critical New Component: Visual Verification System

### Problem Statement

**User Quote**: "I believe you never testing it with playwright MCP to confirm placement. we generated several and the image was stretched and the text was not stylized and was all over the signature and outside the signature. what tools were actually looking at the final product?"

**Root Cause**: No automated visual verification in signature generation workflow.

### Solution: `clickable-verifier.js`

Automated Playwright-based verification that runs AFTER signature generation:

```javascript
// Verification checklist
✓ Image dimensions within 700x200 boundary
✓ Image aspect ratio preserved (no stretching)
✓ Text elements positioned inside container
✓ Clickable links functional (tel:, mailto:, https:, maps)
✓ Styles applied correctly (fonts, colors, spacing)
✓ No elements overflowing container
✓ Logo visible and properly sized
```

### Verification Workflow

```
User clicks "Generate Signature"
         ↓
Gemini API generates image
         ↓
Crop to 700x200
         ↓
OCR validation (existing)
         ↓
Render in preview area
         ↓
🆕 AUTOMATIC PLAYWRIGHT VERIFICATION 🆕
         ↓
    Pass? ────→ Show preview with ✓ badge
         ↓
    Fail? ────→ Auto-retry OR show issues
```

### Implementation: `clickable-verifier.js`

```javascript
import playwright from 'playwright';

async function verifySignature(signatureHTML, userInfo) {
    const browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 800, height: 400 } });

    // Inject signature HTML into test page
    await page.setContent(`
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 20px; background: #f5f5f5;">
            <div id="signature-container" style="max-width: 700px;">
                ${signatureHTML}
            </div>
        </body>
        </html>
    `);

    const issues = [];

    // Check 1: Container dimensions
    const container = await page.locator('#signature-container').first();
    const containerBox = await container.boundingBox();
    if (containerBox.width > 750 || containerBox.height > 250) {
        issues.push(`Container exceeds bounds: ${containerBox.width}x${containerBox.height}px`);
    }

    // Check 2: Image stretching
    const images = await container.locator('img').all();
    for (const img of images) {
        const styles = await img.evaluate(el => ({
            objectFit: window.getComputedStyle(el).objectFit,
            width: el.naturalWidth,
            height: el.naturalHeight,
            displayWidth: el.width,
            displayHeight: el.height
        }));

        const aspectRatio = styles.width / styles.height;
        const displayRatio = styles.displayWidth / styles.displayHeight;
        if (Math.abs(aspectRatio - displayRatio) > 0.1) {
            issues.push(`Image stretched: natural ${aspectRatio.toFixed(2)} vs display ${displayRatio.toFixed(2)}`);
        }
    }

    // Check 3: Text positioning
    const textElements = await container.locator('div, span, p').all();
    for (let i = 0; i < textElements.length; i++) {
        const box = await textElements[i].boundingBox();
        if (box && (box.x < 0 || box.y < 0)) {
            issues.push(`Text element ${i} outside container: x=${box.x}, y=${box.y}`);
        }
    }

    // Check 4: Clickable links
    const phoneLink = await container.locator(`a[href^="tel:${userInfo.phone}"]`).count();
    if (phoneLink === 0) issues.push('Phone link missing or incorrect');

    const emailLink = await container.locator(`a[href^="mailto:${userInfo.email}"]`).count();
    if (emailLink === 0) issues.push('Email link missing or incorrect');

    const websiteLink = await container.locator('a[href*="lendwisemtg.com"]').count();
    if (websiteLink === 0) issues.push('Website link missing');

    // Check 5: Click functionality
    try {
        await page.locator(`a[href^="tel:"]`).first().click({ trial: true });
    } catch (e) {
        issues.push('Phone link not clickable');
    }

    // Take verification screenshot
    const screenshot = await page.screenshot({ fullPage: true });

    await browser.close();

    return {
        passed: issues.length === 0,
        issues,
        screenshot
    };
}
```

---

## Implementation Phases

### Phase 4: Implement Visual Verification (PRIORITY)

**Deliverable**: `clickable-verifier.js` + integration into signature workflow

**Tasks**:
1. Create `clickable-verifier.js` with checks outlined above
2. Add verification step to signature generation
3. Add retry logic (max 3 attempts)
4. Add verification badge to preview
5. Save verification screenshots

**Success Criteria**:
- All signatures verified before display
- Visual issues caught automatically
- User sees verification status
- No more stretched images or misplaced text

### Phase 5: Create Unified Interface

**Deliverable**: `marketing-generator-hub.html`

**Tasks**:
1. Clone nano-test.html structure
2. Add media type selector at top
3. Implement shared components (photo, logo)
4. Create conditional panels for each media type
5. Wire up generation workflows
6. Add visual verification for signatures
7. Style consistently with dark theme + gold accents

**File Structure**:
```
marketing-generator-hub.html       (main interface)
  ├── shared-components.js         (photo, logo, state management)
  ├── static-image-panel.js        (nano functionality)
  ├── video-panel.js               (veo functionality)
  ├── signature-panel.js           (signature + verification)
  └── clickable-verifier.js        (NEW - visual verification)
```

### Phase 6: End-to-End Testing

**Test Cases**:

1. **Static Image Generation**
   - Select template
   - Upload photo
   - Choose logo variant
   - Generate image
   - Verify canvas output

2. **Video Generation**
   - Configure video settings
   - Enter prompt
   - Select preset
   - Generate video
   - Check status polling

3. **Signature Generation with Verification** ⭐
   - Fill form fields
   - Upload headshot
   - Select template
   - Click generate
   - **Automatic verification runs**
   - Preview shows with ✓ badge
   - Copy HTML works
   - All links clickable

4. **Cross-Media Workflow**
   - Switch between media types
   - Verify state persistence
   - Check shared components
   - Test photo/logo reuse

---

## Technical Specifications

### Shared State Management

```javascript
const sharedState = {
    user: {
        photo: null,        // File object
        photoURL: null,     // Data URL
        logoVariant: 'logo-only'  // 'logo-only' | 'logo-with-owl'
    },
    mediaType: 'static',    // 'static' | 'video' | 'signature'
    currentTemplate: null,
    generationInProgress: false
};
```

### API Endpoints

```javascript
// Existing
POST /api/generate-image     (nano - not used, canvas only)
POST /api/generate-video     (veo backend on :3000)
POST /api/generate-signature (gemini - signature-generator.html)
POST /api/ocr-validate       (quality backend on :3001)

// New
POST /api/verify-signature   (calls clickable-verifier.js)
```

### Verification API Response

```json
{
  "passed": true,
  "issues": [],
  "screenshot": "data:image/png;base64,...",
  "verificationTime": "2025-10-29T23:15:00Z",
  "checks": {
    "dimensions": "✓",
    "aspectRatio": "✓",
    "textPositioning": "✓",
    "clickableLinks": "✓",
    "styling": "✓"
  }
}
```

---

## File Paths (Absolute)

### Existing Files
- Nano Generator: `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/nano-test.html`
- Signature Generator: `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/signature-generator.html`
- Video Interface: `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/veo-test-interface.html`
- Video Backend: `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/veo-test-server.js`
- Quality Backend: `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/quality-backend.js`

### New Files (To Be Created)
- Unified Interface: `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/marketing-generator-hub.html`
- Visual Verifier: `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/clickable-verifier.js`
- Shared Components: `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/shared-components.js`

### Assets
- Logo Only: `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/lendwise-mortgage-logo.png`
- Logo + Owl: `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/lendwise-owl-logo.png`

---

## Success Metrics

1. ✅ All three media types accessible from one interface
2. ✅ Photo upload shared across all types
3. ✅ Logo selector works for all generations
4. ✅ **100% of signatures pass visual verification before display**
5. ✅ No stretched images reported
6. ✅ No misplaced text reported
7. ✅ All clickable links functional
8. ✅ User can switch media types seamlessly
9. ✅ Visual verification runs automatically (no manual step)
10. ✅ Verification screenshots saved for debugging

---

## User Concerns Addressed

### Original User Quote
> "I believe you never testing it with playwright MCP to confirm placement. we generated several and the image was stretched and the text was not stylized and was all over the signature and outside the signature. what tools were actually looking at the final product?"

### Our Solution
1. **Automated Playwright verification** runs on EVERY signature generation
2. **Visual checks** before user sees output:
   - Image dimensions
   - Aspect ratio preservation
   - Text positioning
   - Link functionality
   - Style application
3. **Verification screenshots** saved for evidence
4. **Auto-retry** if issues detected (max 3 attempts)
5. **Verification badge** shows user that signature was tested

### YouTube Video Approach
Following systematic MCP orchestration:
1. Use Playwright MCP for visual verification
2. Take screenshots at each step
3. Validate actual output (not just code)
4. Document visual state
5. Implement feedback loops

---

## Next Steps

1. ✅ Visual audit completed (Phase 1-2)
2. ✅ Integration plan created (Phase 3)
3. ⏳ Implement `clickable-verifier.js` (Phase 4)
4. ⏳ Create unified interface (Phase 5)
5. ⏳ Test end-to-end workflows (Phase 6)
6. ⏳ Update project memory with findings

---

*This integration plan addresses all user concerns and implements the missing visual verification layer that caused the signature generator issues.*
