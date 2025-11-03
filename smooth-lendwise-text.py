#!/usr/bin/env python3
"""
Smooth and enhance pixelated images using advanced image processing
"""

from PIL import Image, ImageFilter, ImageEnhance
import os

def smooth_image(input_path, output_path, scale_factor=2):
    """
    Apply smoothing and anti-aliasing to an image

    Args:
        input_path: Path to input image
        output_path: Path to save smoothed image
        scale_factor: How much to upscale (2x, 3x, etc.)
    """
    # Open the image
    img = Image.open(input_path)

    # Get original size
    original_size = img.size
    new_size = (original_size[0] * scale_factor, original_size[1] * scale_factor)

    print(f"Original size: {original_size}")
    print(f"Upscaling to: {new_size}")

    # Upscale using LANCZOS (best quality resampling)
    img_upscaled = img.resize(new_size, Image.Resampling.LANCZOS)

    # Apply smoothing filter
    img_smooth = img_upscaled.filter(ImageFilter.SMOOTH_MORE)

    # Apply slight sharpening to compensate for blur
    img_sharp = img_smooth.filter(ImageFilter.UnsharpMask(radius=1, percent=100, threshold=3))

    # Enhance edges slightly
    enhancer = ImageEnhance.Sharpness(img_sharp)
    img_enhanced = enhancer.enhance(1.2)

    # Save at high quality
    img_enhanced.save(output_path, 'PNG', optimize=True)
    print(f"✓ Saved smoothed image to: {output_path}")

    return img_enhanced

def main():
    base_dir = "/mnt/c/Users/dyoun/Downloads"

    # Process both images
    images = [
        ("Generated Image October 30, 2025 - 10_12PM (1).png", "lendwise-smooth-light-bg.png"),
        ("Generated Image October 30, 2025 - 10_22PM.png", "lendwise-smooth-dark-bg.png"),
        ("pixilated.png", "lendwise-smooth-pixelated-fix.png")
    ]

    for input_file, output_file in images:
        input_path = os.path.join(base_dir, input_file)
        output_path = os.path.join(base_dir, output_file)

        if os.path.exists(input_path):
            print(f"\n{'='*60}")
            print(f"Processing: {input_file}")
            print(f"{'='*60}")
            smooth_image(input_path, output_path, scale_factor=2)
        else:
            print(f"⚠ File not found: {input_path}")

    print("\n" + "="*60)
    print("✓ All images processed successfully!")
    print("="*60)

if __name__ == "__main__":
    main()
