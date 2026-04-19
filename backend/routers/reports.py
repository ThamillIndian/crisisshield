from fastapi import APIRouter, HTTPException
from services.firestore_service import get_report_by_incident, get_hotel_reports

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/incident/{incident_id}")
async def get_report(incident_id: str):
    report = await get_report_by_incident(incident_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found yet. Check after incident is resolved.")
    return report


@router.get("/hotel/{hotel_id}")
async def fetch_hotel_reports(hotel_id: str):
    try:
        reports = await get_hotel_reports(hotel_id)
        return reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
