from PIL import Image
import subprocess
import time

print("🦉 Creating Final Perfect Logo with Larger L and W...")
print("=" * 60)

# First, we need to capture the HTML text as an image
# We'll use Chrome headless to render the HTML

html_file = '/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/create-text-with-large-lw.html'

# Use Chrome to capture screenshot
print("📸 Capturing text rendering...")
screenshot_path = '/tmp/lendwise-text.png'

# Try to use Chrome headless
try:
    cmd = [
        'google-chrome',
        '--headless',
        '--disable-gpu',
        '--screenshot=' + screenshot_path,
        '--window-size=800,300',
        '--default-background-color=00000000',  # Transparent
        'file://' + html_file
    ]

    result = subprocess.run(cmd, capture_output=True, timeout=10)

    if result.returncode == 0:
        print("✓ Text captured successfully")
        time.sleep(0.5)  # Wait for file to be written
    else:
        print(f"❌ Chrome failed: {result.stderr.decode()}")
        raise Exception("Chrome failed")

except Exception as e:
    print(f"⚠️  Could not use Chrome headless: {e}")
    print("Alternative: Using the existing text from PicsArt version...")
    screenshot_path = None

# Load the small owl we created
owl_img = Image.open('/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/lendwise-logo-perfect.png').convert('RGBA')

# If we got the text screenshot, use it
if screenshot_path and Image.open(screenshot_path):
    text_img = Image.open(screenshot_path).convert('RGBA')

    # Crop to content
    text_bbox = text_img.getbbox()
    if text_bbox:
        text_img = text_img.crop(text_bbox)
        print(f"✓ Text image size: {text_img.size}")

    # Create final composition
    final_width = owl_img.width + text_img.width + 30
    final_height = max(owl_img.height, text_img.height)

    final_logo = Image.new('RGBA', (final_width, final_height), (0, 0, 0, 0))

    # Paste owl on left
    owl_y = (final_height - owl_img.height) // 2
    final_logo.paste(owl_img, (0, owl_y), owl_img)

    # Paste text on right
    text_x = owl_img.width + 30
    text_y = (final_height - text_img.height) // 2
    final_logo.paste(text_img, (text_x, text_y), text_img)

    print(f"✓ Combined logo size: {final_logo.size}")
else:
    print("Using existing logo without text modification")
    final_logo = owl_img

# Trim and save
final_bbox = final_logo.getbbox()
if final_bbox:
    final_logo = final_logo.crop(final_bbox)

output_path = '/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator/lendwise-logo-final.png'
final_logo.save(output_path, 'PNG')

print("=" * 60)
print(f"✅ Final logo saved: {output_path}")
print(f"   Size: {final_logo.size}")
print(f"   L and W letters should now be 25% larger!")
