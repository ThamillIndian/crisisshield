import google.generativeai as genai
from core.config import settings

_model = None


def init_gemini() -> None:
    genai.configure(api_key=settings.gemini_api_key)


def get_model():
    global _model
    if _model is None:
        _model = genai.GenerativeModel(
            model_name=settings.gemini_model,
            generation_config={
                "temperature": 0.1,
                "response_mime_type": "application/json",
            },
        )
    return _model
