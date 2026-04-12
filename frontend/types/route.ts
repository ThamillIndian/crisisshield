export interface RouteStep {
  step: number;
  instruction: string;
}

export interface EvacuationRoute {
  id: string;
  incidentId: string;
  hotelId: string;
  floor: number;
  path: RouteStep[];
  exitUsed: string;
  isBlocked: boolean;
  estimatedTimeSeconds: number;
  warning?: string;
  updatedAt: string;
}
