import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from ai-service directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    def __init__(self):
        self.PORT: int = int(os.getenv("PORT", "8000"))
        self.HOST: str = os.getenv("HOST", "0.0.0.0")
        self.GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
        self.GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
        self.GROK_API_KEY: str = (os.getenv("GROK_API_KEY") or os.getenv("GROQ_API_KEY") or "").strip()
        if self.GROK_API_KEY.startswith("gsk_"):
            default_grok_url = "https://api.groq.com/openai/v1"
            default_grok_model = "openai/gpt-oss-20b"
        elif self.GROK_API_KEY.startswith("sk-or-"):
            default_grok_url = "https://openrouter.ai/api/v1"
            default_grok_model = "x-ai/grok-2-1212"
        elif self.GROK_API_KEY.startswith("sk-"):
            default_grok_url = "https://api.openai.com/v1"
            default_grok_model = "gpt-4o-mini"
        else:
            default_grok_url = "https://api.x.ai/v1"
            default_grok_model = "grok-2-latest"
        self.GROK_BASE_URL: str = os.getenv("GROK_BASE_URL", default_grok_url).strip()
        self.GROK_MODEL: str = os.getenv("GROK_MODEL", default_grok_model).strip()
        self.NODE_BACKEND_URL: str = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")
        self.FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    @property
    def has_gemini_key(self) -> bool:
        return bool(self.GEMINI_API_KEY and len(self.GEMINI_API_KEY) > 5)

    @property
    def has_grok_key(self) -> bool:
        return bool(self.GROK_API_KEY and len(self.GROK_API_KEY) > 5)

settings = Settings()
