from core.firebase_admin import get_messaging, get_firestore


async def notify_user(user_id: str, title: str, body: str, data: dict | None = None) -> None:
    db = get_firestore()
    user_snap = db.collection("users").document(user_id).get()
    if not user_snap.exists:
        return

    user_data = user_snap.to_dict()
    fcm_token = user_data.get("fcmToken")
    if not fcm_token:
        return

    messaging = get_messaging()
    message = messaging.Message(
        notification=messaging.Notification(title=title, body=body),
        data={k: str(v) for k, v in (data or {}).items()},
        token=fcm_token,
    )
    try:
        messaging.send(message)
    except Exception:
        pass


async def notify_hotel_staff(hotel_id: str, title: str, body: str, data: dict | None = None) -> None:
    db = get_firestore()
    staff_docs = (
        db.collection("users")
        .where("hotelId", "==", hotel_id)
        .where("role", "==", "staff")
        .stream()
    )
    messaging = get_messaging()
    tokens = [
        d.to_dict().get("fcmToken")
        for d in staff_docs
        if d.to_dict().get("fcmToken")
    ]
    if not tokens:
        return

    message = messaging.MulticastMessage(
        notification=messaging.Notification(title=title, body=body),
        data={k: str(v) for k, v in (data or {}).items()},
        tokens=tokens,
    )
    try:
        messaging.send_each_for_multicast(message)
    except Exception:
        pass


async def broadcast_to_hotel(hotel_id: str, title: str, body: str, data: dict | None = None) -> None:
    db = get_firestore()
    all_users = (
        db.collection("users")
        .where("hotelId", "==", hotel_id)
        .stream()
    )
    messaging = get_messaging()
    tokens = [
        d.to_dict().get("fcmToken")
        for d in all_users
        if d.to_dict().get("fcmToken")
    ]
    if not tokens:
        return

    for i in range(0, len(tokens), 500):
        batch = tokens[i:i + 500]
        message = messaging.MulticastMessage(
            notification=messaging.Notification(title=title, body=body),
            data={k: str(v) for k, v in (data or {}).items()},
            tokens=batch,
        )
        try:
            messaging.send_each_for_multicast(message)
        except Exception:
            pass
