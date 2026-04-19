import json
from core.gemini import get_model


COMMUNICATION_PROMPT = """
You are a multilingual emergency communication AI for a hotel in India.

[SITE-SPECIFIC KNOWLEDGE]:
{knowledge_context}

Emergency:
- Type: {incident_type}
- Severity: {severity}

Evacuation Instructions:
{route_instructions}

Target Audience: {role} (guest | staff | admin)
Target Language Code: {language}

Generate a clear, calm, role-appropriate emergency message. Use the site-specific knowledge (like assembly points or protocol details) if they improve the message's clarity or accuracy.

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
    prompt = COMMUNICATION_PROMPT.format(
        knowledge_context=knowledge_context,
        incident_type=incident_type,
        severity=severity,
        route_instructions=route_instructions,
        role=role,
        language=language,
    )
    response = model.generate_content(prompt)
    return json.loads(response.text)
