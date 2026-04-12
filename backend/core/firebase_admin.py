import firebase_admin
from firebase_admin import credentials, firestore, messaging
from core.config import settings

_app = None


def init_firebase() -> None:
    global _app
    if _app is not None:
        return
    cred = credentials.Certificate({
        "type": "service_account",
        "project_id": settings.firebase_project_id,
        "private_key": settings.firebase_private_key.replace("\\n", "\n"),
        "client_email": settings.firebase_client_email,
        "token_uri": "https://oauth2.googleapis.com/token",
    })
    _app = firebase_admin.initialize_app(cred)


def get_firestore():
    return firestore.client()


def get_messaging():
    return messaging
