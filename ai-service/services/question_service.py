import logging
from typing import List
from models.schemas import QuestionGenerateRequest, QuestionGenerateResponse, QuestionItem
from services.gemini_client import gemini_service

logger = logging.getLogger(__name__)

CURATED_QUESTION_BANKS = {
    "frontend": [
        ("Explain how the Virtual DOM works in React and compare it with the browser's real DOM.", "React", "medium", "Think about reconciliation, diffing algorithm, and batching."),
        ("What are the key differences between useMemo, useCallback, and React.memo? When would you use each?", "React Hooks", "medium", "Focus on reference equality, re-renders, and performance trade-offs."),
        ("How does the CSS box model work, and what is the difference between content-box and border-box?", "CSS", "easy", "Explain how padding and border affect total width and height."),
        ("Explain the JavaScript event loop, microtasks, and macrotasks with an example.", "JavaScript", "hard", "Mention Promise jobs vs setTimeout and execution order in the queue."),
        ("How would you optimize Web Vitals (LCP, FID, CLS) in a heavy React web application?", "Performance", "hard", "Think about code splitting, lazy loading, image optimization, and font loading.")
    ],
    "backend": [
        ("Explain RESTful API design principles and how idempotent HTTP methods differ from non-idempotent ones.", "API Architecture", "medium", "Compare GET, PUT, POST, and DELETE idempotency."),
        ("How does JWT authentication work, and how do you protect against XSS and CSRF token theft?", "Security", "medium", "Discuss httpOnly cookies, Authorization headers, and token refresh strategies."),
        ("Explain database indexing. How do B-Trees work and when might an index hurt query performance?", "Databases", "hard", "Consider write latency, storage overhead, and low-cardinality columns."),
        ("How would you design a rate limiter for an Express or Node.js microservice?", "System Design", "hard", "Mention Token Bucket, Leaky Bucket, and Redis integration."),
        ("What is the difference between SQL and NoSQL databases, and how do you decide which to use?", "Architecture", "easy", "Focus on schema rigidity, ACID guarantees, and horizontal scalability.")
    ],
    "full stack": [
        ("Walk through what happens from the moment a user types a URL into their browser until the page renders.", "Networking & Architecture", "medium", "Include DNS, TCP handshake, TLS, HTTP request, DOM/CSSOM, and JS execution."),
        ("How do you handle asynchronous operations and error boundaries across both client and server?", "Architecture", "medium", "Discuss try/catch, Express middleware, React error boundaries, and user feedback."),
        ("Explain how WebSockets enable real-time bidirectional communication compared to long polling and SSE.", "Networking", "medium", "Compare connection persistence, overhead, and reconnection handling."),
        ("Design a scalable file upload system where users upload large PDFs and images.", "System Design", "hard", "Consider presigned S3/GCS URLs, chunked uploads, validation, and async background workers."),
        ("How do you manage environment configuration, secrets, and deployment pipelines between dev and production?", "DevOps & Security", "medium", "Discuss .env, containerization, secrets managers, and CI/CD.")
    ],
    "machine learning": [
        ("Explain the bias-variance tradeoff and how regularization techniques (L1 vs L2) address overfitting.", "ML Fundamentals", "medium", "Contrast Lasso (feature sparsity) with Ridge (coefficient shrinkage)."),
        ("How do Transformer attention mechanisms (Self-Attention) work compared to traditional RNNs?", "Deep Learning", "hard", "Explain Query, Key, Value vectors and parallel token processing."),
        ("What metrics would you use to evaluate an imbalanced classification problem instead of simple accuracy?", "Evaluation", "medium", "Discuss Precision, Recall, F1-score, PR-AUC, and ROC-AUC curves."),
        ("Explain how RAG (Retrieval-Augmented Generation) works and how vector embeddings are used.", "Generative AI", "hard", "Discuss chunking, vector databases, cosine similarity, and prompt augmentation."),
        ("How would you monitor and handle data drift and concept drift in a deployed ML pipeline?", "MLOps", "medium", "Discuss baseline distributions, KS-tests, retraining triggers, and shadow deployments.")
    ],
    "behavioral": [
        ("Tell me about a challenging technical project you worked on. What obstacles did you encounter and how did you resolve them?", "Problem Solving", "medium", "Use the STAR framework (Situation, Task, Action, Result)."),
        ("Describe a situation where you had a disagreement with a teammate over an architecture decision. How did you handle it?", "Collaboration", "medium", "Highlight empathy, data-driven decisions, and consensus building."),
        ("How do you prioritize competing deadlines when multiple critical tasks arise simultaneously?", "Time Management", "easy", "Explain Eisenhower matrix, stakeholder communication, and iterative delivery."),
        ("Tell me about a time you made a mistake that affected a project or system. What did you learn?", "Accountability", "medium", "Emphasize ownership, prompt post-mortem, and preventive safeguards."),
        ("How do you keep your technical skills sharp and decide what new technologies to learn?", "Continuous Learning", "easy", "Share personal learning routines, projects, and curiosity.")
    ]
}

