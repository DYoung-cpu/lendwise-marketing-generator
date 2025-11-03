/**
 * Style Presets for WISR Marketing Generator
 *
 * 12 visual style variations inspired by reference image (dramatic bokeh/purple/gold)
 * adapted to LendWise branding (forest green + metallic gold).
 *
 * Each preset includes:
 * - Name and description
 * - Visual characteristics
 * - Typography specifications
 * - Color palette
 * - Lighting/effects
 * - Best use cases
 *
 * Usage:
 *   import { STYLE_PRESETS, getStylePromptAddition } from './style-presets.js';
 *   const styleAddition = getStylePromptAddition('dramatic');
 */

export const STYLE_PRESETS = {
    // ========== DRAMATIC SUITE (Bokeh-Inspired) ==========

    dramatic: {
        name: 'Dramatic Bokeh',
        description: 'Deep forest green bokeh with floating light particles',
        category: 'dramatic',
        visualCharacteristics: [
            'Deep forest green bokeh effect (circular light spots)',
            'Floating golden light particles and lens flare',
            'Strong depth of field with blurred background',
            'High contrast between sharp foreground and soft background',
            'Metallic gold accents with shimmer and glow',
            'Moody, cinematic atmosphere'
        ],
        typography: {
            headline: 'Playfair Display, bold, 60-72pt, dramatic shadow',
            body: 'Open Sans, medium, 14-16pt, subtle glow',
            accent: 'Metallic gold gradient with shimmer effect'
        },
        colorPalette: {
            background: ['#0a1f15', '#1a3d2e', '#2d5f3f'], // Dark to medium green
            bokehColors: ['#4a7c59', '#5a8c69', '#6a9c79'], // Lighter green bokeh
            gold: ['#FFD700', '#FFC107', '#FFB300'], // Bright gold
            particles: ['rgba(255, 215, 0, 0.8)', 'rgba(255, 215, 0, 0.4)']
        },
        lighting: 'Dramatic side lighting with backlit glow, creates depth',
        effects: [
            'Circular bokeh spots (large in background)',
            'Floating light particles with motion blur',
            'Lens flare streaks (subtle)',
            'Vignette darkening edges'
        ],
        bestFor: ['Rate alerts', 'Market updates', 'Testimonials', 'Loan journey'],
        promptAddition: 'Deep forest green bokeh background with circular light spots. Floating golden light particles. Dramatic depth of field. Cinematic lighting with backlit glow.'
    },

    lightParticles: {
        name: 'Light Particles',
        description: 'Dark background with floating luminous gold particles',
        category: 'dramatic',
        visualCharacteristics: [
            'Very dark forest green background (#0a1f15)',
            'Hundreds of small floating gold particles',
            'Particles have soft glow and motion blur',
            'Some particles brighter/larger for depth',
            'Ethereal, magical atmosphere',
            'Clean text areas with particle-free zones'
        ],
        typography: {
            headline: 'Playfair Display, bold, 54-66pt, bright gold',
            body: 'Open Sans, regular, 12-14pt, white with shadow',
            accent: 'Glowing gold with particle effect'
        },
        colorPalette: {
            background: ['#0a1f15', '#0f2619'],
            particles: ['#FFD700', '#FFC107', '#DAA520'],
            text: ['#FFFFFF', '#F5F5DC']
        },
        lighting: 'Ambient glow from particles, no direct light source',
        effects: [
            'Particle glow (soft, 3-5px blur)',
            'Random particle sizes (2-8px)',
            'Depth through opacity variation',
            'Some particles in motion'
        ],
        bestFor: ['Celebration announcements', 'Milestone achievements', 'Premium content'],
        promptAddition: 'Very dark forest green background. Hundreds of small floating gold particles with soft glow. Ethereal, magical atmosphere. Particles create depth through size and opacity variation.'
    },

    deepDepth: {
        name: 'Deep Depth',
        description: 'Strong foreground/background separation with blur',
        category: 'dramatic',
        visualCharacteristics: [
            'Sharp, clear foreground elements',
            'Heavily blurred background (forest green)',
            'Creates sense of layered depth',
            'Gold accents in focus',
            'Professional photography aesthetic',
            'Forbes/Bloomberg editorial style'
        ],
        typography: {
            headline: 'Playfair Display, bold, 48-60pt, sharp focus',
            body: 'Open Sans, medium, 13-15pt, crisp',
            accent: 'Sharp gold metallic finish'
        },
        colorPalette: {
            foreground: ['#2d5f3f', '#1a3d2e'], // Clear, saturated
            background: ['#4a7c59', '#5a8c69'], // Lighter, blurred
            gold: ['#DAA520', '#B8860B']
        },
        lighting: 'Professional studio lighting, soft box effect',
        effects: [
            'Gaussian blur on background (heavy)',
            'Sharp focus on text/logo',
            'Depth cues through blur gradient',
            'Professional color grading'
        ],
        bestFor: ['Market intelligence', 'Professional reports', 'About me cards'],
        promptAddition: 'Strong depth of field effect. Sharp, clear foreground with heavily blurred forest green background. Professional photography aesthetic. Layered depth creates sophisticated look.'
    },

    // ========== ELEGANT SUITE ==========

    metallicLuxury: {
        name: 'Metallic Luxury',
        description: 'Gold metallic text with shimmer and elegance',
        category: 'elegant',
        visualCharacteristics: [
            'Rich forest green gradient background',
            'Metallic gold text with reflective quality',
            'Subtle shimmer and shine effects',
            'Premium magazine aesthetic',
            'Refined, sophisticated composition',
            'Generous whitespace'
        ],
        typography: {
            headline: 'Playfair Display, bold, 56-68pt, metallic gold',
            body: 'Open Sans, regular, 12-14pt, cream color',
            accent: 'Polished gold with specular highlights'
        },
        colorPalette: {
            background: ['#2d5f3f', '#1a3d2e', '#0f1f15'], // Green gradient
            gold: ['#FFD700', '#F7E7CE', '#B8860B'], // Gold with highlights
            text: ['#F5F5DC', '#FFFFFF']
        },
        lighting: 'Soft, even lighting with gentle highlights on metallic elements',
        effects: [
            'Metallic sheen on gold text',
            'Subtle shimmer animation suggest',
            'Polished, reflective quality',
            'Soft glow around gold elements'
        ],
        bestFor: ['Luxury homes', 'Jumbo loans', 'High-end testimonials'],
        promptAddition: 'Forest green gradient background. Metallic gold text with reflective shimmer. Premium magazine aesthetic. Refined, sophisticated composition with generous whitespace.'
    },

    gradientFlow: {
        name: 'Gradient Flow',
        description: 'Smooth green-to-dark gradients with fluid movement',
        category: 'elegant',
        visualCharacteristics: [
            'Flowing forest green gradients',
            'Smooth transitions (no harsh lines)',
            'Sense of movement and fluidity',
            'Elegant curve suggestions',
            'Calm, professional atmosphere',
            'Gold accents as focal points'
        ],
        typography: {
            headline: 'Playfair Display, medium, 50-62pt, white',
            body: 'Open Sans, regular, 12-14pt, cream',
            accent: 'Gold with gradient overlay'
        },
        colorPalette: {
            gradients: [
                ['#4a7c59', '#2d5f3f', '#1a3d2e'], // Light to dark green
                ['#2d5f3f', '#1a3d2e', '#0a1f15']  // Medium to very dark
            ],
            gold: ['#DAA520', '#FFD700'],
            text: ['#FFFFFF', '#F5F5DC']
        },
        lighting: 'Soft, diffused lighting that enhances gradient flow',
        effects: [
            'Multi-stop gradients (3-5 colors)',
            'Radial or linear flow patterns',
            'Subtle gradient mesh',
            'Smooth color transitions'
        ],
        bestFor: ['Market trends', 'Economic updates', 'Rate forecasts'],
        promptAddition: 'Flowing forest green gradients with smooth transitions. Elegant, fluid movement. Calm professional atmosphere. Gold accents as focal points. Multi-stop gradient creates depth.'
    },

    sophisticatedShadow: {
        name: 'Sophisticated Shadow',
        description: 'Floating shadows on key elements for depth',
        category: 'elegant',
        visualCharacteristics: [
            'Clean forest green background',
            'Elements appear to float with soft shadows',
            'Layered composition',
            'Premium business card aesthetic',
            'Modern, refined design',
            'Clear visual hierarchy'
        ],
        typography: {
            headline: 'Playfair Display, semibold, 52-64pt, with shadow',
            body: 'Open Sans, regular, 12-14pt, with subtle shadow',
            accent: 'Gold with elevated appearance'
        },
        colorPalette: {
            background: ['#2d5f3f', '#245237'],
            shadows: ['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.15)'],
            gold: ['#FFD700', '#DAA520'],
            text: ['#FFFFFF', '#F5F5DC']
        },
        lighting: 'Soft overhead lighting creating natural shadows',
        effects: [
            'Floating shadow (offset down-right)',
            'Shadow blur 8-15px',
            'Multi-level depth (different shadow intensities)',
            'Clean, crisp edges'
        ],
        bestFor: ['Business cards', 'Contact info', 'Professional profiles'],
        promptAddition: 'Clean forest green background. Elements float with soft shadows below. Layered composition with clear hierarchy. Premium business aesthetic. Shadows create depth and sophistication.'
    },

    // ========== MODERN SUITE ==========

    cleanMinimal: {
        name: 'Clean Minimal',
        description: 'Thin gold lines and generous whitespace',
        category: 'modern',
        visualCharacteristics: [
            'Light forest green background',
            'Thin gold accent lines',
            'Generous whitespace (50%+ negative space)',
            'Grid-based layout',
            'Contemporary, uncluttered',
            'Swiss design influence'
        ],
        typography: {
            headline: 'Playfair Display, light, 48-60pt, thin weight',
            body: 'Open Sans, regular, 12-14pt, dark green',
            accent: 'Thin gold lines (1-2px)'
        },
        colorPalette: {
            background: ['#e8f3ed', '#f5f9f7'], // Very light green
            lines: ['#DAA520', '#B8860B'],
            text: ['#1a3d2e', '#2d5f3f'],
            accents: ['#FFD700']
        },
        lighting: 'Bright, even lighting like modern gallery',
        effects: [
            'Thin horizontal/vertical lines',
            'Geometric grid system',
            'Minimal shadows',
            'Crisp, clean edges'
        ],
        bestFor: ['Modern listings', 'Clean data', 'Minimalist content'],
        promptAddition: 'Light forest green background. Thin gold accent lines (1-2px). Generous whitespace (50%+). Contemporary grid-based layout. Swiss design aesthetic. Uncluttered and modern.'
    },

    boldTypography: {
        name: 'Bold Typography',
        description: 'Large, bold serif headlines dominate',
        category: 'modern',
        visualCharacteristics: [
            'Typography as primary visual element',
            'Extra large headlines (72-96pt)',
            'Bold weight serif font',
            'Medium green background',
            'Type creates visual impact',
            'Minimal other elements'
        ],
        typography: {
            headline: 'Playfair Display, extra bold, 72-96pt, gold',
            body: 'Open Sans, regular, 11-13pt, white',
            accent: 'Typography IS the accent'
        },
        colorPalette: {
            background: ['#2d5f3f', '#1a3d2e'],
            headline: ['#FFD700', '#FFC107'],
            body: ['#FFFFFF', '#F5F5DC']
        },
        lighting: 'Lighting emphasizes typography dimension',
        effects: [
            'Large type creates hierarchy',
            'Strong contrast (type vs background)',
            'Type shadow for dimension',
            'Letter spacing for impact'
        ],
        bestFor: ['Rate announcements', 'Bold statements', 'Call-to-action'],
        promptAddition: 'Extra large bold serif headlines (72-96pt) in gold. Typography dominates as primary visual element. Medium green background. Strong contrast creates impact. Minimal other elements.'
    },

    geometricPatterns: {
        name: 'Geometric Patterns',
        description: 'Subtle geometric overlays and modern shapes',
        category: 'modern',
        visualCharacteristics: [
            'Forest green background',
            'Subtle geometric pattern overlays (5-10% opacity)',
            'Modern shapes (triangles, hexagons, lines)',
            'Tech-forward aesthetic',
            'Structured but not rigid',
            'Contemporary financial design'
        ],
        typography: {
            headline: 'Open Sans, bold, 50-62pt, clean',
            body: 'Open Sans, regular, 12-14pt, sans-serif',
            accent: 'Geometric shapes in gold'
        },
        colorPalette: {
            background: ['#2d5f3f', '#245237'],
            patterns: ['rgba(218, 165, 32, 0.1)', 'rgba(255, 215, 0, 0.05)'],
            text: ['#FFFFFF', '#F5F5DC'],
            shapes: ['#DAA520', '#FFD700']
        },
        lighting: 'Even, tech-style lighting',
        effects: [
            'Geometric pattern overlay (subtle)',
            'Angular shapes as accents',
            'Grid-based composition',
            'Modern, structured layout'
        ],
        bestFor: ['Market data', 'Tech-savvy audience', 'Modern financial content'],
        promptAddition: 'Forest green background with subtle geometric pattern overlay (5-10% opacity). Modern shapes like triangles and hexagons. Tech-forward aesthetic. Gold geometric accents.'
    },

    // ========== BOLD SUITE ==========

    highContrast: {
        name: 'High Contrast',
        description: 'Deep green + bright gold, no middle tones',
        category: 'bold',
        visualCharacteristics: [
            'Very dark forest green (#0a1f15)',
            'Bright metallic gold (#FFD700)',
            'No middle tones - pure contrast',
            'Dramatic, attention-grabbing',
            'Bold visual statements',
            'Maximum readability'
        ],
        typography: {
            headline: 'Playfair Display, black, 60-74pt, bright gold',
            body: 'Open Sans, bold, 13-15pt, white',
            accent: 'Bright gold with glow'
        },
        colorPalette: {
            background: ['#0a1f15', '#050f0a'], // Very dark
            gold: ['#FFD700', '#FFF8DC'], // Very bright
            text: ['#FFFFFF'] // Pure white only
        },
        lighting: 'High contrast lighting, no soft gradients',
        effects: [
            'Maximum contrast (no gradients)',
            'Sharp edges',
            'Gold glow for emphasis',
            'Bold, clear hierarchy'
        ],
        bestFor: ['Urgent alerts', 'Breaking news', 'Important announcements'],
        promptAddition: 'Very dark forest green background (#0a1f15). Bright metallic gold (#FFD700). No middle tones - pure high contrast. Dramatic and attention-grabbing. Maximum readability.'
    },

    dynamicAngles: {
        name: 'Dynamic Angles',
        description: 'Diagonal elements and angular energy',
        category: 'bold',
        visualCharacteristics: [
            'Diagonal lines and shapes',
            'Angular composition (not horizontal/vertical)',
            'Sense of motion and energy',
            'Dynamic, modern feel',
            'Directional flow',
            'Action-oriented design'
        ],
        typography: {
            headline: 'Open Sans, bold, 54-66pt, angled baseline',
            body: 'Open Sans, medium, 12-14pt, aligned',
            accent: 'Angular gold accent lines'
        },
        colorPalette: {
            background: ['#2d5f3f', '#1a3d2e'],
            accents: ['#FFD700', '#FFC107'],
            text: ['#FFFFFF', '#F5F5DC']
        },
        lighting: 'Directional lighting following angles',
        effects: [
            'Diagonal layout (15-30 degree angles)',
            'Angular accent lines',
            'Directional shadows',
            'Dynamic composition'
        ],
        bestFor: ['Action items', 'Time-sensitive content', 'Growth stories'],
        promptAddition: 'Diagonal layout with 15-30 degree angles. Angular composition creates motion and energy. Directional gold accent lines. Dynamic, action-oriented design with forward momentum.'
    },

    layeredDepth: {
        name: 'Layered Depth',
        description: 'Multiple depth layers with strong shadows',
        category: 'bold',
        visualCharacteristics: [
            'Multiple overlapping layers',
            'Strong shadows between layers',
            '3-4 distinct depth levels',
            'Dimensional, tactile appearance',
            'Rich visual complexity',
            'Premium, layered aesthetic'
        ],
        typography: {
            headline: 'Playfair Display, bold, 56-68pt, top layer',
            body: 'Open Sans, regular, 12-14pt, middle layer',
            accent: 'Gold elements on multiple layers'
        },
        colorPalette: {
            layer1: ['#4a7c59'], // Lightest (front)
            layer2: ['#2d5f3f'], // Medium (middle)
            layer3: ['#1a3d2e'], // Dark (back)
            shadows: ['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.25)'],
            gold: ['#FFD700', '#DAA520']
        },
        lighting: 'Layered lighting creating distinct shadows',
        effects: [
            'Strong shadows (offset 5-10px)',
            '3-4 depth layers visible',
            'Overlapping elements',
            'Dimensional appearance'
        ],
        bestFor: ['Complex data', 'Multi-section content', 'Premium listings'],
        promptAddition: 'Multiple overlapping layers in different green tones. Strong shadows between layers (5-10px offset). 3-4 distinct depth levels. Dimensional, tactile appearance creates rich visual complexity.'
    }
};

