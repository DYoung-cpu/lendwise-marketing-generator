from PIL import Image
import numpy as np

# Load the image
img = Image.open('/mnt/c/Users/dyoun/Downloads/Generated Image October 16, 2025 - 6_43AM.png')

# Convert to RGBA if not already
img = img.convert('RGBA')

# Get image data as numpy array
data = np.array(img)

# Create a mask for dark pixels (background)
# Dark pixels have low RGB values (all channels < threshold)
r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]

# Calculate brightness - if all RGB values are below 100, it's background
# Keep pixels that are bright enough (the gold text)
brightness = (r.astype(int) + g.astype(int) + b.astype(int)) / 3
threshold = 80

# Make dark pixels transparent
data[:,:,3] = np.where(brightness < threshold, 0, a)

# Create new image
result = Image.fromarray(data, 'RGBA')

# Save with transparency
result.save('/mnt/c/Users/dyoun/Active Projects/LendWise-Onboarding/frontend/public/lendwise-logo-transparent.png', 'PNG')

print("Logo processed successfully! Saved as lendwise-logo-transparent.png")
print(f"Original size: {img.size}")
print(f"Processed size: {result.size}")
