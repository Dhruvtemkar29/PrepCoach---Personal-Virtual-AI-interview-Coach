import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from services.gemini_client import gemini_service

logger = logging.getLogger(__name__)

class RecommendationRequest(BaseModel):
    role: str = "Software Developer"
    average_score: Optional[float] = 75.0
    technical_score: Optional[float] = 75.0
    communication_score: Optional[float] = 75.0
    confidence_score: Optional[float] = 75.0
    strengths: List[str] = Field(default_factory=list)
    improvements: List[str] = Field(default_factory=list)
    difficulty_preference: Optional[str] = "medium"

class RecommendedTask(BaseModel):
    week_number: int
    task_title: str
    task_description: str
    priority: str = "High"

class RecommendationResponse(BaseModel):
    readiness_status: str
    primary_focus_area: str
    actionable_tip: str
    recommended_topics: List[str]
    adaptive_tasks: List[RecommendedTask]
    source: str = "gemini"

def generate_recommendations(req: RecommendationRequest) -> RecommendationResponse:
    avg = req.average_score or 75.0
    tech = req.technical_score or 75.0
    comm = req.communication_score or 75.0
    conf = req.confidence_score or 75.0

    # Determine readiness status
    if avg >= 85:
        readiness = "Interview Ready"
    elif avg >= 70:
        readiness = "Needs Targeted Polish"
    else:
        readiness = "Foundational Practice Required"

    if gemini_service.is_available:
        prompt = f"""
You are PrepCoach AI, an elite career mentor and technical interview strategist.
Analyze this candidate's interview performance metrics and recommend a personalized study plan:

- Target Role: {req.role}
- Overall Score: {avg}%
- Technical Score: {tech}%
- Communication Score: {comm}%
- Confidence Score: {conf}%
- Known Strengths: {", ".join(req.strengths) if req.strengths else "Solid baseline effort"}
- Known Improvement Areas: {", ".join(req.improvements) if req.improvements else "Deepen explanations with structured examples"}
- Preferred Difficulty: {req.difficulty_preference}

Return ONLY valid JSON matching this schema:
{{
  "readiness_status": "{readiness}",
  "primary_focus_area": "...",
  "actionable_tip": "...",
  "recommended_topics": ["Topic 1", "Topic 2", "Topic 3"],
  "adaptive_tasks": [
    {{
      "week_number": 1,
      "task_title": "...",
      "task_description": "...",
      "priority": "High | Medium"
    }}
  ]
}}
"""
        system_instruction = "You are PrepCoach AI Personal Learning Coach. Deliver actionable, supportive, role-specific guidance."
        ai_res = gemini_service.generate_json(prompt, system_instruction=system_instruction)
        if ai_res and "primary_focus_area" in ai_res:
            tasks = []
            for t in ai_res.get("adaptive_tasks", []):
                tasks.append(RecommendedTask(
                    week_number=t.get("week_number", 1),
                    task_title=t.get("task_title", "Practice Session"),
                    task_description=t.get("task_description", "Complete practice interview"),
                    priority=t.get("priority", "High")
                ))
            return RecommendationResponse(
                readiness_status=ai_res.get("readiness_status", readiness),
                primary_focus_area=ai_res.get("primary_focus_area", "Technical Depth & Communication"),
                actionable_tip=ai_res.get("actionable_tip", "Structure answers using top-down STAR method."),
                recommended_topics=ai_res.get("recommended_topics", ["System Design", "Behavioral Scenarios"]),
                adaptive_tasks=tasks,
                source="gemini"
            )

    # Analytical heuristic recommendation fallback
    logger.info("Using heuristic recommendation engine fallback.")
    recommended_topics = []
    adaptive_tasks = []

    if comm < tech:
        focus = "Communication & Answer Structuring"
        tip = "Focus on the STAR method (Situation, Task, Action, Result) to avoid trailing off."
        recommended_topics = ["Behavioral Storytelling", "STAR Methodology", "Conflict Resolution Scenarios"]
        adaptive_tasks.append(RecommendedTask(
            week_number=2,
            task_title="Master STAR Behavioral Responses",
            task_description="Draft and practice 3 key workplace stories demonstrating leadership and conflict resolution.",
            priority="High"
        ))
    elif tech < 75:
        focus = "Core Technical & Architectural Fundamentals"
        tip = "Revise database indexing, asynchronous concurrency, and system scaling patterns."
        recommended_topics = ["Database Indexing & Queries", "Microservice Patterns", "REST API Idempotency"]
        adaptive_tasks.append(RecommendedTask(
            week_number=1,
            task_title="Deep Dive into Database Performance",
            task_description="Practice explaining B-Trees, query explain plans, and caching strategies with Redis.",
            priority="High"
        ))
    else:
        focus = "High-Pressure Mock Simulations & Edge Cases"
        tip = "Practice timed sessions and articulate trade-offs between competing architecture designs."
        recommended_topics = ["System Design Trade-offs", "Concurrency & Race Conditions", "Executive Communication"]
        adaptive_tasks.append(RecommendedTask(
            week_number=3,
            task_title="Full-Length Timed Technical Simulation",
            task_description="Complete a 30-minute Hard technical simulation without pausing.",
            priority="Medium"
        ))

    return RecommendationResponse(
        readiness_status=readiness,
        primary_focus_area=focus,
        actionable_tip=tip,
        recommended_topics=recommended_topics,
        adaptive_tasks=adaptive_tasks,
        source="heuristic_engine"
    )
