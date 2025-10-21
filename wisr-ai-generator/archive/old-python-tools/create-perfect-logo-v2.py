from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

print("🦉 Creating Perfect LendWise Logo v2...")
print("=" * 60)

# Load the PicsArt transparent logo
source_logo = Image.open('/mnt/c/Users/dyoun/Downloads/Screenshot 2025-10-10 201612-Picsart-BackgroundRemover.png')
source_logo = source_logo.convert('RGBA')

print(f"✓ Loaded source logo: {source_logo.size}")

width, height = source_logo.size

# Extract owl - being more precise with boundaries
# Looking at the image, owl is roughly 0-230px
owl_region = source_logo.crop((0, 0, 230, height))
owl_bbox = owl_region.getbbox()

if owl_bbox:
    owl_cropped = owl_region.crop(owl_bbox)
    print(f"✓ Extracted owl: {owl_cropped.size}")

    # Resize owl to 30% of original (even smaller)
    owl_scale = 0.30
    new_owl_width = int(owl_cropped.width * owl_scale)
    new_owl_height = int(owl_cropped.height * owl_scale)

    owl_small = owl_cropped.resize((new_owl_width, new_owl_height), Image.Resampling.LANCZOS)
    print(f"✓ Resized owl to: {owl_small.size} (30% of original)")
else:
    print("❌ Could not find owl")
    exit(1)

# Extract text region - more precisely
text_region = source_logo.crop((300, 0, width, height))
text_bbox = text_region.getbbox()

if text_bbox:
    text_cropped = text_region.crop(text_bbox)
    print(f"✓ Extracted text: {text_cropped.size}")
else:
    print("❌ Could not extract text")
    exit(1)

# Create final canvas
final_width = 700
final_height = 140
final_logo = Image.new('RGBA', (final_width, final_height), (0, 0, 0, 0))

# Position small owl on left, vertically centered
owl_x = 10
owl_y = (final_height - new_owl_height) // 2
final_logo.paste(owl_small, (owl_x, owl_y), owl_small)

print(f"✓ Placed owl at ({owl_x}, {owl_y})")

# Position text to right of owl
text_x = owl_x + new_owl_width + 20
text_y = (final_height - text_cropped.height) // 2
final_logo.paste(text_cropped, (text_x, text_y), text_cropped)

print(f"✓ Placed text at ({text_x}, {text_y})")

# Trim excess transparent space
final_bbox = final_logo.getbbox()
if final_bbox:
    final_logo = final_logo.crop(final_bbox)
    print(f"✓ Trimmed to: {final_logo.size}")

# Save
output_path = '/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/lendwise-logo-perfect.png'
final_logo.save(output_path, 'PNG')

print("=" * 60)
print(f"✅ Logo saved: {output_path}")
print(f"   Size: {final_logo.size}")
print(f"   Owl: {owl_small.size}")
print()
print("⚠️  NOTE: L and W letters are still same size as other letters.")
print("   The original text has uniform letter sizes.")
print("   To make L and W larger, we need to:")
print("   1. Recreate text from scratch with custom fonts, OR")
print("   2. Use image editing software (Photoshop/GIMP/Canva)")
print()
print("Would you like me to:")
print("A) Try to recreate the metallic text with larger L/W using PIL")
print("B) Use this version and manually edit L/W in design software")
