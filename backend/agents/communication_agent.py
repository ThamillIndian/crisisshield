import json
from core.gemini import get_model


COMMUNICATION_PROMPT = """
You are a multilingual emergency communication AI for a hotel in India.

Emergency:
- Type: {incident_type}
- Severity: {severity}

Evacuation Instructions:
{route_instructions}

Target Audience: {role} (guest | staff | admin)
Target Language Code: {language}

Generate a clear, calm, role-appropriate emergency message.

Respond ONLY with valid JSON:
{{
  "message_en": "<message in English>",
  "message_local": "<message translated to the target language>",
  "urgency": "high" | "medium" | "low"
}}

Guidelines:
- For guests: simple, reassuring, step-by-step
- For staff: direct, task-focused, professional
- For admin: comprehensive situational update
- Keep messages concise (2-3 sentences max)
- Translate accurately to the target language
"""


async def generate_message(
    incident_type: str,
    severity: str,
    route_instructions: str,
    role: str,
    language: str,
) -> dict:
    model = get_model()
    prompt = COMMUNICATION_PROMPT.format(
        incident_type=incident_type,
        severity=severity,
        route_instructions=route_instructions,
        role=role,
        language=language,
    )
    response = model.generate_content(prompt)
    return json.loads(response.text)
