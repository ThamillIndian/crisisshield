export interface RouteStep {
  step: number;
  instruction: string;
  x?: number;
  y?: number;
}

export interface EvacuationRoute {
  id: string;
  incidentId: string;
  hotelId: string;
  floor: number;
  path: RouteStep[];
  spatialData?: {
    guestPos: { x: number; y: number };
    exitPos?: { x: number; y: number } | null;
    dangerPos?: { x: number; y: number } | null;
  };
  exitUsed: string;
  isBlocked: boolean;
  estimatedTimeSeconds: number;
  warning?: string;
  updatedAt: string;
}
