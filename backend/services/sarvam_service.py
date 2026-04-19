import io
from sarvamai import SarvamAI
from core.config import settings


def get_client():
    return SarvamAI(api_subscription_key=settings.sarvam_api_key)


async def speech_to_text(audio_bytes: bytes, language: str = "hi-IN") -> str:
    """Convert audio bytes to text using Sarvam's SOTA Saaras:v3 model."""
    client = get_client()
    
    # The SDK Expects a file-like object
    audio_file = io.BytesIO(audio_bytes)
    audio_file.name = "audio.wav"
    
    try:
        response = client.speech_to_text.transcribe(
            file=audio_file,
            model="saaras:v3",
            language_code=language,
        )
        # response is an object, use attribute access
        return getattr(response, "transcript", "")
    except Exception as e:
        print(f"Sarvam STT Error: {e}")
        return ""


async def speech_to_english(audio_bytes: bytes) -> str:
    """
    Multilingual Speech-to-English translation.
    Automatically detects the spoken Indian language and returns English text.
    """
    client = get_client()
    audio_file = io.BytesIO(audio_bytes)
    audio_file.name = "audio.wav"

    try:
        # 'translate' mode in v3 automatically maps speech to English
        response = client.speech_to_text.transcribe(
            file=audio_file,
            model="saaras:v3",
            mode="translate"
        )
        return getattr(response, "transcript", "")
    except Exception as e:
        print(f"Sarvam Translation Error: {e}")
        return ""


async def text_to_speech(text: str, language: str = "hi-IN") -> bytes:
    """Convert text to warm, natural audio using Bulbul:v1."""
    client = get_client()
    try:
        response = client.text_to_speech.generate(
            inputs=[text],
            target_language_code=language,
            speaker="meera",
            model="bulbul:v1",
        )
        
        import base64
        # Handle both object and dict style response
        audios = getattr(response, "audios", []) if not isinstance(response, dict) else response.get("audios", [])
        if audios:
            return base64.b64decode(audios[0])
        return b""
    except Exception as e:
        print(f"Sarvam TTS Error: {e}")
        return b""


async def translate_text(text: str, source_language: str, target_language: str) -> str:
    """Translate text between Indian languages using Mayura:v1."""
    client = get_client()
    try:
        response = client.translation.translate(
            input=text,
            source_language_code=source_language,
            target_language_code=target_language,
            model="mayura:v1",
        )
        return getattr(response, "translated_text", text) if not isinstance(response, dict) else response.get("translated_text", text)
    except Exception as e:
        print(f"Sarvam Translation Error: {e}")
        return text
