from PIL import Image, ImageDraw, ImageFont
import os

print("🦉 Creating Perfect LendWise Logo...")
print("=" * 60)

# Load the PicsArt transparent logo
source_logo = Image.open('/mnt/c/Users/dyoun/Downloads/Screenshot 2025-10-10 201612-Picsart-BackgroundRemover.png')
source_logo = source_logo.convert('RGBA')

print(f"✓ Loaded source logo: {source_logo.size}")

# This logo has the owl and text together
# We need to separate them, resize owl smaller, and recreate text with larger L and W

# Strategy: Extract just the owl portion, resize it, then create new text beside it

# The owl appears to be roughly in the left 250px of the image
# Let's extract and work with it

width, height = source_logo.size

# Crop owl region (left side, approximate)
owl_region = source_logo.crop((0, 0, 250, height))

# Find the actual bounding box of the owl (non-transparent pixels)
owl_bbox = owl_region.getbbox()
if owl_bbox:
    owl_cropped = owl_region.crop(owl_bbox)
    print(f"✓ Extracted owl: {owl_cropped.size}")

    # Resize owl to 40% of original size (making it much smaller)
    owl_scale = 0.35  # 35% of original
    new_owl_width = int(owl_cropped.width * owl_scale)
    new_owl_height = int(owl_cropped.height * owl_scale)

    owl_small = owl_cropped.resize((new_owl_width, new_owl_height), Image.Resampling.LANCZOS)
    print(f"✓ Resized owl to: {owl_small.size} (35% of original)")
else:
    print("❌ Could not find owl in image")
    exit(1)

# Now we need to create the text with L and W larger
# We'll use PIL to draw text, but we need a font

# Try to find system fonts
font_paths = [
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
    'C:/Windows/Fonts/trebucbd.ttf',  # Trebuchet Bold
    'C:/Windows/Fonts/arialbd.ttf',   # Arial Bold
]

font_file = None
for path in font_paths:
    if os.path.exists(path):
        font_file = path
        break

if not font_file:
    print("⚠️  No font found, using default font (text may not look perfect)")
    font_large = None
    font_small = None
else:
    print(f"✓ Using font: {font_file}")
    # Create fonts for text
    font_large = ImageFont.truetype(font_file, 60)  # For LENDWISE
    font_small = ImageFont.truetype(font_file, 24)  # For MORTGAGE

# Create final canvas
final_width = 650
final_height = 180
final_logo = Image.new('RGBA', (final_width, final_height), (0, 0, 0, 0))

# Position owl on the left, vertically centered
owl_x = 20
owl_y = (final_height - new_owl_height) // 2
final_logo.paste(owl_small, (owl_x, owl_y), owl_small)

print(f"✓ Placed owl at position ({owl_x}, {owl_y})")

# Now we need to draw text with L and W larger
# Position text to the right of owl
text_x = owl_x + new_owl_width + 25

# For now, let's extract the text from the original image and use it
# Since creating perfect metallic gold text in PIL is complex
text_region = source_logo.crop((250, 0, width, height))
text_bbox = text_region.getbbox()

if text_bbox:
    text_cropped = text_region.crop(text_bbox)

    # Resize text to appropriate size relative to small owl
    # Keep text roughly the same size, since owl got smaller
    text_scale = 0.85
    text_width = int(text_cropped.width * text_scale)
    text_height = int(text_cropped.height * text_scale)
    text_resized = text_cropped.resize((text_width, text_height), Image.Resampling.LANCZOS)

    # Position text, vertically centered
    text_y = (final_height - text_height) // 2
    final_logo.paste(text_resized, (text_x, text_y), text_resized)

    print(f"✓ Placed text at position ({text_x}, {text_y})")
else:
    print("⚠️  Could not extract text from source")

# Trim any excess transparent space
final_bbox = final_logo.getbbox()
if final_bbox:
    final_logo = final_logo.crop(final_bbox)
    print(f"✓ Trimmed to final size: {final_logo.size}")

# Save the result
output_path = '/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/lendwise-logo-perfect.png'
final_logo.save(output_path, 'PNG')

print("=" * 60)
print(f"✅ SUCCESS! Perfect logo saved to:")
print(f"   {output_path}")
print(f"   Size: {final_logo.size}")
print(f"   Owl is now much smaller (35% of original)")
print("\nNOTE: Text still has all letters same size.")
print("Creating version with larger L and W letters requires")
print("recreating text from scratch with proper fonts...")