def generate_questions(req: QuestionGenerateRequest) -> QuestionGenerateResponse:
    target_role = req.role.strip()
    role_lower = target_role.lower()
    num = max(1, min(req.num_questions, 10))

    if gemini_service.is_available:
        prompt = f"""
You are an expert technical interviewer and hiring manager at a top-tier tech company.
Generate exactly {num} interview questions for the following candidate profile:

- Target Role: {req.role}
- Interview Type: {req.interview_type} (e.g., technical, behavioral, system design, coding)
- Difficulty Level: {req.difficulty} (easy, medium, hard)
- Key Skills: {", ".join(req.skills) if req.skills else "General core requirements for this role"}
{f"- Candidate Resume Highlights: {req.resume_text[:1000]}" if req.resume_text else ""}
{f"- Target Job Description: {req.job_description[:1000]}" if req.job_description else ""}

Return ONLY a valid JSON object matching this schema:
{{
  "questions": [
    {{
      "question_number": 1,
      "question_text": "...",
      "category": "...",
      "difficulty": "{req.difficulty}",
      "hint": "..."
    }}
  ]
}}
Ensure the questions are modern, practical, challenging according to the difficulty, and directly relevant to the role.
"""
        system_instruction = "You are PrepCoach AI, an elite technical interviewer. Generate realistic, probing interview questions in strict JSON format."
        ai_result = gemini_service.generate_json(prompt, system_instruction=system_instruction)
        
        if ai_result and "questions" in ai_result and isinstance(ai_result["questions"], list):
            items = []
            for i, q in enumerate(ai_result["questions"][:num], 1):
                items.append(QuestionItem(
                    question_number=i,
                    question_text=q.get("question_text", f"Question {i}"),
                    category=q.get("category", req.interview_type),
                    difficulty=q.get("difficulty", req.difficulty),
                    hint=q.get("hint")
                ))
            if items:
                return QuestionGenerateResponse(
                    success=True,
                    questions=items,
                    role=req.role,
                    difficulty=req.difficulty,
                    source="gemini"
                )

    # Heuristic / curated fallback engine
    logger.info("Using curated question bank engine fallback.")
    bank_key = "full stack"
    if "front" in role_lower or "react" in role_lower:
        bank_key = "frontend"
    elif "back" in role_lower or "node" in role_lower or "python" in role_lower or "java" in role_lower:
        bank_key = "backend"
    elif "ml" in role_lower or "machine" in role_lower or "ai" in role_lower or "data" in role_lower:
        bank_key = "machine learning"
    elif req.interview_type.lower() == "behavioral" or req.interview_type.lower() == "hr":
        bank_key = "behavioral"

    selected_pool = CURATED_QUESTION_BANKS.get(bank_key, CURATED_QUESTION_BANKS["full stack"])
    # If behavioral interview type was requested, prioritize behavioral questions
    if req.interview_type.lower() in ["behavioral", "hr"]:
        selected_pool = CURATED_QUESTION_BANKS["behavioral"]

    items = []
    for i in range(num):
        q_tuple = selected_pool[i % len(selected_pool)]
        items.append(QuestionItem(
            question_number=i + 1,
            question_text=q_tuple[0],
            category=q_tuple[1],
            difficulty=q_tuple[2] or req.difficulty,
            hint=q_tuple[3]
        ))

    return QuestionGenerateResponse(
        success=True,
        questions=items,
        role=req.role,
        difficulty=req.difficulty,
        source="curated_engine"
    )
