from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# Question Generation
class QuestionItem(BaseModel):
    question_number: int
    question_text: str
    category: str = "technical"
    difficulty: str = "medium"
    hint: Optional[str] = None

class QuestionGenerateRequest(BaseModel):
    role: str = "Full Stack Developer"
    interview_type: str = "technical"
    difficulty: str = "medium"
    num_questions: int = 5
    skills: List[str] = Field(default_factory=list)
    resume_text: Optional[str] = None
    job_description: Optional[str] = None

class QuestionGenerateResponse(BaseModel):
    success: bool = True
    questions: List[QuestionItem]
    role: str
    difficulty: str
    source: str = "gemini"

# Answer Evaluation
class AnswerEvaluationRequest(BaseModel):
    question_text: str
    answer_text: str
    role: Optional[str] = "Software Engineer"
    difficulty: Optional[str] = "medium"
    category: Optional[str] = "technical"
    duration_seconds: Optional[int] = 0

class AnswerEvaluationResponse(BaseModel):
    overall_score: float = Field(ge=0, le=100)
    technical_score: float = Field(ge=0, le=100)
    communication_score: float = Field(ge=0, le=100)
    confidence_score: float = Field(ge=0, le=100)
    strengths: List[str] = Field(default_factory=list)
    improvements: List[str] = Field(default_factory=list)
    detailed_feedback: str
    suggested_answer: Optional[str] = None
    source: str = "gemini"

# Multi-Answer Session Evaluation (for entire completed interview)
class SessionQuestionAnswer(BaseModel):
    question_text: str
    answer_text: str
    category: Optional[str] = "general"

class SessionEvaluationRequest(BaseModel):
    role: str = "Software Engineer"
    difficulty: str = "medium"
    interview_type: str = "technical"
    qa_pairs: List[SessionQuestionAnswer]

class SessionEvaluationResponse(BaseModel):
    overall_score: float
    technical_score: float
    communication_score: float
    confidence_score: float
    strengths: List[str]
    improvements: List[str]
    detailed_feedback: str
    source: str = "gemini"

# Resume Analysis
class ResumeAnalyzeRequest(BaseModel):
    resume_text: str
    target_role: Optional[str] = "Software Engineer"

class ResumeAnalyzeResponse(BaseModel):
    extracted_skills: List[str] = Field(default_factory=list)
    experience_level: str = "Entry-Level"
    education: List[str] = Field(default_factory=list)
    role_match_score: float = Field(ge=0, le=100)
    strengths: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    summary: str
    source: str = "gemini"

# PrepBot Chat
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    history: List[ChatMessage] = Field(default_factory=list)

class ChatResponse(BaseModel):
    reply: str
    source: str = "gemini"
