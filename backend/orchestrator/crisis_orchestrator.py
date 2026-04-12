import time
from datetime import datetime, timezone

from agents.classification_agent import classify_incident
from agents.allocation_agent import allocate_resources
from agents.routing_agent import generate_route
from agents.communication_agent import generate_message
from services.firestore_service import (
    create_incident,
    update_incident,
    get_hotel_staff,
    get_hotel_floor_data,
    create_task,
    create_route,
    add_timeline_event,
)
from services.fcm_service import notify_user, notify_hotel_staff
from models.incident import ReportIncidentRequest


async def handle_new_incident(req: ReportIncidentRequest) -> str:
    """
    Full orchestration pipeline triggered on every new incident report.
    Returns the created incident ID.
    """
    start_ms = int(time.time() * 1000)
    now = datetime.now(timezone.utc).isoformat()

    # ── Step 1: Create incident record in Firestore ──────────────────
    incident_id = await create_incident({
        "hotelId": req.hotelId,
        "reportedBy": req.userId,
        "reportedAt": now,
        "inputType": req.inputType,
        "rawInput": req.rawInput,
        "language": req.language,
        "type": "unknown",
        "severity": "medium",
        "confidence": 0.0,
        "location": {"floor": req.floor, "room": req.room},
        "status": "active",
        "timeline": [{"time": now, "event": "Incident reported by guest"}],
    })

    # ── Step 2: Classification Agent ─────────────────────────────────
    classification = await classify_incident(
        raw_input=req.rawInput,
        language=req.language,
        hotel_id=req.hotelId,
        floor=req.floor,
        room=req.room,
    )
    classification_ms = int(time.time() * 1000) - start_ms

    await update_incident(incident_id, {
        "type": classification.type,
        "severity": classification.severity,
        "confidence": classification.confidence,
    })
    await add_timeline_event(
        incident_id,
        f"AI classified as {classification.type.upper()} — {classification.severity.upper()} "
        f"(confidence: {int(classification.confidence * 100)}%)"
    )

    # ── Step 3: Get hotel data ────────────────────────────────────────
    staff_list = await get_hotel_staff(req.hotelId)
    floor_data = await get_hotel_floor_data(req.hotelId, req.floor)

    # ── Step 4: Resource Allocation Agent ────────────────────────────
    assignments = await allocate_resources(
        incident_type=classification.type,
        severity=classification.severity,
        floor=req.floor,
        room=req.room,
        summary=classification.summary_en,
        staff_list=staff_list,
    )

    for assignment in assignments:
        task_id = await create_task({
            "incidentId": incident_id,
            "hotelId": req.hotelId,
            "assignedTo": assignment["staffId"],
            "staffRole": assignment["staffRole"],
            "title": assignment["title"],
            "description": assignment["description"],
            "priority": assignment["priority"],
            "status": "pending",
            "assignedAt": datetime.now(timezone.utc).isoformat(),
        })
        await notify_user(
            user_id=assignment["staffId"],
            title=f"🚨 Emergency Task: {classification.type.upper()}",
            body=assignment["title"],
            data={"incidentId": incident_id, "taskId": task_id, "type": "task_assigned"},
        )

    await add_timeline_event(
        incident_id,
        f"Tasks assigned to {len(assignments)} staff members"
    )

    # ── Step 5: Routing Agent ─────────────────────────────────────────
    exits = floor_data.get("exits", [])
    available_exits = [e["label"] for e in exits if not e.get("blocked", False)]
    blocked_exits = [e["label"] for e in exits if e.get("blocked", False)]
    staircases = floor_data.get("staircases", ["Staircase A", "Staircase B"])

    route_data = await generate_route(
        incident_type=classification.type,
        floor=req.floor,
        room=req.room,
        total_floors=floor_data.get("totalFloors", 5),
        available_exits=available_exits,
        blocked_exits=blocked_exits,
        staircases=staircases,
    )

    await create_route({
        "incidentId": incident_id,
        "hotelId": req.hotelId,
        "floor": req.floor,
        **route_data,
        "isBlocked": False,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    })
    await add_timeline_event(
        incident_id,
        f"Evacuation route generated via {route_data.get('exitUsed', 'Exit')}"
    )

    # ── Step 6: Communication Agent — notify the reporting guest ──────
    route_instructions = " → ".join(
        [s["instruction"] for s in route_data.get("path", [])]
    )
    guest_msg = await generate_message(
        incident_type=classification.type,
        severity=classification.severity,
        route_instructions=route_instructions,
        role="guest",
        language=req.language,
    )
    await notify_user(
        user_id=req.userId,
        title="🚨 Emergency Instructions",
        body=guest_msg.get("message_local") or guest_msg.get("message_en", "Please evacuate immediately."),
        data={"incidentId": incident_id, "type": "evacuation_route"},
    )
    await add_timeline_event(incident_id, "Guest evacuation instructions sent")

    return incident_id
