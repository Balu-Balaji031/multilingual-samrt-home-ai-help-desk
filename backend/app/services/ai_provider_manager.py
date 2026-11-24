import asyncio

from app.services.gemini_service import GeminiService
from app.services.groq_service import GroqService
from app.core.performance import record_timing, timed_stage


GEMINI_TIMEOUT_SECONDS = 12.0


class AIProviderError(Exception):
    pass


class AIProviderManager:
    def __init__(self):
        self.gemini = GeminiService()
        self.groq = GroqService()
        
    async def get_response(self, system_prompt: str, messages: list, image_bytes: bytes = None, mime_type: str = None) -> dict:
        try:
            with timed_stage("gemini_generation", provider="gemini"):
                response = await asyncio.wait_for(
                    self.gemini.generate_response(system_prompt, messages, image_bytes, mime_type),
                    timeout=GEMINI_TIMEOUT_SECONDS,
                )
            if not image_bytes:
                record_timing("groq_fallback", 0, outcome="skipped", provider="groq")
            return response
        except Exception:
            if image_bytes:
                record_timing("groq_fallback", 0, outcome="skipped", provider="groq")
                raise AIProviderError("Vision processing is temporarily unavailable.")
            try:
                with timed_stage("groq_fallback", provider="groq"):
                    return await self.groq.generate_response(system_prompt, messages)
            except Exception as error:
                raise AIProviderError("No configured AI provider is currently available.") from error
