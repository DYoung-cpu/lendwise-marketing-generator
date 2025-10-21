from PIL import Image
import numpy as np

# Load the original backup
img = Image.open('lendwise-logo-original-backup.png').convert('RGBA')
print(f"Original size: {img.size}")

# Convert to numpy for processing
data = np.array(img)

# Remove white/light gray background
# Any pixel that's very light (close to white) should be made transparent
rgb = data[:, :, :3]
alpha = data[:, :, 3]

# Calculate brightness for each pixel
brightness = np.mean(rgb, axis=2)

# Make bright pixels (>240) transparent - these are the background
# But keep pixels that have color variation (actual logo elements)
background_mask = brightness > 240

# Set alpha to 0 for background pixels
alpha[background_mask] = 0
data[:, :, 3] = alpha

img_clean = Image.fromarray(data, mode='RGBA')

# Now we need to make owl MUCH smaller
# Looking at your screenshot, the owl should be maybe 25-30% of the text height
# Let's go very aggressive: reduce owl to 30% of original size

width, height = img_clean.size

# Owl region is left ~400px
owl_width = 400
owl_section = img_clean.crop((0, 0, owl_width, height))
text_section = img_clean.crop((owl_width, 0, width, height))

# Make owl VERY small - 30% of original
owl_scale = 0.3
new_owl_w = int(owl_width * owl_scale)
new_owl_h = int(height * owl_scale)

owl_tiny = owl_section.resize((new_owl_w, new_owl_h), Image.Resampling.LANCZOS)
print(f"Tiny owl size: {owl_tiny.size}")

# Get text bounding box to trim it
text_bbox = text_section.getbbox()
if text_bbox:
    text_trimmed = text_section.crop(text_bbox)
else:
    text_trimmed = text_section

# Create final image - fit owl and text together
text_w, text_h = text_trimmed.size
padding = 15

# Final canvas height should match text height
final_height = text_h
final_width = new_owl_w + text_w + padding

# Create transparent canvas
final_img = Image.new('RGBA', (final_width, final_height), (0, 0, 0, 0))

# Center owl vertically next to text
owl_y = (final_height - new_owl_h) // 2

# Paste owl and text
final_img.paste(owl_tiny, (0, owl_y), owl_tiny)
final_img.paste(text_trimmed, (new_owl_w + padding, 0), text_trimmed)

# Trim any extra transparent space
bbox = final_img.getbbox()
if bbox:
    final_img = final_img.crop(bbox)

# Save
final_img.save('lendwise-logo.png', 'PNG')
print(f"Final logo size: {final_img.size}")
print("✅ Owl is now MUCH smaller (30% of original)")
print("✅ Background is truly transparent")
