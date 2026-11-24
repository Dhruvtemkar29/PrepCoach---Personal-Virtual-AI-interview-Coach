import logging
import re
from typing import List, Dict, Any
from models.schemas import (
    AnswerEvaluationRequest,
    AnswerEvaluationResponse,
    SessionEvaluationRequest,
    SessionEvaluationResponse
)
from services.gemini_client import gemini_service

logger = logging.getLogger(__name__)

def evaluate_single_answer(req: AnswerEvaluationRequest) -> AnswerEvaluationResponse:
    answer = req.answer_text.strip()
    words = len(answer.split())

    if gemini_service.is_available:
        prompt = f"""
You are an expert technical interviewer and executive communication coach.
Evaluate this candidate's interview response thoroughly.

- Question: "{req.question_text}"
- Candidate Answer: "{req.answer_text}"
- Target Role: {req.role}
- Difficulty: {req.difficulty}
- Category: {req.category}
- Duration: {req.duration_seconds} seconds

Evaluate on these criteria (scores from 0 to 100):
1. technical_score: Depth, factual correctness, terminology, technical concepts.
2. communication_score: Clarity, structure (e.g. STAR, top-down), concise explanation.
3. confidence_score: Decisiveness, tone, completeness, lack of excessive hedges or uncertainty.
4. overall_score: Weighted composite (45% technical, 35% communication, 20% confidence).

Return ONLY valid JSON matching this exact structure:
{{
  "overall_score": 85.0,
  "technical_score": 88.0,
  "communication_score": 82.0,
  "confidence_score": 84.0,
  "strengths": [
    "Specific strength point 1",
    "Specific strength point 2"
  ],
  "improvements": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2"
  ],
  "detailed_feedback": "A comprehensive 2-3 paragraph breakdown of the candidate's answer.",
  "suggested_answer": "An exemplary, concise senior-level model answer for this question."
}}
"""
        system_instruction = "You are an objective, encouraging, and rigorous AI interview evaluator. Return your assessment in clean JSON format."
        ai_result = gemini_service.generate_json(prompt, system_instruction=system_instruction)
        
        if ai_result and "overall_score" in ai_result:
            return AnswerEvaluationResponse(
                overall_score=float(ai_result.get("overall_score", 75.0)),
                technical_score=float(ai_result.get("technical_score", 75.0)),
                communication_score=float(ai_result.get("communication_score", 75.0)),
                confidence_score=float(ai_result.get("confidence_score", 75.0)),
                strengths=ai_result.get("strengths", ["Solid attempt at addressing the core question"]),
                improvements=ai_result.get("improvements", ["Provide deeper technical examples"]),
                detailed_feedback=ai_result.get("detailed_feedback", "Good baseline response with opportunities for greater depth."),
                suggested_answer=ai_result.get("suggested_answer"),
                source="gemini"
            )

    # Heuristic analytical scoring engine
    logger.info("Using analytical heuristic evaluation engine fallback.")
    if words == 0:
        return AnswerEvaluationResponse(
            overall_score=0.0,
            technical_score=0.0,
            communication_score=0.0,
            confidence_score=0.0,
            strengths=[],
            improvements=["No response provided. Ensure you speak or type your answer clearly."],
            detailed_feedback="The question was skipped or submitted without an answer. In an interview, offering an educated guess or outlining your thought process is always better than silence.",
            suggested_answer="Structure your answer by defining the core concept, citing an example, and mentioning relevant trade-offs.",
            source="heuristic_engine"
        )

    # Calculate scores based on length, keywords, structure
    # Word count curve: optimal around 60-180 words for a standard technical answer
    length_factor = min(1.0, words / 80.0)
    
    # Technical keywords check
    tech_keywords = [
        "architecture", "performance", "database", "api", "component", "state", "cache",
        "scale", "async", "promise", "latency", "index", "optimization", "security",
        "algorithm", "complexity", "trade-off", "lifecycle", "design", "protocol"
    ]
    tech_hits = sum(1 for kw in tech_keywords if re.search(r'\b' + kw, answer, re.IGNORECASE))
    tech_bonus = min(25.0, tech_hits * 5.0)

    # Structure check (STAR / connective words)
    connectives = ["because", "specifically", "for example", "furthermore", "however", "therefore", "firstly", "in order to"]
    conn_hits = sum(1 for conn in connectives if conn in answer.lower())
    comm_bonus = min(20.0, conn_hits * 5.0)

    base_score = 55.0
    technical = min(95.0, base_score + (length_factor * 20.0) + tech_bonus)
    communication = min(92.0, base_score + (length_factor * 20.0) + comm_bonus)
    confidence = min(90.0, base_score + (length_factor * 25.0))

    if words < 20:
        technical = min(technical, 50.0)
        communication = min(communication, 45.0)
        confidence = min(confidence, 40.0)

    overall = round((technical * 0.45) + (communication * 0.35) + (confidence * 0.20), 1)

    strengths = []
    if words >= 50:
        strengths.append("Provided a well-elaborated response with sufficient detail.")
    if tech_hits >= 2:
        strengths.append("Incorporated relevant technical terminology appropriately.")
    if conn_hits >= 1:
        strengths.append("Structured the answer using logical transitions and explanations.")
    if not strengths:
        strengths.append("Addressed the question directly without going off-topic.")

    improvements = []
    if words < 40:
        improvements.append("Elaborate further with concrete examples or real-world use cases.")
    if tech_hits == 0:
        improvements.append("Include more specific domain keywords and architectural concepts.")
    if conn_hits == 0:
        improvements.append("Use framing frameworks (e.g. STAR method: Situation, Task, Action, Result) for clearer structure.")
    if not improvements:
        improvements.append("Consider discussing performance trade-offs or alternative edge cases.")

    feedback = (
        f"Your response contained {words} words. "
        + ("You demonstrated strong familiarity with the subject matter. " if overall >= 75 else "You provided a fair foundation, but could deepen technical rigor. ")
        + f"Focus on structuring your response into three parts: Concept definition, practical application, and performance or edge-case trade-offs."
    )

    return AnswerEvaluationResponse(
        overall_score=round(overall, 1),
        technical_score=round(technical, 1),
        communication_score=round(communication, 1),
        confidence_score=round(confidence, 1),
        strengths=strengths,
        improvements=improvements,
        detailed_feedback=feedback,
        suggested_answer=f"For '{req.question_text}', an ideal response defines the core principle clearly, outlines how it operates in a production system, and highlights a trade-off or best practice.",
        source="heuristic_engine"
    )

