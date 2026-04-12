from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone

from models.task import UpdateTaskRequest
from services.firestore_service import update_task, get_incident_tasks

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/incident/{incident_id}")
async def list_incident_tasks(incident_id: str):
    return await get_incident_tasks(incident_id)


@router.patch("/{task_id}")
async def update_task_status(task_id: str, req: UpdateTaskRequest):
    data: dict = {"status": req.status}
    if req.status == "done":
        data["completedAt"] = datetime.now(timezone.utc).isoformat()
    await update_task(task_id, data)
    return {"taskId": task_id, "status": req.status}
