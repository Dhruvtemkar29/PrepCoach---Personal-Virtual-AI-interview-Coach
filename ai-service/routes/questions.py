from fastapi import APIRouter, HTTPException
from models.schemas import QuestionGenerateRequest, QuestionGenerateResponse
from services.question_service import generate_questions

router = APIRouter(prefix="/api/ai/questions", tags=["Questions"])

@router.post("/generate", response_model=QuestionGenerateResponse)
async def generate_interview_questions(request: QuestionGenerateRequest):
    try:
        return generate_questions(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question generation failed: {str(e)}")
