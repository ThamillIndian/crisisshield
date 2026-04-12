from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.fcm_service import broadcast_to_hotel

router = APIRouter(prefix="/notifications", tags=["notifications"])


class BroadcastRequest(BaseModel):
    incidentId: str
    hotelId: str
    message: str


@router.post("/broadcast")
async def broadcast_message(req: BroadcastRequest):
    await broadcast_to_hotel(
        hotel_id=req.hotelId,
        title="📢 Emergency Update",
        body=req.message,
        data={"incidentId": req.incidentId, "type": "broadcast"},
    )
    return {"status": "sent"}
