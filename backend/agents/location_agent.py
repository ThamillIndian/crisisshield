import json
import re

from core.gemini import clean_json, get_model
from models.incident import LocationExtractionResult


LOCATION_PROMPT = """
You extract the ACTUAL INCIDENT location from a hotel emergency report.

Emergency report: "{raw_input}"
Language code: "{language}"
Reporter profile location: Floor {reporter_floor}, Room {reporter_room}

Important:
- Reporter location and incident location can be different.
- Incident location is where danger/help is needed.
- If text says "I am in 105, smoke near 503", incident is 503.
- If location is unclear, return null fields and low confidence.

Return ONLY valid JSON:
{{
  "incident_floor": <int or null>,
  "incident_room": <string or null>,
  "confidence": <float 0.0-1.0>,
  "reason": "<brief reason>"
}}
"""


def _fallback_extract(raw_input: str) -> tuple[int | None, str | None]:
    # Fast deterministic fallback for inputs like "room 503" or "floor 5 room 503".
    room_match = re.search(r"\broom\s*[-:]?\s*([A-Za-z]?\d{2,4})\b", raw_input, re.IGNORECASE)
    floor_match = re.search(r"\bfloor\s*[-:]?\s*(\d{1,2})\b", raw_input, re.IGNORECASE)

    room = room_match.group(1) if room_match else None
    floor = int(floor_match.group(1)) if floor_match else None

    if floor is None and room:
        digits = re.search(r"(\d+)", room)
        if digits and len(digits.group(1)) >= 2:
            floor = int(digits.group(1)[0])

    return floor, room


async def extract_incident_location(
    raw_input: str,
    language: str,
    reporter_floor: int,
    reporter_room: str,
) -> LocationExtractionResult:
    model = get_model()
    prompt = LOCATION_PROMPT.format(
        raw_input=raw_input,
        language=language,
        reporter_floor=reporter_floor,
        reporter_room=reporter_room,
    )

    try:
        response = model.generate_content(prompt)
        data = json.loads(clean_json(response.text))
        result = LocationExtractionResult(**data)
    except Exception:
        result = LocationExtractionResult()

    fallback_floor, fallback_room = _fallback_extract(raw_input)
    if not result.incident_room and fallback_room:
        result.incident_room = fallback_room
    if result.incident_floor is None and fallback_floor is not None:
        result.incident_floor = fallback_floor
    if result.confidence == 0.0 and (result.incident_floor is not None or result.incident_room):
        result.confidence = 0.75
        if not result.reason:
            result.reason = "location inferred from explicit room/floor mention in report text"

    return result
