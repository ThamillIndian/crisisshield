export interface IncidentMetrics {
  classificationTimeMs: number;
  firstStaffResponseSec: number;
  totalEvacuationSec: number;
  guestsTotal: number;
  guestsEvacuated: number;
}

export interface IncidentReport {
  id: string;
  incidentId: string;
  hotelId: string;
  generatedAt: string;
  generatedBy: string;
  metrics: IncidentMetrics;
  whatWorkedWell: string[];
  areasToImprove: string[];
  recommendations: string[];
  fullTimeline: { time: string; event: string }[];
}
