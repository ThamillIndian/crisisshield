import json
from core.gemini import get_model


ROUTING_PROMPT = """
You are a spatial evacuation routing AI for a hotel emergency system.
Your goal is to map the safest path on a virtual 100x100 coordinate grid.

Emergency:
- Type: {incident_type}
- Floor: {floor}
- Room: {room}

Floor Layout:
- Total floors: {total_floors}
- Available exits: {available_exits}
- Blocked exits: {blocked_exits}
- Staircases: {staircases}

TASK:
1. Determine the best exit.
2. Generate a step-by-step path.
3. Assign (x, y) coordinates for EVERY step and key point on a 100x100 grid.
   - (0,0) is Top-Left, (100,100) is Bottom-Right.
   - Place Room {room} and the Exits logically (e.g. rooms along corridors, exits at building edges).

Respond ONLY with valid JSON:
{{
  "path": [
    {{"step": 1, "instruction": "<text>", "x": <int>, "y": <int>}},
    {{"step": 2, "instruction": "<text>", "x": <int>, "y": <int>}}
  ],
  "spatialData": {{
    "guestPos": {{"x": <int>, "y": <int>}},
    "exitPos": {{"x": <int>, "y": <int>}},
    "dangerPos": {{"x": <int>, "y": <int>}}
  }},
  "exitUsed": "<exit label>",
  "estimatedTimeSeconds": <int>,
  "warning": "<text or null>"
}}

Rules:
- Never route through blocked exits.
- For fire: avoid elevators, use staircases.
- Ensure the path coordinates create a continuous logical line.
"""


from core.gemini import get_model, clean_json


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
    return json.loads(clean_json(response.text))
