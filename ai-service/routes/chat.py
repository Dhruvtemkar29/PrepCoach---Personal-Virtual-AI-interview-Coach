from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse
from services.chat_service import generate_chat_response

router = APIRouter(prefix="/api/ai/chat", tags=["Chat"])

@router.post("/message", response_model=ChatResponse)
async def chat_with_coach(request: ChatRequest):
    try:
        return generate_chat_response(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat generation failed: {str(e)}")
