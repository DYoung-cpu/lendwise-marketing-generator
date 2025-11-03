from PIL import Image

# Load the transparent logo
img = Image.open('/mnt/c/Users/dyoun/Active Projects/LendWise-Onboarding/frontend/public/lendwise-logo-transparent.png')

# Get dimensions
width, height = img.size
print(f"Original size: {width}x{height}")

# Crop out the right side where the star is (roughly last 150 pixels)
# We'll crop from left=0 to right=width-150
crop_box = (0, 0, width - 150, height)
cropped = img.crop(crop_box)

print(f"Cropped size: {cropped.size}")

# Save the cropped version
cropped.save('/mnt/c/Users/dyoun/Active Projects/LendWise-Onboarding/frontend/public/lendwise-logo-clean.png', 'PNG')

print("Logo cropped successfully! Saved as lendwise-logo-clean.png")
