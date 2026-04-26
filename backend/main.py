from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.firebase_admin import init_firebase
from core.gemini import init_gemini

# Import all routers at once to avoid redundancy
from routers import incidents, tasks, notifications, voice, reports, hotels

app = FastAPI(
    title="CrisisShield API",
    description="AI-Powered Crisis Coordination System for Hospitality Venues",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Startup ───────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    init_firebase()
    init_gemini()


# ── Routers ───────────────────────────────────────────────────────────
app.include_router(incidents.router)
app.include_router(tasks.router)
app.include_router(notifications.router)
app.include_router(voice.router)
app.include_router(reports.router)
app.include_router(hotels.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to the CrisisShield API",
        "status": "online",
        "documentation": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health():
    return {"status": "ok", "service": "CrisisShield API"}
