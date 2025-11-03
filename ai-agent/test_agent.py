"""
Test the Marketing Agent with Real Gemini Flash Image Generation
"""

import os
from marketing_agent import MarketingAgent

# Your API key
API_KEY = "AIzaSyD7cwQ3dv2BScr9y0GM4lk0sYaVV0Uw1Os"

# Create the agent
print("="*60)
print("INITIALIZING MARKETING AGENT")
print("="*60)

agent = MarketingAgent(gemini_api_key=API_KEY)

# Test 1: Simple text generation
print("\n\nTEST 1: Generate simple marketing image")
print("-"*60)

result = agent.generate(
    task="Generate a mortgage rates marketing image",
    expected_text="CURRENT MORTGAGE RATES",
    max_attempts=3
)

print("\n" + "="*60)
print("RESULTS")
print("="*60)
print(f"Success: {result['success']}")
print(f"Attempts used: {result['attempts']}")
print(f"Image saved to: {result['image_path']}")
print(f"Verification: {result['verification']}")
print(f"\nAgent learning notes: {result['learning_notes']}")
print(f"Current success rate: {result['current_success_rate']:.1f}%")

# Show agent stats
stats = agent.get_stats()
print("\n" + "="*60)
print("AGENT PERFORMANCE STATISTICS")
print("="*60)
print(f"Overall success rate: {stats['success_rate']:.1f}%")
print(f"Total attempts: {stats['total_attempts']}")
print(f"Total successes: {stats['total_successes']}")
print(f"Common mistakes: {stats['common_mistakes']}")
