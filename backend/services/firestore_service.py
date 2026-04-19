import asyncio
from datetime import datetime, timezone
from google.cloud.firestore_v1 import ArrayUnion
from core.firebase_admin import get_firestore


async def create_incident(data: dict) -> str:
    db = get_firestore()
    ref = db.collection("incidents").document()
    await asyncio.to_thread(ref.set, data)
    return ref.id


async def update_incident(incident_id: str, data: dict) -> None:
    db = get_firestore()
    ref = db.collection("incidents").document(incident_id)
    await asyncio.to_thread(ref.update, data)


async def add_timeline_event(incident_id: str, event: str) -> None:
    db = get_firestore()
    entry = {"time": datetime.now(timezone.utc).isoformat(), "event": event}
    ref = db.collection("incidents").document(incident_id)
    await asyncio.to_thread(ref.update, {"timeline": ArrayUnion([entry])})


async def get_incident(incident_id: str) -> dict | None:
    db = get_firestore()
    ref = db.collection("incidents").document(incident_id)
    snap = await asyncio.to_thread(ref.get)
    if snap.exists:
        return {"id": snap.id, **snap.to_dict()}
    return None


async def get_hotel_staff(hotel_id: str) -> list[dict]:
    db = get_firestore()
    query = (
        db.collection("users")
        .where("hotelId", "==", hotel_id)
        .where("role", "==", "staff")
    )
    # .stream() is a blocking generator, we'll fetch all docs at once in a thread
    docs = await asyncio.to_thread(lambda: list(query.stream()))
    return [{"id": d.id, **d.to_dict()} for d in docs]


async def get_hotel_floor_data(hotel_id: str, floor: int) -> dict:
    db = get_firestore()
    ref = (
        db.collection("hotels")
        .document(hotel_id)
        .collection("floors")
        .document(str(floor))
    )
    snap = await asyncio.to_thread(ref.get)
    if snap.exists:
        return snap.to_dict()
    # Default fallback floor data
    return {
        "floorNumber": floor,
        "totalFloors": 5,
        "exits": [
            {"exitId": "A", "label": "Exit A", "blocked": False},
            {"exitId": "C", "label": "Exit C", "blocked": False},
        ],
        "staircases": ["Staircase A", "Staircase B"],
    }


async def create_task(data: dict) -> str:
    db = get_firestore()
    ref = db.collection("tasks").document()
    await asyncio.to_thread(ref.set, data)
    return ref.id


async def update_task(task_id: str, data: dict) -> None:
    db = get_firestore()
    ref = db.collection("tasks").document(task_id)
    await asyncio.to_thread(ref.update, data)


async def get_incident_tasks(incident_id: str) -> list[dict]:
    db = get_firestore()
    query = (
        db.collection("tasks")
        .where("incidentId", "==", incident_id)
    )
    docs = await asyncio.to_thread(lambda: list(query.stream()))
    return [{"id": d.id, **d.to_dict()} for d in docs]


async def create_route(data: dict) -> str:
    db = get_firestore()
    ref = db.collection("routes").document()
    await asyncio.to_thread(ref.set, data)
    return ref.id


async def get_user(user_id: str) -> dict | None:
    db = get_firestore()
    ref = db.collection("users").document(user_id)
    snap = await asyncio.to_thread(ref.get)
    if snap.exists:
        return {"id": snap.id, **snap.to_dict()}
    return None


async def create_report(data: dict) -> str:
    db = get_firestore()
    ref = db.collection("reports").document()
    await asyncio.to_thread(ref.set, data)
    return ref.id


async def get_report_by_incident(incident_id: str) -> dict | None:
    db = get_firestore()
    query = (
        db.collection("reports")
        .where("incidentId", "==", incident_id)
        .limit(1)
    )
    docs = await asyncio.to_thread(lambda: list(query.stream()))
    for d in docs:
        return {"id": d.id, **d.to_dict()}
    return None


async def get_hotel_reports(hotel_id: str, limit: int = 30) -> list[dict]:
    db = get_firestore()
    # We fetch with a limit to keep it snappy. 
    # Still no order_by here to avoid requiring a composite index.
    query = (
        db.collection("reports")
        .where("hotelId", "==", hotel_id)
        .limit(limit)
    )
    docs = await asyncio.to_thread(lambda: list(query.stream()))
    reports = [{"id": d.id, **d.to_dict()} for d in docs]
    
    # Sort in-memory to keep implementation simple but fast for recent items
    reports.sort(key=lambda x: x.get("generatedAt", ""), reverse=True)
    return reports


# ─── KNOWLEDGE GROUNDING ──────────────────────────────────

async def get_hotel_knowledge(hotel_id: str) -> dict | None:
    db = get_firestore()
    ref = (
        db.collection("hotels")
        .document(hotel_id)
        .collection("knowledge")
        .document("data")
    )
    snap = await asyncio.to_thread(ref.get)
    if snap.exists:
        return snap.to_dict()
    return None


async def update_hotel_knowledge(hotel_id: str, data: dict) -> None:
    db = get_firestore()
    ref = db.collection("hotels").document(hotel_id).collection("knowledge").document("data")
    await asyncio.to_thread(ref.set, data, merge=True)
