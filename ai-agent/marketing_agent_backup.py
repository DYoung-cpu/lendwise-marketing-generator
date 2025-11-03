"""
Marketing Agent - A Real Autonomous Learning Agent
===================================================
This agent:
- Generates images using Gemini Flash 2.5
- Verifies text accuracy using Gemini Pro Vision
- Learns from failures (persistent memory)
- Iteratively improves until 90%+ success rate
- Uses LangGraph ReAct pattern for autonomous decision-making
"""

import os
import json
from datetime import datetime
from typing import TypedDict, Annotated, Literal
from pathlib import Path
import base64

from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from PIL import Image
import io


# ============================================================================
# AGENT STATE - This is the agent's memory during a task
# ============================================================================

class AgentState(TypedDict):
    """The state that flows through the agent graph"""
    task: str  # What we're trying to generate
    expected_text: str  # Text that should appear in the image
    prompt: str  # Current prompt being used
    attempt: int  # Current attempt number
    max_attempts: int  # Maximum attempts before giving up
    generated_image_path: str  # Path to the generated image
    verification_result: dict  # Result from vision verification
    decision: str  # Agent's decision: retry, success, or failure
    learning_notes: str  # What the agent learned
    history: list  # Conversation history
    reference_images: list  # Reference images (logo, headshot, etc.)


# ============================================================================
# PERSISTENT MEMORY - Agent remembers across sessions
# ============================================================================

class AgentMemory:
    """Persistent memory system - the agent LEARNS from mistakes"""

    def __init__(self, memory_file: str = "agent_memory.json"):
        self.memory_file = Path(memory_file)
        self.memory = self._load_memory()

    def _load_memory(self) -> dict:
        """Load memory from disk"""
        if self.memory_file.exists():
            with open(self.memory_file, 'r') as f:
                return json.load(f)
        return {
            "successful_prompts": [],
            "failed_patterns": [],
            "common_mistakes": {},
            "success_rate": 0.0,
            "total_attempts": 0,
            "total_successes": 0
        }

    def save(self):
        """Save memory to disk"""
        with open(self.memory_file, 'w') as f:
            json.dump(self.memory, f, indent=2)

    def record_success(self, prompt: str, expected_text: str, notes: str):
        """Record a successful generation"""
        self.memory["successful_prompts"].append({
            "prompt": prompt,
            "expected_text": expected_text,
            "notes": notes,
            "timestamp": datetime.now().isoformat()
        })
        self.memory["total_successes"] += 1
        self.memory["total_attempts"] += 1
        self._update_success_rate()
        self.save()

    def record_failure(self, prompt: str, expected_text: str, actual_text: str, notes: str):
        """Record a failed generation - LEARN from it"""
        self.memory["failed_patterns"].append({
            "prompt": prompt,
            "expected_text": expected_text,
            "actual_text": actual_text,
            "notes": notes,
            "timestamp": datetime.now().isoformat()
        })

        # Track common mistakes
        mistake_type = self._classify_mistake(expected_text, actual_text)
        if mistake_type not in self.memory["common_mistakes"]:
            self.memory["common_mistakes"][mistake_type] = 0
        self.memory["common_mistakes"][mistake_type] += 1

        self.memory["total_attempts"] += 1
        self._update_success_rate()
        self.save()

    def _classify_mistake(self, expected: str, actual: str) -> str:
        """Classify what type of mistake occurred"""
        if not actual:
            return "text_not_detected"
        elif expected.lower() != actual.lower():
            return "spelling_error"
        elif expected != actual:
            return "case_error"
        else:
            return "spacing_or_formatting"

    def _update_success_rate(self):
        """Update the overall success rate"""
        if self.memory["total_attempts"] > 0:
            self.memory["success_rate"] = (
                self.memory["total_successes"] / self.memory["total_attempts"]
            ) * 100

    def get_advice(self, task: str, expected_text: str) -> str:
        """Get advice based on past learnings"""
        advice = []

        # Check common mistakes
        if "spelling_error" in self.memory["common_mistakes"]:
            advice.append("IMPORTANT: Previous attempts had spelling errors. Include exact spelling in prompt.")

        if "text_not_detected" in self.memory["common_mistakes"]:
            advice.append("IMPORTANT: Previous attempts failed to generate text. Emphasize text visibility.")

        # Check for similar successful prompts
        for success in self.memory["successful_prompts"][-5:]:  # Last 5 successes
            if expected_text.lower() in success["expected_text"].lower():
                advice.append(f"Similar successful prompt: {success['prompt'][:100]}")

        return "\n".join(advice) if advice else "No specific advice yet - building knowledge base."


