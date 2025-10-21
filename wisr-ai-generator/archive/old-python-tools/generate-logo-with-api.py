import anthropic
import base64
import os
import json

# Initialize the client
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

prompt = """Create a logo image for "LendWise Mortgage" with these specifications:

ELEMENTS:
- A gold metallic owl with bright green glowing eyes (left side)
- Text "LENDWISE MORTGAGE" in metallic gold (right side)
  - "LENDWISE" in larger font (top line)
  - "MORTGAGE" in smaller font (bottom line)
  - Letters L and W should be slightly larger than other letters

LAYOUT:
- Owl on the LEFT, small size (about 25-30% of total logo height)
- Text on the RIGHT
- Owl vertically centered with the text
- Minimal spacing between owl and text
- Compact professional layout

STYLE:
- Metallic gold gradient on both owl and text (shiny, reflective)
- Owl should have depth and shading
- Green eyes should glow
- Professional, modern business logo aesthetic

CRITICAL:
- TRANSPARENT BACKGROUND (no white, no gray, no color)
- High quality, sharp edges
- The owl must be SMALL - roughly the same height as just the word "LENDWISE" (not the full logo)
- Output dimensions approximately 600x180 pixels

This is for professional stationery, business cards, and website use."""

print("Requesting logo generation from Claude API...")
print("This may take a moment...\n")

message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": prompt
        }
    ]
)

# Check if we got an image back
print("Response received!")
print(f"Response type: {message.content[0].type}")

if message.content[0].type == "image":
    # Extract image data
    image_data = message.content[0].source.data
    image_format = message.content[0].source.media_type

    print(f"Image format: {image_format}")

    # Decode and save
    image_bytes = base64.b64decode(image_data)

    with open('lendwise-logo-generated.png', 'wb') as f:
        f.write(image_bytes)

    print("✅ Logo saved as 'lendwise-logo-generated.png'")
    print(f"   File size: {len(image_bytes)} bytes")
else:
    print("❌ No image was generated. Response:")
    print(json.dumps(message.content, indent=2))
    print("\nNote: Claude API may not support direct image generation.")
    print("You'll need to use a different approach or ask Nano through the chat interface.")
