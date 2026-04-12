import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  addDoc,
  serverTimestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Incident } from "@/types/incident";
import type { Task } from "@/types/task";
import type { EvacuationRoute } from "@/types/route";

// ─── INCIDENTS ──────────────────────────────────────────

export function listenToActiveIncidents(
  hotelId: string,
  callback: (incidents: Incident[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "incidents"),
    where("hotelId", "==", hotelId),
    where("status", "==", "active"),
    orderBy("reportedAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Incident)));
  });
}

export function listenToIncident(
  incidentId: string,
  callback: (incident: Incident | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, "incidents", incidentId), (snap) => {
    callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as Incident) : null);
  });
}

// ─── TASKS ──────────────────────────────────────────────

export function listenToMyTasks(
  staffId: string,
  callback: (tasks: Task[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "tasks"),
    where("assignedTo", "==", staffId),
    where("status", "in", ["pending", "in_progress"]),
    orderBy("priority", "asc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task)));
  });
}

export function listenToIncidentTasks(
  incidentId: string,
  callback: (tasks: Task[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "tasks"),
    where("incidentId", "==", incidentId),
    orderBy("priority", "asc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task)));
  });
}

export async function updateTaskStatus(
  taskId: string,
  status: Task["status"]
): Promise<void> {
  const updates: Record<string, unknown> = { status };
  if (status === "done") updates.completedAt = serverTimestamp();
  await updateDoc(doc(db, "tasks", taskId), updates);
}

// ─── ROUTES ─────────────────────────────────────────────

export function listenToRoute(
  incidentId: string,
  floor: number,
  callback: (route: EvacuationRoute | null) => void
): Unsubscribe {
  const q = query(
    collection(db, "routes"),
    where("incidentId", "==", incidentId),
    where("floor", "==", floor)
  );
  return onSnapshot(q, (snap) => {
    if (snap.empty) {
      callback(null);
    } else {
      const d = snap.docs[0];
      callback({ id: d.id, ...d.data() } as EvacuationRoute);
    }
  });
}
