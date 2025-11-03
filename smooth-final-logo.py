#!/usr/bin/env python3
"""
Smooth the combined logo and ensure transparent background
"""

from PIL import Image, ImageFilter, ImageEnhance
import numpy as np

def make_background_transparent(img):
    """Remove white/light backgrounds and make them transparent"""
    img = img.convert('RGBA')
    data = np.array(img)

    # Get the RGB values
    red, green, blue, alpha = data.T

    # Find white/near-white areas (background)
    # Pixels where R, G, B are all > 240
    white_areas = (red > 240) & (green > 240) & (blue > 240)

    # Make white areas transparent
    data[..., 3][white_areas.T] = 0

    return Image.fromarray(data)

def smooth_logo(input_path, output_path, upscale_factor=2):
    """
    Smooth the logo and make background transparent

    Args:
        input_path: Path to the exported logo
        output_path: Path to save the smoothed logo
        upscale_factor: How much to upscale for smoothing (2x default)
    """
    # Open image
    img = Image.open(input_path)
    print(f"Original size: {img.size}")
    print(f"Original mode: {img.mode}")

    # Make background transparent
    img = make_background_transparent(img)
    print("✓ Background made transparent")

    # Get dimensions
    original_size = img.size
    new_size = (original_size[0] * upscale_factor, original_size[1] * upscale_factor)

    print(f"Upscaling to: {new_size}")

    # Upscale using LANCZOS (highest quality)
    img_upscaled = img.resize(new_size, Image.Resampling.LANCZOS)

    # Apply smoothing filter
    img_smooth = img_upscaled.filter(ImageFilter.SMOOTH_MORE)

    # Apply subtle sharpening to maintain crisp edges
    img_sharp = img_smooth.filter(ImageFilter.UnsharpMask(radius=2, percent=120, threshold=3))

    # Enhance sharpness slightly
    enhancer = ImageEnhance.Sharpness(img_sharp)
    img_enhanced = enhancer.enhance(1.3)

    # Save at maximum quality with transparency
    img_enhanced.save(output_path, 'PNG', optimize=False, compress_level=0)
    print(f"✓ Saved smoothed transparent logo to: {output_path}")
    print(f"Final size: {img_enhanced.size}")

    return img_enhanced

def main():
    input_file = "/mnt/c/Users/dyoun/Downloads/download - 2025-10-30T225700.063.png"
    output_file = "/mnt/c/Users/dyoun/Downloads/lendwise-logo-final-smooth.png"

    print("="*60)
    print("Smoothing LendWise Logo")
    print("="*60)

    smooth_logo(input_file, output_file, upscale_factor=2)

    print("\n" + "="*60)
    print("✓ Logo smoothing complete!")
    print("="*60)
    print("\nYour logo now has:")
    print("  • Transparent background (no white)")
    print("  • Smooth anti-aliased edges")
    print("  • 2x higher resolution")
    print("  • Ready to place on any background")

if __name__ == "__main__":
    main()
