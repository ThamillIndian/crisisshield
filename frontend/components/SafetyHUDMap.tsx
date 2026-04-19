"use client";

import { motion } from "framer-motion";
import { MapPin, ShieldAlert, DoorOpen, Navigation } from "lucide-react";

interface Point {
  x: number;
  y: number;
}

interface PathStep extends Point {
  step: number;
  instruction: string;
}

interface SafetyHUDMapProps {
  path: PathStep[];
  spatialData: {
    guestPos: Point;
    exitPos?: Point | null;
    dangerPos?: Point | null;
  };
  isMedical?: boolean;
}

export function SafetyHUDMap({ path, spatialData, isMedical }: SafetyHUDMapProps) {
  const { guestPos, exitPos, dangerPos } = spatialData;

  // Convert coordinate path to SVG points string
  const points = path.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <div className="relative w-full aspect-square bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl group">
      {/* Background Blueprint Grid */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-500" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
      </svg>

      {/* Main Map Canvas */}
      <svg className="absolute inset-0 w-full h-full p-4" viewBox="0 0 100 100">
        <AnimatePresence>
          {/* Path Line with Glow */}
          {path.length > 0 && !isMedical && (
            <>
              {/* Outer Glow */}
              <motion.polyline
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.3 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                points={points}
                fill="none"
                stroke="#6366f1"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="blur-sm"
              />
              {/* The Actual Line */}
              <motion.polyline
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                points={points}
                fill="none"
                stroke="#818cf8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="4 2"
                className="animate-[dash_20s_linear_infinite]"
              />
            </>
          )}
        </AnimatePresence>

        {/* Exit Marker */}
        {exitPos && (
          <foreignObject x={exitPos.x - 5} y={exitPos.y - 5} width="10" height="10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center justify-center w-full h-full bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)]"
            >
              <DoorOpen className="w-6 h-6 text-white p-1" />
            </motion.div>
          </foreignObject>
        )}

        {/* Danger/Danger Marker */}
        {dangerPos && (
          <foreignObject x={dangerPos.x - 6} y={dangerPos.y - 6} width="12" height="12">
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex items-center justify-center w-full h-full bg-red-600 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.7)]"
            >
              <ShieldAlert className="w-8 h-8 text-white p-1" />
            </motion.div>
          </foreignObject>
        )}

        {/* Guest Position Marker (YOU) */}
        <foreignObject x={guestPos.x - 6} y={guestPos.y - 6} width="12" height="12">
          <div className="relative w-full h-full flex items-center justify-center">
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-indigo-500 rounded-full"
            />
            <div className="relative z-10 p-2 bg-white rounded-full shadow-lg border-2 border-indigo-600">
               <Navigation className="w-5 h-5 text-indigo-600 fill-current" />
            </div>
          </div>
        </foreignObject>
      </svg>

      {/* Decorative Overlays */}
      <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg px-2 py-1 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] font-mono text-slate-300 uppercase tracking-tighter">Live Spatial Feed</span>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2">
         {isMedical && (
            <div className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-1 rounded border border-blue-500/30 backdrop-blur-sm">
              RESPONDER DISPATCHED
            </div>
         )}
         <div className="bg-slate-900/80 text-slate-400 text-[10px] font-mono px-2 py-1 rounded border border-slate-700 backdrop-blur-sm">
            FL {path[0]?.step || 1} COORDINATES
         </div>
      </div>

      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
      `}</style>
    </div>
  );
}

import { AnimatePresence } from "framer-motion";