def evaluate_full_session(req: SessionEvaluationRequest) -> SessionEvaluationResponse:
    if not req.qa_pairs:
        return SessionEvaluationResponse(
            overall_score=0.0,
            technical_score=0.0,
            communication_score=0.0,
            confidence_score=0.0,
            strengths=[],
            improvements=["No answers were submitted."],
            detailed_feedback="Session completed without any recorded answers.",
            source="heuristic_engine"
        )

    # If Gemini is available, synthesize a full comprehensive interview evaluation
    if gemini_service.is_available:
        qa_summary = "\n\n".join([
            f"Q{i+1}: {qa.question_text}\nA: {qa.answer_text}"
            for i, qa in enumerate(req.qa_pairs)
        ])
        prompt = f"""
You are the lead technical interviewer evaluating a completed interview session for a {req.role} position.
Difficulty: {req.difficulty}
Interview Type: {req.interview_type}

Candidate Transcript:
{qa_summary}

Provide a comprehensive final evaluation across all answers.
Return ONLY valid JSON matching this schema:
{{
  "overall_score": 82.5,
  "technical_score": 85.0,
  "communication_score": 80.0,
  "confidence_score": 82.0,
  "strengths": [
    "Key overall strength 1",
    "Key overall strength 2",
    "Key overall strength 3"
  ],
  "improvements": [
    "Key overall area for growth 1",
    "Key overall area for growth 2",
    "Key overall area for growth 3"
  ],
  "detailed_feedback": "A comprehensive multi-paragraph evaluation synthesizing candidate capabilities, depth of knowledge, and next-step recommendations."
}}
"""
        system_instruction = "You are PrepCoach AI's master interviewer. Provide actionable, supportive, yet rigorous candidate evaluation."
        ai_result = gemini_service.generate_json(prompt, system_instruction=system_instruction)
        
        if ai_result and "overall_score" in ai_result:
            return SessionEvaluationResponse(
                overall_score=float(ai_result.get("overall_score", 75.0)),
                technical_score=float(ai_result.get("technical_score", 75.0)),
                communication_score=float(ai_result.get("communication_score", 75.0)),
                confidence_score=float(ai_result.get("confidence_score", 75.0)),
                strengths=ai_result.get("strengths", ["Solid technical grasp"]),
                improvements=ai_result.get("improvements", ["Deepen system design considerations"]),
                detailed_feedback=ai_result.get("detailed_feedback", "Great overall performance across the interview."),
                source="gemini"
            )

    # Analytical aggregation fallback
    individual_evals = [
        evaluate_single_answer(AnswerEvaluationRequest(
            question_text=qa.question_text,
            answer_text=qa.answer_text,
            role=req.role,
            difficulty=req.difficulty,
            category=qa.category
        ))
        for qa in req.qa_pairs
    ]

    avg_overall = sum(e.overall_score for e in individual_evals) / len(individual_evals)
    avg_tech = sum(e.technical_score for e in individual_evals) / len(individual_evals)
    avg_comm = sum(e.communication_score for e in individual_evals) / len(individual_evals)
    avg_conf = sum(e.confidence_score for e in individual_evals) / len(individual_evals)

    all_strengths = []
    all_improvements = []
    for e in individual_evals:
        all_strengths.extend(e.strengths)
        all_improvements.extend(e.improvements)

    # De-duplicate while preserving order
    unique_strengths = list(dict.fromkeys(all_strengths))[:4]
    unique_improvements = list(dict.fromkeys(all_improvements))[:4]

    feedback = (
        f"You completed {len(req.qa_pairs)} interview questions for the {req.role} role. "
        f"Your overall score is {avg_overall:.1f}%. "
        + ("Strong demonstration of technical knowledge and articulated thoughts clearly." if avg_overall >= 75 else "Good foundational effort. Continued practice on structured responses will boost your performance.")
    )

    return SessionEvaluationResponse(
        overall_score=round(avg_overall, 1),
        technical_score=round(avg_tech, 1),
        communication_score=round(avg_comm, 1),
        confidence_score=round(avg_conf, 1),
        strengths=unique_strengths or ["Consistent completion of all questions"],
        improvements=unique_improvements or ["Continue refining concise delivery"],
        detailed_feedback=feedback,
        source="heuristic_engine"
    )
