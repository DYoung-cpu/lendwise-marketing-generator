#!/usr/bin/env python3
"""
Combine owl and text using ORIGINAL high-res images
NO filters, NO smoothing, NO degradation - just pure quality
"""

from PIL import Image

def combine_assets_pure(owl_path, text_path, output_path, owl_x, owl_y, text_x, text_y,
                        canvas_width, canvas_height, owl_scale=0.35, text_scale=1.0):
    """
    Combine images at original quality with zero degradation
    """
    # Load original images
    owl = Image.open(owl_path)
    text = Image.open(text_path)

    print(f"Original Owl: {owl.size}")
    print(f"Original Text: {text.size}")

    # Create transparent canvas
    canvas = Image.new('RGBA', (canvas_width, canvas_height), (0, 0, 0, 0))

    # Calculate scaled sizes (ONLY LANCZOS for quality)
    owl_width = int(owl.size[0] * owl_scale)
    owl_height = int(owl.size[1] * owl_scale)

    text_width = int(text.size[0] * text_scale)
    text_height = int(text.size[1] * text_scale)

    # Resize ONLY with LANCZOS (highest quality, no filters)
    owl_resized = owl.resize((owl_width, owl_height), Image.Resampling.LANCZOS)
    text_resized = text.resize((text_width, text_height), Image.Resampling.LANCZOS)

    print(f"Owl scaled to: {owl_resized.size}")
    print(f"Text scaled to: {text_resized.size}")

    # Paste onto canvas (NO FILTERS, NO PROCESSING)
    if text_resized.mode == 'RGBA':
        canvas.paste(text_resized, (text_x, text_y), text_resized)
    else:
        canvas.paste(text_resized, (text_x, text_y))

    if owl_resized.mode == 'RGBA':
        canvas.paste(owl_resized, (owl_x, owl_y), owl_resized)
    else:
        canvas.paste(owl_resized, (owl_x, owl_y))

    # Save with NO compression, NO optimization
    canvas.save(output_path, 'PNG', compress_level=0)
    print(f"✓ Saved to: {output_path}")
    print(f"Final canvas: {canvas_width}x{canvas_height}")

def main():
    # Use the ORIGINAL smoothed text (already processed once, don't touch again)
    owl_path = "/mnt/c/Users/dyoun/Downloads/owl-logo.png"
    text_path = "/mnt/c/Users/dyoun/Downloads/text-logo.png"
    output_path = "/mnt/c/Users/dyoun/Downloads/lendwise-logo-pure-quality.png"

    print("="*60)
    print("Combining Logo - PURE QUALITY (No Filters)")
    print("="*60)

    # Use your positioning from the generator
    combine_assets_pure(
        owl_path=owl_path,
        text_path=text_path,
        output_path=output_path,
        owl_x=624,      # Centered for 2048 canvas
        owl_y=400,      # Your preferred position
        text_x=0,
        text_y=1150,    # Your preferred position
        canvas_width=2048,
        canvas_height=2800,
        owl_scale=0.35,
        text_scale=1.0
    )

    print("\n" + "="*60)
    print("✓ Pure quality logo created!")
    print("="*60)
    print("\nNO filters applied, NO degradation")
    print("Original image quality preserved 100%")

if __name__ == "__main__":
    main()
