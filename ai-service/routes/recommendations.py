from fastapi import APIRouter, HTTPException
from services.recommendation_service import (
    RecommendationRequest,
    RecommendationResponse,
    generate_recommendations
)

router = APIRouter(prefix="/api/ai/recommendations", tags=["Recommendations"])

@router.post("", response_model=RecommendationResponse)
async def get_ai_recommendations(request: RecommendationRequest):
    try:
        return generate_recommendations(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")
