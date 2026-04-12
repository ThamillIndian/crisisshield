from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime


IncidentType = Literal["fire", "medical", "security", "unknown"]
IncidentSeverity = Literal["critical", "high", "medium", "low"]
IncidentStatus = Literal["active", "contained", "resolved"]


class IncidentLocation(BaseModel):
    floor: int
    room: str
    zone: Optional[str] = None


class TimelineEvent(BaseModel):
    time: str
    event: str


class ReportIncidentRequest(BaseModel):
    inputType: Literal["voice", "text", "panic_button"]
    rawInput: str
    language: str = "en"
    userId: str
    hotelId: str
    floor: int = 1
    room: str = "unknown"


class IncidentClassification(BaseModel):
    type: IncidentType
    severity: IncidentSeverity
    confidence: float
    summary_en: str
    immediate_action: str


class Incident(BaseModel):
    id: str
    hotelId: str
    reportedBy: str
    reportedAt: str
    inputType: str
    rawInput: str
    language: str
    type: IncidentType
    severity: IncidentSeverity
    confidence: float
    location: IncidentLocation
    status: IncidentStatus
    resolvedAt: Optional[str] = None
    resolvedBy: Optional[str] = None
    timeline: list[TimelineEvent] = []


class ResolveIncidentRequest(BaseModel):
    resolvedBy: str
