/**
 * Animation Effects Library
 *
 * Pre-built FFmpeg filter templates for text overlay animations
 * Supports: fade, slide, glow, zoom, metallic shimmer, water ripple, etc.
 */

/**
 * Fade In/Out Effect
 *
 * @param {number} startTime - When to start fading in (seconds)
 * @param {number} duration - Total duration on screen (seconds)
 * @param {number} fadeInDuration - Fade in duration (default: 0.3s)
 * @param {number} fadeOutDuration - Fade out duration (default: 0.3s)
 * @returns {string} FFmpeg filter
 */
export function fadeInOut(startTime, duration, fadeInDuration = 0.3, fadeOutDuration = 0.3) {
  const fadeOutStart = startTime + duration - fadeOutDuration;

  return `fade=in:st=${startTime}:d=${fadeInDuration}:alpha=1,fade=out:st=${fadeOutStart}:d=${fadeOutDuration}:alpha=1`;
}

/**
 * Slide In Effect
 *
 * @param {string} direction - 'left', 'right', 'top', 'bottom'
 * @param {number} startTime - When animation starts
 * @param {number} duration - Slide duration (default: 0.5s)
 * @param {number} x - Final X position
 * @param {number} y - Final Y position
 * @returns {Object} { filter, overlayExpression }
 */
export function slideIn(direction, startTime, duration = 0.5, x = 0, y = 0) {
  let overlayExpression;

  switch (direction) {
    case 'left':
      overlayExpression = `x='if(lt(t-${startTime},${duration}), ${x}+W*((${duration}-(t-${startTime}))/${duration}), ${x})':y=${y}`;
      break;
    case 'right':
      overlayExpression = `x='if(lt(t-${startTime},${duration}), ${x}-W*((${duration}-(t-${startTime}))/${duration}), ${x})':y=${y}`;
      break;
    case 'top':
      overlayExpression = `x=${x}:y='if(lt(t-${startTime},${duration}), ${y}+H*((${duration}-(t-${startTime}))/${duration}), ${y})'`;
      break;
    case 'bottom':
      overlayExpression = `x=${x}:y='if(lt(t-${startTime},${duration}), ${y}-H*((${duration}-(t-${startTime}))/${duration}), ${y})'`;
      break;
    default:
      overlayExpression = `x=${x}:y=${y}`;
  }

  return {
    filter: fadeInOut(startTime, duration, 0.1, 0),
    overlayExpression
  };
}

/**
 * Zoom In Effect
 *
 * @param {number} startTime - When animation starts
 * @param {number} duration - Zoom duration
 * @param {number} startScale - Starting scale (default: 0.5)
 * @param {number} endScale - Ending scale (default: 1.0)
 * @returns {string} FFmpeg filter
 */
export function zoomIn(startTime, duration, startScale = 0.5, endScale = 1.0) {
  const endTime = startTime + duration;

  return `scale='if(lt(t,${startTime}), iw*${startScale}, if(lt(t,${endTime}), iw*(${startScale}+((t-${startTime})/${duration})*(${endScale}-${startScale})), iw*${endScale}))':'if(lt(t,${startTime}), ih*${startScale}, if(lt(t,${endTime}), ih*(${startScale}+((t-${startTime})/${duration})*(${endScale}-${startScale})), ih*${endScale}))'`;
}

/**
 * Glow Pulse Effect
 *
 * Creates a breathing glow around text
 *
 * @param {number} frequency - Pulse frequency (Hz, default: 1.0)
 * @param {number} intensity - Glow intensity (0-1, default: 0.5)
 * @returns {string} FFmpeg filter
 */
export function glowPulse(frequency = 1.0, intensity = 0.5) {
  // Use boxblur with time-varying radius for pulsing effect
  const minBlur = 2;
  const maxBlur = 10;

  return `boxblur=${minBlur}+${maxBlur-minBlur}*(1+sin(2*PI*${frequency}*t))/2:1`;
}

/**
 * Metallic Shimmer Effect
 *
 * Creates a light sweep across the text (simulates metallic shine)
 *
 * @param {number} speed - Sweep speed (default: 2.0 seconds for full sweep)
 * @param {number} width - Overlay width
 * @returns {string} FFmpeg filter
 */
export function metallicShimmer(speed = 2.0, width = 1080) {
  // Create a moving gradient overlay
  return `colorkey=0xFFFFFF:0.3:0.2,lutrgb=r='if(between(x, ${width}*((t/${speed})%1)-50, ${width}*((t/${speed})%1)+50), 255, r)':g='if(between(x, ${width}*((t/${speed})%1)-50, ${width}*((t/${speed})%1)+50), 255, g)':b='if(between(x, ${width}*((t/${speed})%1)-50, ${width}*((t/${speed})%1)+50), 255, b)'`;
}

