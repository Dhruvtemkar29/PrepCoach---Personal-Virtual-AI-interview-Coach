import uvicorn
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings
from routes.questions import router as questions_router
from routes.evaluation import router as evaluation_router
from routes.resume import router as resume_router
from routes.chat import router as chat_router
from routes.recommendations import router as recommendations_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("prepcoach-ai")

app = FastAPI(
    title="PrepCoach AI & NLP Service",
    description="Intelligent Question Generation, Answer Evaluation, and Resume Intelligence powered by Gemini and NLP",
    version="1.0.0"
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://localhost:5000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount AI routers
app.include_router(questions_router)
app.include_router(evaluation_router)
app.include_router(resume_router)
app.include_router(chat_router)
app.include_router(recommendations_router)

@app.get("/")
def root():
    return {
        "service": "PrepCoach AI Service",
        "status": "online",
        "version": "1.0.0",
        "gemini_active": settings.has_gemini_key,
        "endpoints": [
            "/api/ai/questions/generate",
            "/api/ai/evaluate/answer",
            "/api/ai/evaluate/session",
            "/api/ai/resume/analyze",
            "/api/ai/chat/message",
            "/health"
        ]
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "gemini_configured": settings.has_gemini_key,
        "model": settings.GEMINI_MODEL
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
