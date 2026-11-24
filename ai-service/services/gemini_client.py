import json
import logging
from typing import Optional, Any, Dict
from config.settings import settings

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.client = None
        self.model_name = settings.GEMINI_MODEL
        if settings.has_gemini_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
                logger.info(f"Gemini client successfully initialized with model {self.model_name}")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini client: {e}")
                self.client = None
        else:
            logger.warning("No valid GEMINI_API_KEY found. AI service will operate using intelligent heuristic fallback engine.")

    @property
    def is_available(self) -> bool:
        return self.client is not None

    def generate_text(self, prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
        if not self.is_available:
            return None
        try:
            from google.genai import types
            config = types.GenerateContentConfig()
            if system_instruction:
                config.system_instruction = system_instruction
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini generate_text error: {e}")
            return None

    def generate_json(self, prompt: str, system_instruction: Optional[str] = None) -> Optional[Dict[str, Any]]:
        if not self.is_available:
            return None
        try:
            from google.genai import types
            config = types.GenerateContentConfig(
                response_mime_type="application/json"
            )
            if system_instruction:
                config.system_instruction = system_instruction
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config
            )
            if response.text:
                cleaned = response.text.strip()
                if cleaned.startswith("```json"):
                    cleaned = cleaned[7:]
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3]
                return json.loads(cleaned.strip())
            return None
        except Exception as e:
            logger.error(f"Gemini generate_json error: {e}")
            return None

gemini_service = GeminiService()
