import json
from core.gemini import get_model


COMMUNICATION_PROMPT = """
You are a multilingual emergency communication AI for a hotel in India.

[SITE-SPECIFIC KNOWLEDGE]:
{knowledge_context}

Emergency Context:
- Type: {incident_type}
- Severity: {severity}

Status:
{route_status}

Target Audience: {role} (guest | staff | admin)
Target Language Code: {language}

Instruction Guidelines:
1. If "Evacuation Route" is provided: Guide the user safely to the exit using those steps.
2. If "NO Evacuation Needed": Use the [SITE-SPECIFIC KNOWLEDGE] to provide comfort, safety protocols, or first-aid instructions. (e.g. "Stay calm, medical staff is arriving with water," or "Help is on the way to Room 205").
3. Be calm, clear, and reassuring.

Respond ONLY with valid JSON:
{{
  "message_en": "<message in English>",
  "message_local": "<message translated to the target language>",
  "urgency": "high" | "medium" | "low"
}}
"""


async def generate_message(
    incident_type: str,
    severity: str,
    route_instructions: str,
    role: str,
    language: str,
    knowledge_context: str = "",
) -> dict:
    model = get_model()
    
    route_status = f"Evacuation Route Provided:\n{route_instructions}" if route_instructions else "NO Evacuation Needed. Stay in place."
    
    prompt = COMMUNICATION_PROMPT.format(
        knowledge_context=knowledge_context,
        incident_type=incident_type,
        severity=severity,
        route_status=route_status,
        role=role,
        language=language,
    )
    response = model.generate_content(prompt)
    return json.loads(response.text)
