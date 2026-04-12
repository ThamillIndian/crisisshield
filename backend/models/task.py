from pydantic import BaseModel
from typing import Literal, Optional


TaskStatus = Literal["pending", "in_progress", "done"]


class Task(BaseModel):
    id: str
    incidentId: str
    hotelId: str
    assignedTo: str
    staffRole: str
    title: str
    description: str
    priority: Literal[1, 2, 3]
    status: TaskStatus
    assignedAt: str
    completedAt: Optional[str] = None


class UpdateTaskRequest(BaseModel):
    status: TaskStatus
