from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Response
from services.sarvam_service import speech_to_text, text_to_speech, speech_to_english
from orchestrator.crisis_orchestrator import handle_new_incident
from models.incident import ReportIncidentRequest

router = APIRouter(prefix="/voice", tags=["voice"])


@router.post("/report")
async def voice_report(
    file: UploadFile = File(...),
    userId: str = Form(...),
    hotelId: str = Form(...),
    floor: int = Form(...),
    room: str = Form(...),
):
    """
    Handle an emergency report sent via voice.
    1. Translate speech to English.
    2. Trigger incident orchestration.
    """
    audio_bytes = await file.read()
    try:
        # Get English transcript from any spoken Indian language
        english_transcript = await speech_to_english(audio_bytes)
        
        if not english_transcript:
            raise HTTPException(status_code=400, detail="Could not understand the emergency report. Please try again or type.")

        print(f"\n[VOICE REPORT] Translated transcript: \"{english_transcript}\"")
        # Create structured request for the orchestrator
        req = ReportIncidentRequest(
            userId=userId,
            hotelId=hotelId,
            inputType="voice",
            rawInput=english_transcript,
            language="en", # Sarvam translated it to English
            floor=floor,
            room=room
        )
        
        incident_id = await handle_new_incident(req)
        return {
            "incidentId": incident_id, 
            "transcript": english_transcript,
            "status": "incident_created"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice reporting failed: {e}")


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
