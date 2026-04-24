import google.generativeai as genai
from core.config import settings
import re

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


def clean_json(text: str) -> str:
    """Extract JSON from potential markdown code blocks or prose."""
    # Try to find content between ```json and ```
    match = re.search(r"```json\s+(.*?)\s+```", text, re.DOTALL)
    if match:
        return match.group(1).strip()
    
    # Fallback: try to find anything that looks like a JSON object or array
    match = re.search(r"(\{.*\}|\[.*\])", text, re.DOTALL)
    if match:
        return match.group(0).strip()
        
    return text.strip()
