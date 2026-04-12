export type TaskStatus = "pending" | "in_progress" | "done";

export interface Task {
  id: string;
  incidentId: string;
  hotelId: string;
  assignedTo: string;
  staffRole: string;
  title: string;
  description: string;
  priority: 1 | 2 | 3;
  status: TaskStatus;
  assignedAt: string;
  completedAt?: string;
}