/**
 * Get random style preset
 */
export function getRandomStyle(category = null) {
    const styles = Object.keys(STYLE_PRESETS);
    const filtered = category
        ? styles.filter(key => STYLE_PRESETS[key].category === category)
        : styles;

    const randomKey = filtered[Math.floor(Math.random() * filtered.length)];
    return {
        key: randomKey,
        preset: STYLE_PRESETS[randomKey]
    };
}

/**
 * Get style prompt addition for Gemini
 */
export function getStylePromptAddition(styleKey) {
    const preset = STYLE_PRESETS[styleKey];
    if (!preset) {
        console.warn(`⚠️  Unknown style preset: ${styleKey}, using 'dramatic'`);
        return STYLE_PRESETS.dramatic.promptAddition;
    }
    return preset.promptAddition;
}

/**
 * Get styles by category
 */
export function getStylesByCategory(category) {
    return Object.entries(STYLE_PRESETS)
        .filter(([, preset]) => preset.category === category)
        .map(([key, preset]) => ({ key, ...preset }));
}

/**
 * Get all categories
 */
export function getCategories() {
    const categories = new Set();
    Object.values(STYLE_PRESETS).forEach(preset => {
        categories.add(preset.category);
    });
    return Array.from(categories);
}

/**
 * Format style info for display
 */
export function formatStyleInfo(styleKey) {
    const preset = STYLE_PRESETS[styleKey];
    if (!preset) return null;

    return {
        name: preset.name,
        description: preset.description,
        category: preset.category,
        bestFor: preset.bestFor.join(', '),
        characteristics: preset.visualCharacteristics.join(' • ')
    };
}

export default {
    STYLE_PRESETS,
    getRandomStyle,
    getStylePromptAddition,
    getStylesByCategory,
    getCategories,
    formatStyleInfo
};
