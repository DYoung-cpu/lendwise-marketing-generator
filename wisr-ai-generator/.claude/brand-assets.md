# Brand Assets & Style Guide

**Last Updated:** 2025-10-26
**Project:** Marketing Generator (wisr-ai-generator)

---

## 🎨 LendWise Mortgage Brand

### Primary Brand Colors
```css
/* Metallic Gold - Primary Brand Color */
Gold Gradient: linear-gradient(135deg, #B8860B 0%, #DAA520 50%, #FFD700 100%)
Hex Values: #B8860B, #DAA520, #FFD700

/* Dark Backgrounds */
Forest Green: #1B4D3E to #2D5F4F
Professional Dark: #2c3e50, #34495e

/* Accent Colors */
Professional Purple: #8B5CF6
Professional Blue: #3B82F6
```

### Typography Standards
- **Headers:** Bold, gold metallic text with letter spacing
- **Body:** Clean, readable sans-serif
- **Important Text:** LENDWISE on line 1, ONBOARDING on line 2
- **Phone/NMLS:** Must be crystal clear and perfectly readable

---

## 📦 Key Assets

### WISR Owl Video
**Location:** `/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/wisr-owl-video.mp4`

**Usage:**
- Used in headers and intro pages
- Signature branding element for LendWise
- Transparent background
- Blend mode: `lighten` to remove black background

**When David says:** "Put the WISR owl video in the header"
**He means:**
```html
<video autoplay loop muted playsinline>
  <source src="wisr-owl-video.mp4" type="video/mp4">
</video>
<style>
video {
  mix-blend-mode: lighten; /* Removes black background */
}
</style>
```

### LendWise Logo
**Location:** `lendwise-mortgage-logo.png`

**Specifications:**
- Gold metallic styling
- "LENDWISE" on first line
- "MORTGAGE" on second line (50% smaller, centered)
- Transparent background (NO black)
- Used in all marketing materials

**Logo Rules:**
- MORTGAGE text must be 50% smaller than LENDWISE
- MORTGAGE centered below LENDWISE
- Always transparent background

---

## 🏢 LendWise Onboarding Project References

### Card Curtain Reveal Component
**Project:** `/mnt/c/Users/dyoun/Active Projects/LendWise-Onboarding`
**File:** `frontend/src/components/ui/card-curtain-reveal.tsx`

**What it does:** Side-opening curtain animation for cards

**Key features:**
- Left and right panels open from center
- Smooth animation on hover
- Content reveals behind curtains

### 4-Panel Door Animation
**Features:**
- 4 panels that open outward
- Center glow effect
- Video background behind doors
- Zero gap at center seam when closed

**Key CSS:**
- Door panels meet perfectly at center
- Glow positioned at center of video
- Transform calculations for symmetric opening

### Gold Header Design
**Standard format:**
```
Line 1: LENDWISE (large, gold, metallic)
Line 2: ONBOARDING (slightly smaller, gold, metallic)
```

**Styling characteristics:**
- Metallic gold gradient
- Letter spacing for professional look
- Centered alignment
- Shadow/glow effects for depth

---

## 🎯 David's Style Preferences

### Communication Style
**Always remember:**
- Call him David (not "user")
- Use numbered steps (Step 1, Step 2, etc.)
- No long explanations - clear action items
- Show visual examples
- Hand-holding approach

**When he says:**
- "Make it gold" → Use brand gold gradient
- "Like the LendWise design" → Reference existing brand materials
- "Put the WISR owl" → He knows exactly what file and where
- "Test it and show me" → Take screenshot with Playwright

### Design Preferences
1. **Professional & Luxury:** Clean, sophisticated, trustworthy
2. **Gold Accents:** Metallic gold is signature color
3. **Consistent Spacing:** Grid-based, generous whitespace
4. **Readable Typography:** Crystal clear text, proper contrast
5. **Smooth Animations:** Professional motion, not gimmicky

---

## 🖼️ Visual Design Patterns

### Successful Patterns
1. **Gold Metallic Headers**
   - Works well: LENDWISE + ONBOARDING format
   - Text with letter spacing
   - Gradient with shadow depth

2. **Dark Backgrounds with Gold Text**
   - High contrast
   - Professional appearance
   - Matches mortgage industry expectations

3. **Curtain/Door Reveal Animations**
   - Adds interactivity
   - Professional motion
   - Brand signature

### Avoid
- ❌ Plain white text (use gold instead)
- ❌ Busy backgrounds (keep clean)
- ❌ Black backgrounds on logos (use transparent)
- ❌ Cramped spacing (be generous)
- ❌ Low contrast text (must be readable)

---

## 📐 Layout Standards

### Instagram Format (Primary)
- **Size:** 1080x1350 (portrait)
- **Safe Zone:** Keep important content 10% from edges
- **Text:** Large, readable from phone screens
- **Logo:** Top or bottom, never center

### General Spacing
- **Padding:** Generous (20-40px minimum)
- **Line Height:** 1.6 for body text
- **Letter Spacing:** 0.05em for headers
- **Margin:** Consistent rhythm (use multiples of 8px)

---

## 🎬 Animation Guidelines

### Motion Principles
1. **Smooth:** Use ease-in-out timing
2. **Purpose:** Every animation has meaning
3. **Duration:** 300-500ms for most transitions
4. **Subtle:** Professional, not flashy

### Common Patterns
```css
/* Curtain reveal */
transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);

/* Hover effects */
transition: all 0.2s ease;

/* Door opening */
transform: rotateY(90deg);
transition: transform 0.8s ease-in-out;
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
Mobile: 320px - 767px
Tablet: 768px - 1023px
Desktop: 1024px+

/* Common breakpoints */
@media (max-width: 768px) { }
@media (min-width: 769px) and (max-width: 1024px) { }
@media (min-width: 1025px) { }
```

---

## 🎨 Component Styling

### Buttons
```css
.primary-button {
  background: linear-gradient(135deg, #B8860B, #FFD700);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}
```

### Cards
```css
.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}
```

---

## 🔍 Asset Locations Quick Reference

```
Key Files:
├── wisr-owl-video.mp4           # WISR owl animation
├── lendwise-mortgage-logo.png   # Main logo
├── nano-test.html               # Marketing generator
├── quality-backend.js           # Backend server
└── .claude/
    ├── project-memory.md        # Project context
    ├── brand-assets.md          # This file
    └── known-issues.md          # Problems & solutions
```

---

## 💡 Quick Reference for Agent

**When David asks for:**

| Request | Action |
|---------|--------|
| "Gold button" | Use gradient #B8860B → #FFD700 |
| "WISR owl in header" | Use wisr-owl-video.mp4 with lighten blend |
| "LendWise style" | Gold metallic + dark background |
| "Make it professional" | Clean layout, generous spacing, gold accents |
| "Test it" | Screenshot with Playwright |
| "Like the door animation" | Reference LendWise-Onboarding 4-panel doors |

**Remember:** David knows his brand deeply. When he references these elements, he expects the agent to know exact files, colors, and styling.

---

**This file should be referenced whenever implementing design changes or adding visual elements.**
