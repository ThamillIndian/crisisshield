from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.firestore_service import get_hotel_knowledge, update_hotel_knowledge

router = APIRouter(prefix="/hotels", tags=["hotels"])

class KnowledgeUpdateRequest(BaseModel):
    hotelName: str | None = None
    protocols: dict | None = None
    equipment_mapping: dict | None = None
    emergency_contacts: dict | None = None
    facility_info: dict | None = None

@router.get("/{hotel_id}/knowledge")
async def fetch_knowledge(hotel_id: str):
    try:
        data = await get_hotel_knowledge(hotel_id)
        if not data:
            raise HTTPException(status_code=404, detail="Knowledge data not found for this hotel.")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{hotel_id}/knowledge")
async def update_knowledge(hotel_id: str, req: KnowledgeUpdateRequest):
    try:
        # Filter out None values to perform a partial, update
        update_data = {k: v for k, v in req.dict().items() if v is not None}
        if not update_data:
            return {"status": "no change"}
            
        await update_hotel_knowledge(hotel_id, update_data)
        return {"status": "success", "updated_fields": list(update_data.keys())}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
