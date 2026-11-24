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
You are PrepCoach AI, an encouraging, articulate, and highly knowledgeable personal interview coach.
The candidate is preparing for job interviews.

{f"Context / Current Question: {req.context}" if req.context else ""}
{f"Conversation History:\n{history_text}" if history_text else ""}

Candidate: "{user_msg}"

Provide an insightful, concise, and actionable response (1-2 short paragraphs or bullet points). If they asked for advice on answering a question, suggest the STAR method and provide a practical sample angle.
"""
        system_instruction = "You are PrepCoach AI, a professional virtual interview mentor."
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
