import json
from core.gemini import get_model


ROUTING_PROMPT = """
You are an evacuation routing AI for a hotel emergency system.

Emergency:
- Type: {incident_type}
- Floor: {floor}
- Room: {room}

Floor Layout:
- Total floors: {total_floors}
- Available exits: {available_exits}
- Blocked exits: {blocked_exits}
- Staircases: {staircases}

Generate the safest evacuation route for guests on floor {floor}.

Respond ONLY with valid JSON:
{{
  "path": [
    {{"step": 1, "instruction": "<clear step instruction>"}},
    {{"step": 2, "instruction": "<clear step instruction>"}},
    {{"step": 3, "instruction": "<clear step instruction>"}}
  ],
  "exitUsed": "<exit label e.g. Exit C>",
  "estimatedTimeSeconds": <integer>,
  "warning": "<important safety warning or null>"
}}

Rules:
- Never route through blocked exits
- For fire: avoid elevators, use staircases
- For medical: fastest route to ground floor
- Keep instructions clear and brief
"""


async def generate_route(
    incident_type: str,
    floor: int,
    room: str,
    total_floors: int,
    available_exits: list[str],
    blocked_exits: list[str],
    staircases: list[str],
) -> dict:
    model = get_model()
    prompt = ROUTING_PROMPT.format(
        incident_type=incident_type,
        floor=floor,
        room=room,
        total_floors=total_floors,
        available_exits=", ".join(available_exits) or "None",
        blocked_exits=", ".join(blocked_exits) or "None",
        staircases=", ".join(staircases) or "None",
    )
    response = model.generate_content(prompt)
    return json.loads(response.text)
