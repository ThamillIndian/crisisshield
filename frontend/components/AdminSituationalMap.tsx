"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, MapPin, Navigation, Flame, HeartPulse, AlertTriangle } from "lucide-react";
import type { Incident } from "@/types/incident";

interface AdminSituationalMapProps {
  incidents: Incident[];
  selectedId: string | null;
  onSelectIncident: (id: string) => void;
}

const INCIDENT_ICON = {
  fire: <Flame className="h-4 w-4" />,
  medical: <HeartPulse className="h-4 w-4" />,
  security: <ShieldAlert className="h-4 w-4" />,
  unknown: <AlertTriangle className="h-4 w-4" />,
};

export function AdminSituationalMap({ incidents, selectedId, onSelectIncident }: AdminSituationalMapProps) {
  // We use the floor of the selected incident as our "Blueprint Base"
  // If no incident is selected, we show floor 1
  const selectedIncident = incidents.find(i => i.id === selectedId);
  const currentFloor = selectedIncident?.location.floor || 1;

  // Filter incidents to show only those on the active floor view
  const visibleIncidents = incidents.filter(i => i.location.floor === currentFloor && i.spatialData);

  return (
    <div className="relative w-full aspect-video min-h-[400px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group cursor-crosshair">
      {/* Background Blueprint Grid */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="admin-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-indigo-400" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#admin-grid)" />
      </svg>

      {/* Main Tactical Canvas */}
      <svg className="absolute inset-0 w-full h-full p-8" viewBox="0 0 100 100">
        <AnimatePresence>
          {visibleIncidents.map((inc) => {
            const { guestPos, dangerPos } = inc.spatialData!;
            const isSelected = selectedId === inc.id;

            return (
              <g key={inc.id}>
                {/* Connection Line (Guest to Danger) - Subtle */}
                {dangerPos && isSelected && (
                  <motion.line
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.2 }}
                    x1={guestPos.x} y1={guestPos.y}
                    x2={dangerPos.x} y2={dangerPos.y}
                    stroke="#818cf8"
                    strokeWidth="0.5"
                    strokeDasharray="2 1"
                  />
                )}

                {/* Danger Zone Heatmap Pulse */}
                {dangerPos && (
                  <circle
                    cx={dangerPos.x}
                    cy={dangerPos.y}
                    r={isSelected ? "12" : "8"}
                    className={`fill-red-500/10 ${isSelected ? 'animate-pulse' : ''}`}
                  />
                )}

                {/* Incident Marker */}
                {dangerPos && (
                  <foreignObject x={dangerPos.x - 4} y={dangerPos.y - 4} width="8" height="8">
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onSelectIncident(inc.id)}
                      className={`flex items-center justify-center w-full h-full rounded-full shadow-lg transition-colors border ${
                        isSelected 
                          ? "bg-red-500 border-red-300 shadow-red-500/50" 
                          : "bg-red-900/80 border-red-700/50"
                      }`}
                    >
                      <div className="text-white p-1">
                        {INCIDENT_ICON[inc.type]}
                      </div>
                    </motion.button>
                  </foreignObject>
                )}

                {/* Guest / Reporter Marker */}
                <foreignObject x={guestPos.x - 3} y={guestPos.y - 3} width="6" height="6">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <motion.div 
                      animate={{ scale: isSelected ? [1, 1.4, 1] : 1 }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className={`absolute inset-0 rounded-full ${isSelected ? 'bg-cyan-500/30' : 'bg-slate-700/30'}`}
                    />
                    <div className={`relative z-10 w-3 h-3 rounded-full border shadow-sm ${
                      isSelected ? 'bg-cyan-400 border-white' : 'bg-slate-400 border-slate-600'
                    }`} />
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </AnimatePresence>
      </svg>

      {/* Decorative HUD Elements */}
      <div className="absolute top-6 left-6 flex flex-col gap-1">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg px-3 py-1.5 flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-indigo-400 uppercase leading-none">Perspective</span>
            <span className="text-xs font-bold text-white tracking-widest uppercase">Floor {currentFloor} Operations</span>
          </div>
          <div className="h-6 w-px bg-slate-700" />
          <div className="flex flex-col">
          <span className="text-[10px] font-mono text-slate-500 uppercase leading-none">Telemetry</span>
            <span className="text-xs font-mono text-green-400">{visibleIncidents.length} Linked Nodes</span>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
        <div className="flex gap-2">
          <div className="bg-red-500/10 text-red-400 text-[9px] font-mono border border-red-500/20 px-2 py-1 rounded uppercase tracking-widest backdrop-blur-sm">
            Live Threat Matrix
          </div>
          <div className="bg-slate-900/80 text-slate-400 text-[9px] font-mono border border-slate-700 px-2 py-1 rounded uppercase tracking-widest backdrop-blur-sm">
             Grid Active
          </div>
        </div>
        
        <div className="text-[10px] font-mono text-slate-500 animate-pulse">
           COMMAND_CENTER_SYNC :: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Corner Scanning Decos */}
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-indigo-500/20 rounded-tr-2xl" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-indigo-500/20 rounded-bl-2xl" />
    </div>
  );
}
