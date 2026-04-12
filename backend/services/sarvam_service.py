import httpx
from core.config import settings


async def speech_to_text(audio_bytes: bytes, language: str = "hi-IN") -> str:
    """Convert audio bytes to text using Sarvam STT API."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.sarvam_api_base}/speech-to-text",
            headers={"api-subscription-key": settings.sarvam_api_key},
            files={"file": ("audio.wav", audio_bytes, "audio/wav")},
            data={"language_code": language, "model": "saarika:v2"},
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        return data.get("transcript", "")


async def text_to_speech(text: str, language: str = "hi-IN") -> bytes:
    """Convert text to audio bytes using Sarvam TTS API."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.sarvam_api_base}/text-to-speech",
            headers={
                "api-subscription-key": settings.sarvam_api_key,
                "Content-Type": "application/json",
            },
            json={
                "inputs": [text],
                "target_language_code": language,
                "speaker": "meera",
                "model": "bulbul:v1",
            },
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        audios = data.get("audios", [])
        if audios:
            import base64
            return base64.b64decode(audios[0])
        return b""


async def translate_text(text: str, source_language: str, target_language: str) -> str:
    """Translate text between Indian languages using Sarvam Translate API."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.sarvam_api_base}/translate",
            headers={
                "api-subscription-key": settings.sarvam_api_key,
                "Content-Type": "application/json",
            },
            json={
                "input": text,
                "source_language_code": source_language,
                "target_language_code": target_language,
                "model": "mayura:v1",
            },
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        return data.get("translated_text", text)
