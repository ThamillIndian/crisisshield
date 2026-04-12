from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Response
from services.sarvam_service import speech_to_text, text_to_speech

router = APIRouter(prefix="/voice", tags=["voice"])


@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = Form(default="hi-IN"),
):
    audio_bytes = await file.read()
    try:
        transcript = await speech_to_text(audio_bytes, language)
        return {"transcript": transcript, "language": language}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {e}")


@router.post("/speak")
async def speak_text(text: str, language: str = "hi-IN"):
    try:
        audio_bytes = await text_to_speech(text, language)
        return Response(content=audio_bytes, media_type="audio/wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {e}")