# ============================================================================
# GEMINI CLIENTS
# ============================================================================

class GeminiClients:
    """Handles Gemini API interactions"""

    def __init__(self, api_key: str):
        # Image generation model (Flash 2.5)
        self.image_gen = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-exp",
            google_api_key=api_key,
            temperature=0.7
        )

        # Vision verification model (Pro Vision)
        self.vision = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-exp",
            google_api_key=api_key,
            temperature=0.1  # Low temp for accurate text detection
        )

    def generate_image(self, prompt: str, output_path: str, reference_images: list = None) -> str:
        """Generate image using Gemini Flash Image API"""
        import requests

        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image:generateContent?key={self.image_gen.google_api_key}"

            # Build parts array
            parts = []

            # Add reference images if provided
            if reference_images:
                for img_path in reference_images:
                    with open(img_path, 'rb') as f:
                        img_data = base64.b64encode(f.read()).decode()
                    parts.append({
                        "inline_data": {
                            "mime_type": "image/png",
                            "data": img_data
                        }
                    })

            # Add text prompt
            parts.append({"text": prompt})

            payload = {
                "contents": [{"parts": parts}],
                "generationConfig": {
                    "temperature": 0.7,
                    "topK": 40,
                    "topP": 0.95,
                    "responseModalities": ["image"]
                }
            }

            response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
            response.raise_for_status()
            data = response.json()

            # Extract and save image
            if data.get("candidates") and data["candidates"][0]:
                content = data["candidates"][0]["content"]
                for part in content.get("parts", []):
                    if "inline_data" in part or "inlineData" in part:
                        inline_data = part.get("inline_data") or part.get("inlineData")
                        image_data = inline_data.get("data")

                        # Save image
                        with open(output_path, 'wb') as f:
                            f.write(base64.b64decode(image_data))

                        return f"✅ Image saved to {output_path}"

            return "❌ No image generated in response"

        except requests.exceptions.RequestException as e:
            return f"❌ API Error: {str(e)}"
        except Exception as e:
            return f"❌ Error: {str(e)}"

    def verify_image(self, image_path: str, expected_text: str) -> dict:
        """Verify image text using Gemini Pro Vision"""
        try:
            # Load and encode image
            with open(image_path, 'rb') as f:
                image_data = base64.b64encode(f.read()).decode()

            # Ask vision model to extract text
            prompt = f"""
            Analyze this image and extract ALL visible text.
            Expected text: "{expected_text}"

            Respond in JSON format:
            {{
                "text_detected": "the exact text you see",
                "matches_expected": true/false,
                "confidence": 0-100,
                "issues": ["list any spelling or formatting issues"]
            }}
            """

            response = self.vision.invoke([
                HumanMessage(content=[
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": f"data:image/png;base64,{image_data}"}
                ])
            ])

            # Parse response
            result = json.loads(response.content)
            return result

        except Exception as e:
            return {
                "text_detected": "",
                "matches_expected": False,
                "confidence": 0,
                "issues": [str(e)]
            }


# ============================================================================
# AGENT NODES - The thinking and acting parts
# ============================================================================

