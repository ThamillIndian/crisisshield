import io
from sarvamai import SarvamAI
from core.config import settings


def get_client():
    return SarvamAI(api_subscription_key=settings.sarvam_api_key)


async def speech_to_text(audio_bytes: bytes, language: str = "hi-IN") -> str:
    """Convert audio bytes to text using Sarvam's SOTA Saaras:v3 model."""
    client = get_client()
    audio_file = io.BytesIO(audio_bytes)
    audio_file.name = "audio.wav"
    
    try:
        response = client.speech_to_text.transcribe(
            file=audio_file,
            model="saaras:v3",
            language_code=language,
        )
        # Handle both object and dict style response
        if isinstance(response, dict):
            return response.get("transcript", "")
        return getattr(response, "transcript", "")
    except Exception as e:
        print(f"Sarvam STT Error: {e}")
        return ""


async def speech_to_english(audio_bytes: bytes) -> str:
    """
    Multilingual Speech-to-English translation.
    Successfully handles Indian accents and multiple languages.
    """
    client = get_client()
    audio_file = io.BytesIO(audio_bytes)
    audio_file.name = "audio.wav"

    try:
        # ATTEMPT 1: Saaras:v3 with automatic translation
        print("[SARVAM DEBUG] Attempt 1: Saaras:v3 (Translate mode)...")
        response = client.speech_to_text.transcribe(
            file=audio_file,
            model="saaras:v3",
            mode="translate"
        )
        
        transcript = ""
        if isinstance(response, dict):
            transcript = response.get("transcript", "")
        else:
            transcript = getattr(response, "transcript", "")
        
        if transcript:
            print(f"[SARVAM DEBUG] Attempt 1 Success: \"{transcript}\"")
            return transcript

        # ATTEMPT 2: Fallback to raw transcription (no translation mode)
        print("[SARVAM DEBUG] Attempt 2: Saaras:v3 (Raw STT mode)...")
        audio_file.seek(0)
        response = client.speech_to_text.transcribe(
            file=audio_file,
            model="saaras:v3"
        )
        if isinstance(response, dict):
            transcript = response.get("transcript", "")
        else:
            transcript = getattr(response, "transcript", "")

        if transcript:
            print(f"[SARVAM DEBUG] Attempt 2 Success: \"{transcript}\"")
            return transcript
            
        # ATTEMPT 3: GEMINI SUPREME FALLBACK (The most robust)
        # Using Gemini's multimodal capabilities to "listen" to the audio if specialized models fail.
        print("[SARVAM DEBUG] Attempt 3: Gemini Multimodal Fallback...")
        from core.gemini import get_model
        # We need a new model instance without the JSON constraint for raw transcription
        import google.generativeai as genai
        audio_model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = "Listen to this audio and transcribe exactly what is said. Respond ONLY with the transcript text. If nothing is said, respond with nothing."
        audio_data = {
            "mime_type": "audio/wav",
            "data": audio_bytes
        }
        
        response = audio_model.generate_content([prompt, audio_data])
        transcript = response.text.strip()
        
        if transcript:
            print(f"[SARVAM DEBUG] Attempt 3 (Gemini) Success: \"{transcript}\"")
            return transcript

        print("[SARVAM DEBUG] All STT attempts yielded empty strings.")
        return ""
    except Exception as e:
        print(f"\n❌ SARVAM/GEMINI STT ERROR: {e}")
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
