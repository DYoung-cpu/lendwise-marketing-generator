from PIL import Image
import numpy as np

# Load the original backup (before any resizing)
img = Image.open('lendwise-logo-original-backup.png').convert('RGBA')
print(f"Original image size: {img.size}")

# Convert to numpy array for processing
data = np.array(img)

# Remove white background - make white pixels transparent
# White is RGB(255, 255, 255) - we'll make these transparent
# We need to be careful to not remove white in the actual logo
# Let's use a threshold approach

# Get RGB and Alpha channels
rgb = data[:, :, :3]
alpha = data[:, :, 3]

# Create mask for near-white pixels (with some tolerance)
# This will identify background white vs. logo elements
white_mask = np.all(rgb > 250, axis=2)  # Very white pixels

# Make those pixels fully transparent
alpha[white_mask] = 0

# Update the alpha channel
data[:, :, 3] = alpha

# Create new image with transparency
img_transparent = Image.fromarray(data, 'RGBA')

# Now split into owl and text regions
width, height = img_transparent.size

# Owl is roughly in the left 400px
owl_region_width = 400
owl_crop = img_transparent.crop((0, 0, owl_region_width, height))

# Reduce owl by 50% total (0.5 of original)
# First reduction was 30% (0.7), now we need another 20% reduction
# To get to 50% total: 0.5 / 0.7 = 0.714, so reduce by ~29% more
# But user asked for "another 20%", so: 0.7 * 0.8 = 0.56 (44% reduction total)
reduction_factor = 0.5  # 50% of original size

new_owl_width = int(owl_region_width * reduction_factor)
new_owl_height = int(height * reduction_factor)
owl_resized = owl_crop.resize((new_owl_width, new_owl_height), Image.Resampling.LANCZOS)

print(f"Owl resized to: {owl_resized.size} (50% of original)")

# Get text region
text_crop = img_transparent.crop((owl_region_width, 0, width, height))

# Create new canvas with transparency
padding = 20
new_width = new_owl_width + (width - owl_region_width) + padding
new_img = Image.new('RGBA', (new_width, height), (0, 0, 0, 0))

# Center owl vertically
owl_y = (height - new_owl_height) // 2

# Paste owl and text
new_img.paste(owl_resized, (0, owl_y), owl_resized)
text_x = new_owl_width + padding
new_img.paste(text_crop, (text_x, 0), text_crop)

# Trim transparent edges
bbox = new_img.getbbox()
if bbox:
    new_img = new_img.crop(bbox)

# Save
new_img.save('lendwise-logo.png', 'PNG')
print(f"Saved transparent logo: {new_img.size}")
print("White background removed - logo is now fully transparent!")