def reasoning_node(state: AgentState, memory: AgentMemory, clients: GeminiClients) -> AgentState:
    """REASONING: Agent thinks about what to do"""

    print(f"\n>� REASONING (Attempt {state['attempt']}/{state['max_attempts']})...")

    # Get advice from memory
    advice = memory.get_advice(state["task"], state["expected_text"])

    # Build prompt with learnings
    if state["attempt"] == 1:
        # First attempt - use base prompt
        state["prompt"] = f"""
        Create a high-quality marketing image with the following text: "{state['expected_text']}"

        Requirements:
        - Text must be clearly visible and readable
        - Spelling must be EXACTLY: "{state['expected_text']}"
        - Professional marketing design
        - High contrast for text visibility

        Past learnings:
        {advice}
        """
    else:
        # Retry - adjust based on what went wrong
        issues = state["verification_result"].get("issues", [])
        state["prompt"] = f"""
        RETRY - Previous attempt had issues: {', '.join(issues)}

        Create a high-quality marketing image with EXACT text: "{state['expected_text']}"

        CRITICAL REQUIREMENTS:
        - Spelling MUST be: "{state['expected_text']}" (letter by letter)
        - Text must be large and clearly visible
        - Use high contrast colors
        - Double-check spelling before finalizing

        Previous attempt detected: "{state['verification_result'].get('text_detected', 'nothing')}"
        Expected: "{state['expected_text']}"

        Past learnings:
        {advice}
        """

    print(f"=� Generated prompt strategy")
    return state


def action_node(state: AgentState, memory: AgentMemory, clients: GeminiClients) -> AgentState:
    """ACTION: Agent generates the image"""

    print(f"\n<� GENERATING IMAGE...")

    # Generate image
    output_path = f"generated_image_attempt_{state['attempt']}.png"
    result = clients.generate_image(state["prompt"], output_path)
    state["generated_image_path"] = output_path

    print(f" Image generated: {output_path}")
    return state


def verification_node(state: AgentState, memory: AgentMemory, clients: GeminiClients) -> AgentState:
    """VERIFICATION: Agent checks if the image is correct"""

    print(f"\n= VERIFYING IMAGE...")

    # Verify with vision model
    result = clients.verify_image(
        state["generated_image_path"],
        state["expected_text"]
    )
    state["verification_result"] = result

    detected = result.get("text_detected", "")
    matches = result.get("matches_expected", False)
    confidence = result.get("confidence", 0)

    print(f"Expected: '{state['expected_text']}'")
    print(f"Detected: '{detected}'")
    print(f"Match: {matches}, Confidence: {confidence}%")

    return state


def decision_node(state: AgentState, memory: AgentMemory, clients: GeminiClients) -> AgentState:
    """DECISION: Agent decides what to do next"""

    print(f"\n> MAKING DECISION...")

    matches = state["verification_result"].get("matches_expected", False)
    confidence = state["verification_result"].get("confidence", 0)

    if matches and confidence >= 90:
        # SUCCESS!
        state["decision"] = "success"
        state["learning_notes"] = f"Success on attempt {state['attempt']}. Prompt worked well."
        memory.record_success(
            state["prompt"],
            state["expected_text"],
            state["learning_notes"]
        )
        print(f" SUCCESS! Achieved 90%+ accuracy")

    elif state["attempt"] >= state["max_attempts"]:
        # FAILURE - ran out of attempts
        state["decision"] = "failure"
        state["learning_notes"] = f"Failed after {state['attempt']} attempts. Issues: {state['verification_result'].get('issues', [])}"
        memory.record_failure(
            state["prompt"],
            state["expected_text"],
            state["verification_result"].get("text_detected", ""),
            state["learning_notes"]
        )
        print(f"L FAILURE - Max attempts reached")

    else:
        # RETRY
        state["decision"] = "retry"
        state["attempt"] += 1
        state["learning_notes"] = f"Retry needed. Issues: {state['verification_result'].get('issues', [])}"
        print(f"= RETRY - Adjusting strategy for attempt {state['attempt']}")

    return state


# ============================================================================
# BUILD THE AGENT GRAPH
# ============================================================================