/**
 * Typewriter Reveal Effect
 *
 * Text appears character by character
 *
 * @param {number} startTime - When to start reveal
 * @param {number} charCount - Number of characters
 * @param {number} charsPerSecond - Reveal speed (default: 10 chars/sec)
 * @param {number} width - Overlay width
 * @returns {string} FFmpeg filter
 */
export function typewriterReveal(startTime, charCount, charsPerSecond = 10, width = 1080) {
  const duration = charCount / charsPerSecond;
  const endTime = startTime + duration;

  // Crop from left to right over time
  return `crop='if(lt(t,${startTime}), 0, if(lt(t,${endTime}), ${width}*((t-${startTime})/${duration}), ${width}))':ih:0:0`;
}

/**
 * Scale Bounce Effect
 *
 * Element bounces in with elastic easing
 *
 * @param {number} startTime - When animation starts
 * @param {number} duration - Bounce duration (default: 0.6s)
 * @returns {string} FFmpeg filter
 */
export function scaleBounce(startTime, duration = 0.6) {
  const endTime = startTime + duration;

  // Elastic ease-out formula
  return `scale='if(lt(t,${startTime}), 0, if(lt(t,${endTime}), iw*(1+0.3*sin(10*(t-${startTime})/${duration})*exp(-5*(t-${startTime})/${duration})), iw))':'if(lt(t,${startTime}), 0, if(lt(t,${endTime}), ih*(1+0.3*sin(10*(t-${startTime})/${duration})*exp(-5*(t-${startTime})/${duration})), ih))'`;
}

/**
 * Particle Burst Effect (simulation)
 *
 * Creates small copies that scatter outward
 * Note: This is complex in FFmpeg; simplified version
 *
 * @param {number} startTime - When burst happens
 * @param {number} duration - Burst duration
 * @returns {string} FFmpeg filter
 */
export function particleBurst(startTime, duration = 0.5) {
  // Simple version: rapid scale up with fade
  return `${zoomIn(startTime, duration, 0.8, 1.2)},${fadeInOut(startTime, duration, 0.1, 0.2)}`;
}

/**
 * Combine Multiple Effects
 *
 * @param {Array<string>} effects - Array of filter strings
 * @returns {string} Combined filter
 */
export function combineEffects(...effects) {
  return effects.filter(Boolean).join(',');
}

/**
 * Pre-built Effect Combinations
 */
export const EFFECT_PRESETS = {
  // Text swoops in from right with fade
  swoopInRight: (startTime, x, y) => {
    const slideEffect = slideIn('right', startTime, 0.5, x, y);
    return {
      filter: slideEffect.filter,
      overlayExpression: slideEffect.overlayExpression
    };
  },

  // Text fades in with gentle zoom
  fadeZoomIn: (startTime, duration = 3.0) => {
    return combineEffects(
      fadeInOut(startTime, duration, 0.3, 0.3),
      zoomIn(startTime, 0.5, 0.95, 1.0)
    );
  },

  // Text bounces in with energy
  energyBounce: (startTime) => {
    return combineEffects(
      scaleBounce(startTime, 0.6),
      fadeInOut(startTime, 0.6, 0.1, 0)
    );
  },

  // Breathing glow (loopable)
  breathingGlow: () => {
    return glowPulse(0.5, 0.3);
  },

  // Quick impact (for headlines)
  impact: (startTime) => {
    return combineEffects(
      scaleBounce(startTime, 0.3),
      fadeInOut(startTime, 0.3, 0.05, 0)
    );
  }
};

/**
 * Build overlay filter with timing
 *
 * @param {number} layerIndex - Which overlay layer (1-indexed)
 * @param {number} startTime - When overlay appears
 * @param {number} endTime - When overlay disappears
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} effects - Effect filter string
 * @returns {Object} { fadeFilter, overlayFilter }
 */
export function buildOverlayFilter(layerIndex, startTime, endTime, x, y, effects = '') {
  const duration = endTime - startTime;

  // Build fade filter for this layer
  const fadeFilter = effects || fadeInOut(startTime, duration);

  // Build overlay expression with timing
  const overlayFilter = `overlay=x=${x}:y=${y}:enable='between(t,${startTime},${endTime})'`;

  return {
    fadeFilter: `[${layerIndex}:v]${fadeFilter}[text${layerIndex - 1}]`,
    overlayFilter: `[v${layerIndex - 1}][text${layerIndex - 1}]${overlayFilter}[v${layerIndex}]`
  };
}

export default {
  fadeInOut,
  slideIn,
  zoomIn,
  glowPulse,
  metallicShimmer,
  typewriterReveal,
  scaleBounce,
  particleBurst,
  combineEffects,
  EFFECT_PRESETS,
  buildOverlayFilter
};
