export type IncidentType = "fire" | "medical" | "security" | "unknown";
export type IncidentSeverity = "critical" | "high" | "medium" | "low";
export type IncidentStatus = "active" | "contained" | "resolved";

export interface IncidentLocation {
  floor: number;
  room: string;
  zone?: string;
}

export interface TimelineEvent {
  time: string;
  event: string;
}

export interface Incident {
  id: string;
  hotelId: string;
  reportedBy: string;
  reportedAt: string;
  inputType: "voice" | "text" | "panic_button";
  rawInput: string;
  language: string;
  type: IncidentType;
  severity: IncidentSeverity;
  confidence: number;
  location: IncidentLocation;
  reporterLocation?: IncidentLocation;
  locationSource?: "parsed_text" | "reporter_profile";
  locationConfidence?: number;
  status: IncidentStatus;
  resolvedAt?: string;
  resolvedBy?: string;
  timeline: TimelineEvent[];
  spatialData?: {
    guestPos: { x: number; y: number };
    exitPos?: { x: number; y: number } | null;
    dangerPos?: { x: number; y: number } | null;
  };
  exitUsed?: string;
  estimatedTimeSeconds?: number;
}
