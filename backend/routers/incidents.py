from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone

from models.incident import ReportIncidentRequest, ResolveIncidentRequest
from orchestrator.crisis_orchestrator import handle_new_incident
from services.firestore_service import (
    get_incident, update_incident, add_timeline_event,
    get_incident_tasks, create_report,
)
from agents.review_agent import generate_report
from services.fcm_service import broadcast_to_hotel

router = APIRouter(prefix="/incidents", tags=["incidents"])


@router.post("/report")
async def report_incident(req: ReportIncidentRequest):
    try:
        incident_id = await handle_new_incident(req)
        return {"incidentId": incident_id, "status": "processing"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{incident_id}")
async def get_incident_detail(incident_id: str):
    incident = await get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.patch("/{incident_id}/resolve")
async def resolve_incident(incident_id: str, req: ResolveIncidentRequest):
    incident = await get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    now = datetime.now(timezone.utc).isoformat()
    await update_incident(incident_id, {
        "status": "resolved",
        "resolvedAt": now,
        "resolvedBy": req.resolvedBy,
    })
    await add_timeline_event(incident_id, "All clear declared by admin — Incident resolved")

    # Notify all guests in hotel
    await broadcast_to_hotel(
        hotel_id=incident["hotelId"],
        title="✅ All Clear",
        body="The emergency has been resolved. You may return safely. Thank you.",
        data={"incidentId": incident_id, "type": "all_clear"},
    )

    # Generate post-incident report asynchronously
    tasks = await get_incident_tasks(incident_id)
    reported_at = incident.get("reportedAt", now)

    try:
        report_data = await generate_report(
            incident_type=incident.get("type", "unknown"),
            severity=incident.get("severity", "medium"),
            floor=incident.get("location", {}).get("floor", 1),
            room=incident.get("location", {}).get("room", "unknown"),
            reported_at=reported_at,
            resolved_at=now,
            timeline=incident.get("timeline", []),
            tasks_summary=tasks,
            classification_time_ms=3000,
            guests_evacuated=len(tasks),
            guests_total=len(tasks),
        )
        await create_report({
            "incidentId": incident_id,
            "hotelId": incident["hotelId"],
            "generatedAt": now,
            "generatedBy": "gemini-ai",
            "fullTimeline": incident.get("timeline", []),
            **report_data,
        })
    except Exception:
        pass

    return {"status": "resolved"}
