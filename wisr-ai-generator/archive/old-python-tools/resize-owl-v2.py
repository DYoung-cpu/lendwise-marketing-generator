from PIL import Image

# Load the original logo
img = Image.open('lendwise-logo.png').convert('RGBA')

print(f"Original image size: {img.size}")

# Get the bounding box of non-transparent pixels
bbox = img.getbbox()
print(f"Content bounding box: {bbox}")

# For this approach, let's try to identify the owl vs text by analyzing the image
# The owl should be on the left side, text on the right

# Let's try a manual approach:
# 1. The owl appears to be roughly in the left 35% of the image
# 2. We'll crop it out, resize it, then composite back

width, height = img.size

# Estimate owl region (left portion, roughly 350-400px wide)
owl_region_width = 400
owl_crop = img.crop((0, 0, owl_region_width, height))

# Resize owl to 70% of original
new_owl_width = int(owl_region_width * 0.7)
new_owl_height = int(height * 0.7)
owl_resized = owl_crop.resize((new_owl_width, new_owl_height), Image.Resampling.LANCZOS)

# Get text region (everything after the owl)
text_crop = img.crop((owl_region_width, 0, width, height))

# Create new image with transparent background
# New width = resized owl + text width + padding
padding = 30
new_width = new_owl_width + (width - owl_region_width) + padding
new_img = Image.new('RGBA', (new_width, height), (0, 0, 0, 0))

# Center the owl vertically
owl_y = (height - new_owl_height) // 2

# Paste the resized owl
new_img.paste(owl_resized, (0, owl_y), owl_resized)

# Paste the text to the right of the owl
text_x = new_owl_width + padding
new_img.paste(text_crop, (text_x, 0), text_crop)

# Trim the transparent edges
final_bbox = new_img.getbbox()
if final_bbox:
    new_img = new_img.crop(final_bbox)

# Save
new_img.save('lendwise-logo-resized.png', 'PNG')
print(f"\nSaved as 'lendwise-logo-resized.png'")
print(f"New dimensions: {new_img.size}")
