from PIL import Image
import numpy as np

# Load the original logo
img = Image.open('lendwise-logo.png')
img_array = np.array(img)

print(f"Original image size: {img.size}")
print(f"Image mode: {img.mode}")

# The logo is 992x1056
# We need to reduce the owl by 30% (make it 70% of current size)
# Current owl appears to be roughly the left 400px, text starts around x=450

# Strategy:
# 1. Crop the owl portion (left side)
# 2. Resize owl to 70% (reduce by 30%)
# 3. Crop the text portion (right side)
# 4. Recombine with owl centered vertically next to text

# First, let's identify where the owl ends and text begins
# Based on the image, owl is roughly x: 0-400, text is roughly x: 400-992

owl_section = img.crop((0, 0, 450, 1056))  # Left portion with owl
text_section = img.crop((450, 0, 992, 1056))  # Right portion with text

# Resize owl to 70% (reduce by 30%)
new_owl_width = int(450 * 0.7)
new_owl_height = int(1056 * 0.7)
owl_resized = owl_section.resize((new_owl_width, new_owl_height), Image.Resampling.LANCZOS)

print(f"Resized owl dimensions: {owl_resized.size}")

# Create new canvas
new_width = new_owl_width + (992 - 450) + 50  # owl + text + some spacing
new_height = 1056

# Create transparent background
new_img = Image.new('RGBA', (new_width, new_height), (0, 0, 0, 0))

# Calculate vertical centering for owl
owl_y_offset = (new_height - new_owl_height) // 2

# Paste resized owl on the left, vertically centered
new_img.paste(owl_resized, (20, owl_y_offset), owl_resized if owl_resized.mode == 'RGBA' else None)

# Paste text section to the right of owl
text_x_position = new_owl_width + 50
new_img.paste(text_section, (text_x_position, 0), text_section if text_section.mode == 'RGBA' else None)

# Save the new logo
new_img.save('lendwise-logo-resized.png', 'PNG')
print(f"\nNew logo saved as 'lendwise-logo-resized.png'")
print(f"New dimensions: {new_img.size}")
