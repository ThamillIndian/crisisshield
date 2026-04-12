import { create } from "zustand";
import type { EvacuationRoute } from "@/types/route";

interface RouteState {
  currentRoute: EvacuationRoute | null;
  setCurrentRoute: (route: EvacuationRoute | null) => void;
}

export const useRouteStore = create<RouteState>((set) => ({
  currentRoute: null,
  setCurrentRoute: (currentRoute) => set({ currentRoute }),
}));
