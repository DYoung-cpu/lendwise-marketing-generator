#!/usr/bin/env python3
"""
Compose LendWise logo above text with precise placement
"""

from PIL import Image
import os

def extract_owl_from_logo(logo_path):
    """Extract just the owl portion from the full logo"""
    logo = Image.open(logo_path)

    # The owl is on the left side of the image
    # Let's crop to just the owl (approximately left 30% of image)
    width, height = logo.size

    # Crop the owl portion (adjust as needed)
    owl_width = int(width * 0.35)  # Owl takes about 35% of width
    owl = logo.crop((0, 0, owl_width, height))

    return owl

def compose_logo_with_text(text_image_path, logo_path, output_path):
    """
    Compose logo above text, centered

    Args:
        text_image_path: Path to the smoothed text image
        logo_path: Path to the LendWise logo
        output_path: Where to save the final composition
    """
    # Load images
    text_img = Image.open(text_image_path)

    # Extract just the owl from the logo
    owl = extract_owl_from_logo(logo_path)

    # Resize owl to appropriate size relative to text
    text_width, text_height = text_img.size

    # Make owl about 25% of the text width
    owl_target_width = int(text_width * 0.25)
    aspect_ratio = owl.size[1] / owl.size[0]
    owl_target_height = int(owl_target_width * aspect_ratio)

    owl_resized = owl.resize((owl_target_width, owl_target_height), Image.Resampling.LANCZOS)

    print(f"Text image size: {text_width}x{text_height}")
    print(f"Owl size: {owl_resized.size[0]}x{owl_resized.size[1]}")

    # Create new canvas with space for logo above text
    spacing = int(text_height * 0.1)  # 10% spacing between logo and text
    canvas_height = owl_resized.size[1] + spacing + text_height
    canvas_width = text_width

    # Create canvas (transparent or match background)
    # Check if text image has transparency
    if text_img.mode == 'RGBA':
        canvas = Image.new('RGBA', (canvas_width, canvas_height), (0, 0, 0, 0))
    else:
        canvas = Image.new('RGB', (canvas_width, canvas_height), (255, 255, 255))

    # Calculate positions
    # Center owl horizontally
    owl_x = (canvas_width - owl_resized.size[0]) // 2
    owl_y = 0

    # Place text below owl
    text_x = 0
    text_y = owl_resized.size[1] + spacing

    print(f"Canvas size: {canvas_width}x{canvas_height}")
    print(f"Owl position: ({owl_x}, {owl_y})")
    print(f"Text position: ({text_x}, {text_y})")

    # Composite images
    if owl_resized.mode == 'RGBA':
        canvas.paste(owl_resized, (owl_x, owl_y), owl_resized)
    else:
        canvas.paste(owl_resized, (owl_x, owl_y))

    if text_img.mode == 'RGBA':
        canvas.paste(text_img, (text_x, text_y), text_img)
    else:
        canvas.paste(text_img, (text_x, text_y))

    # Save result
    canvas.save(output_path, 'PNG', optimize=True)
    print(f"✓ Saved composition to: {output_path}")

    return canvas

def main():
    base_dir = "/mnt/c/Users/dyoun"

    # Paths
    text_image = os.path.join(base_dir, "Downloads/lendwise-smooth-light-bg.png")
    logo_image = os.path.join(base_dir, "Active Projects/wisr-ai-generator/lendwise-owl-logo.png")
    output = os.path.join(base_dir, "Downloads/lendwise-logo-with-text.png")

    print("="*60)
    print("Composing LendWise Logo + Text")
    print("="*60)

    compose_logo_with_text(text_image, logo_image, output)

    print("\n" + "="*60)
    print("✓ Composition complete!")
    print("="*60)

if __name__ == "__main__":
    main()
