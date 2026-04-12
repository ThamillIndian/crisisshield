"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { listenToIncident, listenToRoute } from "@/lib/firestore";
import type { Incident } from "@/types/incident";
import type { EvacuationRoute } from "@/types/route";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Flame, HeartPulse, ShieldAlert, CheckCircle, AlertTriangle,
  MapPin, Clock, ChevronRight,
} from "lucide-react";

const INCIDENT_ICONS = {
  fire: <Flame className="h-5 w-5 text-red-400" />,
  medical: <HeartPulse className="h-5 w-5 text-blue-400" />,
  security: <ShieldAlert className="h-5 w-5 text-amber-400" />,
  unknown: <AlertTriangle className="h-5 w-5 text-gray-400" />,
};

const SEVERITY_VARIANT = {
  critical: "destructive" as const,
  high: "warning" as const,
  medium: "warning" as const,
  low: "default" as const,
};

export default function EvacuationPage() {
  const params = useSearchParams();
  const incidentId = params.get("incidentId") ?? "";
  const { user } = useAuthStore();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [route, setRoute] = useState<EvacuationRoute | null>(null);

  useEffect(() => {
    if (!incidentId) return;
    const unsub1 = listenToIncident(incidentId, setIncident);
    const unsub2 = listenToRoute(incidentId, user?.floor ?? 1, setRoute);
    return () => { unsub1(); unsub2(); };
  }, [incidentId, user?.floor]);

  if (!incident) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-3">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto"
          >
            <ShieldAlert className="h-8 w-8 text-red-400" />
          </motion.div>
          <p className="text-white font-medium">Connecting to emergency system...</p>
          <p className="text-slate-400 text-sm">AI is processing your report</p>
        </div>
      </div>
    );
  }

  const isResolved = incident.status === "resolved";

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Alert banner */}
      <AnimatePresence>
        {!isResolved && (
          <motion.div
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            className="bg-red-600 px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {INCIDENT_ICONS[incident.type]}
              <span className="font-bold uppercase tracking-wide">
                {incident.type} — {incident.severity}
              </span>
            </div>
            <Badge variant={SEVERITY_VARIANT[incident.severity]} className="uppercase">
              {incident.status}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {isResolved && (
        <div className="bg-green-600 px-4 py-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold">All Clear — Emergency Resolved</span>
        </div>
      )}

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Location info */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-4 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-indigo-400 shrink-0" />
            <div>
              <p className="text-sm text-slate-400">Your Location</p>
              <p className="font-medium">Room {user?.roomNumber}, Floor {user?.floor}</p>
            </div>
          </CardContent>
        </Card>

        {/* Evacuation Route */}
        {route ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg">Safe Evacuation Route</h2>
                {route.isBlocked && (
                  <Badge variant="destructive">Route Updated</Badge>
                )}
              </div>

              {route.warning && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-300">{route.warning}</p>
                </div>
              )}

              <div className="space-y-2">
                {route.path.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold">
                      {step.step}
                    </div>
                    <div className="flex-1 flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2">
                      <p className="text-sm text-white">{step.instruction}</p>
                      {idx < route.path.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-slate-400 ml-auto shrink-0" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400">
                  Estimated time: ~{Math.round(route.estimatedTimeSeconds / 60)} min
                </span>
                <span className="ml-auto text-sm text-green-400 font-medium">
                  Exit {route.exitUsed} ✓
                </span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4 flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="h-5 w-5 rounded-full border-2 border-indigo-400 border-t-transparent"
              />
              <p className="text-slate-300">Calculating safest evacuation route...</p>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        {incident.timeline.length > 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4 space-y-3">
              <h3 className="font-semibold text-slate-300">Live Updates</h3>
              {[...incident.timeline].reverse().slice(0, 5).map((t, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-white">{t.event}</p>
                    <p className="text-slate-500 text-xs">
                      {new Date(t.time).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
