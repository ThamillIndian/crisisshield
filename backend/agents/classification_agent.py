import json
from core.gemini import get_model
from models.incident import IncidentClassification


CLASSIFICATION_PROMPT = """
You are a crisis classification AI for a hotel emergency response system in India.

Guest report: "{raw_input}"
Guest language code: "{language}"
Hotel: "{hotel_id}", Floor: {floor}, Room: {room}

Analyze the report and classify the emergency. Be sensitive to Indian languages and contexts.

Respond ONLY with valid JSON:
{{
  "type": "fire" | "medical" | "security" | "unknown",
  "severity": "critical" | "high" | "medium" | "low",
  "confidence": <float 0.0-1.0>,
  "summary_en": "<brief English summary of the situation>",
  "immediate_action": "<single most important action for the guest right now>"
}}

Severity guidelines:
- critical: immediate life threat, active fire/smoke, unconscious person, armed threat
- high: injury, chest pain, visible fire risk, suspicious person
- medium: minor injury, unusual smell, suspicious activity
- low: general concern, precautionary report
"""


async def classify_incident(
    raw_input: str,
    language: str,
    hotel_id: str,
    floor: int,
    room: str,
) -> IncidentClassification:
    model = get_model()
    prompt = CLASSIFICATION_PROMPT.format(
        raw_input=raw_input,
        language=language,
        hotel_id=hotel_id,
        floor=floor,
        room=room,
    )
    response = model.generate_content(prompt)
    data = json.loads(response.text)
    return IncidentClassification(**data)
