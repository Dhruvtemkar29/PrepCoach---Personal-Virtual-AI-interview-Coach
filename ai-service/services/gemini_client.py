import json
import logging
import httpx
from typing import Optional, Any, Dict
from config.settings import settings

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.client = None
        self.model_name = settings.GEMINI_MODEL
        self.grok_key = settings.GROK_API_KEY
        self.grok_url = f"{settings.GROK_BASE_URL.rstrip('/')}/chat/completions"
        self.grok_model = settings.GROK_MODEL

        if settings.has_grok_key:
            logger.info(f"Grok/Groq client configured with model {self.grok_model} at {settings.GROK_BASE_URL}")

        if settings.has_gemini_key:
            try:
                from google import genai
                from google.genai import types
                self.client = genai.Client(
                    api_key=settings.GEMINI_API_KEY,
                    http_options=types.HttpOptions(timeout=12000)
                )
                logger.info(f"Gemini client successfully initialized with model {self.model_name}")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini client: {e}")
                self.client = None

        if not self.is_available:
            logger.warning("No valid LLM API key found. AI service will operate using intelligent heuristic fallback engine.")

    @property
    def is_available(self) -> bool:
        return settings.has_grok_key or (self.client is not None)

    def _call_grok(self, prompt: str, system_instruction: Optional[str] = None, json_mode: bool = False) -> Optional[str]:
        if not settings.has_grok_key:
            return None
        try:
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})

            payload: Dict[str, Any] = {
                "model": self.grok_model,
                "messages": messages,
                "temperature": 0.7,
            }
            if json_mode:
                payload["response_format"] = {"type": "json_object"}

            headers = {
                "Authorization": f"Bearer {self.grok_key}",
                "Content-Type": "application/json",
            }
            with httpx.Client(timeout=20.0) as http_client:
                resp = http_client.post(self.grok_url, json=payload, headers=headers)
                if resp.status_code >= 400:
                    logger.error(f"Grok/Groq/OpenAI API error {resp.status_code}: {resp.text}")
                    return None
                data = resp.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"Grok/Groq API error: {e}")
            return None

    def generate_text(self, prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
        if settings.has_grok_key:
            grok_text = self._call_grok(prompt, system_instruction=system_instruction, json_mode=False)
            if grok_text:
                return grok_text

        if self.client is None:
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
        if settings.has_grok_key:
            grok_text = self._call_grok(prompt, system_instruction=system_instruction, json_mode=True)
            if grok_text:
                try:
                    cleaned = grok_text.strip()
                    if cleaned.startswith("```json"):
                        cleaned = cleaned[7:]
                    if cleaned.endswith("```"):
                        cleaned = cleaned[:-3]
                    return json.loads(cleaned.strip())
                except Exception as e:
                    logger.error(f"Grok/Groq JSON parse error: {e}")

        if self.client is None:
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
