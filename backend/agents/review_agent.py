import json
from core.gemini import get_model


REVIEW_PROMPT = """
You are a post-incident analysis AI for hotel emergency management.

Incident Summary:
- Type: {incident_type}
- Severity: {severity}
- Location: Floor {floor}, Room {room}
- Reported At: {reported_at}
- Resolved At: {resolved_at}

Timeline of Events:
{timeline}

Staff Task Completion:
{tasks_summary}

Metrics:
- Classification Time: {classification_time_ms}ms
- Guests Evacuated: {guests_evacuated}/{guests_total}

Generate a detailed post-incident improvement report.

Respond ONLY with valid JSON:
{{
  "response_summary": "<2-3 sentence overall summary>",
  "metrics": {{
    "classificationTimeMs": {classification_time_ms},
    "firstStaffResponseSec": <integer>,
    "totalEvacuationSec": <integer>,
    "guestsEvacuated": {guests_evacuated},
    "guestsTotal": {guests_total}
  }},
  "whatWorkedWell": ["<point 1>", "<point 2>", "<point 3>"],
  "areasToImprove": ["<area 1>", "<area 2>"],
  "recommendations": ["<rec 1>", "<rec 2>", "<rec 3>"]
}}
"""


async def generate_report(
    incident_type: str,
    severity: str,
    floor: int,
    room: str,
    reported_at: str,
    resolved_at: str,
    timeline: list[dict],
    tasks_summary: list[dict],
    classification_time_ms: int,
    guests_evacuated: int,
    guests_total: int,
) -> dict:
    model = get_model()

    timeline_text = "\n".join(
        [f"- [{e['time']}] {e['event']}" for e in timeline]
    )
    tasks_text = "\n".join(
        [f"- {t.get('title', 'Task')}: {t.get('status', 'unknown')}" for t in tasks_summary]
    )

    prompt = REVIEW_PROMPT.format(
        incident_type=incident_type,
        severity=severity,
        floor=floor,
        room=room,
        reported_at=reported_at,
        resolved_at=resolved_at,
        timeline=timeline_text or "No timeline recorded",
        tasks_summary=tasks_text or "No tasks recorded",
        classification_time_ms=classification_time_ms,
        guests_evacuated=guests_evacuated,
        guests_total=guests_total,
    )
    response = model.generate_content(prompt)
    return json.loads(response.text)
