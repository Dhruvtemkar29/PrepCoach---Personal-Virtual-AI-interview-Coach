import logging
from models.schemas import ChatRequest, ChatResponse
from services.gemini_client import gemini_service

logger = logging.getLogger(__name__)

def generate_chat_response(req: ChatRequest) -> ChatResponse:
    user_msg = req.message.strip()

    if gemini_service.is_available:
        history_text = ""
        if req.history:
            history_text = "\n".join([f"{m.role.capitalize()}: {m.content}" for m in req.history[-4:]])

        prompt = f"""
You are PrepBot, the AI assistant built into **PrepCoach** (an AI-powered interview preparation platform).

About PrepCoach (use this when asked what this software is about):
- PrepCoach helps students and job seekers prepare for technical and behavioral interviews.
- Key features: AI Mock Interviews (dynamic question generation & multi-metric evaluation), Resume Manager & AI Resume Analyzer, Performance Analytics, Personalized 4-Week Learning Roadmap, and PrepBot coaching.

{f"User's Live Platform Data / Context: {req.context}" if req.context else "Note: No user score/session data was provided in this request."}
{f"Conversation History:\n{history_text}" if history_text else ""}

User: "{user_msg}"

Guidelines:
- Answer the user's question directly, naturally, and concisely.
- If they ask a general knowledge question (e.g. facts, definitions), answer it plainly without forcing interview frameworks.
- Only suggest the STAR method or interview tips when they are asking about interview preparation or practicing an answer.
- If they ask for their score/progress and no live data is provided above, tell them to check their Dashboard or Interview History (or log in) rather than inventing a number.
"""
        system_instruction = "You are PrepBot, the helpful, accurate AI assistant for PrepCoach."
        text = gemini_service.generate_text(prompt, system_instruction=system_instruction)
        if text:
            return ChatResponse(reply=text.strip(), source="gemini")

    # Heuristic fallback responses for common interview inquiries
    lower = user_msg.lower()
    if "star" in lower:
        reply = (
            "The **STAR method** is the gold standard for behavioral interviews:\n"
            "• **S (Situation):** Set the context and challenge you faced.\n"
            "• **T (Task):** Explain your specific responsibility.\n"
            "• **A (Action):** Detail the exact steps and technologies you leveraged.\n"
            "• **R (Result):** Share measurable outcomes, metrics, or lessons learned."
        )
    elif "nervous" in lower or "confidence" in lower or "anxiety" in lower:
        reply = (
            "It's completely natural to feel nervous before interviews! Try these three tips:\n"
            "1. **Pause before answering:** Taking 3 seconds to organize your thoughts displays composure.\n"
            "2. **Think aloud:** Interviewers care more about your problem-solving journey than immediate perfection.\n"
            "3. **Practice out loud:** Run through 2-3 mock sessions right here in PrepCoach to build vocal muscle memory."
        )
    elif "weakness" in lower:
        reply = (
            "When asked *'What is your greatest weakness?'*, follow this rule:\n"
            "Pick a genuine skill that is NOT core to your primary daily deliverables, and immediately explain the proactive steps you are taking to improve it (e.g., public speaking, where you joined Toastmasters or volunteered for team demos)."
        )
    elif "tell me about yourself" in lower or "introduce" in lower:
        reply = (
            "Structure your *'Tell me about yourself'* into the **Present-Past-Future** framework:\n"
            "1. **Present:** Where you are now, your current role/degree and primary tech stack.\n"
            "2. **Past:** A standout project or experience that shaped your expertise.\n"
            "3. **Future:** Why this specific company and role are the ideal next chapter for your career."
        )
    else:
        reply = (
            f"Great question! When approaching interview topics like this, focus on clarity and concrete examples. "
            f"Break your answer down into: the core principle, how you applied it in a recent project, and the key lesson or trade-off you observed. "
            f"Would you like to practice a mock question on this?"
        )

    return ChatResponse(reply=reply, source="heuristic_engine")
