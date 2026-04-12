from datetime import datetime, timezone
from google.cloud.firestore_v1 import ArrayUnion
from core.firebase_admin import get_firestore


async def create_incident(data: dict) -> str:
    db = get_firestore()
    ref = db.collection("incidents").document()
    ref.set(data)
    return ref.id


async def update_incident(incident_id: str, data: dict) -> None:
    db = get_firestore()
    db.collection("incidents").document(incident_id).update(data)


async def add_timeline_event(incident_id: str, event: str) -> None:
    db = get_firestore()
    entry = {"time": datetime.now(timezone.utc).isoformat(), "event": event}
    db.collection("incidents").document(incident_id).update(
        {"timeline": ArrayUnion([entry])}
    )


async def get_incident(incident_id: str) -> dict | None:
    db = get_firestore()
    snap = db.collection("incidents").document(incident_id).get()
    if snap.exists:
        return {"id": snap.id, **snap.to_dict()}
    return None


async def get_hotel_staff(hotel_id: str) -> list[dict]:
    db = get_firestore()
    docs = (
        db.collection("users")
        .where("hotelId", "==", hotel_id)
        .where("role", "==", "staff")
        .stream()
    )
    return [{"id": d.id, **d.to_dict()} for d in docs]


async def get_hotel_floor_data(hotel_id: str, floor: int) -> dict:
    db = get_firestore()
    snap = (
        db.collection("hotels")
        .document(hotel_id)
        .collection("floors")
        .document(str(floor))
        .get()
    )
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
    ref.set(data)
    return ref.id


async def update_task(task_id: str, data: dict) -> None:
    db = get_firestore()
    db.collection("tasks").document(task_id).update(data)


async def get_incident_tasks(incident_id: str) -> list[dict]:
    db = get_firestore()
    docs = (
        db.collection("tasks")
        .where("incidentId", "==", incident_id)
        .stream()
    )
    return [{"id": d.id, **d.to_dict()} for d in docs]


async def create_route(data: dict) -> str:
    db = get_firestore()
    ref = db.collection("routes").document()
    ref.set(data)
    return ref.id


async def get_user(user_id: str) -> dict | None:
    db = get_firestore()
    snap = db.collection("users").document(user_id).get()
    if snap.exists:
        return {"id": snap.id, **snap.to_dict()}
    return None


async def create_report(data: dict) -> str:
    db = get_firestore()
    ref = db.collection("reports").document()
    ref.set(data)
    return ref.id


async def get_report_by_incident(incident_id: str) -> dict | None:
    db = get_firestore()
    docs = (
        db.collection("reports")
        .where("incidentId", "==", incident_id)
        .limit(1)
        .stream()
    )
    for d in docs:
        return {"id": d.id, **d.to_dict()}
    return None
