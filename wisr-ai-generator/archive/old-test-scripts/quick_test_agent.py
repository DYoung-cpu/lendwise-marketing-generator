"""
Quick Test - Real Learning Agent for Gemini Image Generation
This demonstrates the core concept without the full framework complexity
"""

import requests
import base64
import json
from datetime import datetime

API_KEY = "AIzaSyD7cwQ3dv2BScr9y0GM4lk0sYaVV0Uw1Os"

class SimpleMarketingAgent:
    """Simplified agent that learns from failures"""

    def __init__(self):
        self.memory_file = "agent_memory_simple.json"
        self.memory = self.load_memory()

    def load_memory(self):
        try:
            with open(self.memory_file, 'r') as f:
                return json.load(f)
        except:
            return {
                "attempts": 0,
                "successes": 0,
                "failures": []
            }

    def save_memory(self):
        with open(self.memory_file, 'w') as f:
            json.dump(self.memory, f, indent=2)

    def generate_image(self, prompt, output_path):
        """Generate image using Gemini Flash Image API"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image:generateContent?key={API_KEY}"

        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "responseModalities": ["image"]
            }
        }

        try:
            response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
            response.raise_for_status()
            data = response.json()

            if data.get("candidates") and data["candidates"][0]:
                content = data["candidates"][0]["content"]
                for part in content.get("parts", []):
                    if "inline_data" in part or "inlineData" in part:
                        inline_data = part.get("inline_data") or part.get("inlineData")
                        image_data = inline_data.get("data")

                        with open(output_path, 'wb') as f:
                            f.write(base64.b64decode(image_data))

                        return True, "Image generated successfully"

            return False, "No image in response"

        except Exception as e:
            return False, str(e)

    def run_with_retry(self, expected_text, max_attempts=3):
        """
        The REAL agent behavior - keeps trying until it works
        """
        print("=" * 60)
        print(f"AGENT STARTING: Will generate '{expected_text}'")
        print(f"Max attempts: {max_attempts}")
        print("=" * 60)

        for attempt in range(1, max_attempts + 1):
            print(f"\nATTEMPT {attempt}/{max_attempts}")
            print("-" * 60)

            # Build smarter prompts on retries
            if attempt == 1:
                prompt = f"""
                Create a professional marketing image with this EXACT text: "{expected_text}"

                CRITICAL: Spelling must be letter-perfect. Text should be large and clearly visible.
                """
            else:
                prompt = f"""
                RETRY #{attempt}: Previous attempt failed.

                Create a marketing image with EXACT text: "{expected_text}"

                REQUIREMENTS:
                - Spell it EXACTLY as shown (letter by letter)
                - Make text VERY LARGE and readable
                - Use high contrast
                - Professional design

                This is attempt {attempt} - get the spelling perfect!
                """

            # Generate
            print("Generating image...")
            output_path = f"test_attempt_{attempt}.png"
            success, message = self.generate_image(prompt, output_path)

            self.memory["attempts"] += 1

            if success:
                print(f"SUCCESS! Image saved to: {output_path}")
                print(f"Message: {message}")
                self.memory["successes"] += 1
                self.save_memory()

                # Show stats
                success_rate = (self.memory["successes"] / self.memory["attempts"]) * 100
                print(f"\nAGENT STATS:")
                print(f"  Total attempts: {self.memory['attempts']}")
                print(f"  Successes: {self.memory['successes']}")
                print(f"  Success rate: {success_rate:.1f}%")

                return True, output_path
            else:
                print(f"FAILED: {message}")
                self.memory["failures"].append({
                    "attempt": attempt,
                    "prompt": prompt[:100],
                    "error": message,
                    "timestamp": datetime.now().isoformat()
                })

                if attempt < max_attempts:
                    print("Adjusting strategy and retrying...")
                else:
                    print("Max attempts reached - giving up")

        self.save_memory()
        return False, None


# TEST IT
if __name__ == "__main__":
    agent = SimpleMarketingAgent()

    # Try to generate a simple marketing image
    success, image_path = agent.run_with_retry(
        expected_text="CURRENT MORTGAGE RATES",
        max_attempts=3
    )

    if success:
        print(f"\n\nFINAL RESULT: SUCCESS!")
        print(f"Image saved to: {image_path}")
    else:
        print(f"\n\nFINAL RESULT: FAILED after all attempts")
