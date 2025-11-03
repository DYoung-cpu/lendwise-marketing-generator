// Email Signature Design Templates
// Each template generates a unique background design for LendWise Mortgage email signatures

const SIGNATURE_TEMPLATES = [
    {
        id: 'classic',
        name: 'Classic Professional',
        icon: '🎨',
        description: 'Traditional, clean design with green border and gold accents',
        prompt: `Create a professional, integrated email signature image for LendWise Mortgage.

CRITICAL ASPECT RATIO: 21:9 ultra-wide landscape (will be cropped to 7:2 for email signature)
COMPOSITION: Design horizontally - important elements in CENTER horizontal strip

DESIGN SPECIFICATIONS:
• Style: Classic, traditional mortgage industry aesthetic
• Output: 21:9 aspect ratio (ultra-wide landscape)
• Final use: Cropped to 700px × 200px email signature banner
• Color Palette: Deep forest green (#2d5f3f), gold metallic (#DAA520), white accents
• Layout: Left section with logo/branding, right section with officer information

REQUIRED BRANDING ELEMENTS (MUST INCLUDE IN IMAGE):
• LendWise Mortgage owl logo - positioned in left 200px area
• Officer's full name - prominent, bold, center-right area
• Title: "Mortgage Advisor" or "Loan Officer" - below name
• NMLS number (if provided) - display as "NMLS: {number}"
• Tagline: "Your Path to Homeownership" - bottom area in gold
• Professional gold vertical divider line between logo and officer info

DESIGN LAYOUT:
• Left 200px: Deep forest green background with LendWise owl logo in gold
• Left section includes: "LENDWISE MORTGAGE" text in gold below logo
• Center: Thin vertical gold dividing line (#DAA520)
• Right section: Gradient from deep green to lighter green
• Officer name, title, NMLS centered in right section with good contrast
• Bottom: Gold tagline "Your Path to Homeownership" in script font

CONTACT INFORMATION TO EXCLUDE (will be added as HTML overlay):
• Phone number - reserve space but DO NOT include in image
• Email address - reserve space but DO NOT include in image
• Website URL - reserve space but DO NOT include in image
• Physical address - DO NOT include in image

STYLE REQUIREMENTS:
• Professional, trustworthy, established company aesthetic
• Integrated design where logo and name are part of the composition
• Good text contrast for readability
• Gold accents for premium feel
• Clean, balanced, mortgage industry appropriate

OUTPUT: Complete professional signature with LendWise branding, logo, and officer identity integrated into the design. Phone/email will be added as clickable HTML overlays.`
    },
    {
        id: 'modern',
        name: 'Modern Minimal',
        icon: '✨',
        description: 'Clean, contemporary design with subtle accents',
        prompt: `Create a modern minimalist, integrated email signature image for LendWise Mortgage.

CRITICAL ASPECT RATIO: 21:9 ultra-wide landscape (will be cropped to 7:2 for email signature)
COMPOSITION: Horizontal design - clean, contemporary layout

DESIGN SPECIFICATIONS:
• Style: Modern, minimal, contemporary with focused branding
• Output: 21:9 aspect ratio (ultra-wide landscape)
• Final use: Cropped to 700px × 200px email signature banner
• Color Palette: White (#ffffff), LendWise green (#2d5f3f), gold accent (#DAA520)
• Layout: Clean left-aligned logo, right-aligned officer information

REQUIRED BRANDING ELEMENTS (MUST INCLUDE IN IMAGE):
• LendWise Mortgage owl logo - small, elegant, left side (100px area)
• "LENDWISE" text in modern sans-serif font below logo
• Officer's full name - prominent, clean font, center area
• Title: "Mortgage Advisor" or "Loan Officer" - below name in lighter weight
• NMLS number (if provided) - display as "NMLS: {number}" in small text
• Ultra-thin gold accent line as visual separator

DESIGN LAYOUT:
• Background: Clean white or very light gray (#f9f9f9)
• Left 150px: Small owl logo with "LENDWISE" text in green
• Center: Officer name in bold, modern sans-serif (size 18-20pt equivalent)
• Below name: Title in lighter weight green text
• Below title: NMLS number in small text
• Bottom edge: Ultra-thin 2px gold line (#DAA520) running full width
• Left edge: Thin vertical green accent strip (5px wide)

CONTACT INFORMATION TO EXCLUDE (will be added as HTML overlay):
• Phone number - DO NOT include in image
• Email address - DO NOT include in image
• Website URL - DO NOT include in image

STYLE REQUIREMENTS:
• Ultra-clean, lots of white space (80% of area is white/light)
• Modern typography with good hierarchy
• Minimal but professional
• Logo integrated but not dominating
• Contemporary, tech-forward, approachable aesthetic
• Perfect readability and contrast

OUTPUT: Clean, modern signature with integrated LendWise branding and officer identity. Minimalist style with strong typography. Phone/email added as HTML overlays.`
    },
    {
        id: 'bold',
        name: 'Bold Impact',
        icon: '💎',
        description: 'Eye-catching design with dynamic green and gold elements',
        prompt: `Create a bold, eye-catching integrated email signature image for LendWise Mortgage.

CRITICAL ASPECT RATIO: 21:9 ultra-wide landscape (will be cropped to 7:2 for email signature)
COMPOSITION: Dynamic diagonal design with strong visual hierarchy

DESIGN SPECIFICATIONS:
• Style: Bold, impactful, modern design that commands attention
• Output: 21:9 aspect ratio (ultra-wide landscape)
• Final use: Cropped to 700px × 200px email signature banner
• Color Palette: Rich green gradient (#2d5f3f to #1a3d2e), bright gold (#FFD700), white
• Layout: Diagonal split design with logo left, officer info right

REQUIRED BRANDING ELEMENTS (MUST INCLUDE IN IMAGE):
• LendWise Mortgage owl logo - prominent, left side in gold/white
• "LENDWISE MORTGAGE" text - bold, integrated with logo section
• Officer's full name - LARGE, bold typography, high contrast
• Title: "Mortgage Advisor" or "Loan Officer" - strong, clear
• NMLS number (if provided) - display as "NMLS: {number}"
• Gold geometric accent shapes for visual impact

DESIGN LAYOUT:
• Left 40%: Deep forest green diagonal section with large owl logo in gold
• Logo section includes "LENDWISE MORTGAGE" text in gold
• Diagonal gold band (30-40px) separating left and right sections
• Right 60%: Lighter section (white to light cream gradient)
• Officer name in BOLD large text (size 22-24pt equivalent) in dark green
• Title and NMLS below name in smaller but clear text
• Abstract gold geometric accents (triangles, lines) for visual interest
• Strong diagonal composition from bottom-left to top-right

CONTACT INFORMATION TO EXCLUDE (will be added as HTML overlay):
• Phone number - DO NOT include in image
• Email address - DO NOT include in image
• Website URL - DO NOT include in image

STYLE REQUIREMENTS:
• Bold, confident, stands out in inbox
• High visual impact while remaining professional
• Strong color contrast for maximum readability
• Dynamic diagonal energy but balanced composition
• Gold accents add premium feel without being gaudy
• Modern, assertive, memorable aesthetic
• Mortgage industry appropriate despite bold style

OUTPUT: High-impact signature with integrated LendWise branding, prominent officer identity, and dynamic diagonal composition. Stands out while maintaining professionalism. Phone/email added as HTML overlays.`
    },
    {
        id: 'photo',
        name: 'Photo Featured',
        icon: '📸',
        description: 'Personal design with space for loan officer headshot',
        prompt: `Create a relationship-focused, integrated email signature image for LendWise Mortgage with photo integration.

CRITICAL ASPECT RATIO: 21:9 ultra-wide landscape (will be cropped to 7:2 for email signature)
COMPOSITION: Horizontal layout - photo space left, branding center, officer info right

DESIGN SPECIFICATIONS:
• Style: Personal, warm, relationship-focused with professional branding
• Output: 21:9 aspect ratio (ultra-wide landscape)
• Final use: Cropped to 700px × 200px email signature banner
• Color Palette: Soft cream background, LendWise green (#2d5f3f), gold accents (#DAA520)
• Layout: Circular photo space left, LendWise branding center, officer details right

REQUIRED BRANDING ELEMENTS (MUST INCLUDE IN IMAGE):
• Circular photo frame (150px diameter) - elegant green/gold border
• LendWise owl logo - integrated near/within photo frame design
• "LENDWISE MORTGAGE" text - positioned elegantly near logo
• Officer's full name - prominent, warm font, right section
• Title: "Mortgage Advisor" or "Loan Officer" - below name
• NMLS number (if provided) - display as "NMLS: {number}"
• Tagline: "Your Path to Homeownership" in script font

DESIGN LAYOUT:
• Far left 180px: Circular photo frame with elegant gold inner ring, green outer border
• Photo frame should have blank/placeholder interior (neutral cream fill)
• Small LendWise owl logo positioned near photo frame (integrated design)
• Background: Soft warm cream to light beige gradient
• Center-right: Officer name in warm, personable font (18pt equivalent)
• Below name: Title in green, NMLS in smaller text
• Bottom: Subtle green accent bar (20px height) with "Your Path to Homeownership" in gold
• Gold decorative elements connecting photo frame to text area

CONTACT INFORMATION TO EXCLUDE (will be added as HTML overlay):
• Phone number - DO NOT include in image
• Email address - DO NOT include in image
• Website URL - DO NOT include in image

STYLE REQUIREMENTS:
• Warm, personable, approachable aesthetic
• Human connection and relationship banking focus
• Photo frame is decorative placeholder (will be replaced with actual headshot)
• Professional but personal feel
• Elegant, not corporate
• Trust and personal service emphasis
• Client-facing loan officer appropriate

OUTPUT: Warm, relationship-focused signature with circular photo frame placeholder, integrated LendWise branding, and officer identity. Personal yet professional. Phone/email added as HTML overlays.`
    },
    {
        id: 'luxury',
        name: 'Luxury Edition',
        icon: '👑',
        description: 'Premium design with sophisticated gold metallic effects',
        prompt: `Create a luxury, high-end integrated email signature image for LendWise Mortgage targeting affluent clients.

CRITICAL ASPECT RATIO: 21:9 ultra-wide landscape (will be cropped to 7:2 for email signature)
COMPOSITION: Premium horizontal design with sophisticated branding integration

DESIGN SPECIFICATIONS:
• Style: Luxury, premium, sophisticated - high-net-worth positioning
• Output: 21:9 aspect ratio (ultra-wide landscape)
• Final use: Cropped to 700px × 200px email signature banner
• Color Palette: Deep emerald green (#1a3d2e), metallic gold (#FFD700), champagne, ivory
• Layout: Elegant horizontal design with luxury branding and officer prominence

REQUIRED BRANDING ELEMENTS (MUST INCLUDE IN IMAGE):
• LendWise Mortgage owl logo - sophisticated, metallic gold finish
• "LENDWISE MORTGAGE" text - elegant serif font in gold
• Officer's full name - prominent, luxury typography (serif or elegant sans)
• Title: "Mortgage Advisor" or "Private Client Advisor" - refined
• NMLS number (if provided) - display as "NMLS: {number}" discretely
• Subtle luxury pattern or texture in background
• Gold shimmer/metallic effects for premium feel

DESIGN LAYOUT:
• Top third: Ivory or champagne background with officer name in prominent position
• Officer name in elegant serif font (20-22pt equivalent) in deep emerald green
• Left section: LendWise owl logo in metallic gold with subtle shimmer
• "LENDWISE MORTGAGE" text below logo in refined gold lettering
• Center: Wide metallic gold gradient band (40-50px) with shimmer effect
• Title and NMLS positioned elegantly below/beside name
• Bottom third: Deep emerald green with subtle luxury pattern (damask or geometric)
• Overall: Rich textures - silk, shimmer, metallic finishes
• Sophisticated gold accents throughout for premium positioning

CONTACT INFORMATION TO EXCLUDE (will be added as HTML overlay):
• Phone number - DO NOT include in image
• Email address - DO NOT include in image
• Website URL - DO NOT include in image

STYLE REQUIREMENTS:
• Upscale, exclusive, premium mortgage services aesthetic
• High-end real estate and luxury home financing focus
• Sophisticated, never flashy or gaudy
• Balance luxury with professionalism and taste
• Metallic gold accents add richness without being overwhelming
• Subtle texture and shimmer for premium feel
• Positions LendWise as premium lender for high-net-worth clients
• Elegant, refined, exclusive

OUTPUT: Luxury signature with integrated LendWise branding, sophisticated officer identity, and premium metallic/shimmer effects. High-end positioning appropriate for affluent clientele. Phone/email added as HTML overlays.`
    }
];

// Validate templates on load
if (typeof console !== 'undefined') {
    console.log(`✅ Loaded ${SIGNATURE_TEMPLATES.length} signature templates:`, SIGNATURE_TEMPLATES.map(t => t.name));
}
