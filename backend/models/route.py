from pydantic import BaseModel
from typing import Optional


class RouteStep(BaseModel):
    step: int
    instruction: str


class EvacuationRoute(BaseModel):
    id: str
    incidentId: str
    hotelId: str
    floor: int
    path: list[RouteStep]
    exitUsed: str
    isBlocked: bool = False
    estimatedTimeSeconds: int
    warning: Optional[str] = None
    updatedAt: str