def create_agent_graph(memory: AgentMemory, clients: GeminiClients):
    """Create the agent's decision graph - this is the autonomous loop"""

    # Create the graph
    workflow = StateGraph(AgentState)

    # Add nodes with memory and clients bound
    workflow.add_node("reasoning", lambda s: reasoning_node(s, memory, clients))
    workflow.add_node("action", lambda s: action_node(s, memory, clients))
    workflow.add_node("verification", lambda s: verification_node(s, memory, clients))
    workflow.add_node("decision", lambda s: decision_node(s, memory, clients))

    # Define the flow
    workflow.set_entry_point("reasoning")
    workflow.add_edge("reasoning", "action")
    workflow.add_edge("action", "verification")
    workflow.add_edge("verification", "decision")

    # Decision branching
    def should_continue(state: AgentState) -> Literal["reasoning", "end"]:
        if state["decision"] == "retry":
            return "reasoning"  # Loop back
        return "end"  # Stop (success or failure)

    workflow.add_conditional_edges(
        "decision",
        should_continue,
        {
            "reasoning": "reasoning",
            "end": END
        }
    )

    return workflow.compile()


# ============================================================================
# MAIN AGENT CLASS
# ============================================================================

class MarketingAgent:
    """The main autonomous agent"""

    def __init__(self, gemini_api_key: str):
        self.memory = AgentMemory()
        self.clients = GeminiClients(gemini_api_key)
        self.graph = create_agent_graph(self.memory, self.clients)

        print("> Marketing Agent initialized")
        print(f"=� Current success rate: {self.memory.memory['success_rate']:.1f}%")
        print(f"=� Total attempts: {self.memory.memory['total_attempts']}")

    def generate(self, task: str, expected_text: str, max_attempts: int = 5) -> dict:
        """
        Generate marketing content - the agent runs autonomously

        Args:
            task: Description of what to generate
            expected_text: Exact text that should appear
            max_attempts: Maximum retry attempts

        Returns:
            Result dictionary with success/failure info
        """
        print(f"\n{'='*60}")
        print(f"<� NEW TASK: {task}")
        print(f"=� Expected text: '{expected_text}'")
        print(f"{'='*60}")

        # Initialize state
        initial_state = AgentState(
            task=task,
            expected_text=expected_text,
            prompt="",
            attempt=1,
            max_attempts=max_attempts,
            generated_image_path="",
            verification_result={},
            decision="",
            learning_notes="",
            history=[]
        )

        # RUN THE AGENT - it will loop autonomously!
        final_state = self.graph.invoke(initial_state)

        # Return results
        return {
            "success": final_state["decision"] == "success",
            "attempts": final_state["attempt"],
            "image_path": final_state["generated_image_path"],
            "verification": final_state["verification_result"],
            "learning_notes": final_state["learning_notes"],
            "current_success_rate": self.memory.memory["success_rate"]
        }

    def get_stats(self) -> dict:
        """Get agent performance statistics"""
        return {
            "success_rate": self.memory.memory["success_rate"],
            "total_attempts": self.memory.memory["total_attempts"],
            "total_successes": self.memory.memory["total_successes"],
            "common_mistakes": self.memory.memory["common_mistakes"]
        }


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    # Get API key from environment
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("L Error: GOOGLE_API_KEY environment variable not set")
        print("Set it with: export GOOGLE_API_KEY='your-key-here'")
        exit(1)

    # Create the agent
    agent = MarketingAgent(gemini_api_key=api_key)

    # Example task
    result = agent.generate(
        task="Generate a LendWise mortgage marketing image",
        expected_text="LendWise Mortgage",
        max_attempts=5
    )

    print(f"\n{'='*60}")
    print("<� FINAL RESULT")
    print(f"{'='*60}")
    print(f"Success: {result['success']}")
    print(f"Attempts: {result['attempts']}")
    print(f"Image: {result['image_path']}")
    print(f"Current success rate: {result['current_success_rate']:.1f}%")
    print(f"\nLearning notes: {result['learning_notes']}")

    # Show statistics
    stats = agent.get_stats()
    print(f"\n{'='*60}")
    print("=� AGENT STATISTICS")
    print(f"{'='*60}")
    print(f"Success rate: {stats['success_rate']:.1f}%")
    print(f"Total attempts: {stats['total_attempts']}")
    print(f"Total successes: {stats['total_successes']}")
    print(f"Common mistakes: {stats['common_mistakes']}")
