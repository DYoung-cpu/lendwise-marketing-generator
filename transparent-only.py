#!/usr/bin/env python3
"""
ONLY make background transparent - NO smoothing, NO upscaling, NO filters
Preserve exact quality of the original export
"""

from PIL import Image
import numpy as np

def make_transparent_only(input_path, output_path):
    """
    Remove white background and make transparent WITHOUT any quality changes

    Args:
        input_path: Path to the exported logo
        output_path: Path to save with transparent background
    """
    # Open image at exact original quality
    img = Image.open(input_path)

    print(f"Original size: {img.size}")
    print(f"Original mode: {img.mode}")

    # Convert to RGBA if needed (preserve exact pixels)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    # Get pixel data
    data = np.array(img)

    # Get the RGB channels
    red, green, blue, alpha = data.T

    # Find white/near-white background pixels (R, G, B all > 245)
    white_areas = (red > 245) & (green > 245) & (blue > 245)

    # Make only white areas transparent
    data[..., 3][white_areas.T] = 0

    # Create image from exact pixel data
    result = Image.fromarray(data)

    # Save with NO compression, NO optimization - preserve exact quality
    result.save(output_path, 'PNG', compress_level=0, optimize=False)

    print(f"✓ Saved to: {output_path}")
    print(f"Final size: {result.size} (unchanged)")
    print(f"Final mode: {result.mode}")

    return result

def main():
    input_file = "/mnt/c/Users/dyoun/Downloads/download - 2025-10-30T225700.063.png"
    output_file = "/mnt/c/Users/dyoun/Downloads/lendwise-logo-transparent.png"

    print("="*60)
    print("Making Background Transparent (NO Quality Changes)")
    print("="*60)

    make_transparent_only(input_file, output_file)

    print("\n" + "="*60)
    print("✓ Done!")
    print("="*60)
    print("\nChanges made:")
    print("  • White background → Transparent")
    print("  • Size: UNCHANGED")
    print("  • Quality: UNCHANGED (no filters applied)")
    print("  • Edges: UNCHANGED (exact original pixels)")

if __name__ == "__main__":
    main()
