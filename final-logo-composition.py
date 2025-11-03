#!/usr/bin/env python3
"""
Create final logo composition at full resolution without any scaling
"""

from PIL import Image
import os

def create_final_composition(owl_path, text_path, output_path):
    """
    Composite owl and text at full resolution
    """
    # Load images at full resolution
    owl = Image.open(owl_path)
    text = Image.open(text_path)

    print(f"Owl size: {owl.size}")
    print(f"Text size: {text.size}")

    # Get dimensions
    text_width, text_height = text.size

    # Resize owl to be proportional to text (about 30% of text width)
    owl_target_width = int(text_width * 0.35)
    aspect_ratio = owl.size[1] / owl.size[0]
    owl_target_height = int(owl_target_width * aspect_ratio)

    owl_resized = owl.resize((owl_target_width, owl_target_height), Image.Resampling.LANCZOS)
    print(f"Owl resized to: {owl_resized.size}")

    # No spacing - owl perched directly above text
    spacing = 0

    # Create canvas
    canvas_width = text_width
    canvas_height = owl_resized.size[1] + spacing + text_height

    # Create transparent canvas
    canvas = Image.new('RGBA', (canvas_width, canvas_height), (0, 0, 0, 0))

    # Calculate positions
    owl_x = (canvas_width - owl_resized.size[0]) // 2
    owl_y = 0

    text_x = 0
    text_y = owl_resized.size[1] + spacing

    print(f"Canvas size: {canvas.size}")
    print(f"Owl position: ({owl_x}, {owl_y})")
    print(f"Text position: ({text_x}, {text_y})")

    # Composite
    if owl_resized.mode == 'RGBA':
        canvas.paste(owl_resized, (owl_x, owl_y), owl_resized)
    else:
        owl_rgba = owl_resized.convert('RGBA')
        canvas.paste(owl_rgba, (owl_x, owl_y), owl_rgba)

    if text.mode == 'RGBA':
        canvas.paste(text, (text_x, text_y), text)
    else:
        text_rgba = text.convert('RGBA')
        canvas.paste(text_rgba, (text_x, text_y), text_rgba)

    # Save at maximum quality
    canvas.save(output_path, 'PNG', optimize=False, compress_level=0)
    print(f"✓ Saved high-resolution composition to: {output_path}")

    return canvas

def main():
    base_dir = "/mnt/c/Users/dyoun/Downloads"

    owl_path = os.path.join(base_dir, "owl-logo.png")
    text_path = os.path.join(base_dir, "text-logo.png")
    output_path = os.path.join(base_dir, "lendwise-logo-highres.png")

    print("="*60)
    print("Creating High-Resolution LendWise Logo Composition")
    print("="*60)

    create_final_composition(owl_path, text_path, output_path)

    print("\n" + "="*60)
    print("✓ High-resolution composition complete!")
    print("="*60)

if __name__ == "__main__":
    main()
