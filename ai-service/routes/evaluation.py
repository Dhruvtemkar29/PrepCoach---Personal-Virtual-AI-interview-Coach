from fastapi import APIRouter, HTTPException
from models.schemas import (
    AnswerEvaluationRequest,
    AnswerEvaluationResponse,
    SessionEvaluationRequest,
    SessionEvaluationResponse
)
from services.evaluation_service import evaluate_single_answer, evaluate_full_session

router = APIRouter(prefix="/api/ai/evaluate", tags=["Evaluation"])

@router.post("/answer", response_model=AnswerEvaluationResponse)
async def evaluate_answer(request: AnswerEvaluationRequest):
    try:
        return evaluate_single_answer(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Answer evaluation failed: {str(e)}")

@router.post("/session", response_model=SessionEvaluationResponse)
async def evaluate_session(request: SessionEvaluationRequest):
    try:
        return evaluate_full_session(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Session evaluation failed: {str(e)}")
