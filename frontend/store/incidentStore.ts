import { create } from "zustand";
import type { Incident } from "@/types/incident";

interface IncidentState {
  activeIncident: Incident | null;
  allIncidents: Incident[];
  setActiveIncident: (incident: Incident | null) => void;
  setAllIncidents: (incidents: Incident[]) => void;
}

export const useIncidentStore = create<IncidentState>((set) => ({
  activeIncident: null,
  allIncidents: [],
  setActiveIncident: (activeIncident) => set({ activeIncident }),
  setAllIncidents: (allIncidents) => set({ allIncidents }),
}));
