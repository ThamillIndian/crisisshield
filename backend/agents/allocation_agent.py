import json
from core.gemini import get_model


ALLOCATION_PROMPT = """
You are a resource allocation AI for a hotel emergency response system.

Emergency Details:
- Type: {incident_type}
- Severity: {severity}
- Floor: {floor}
- Room: {room}
- Summary: {summary}

Available Staff:
{staff_list}

Assign tasks to the most relevant staff members based on their roles.
Each staff member should receive clear, actionable tasks.

Respond ONLY with valid JSON:
{{
  "assignments": [
    {{
      "staffId": "<staff user id>",
      "staffRole": "<their role>",
      "title": "<short task title>",
      "description": "<detailed task instruction>",
      "priority": <1|2|3>
    }}
  ]
}}

Priority: 1 = highest urgency, 3 = lowest urgency.
Assign tasks to ALL relevant staff. Skip irrelevant roles.
"""


async def allocate_resources(
    incident_type: str,
    severity: str,
    floor: int,
    room: str,
    summary: str,
    staff_list: list[dict],
) -> list[dict]:
    if not staff_list:
        return []

    model = get_model()
    staff_text = "\n".join(
        [f"- ID: {s['id']}, Name: {s['name']}, Role: {s['staffRole']}" for s in staff_list]
    )
    prompt = ALLOCATION_PROMPT.format(
        incident_type=incident_type,
        severity=severity,
        floor=floor,
        room=room,
        summary=summary,
        staff_list=staff_text,
    )
    response = model.generate_content(prompt)
    data = json.loads(response.text)
    return data.get("assignments", [])
