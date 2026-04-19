"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { listenToActiveIncidents, listenToIncidentTasks } from "@/lib/firestore";
import { api } from "@/lib/api";
import type { Incident } from "@/types/incident";
import type { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ShieldAlert, Flame, HeartPulse, AlertTriangle,
  CheckCircle2, Clock, Users, LogOut, Send, Loader2,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const INCIDENT_ICON = {
  fire: <Flame className="h-4 w-4 text-red-400" />,
  medical: <HeartPulse className="h-4 w-4 text-blue-400" />,
  security: <ShieldAlert className="h-4 w-4 text-amber-400" />,
  unknown: <AlertTriangle className="h-4 w-4 text-gray-400" />,
};

const SEVERITY_VARIANT = {
  critical: "destructive" as const,
  high: "warning" as const,
  medium: "warning" as const,
  low: "default" as const,
};

export default function AdminDashboard() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profileError, setProfileError] = useState("");
  const [broadcast, setBroadcast] = useState("");
  const [resolving, setResolving] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (!user.hotelId) {
      setProfileError("Admin profile is missing hotelId. Update your users/{uid} document.");
      return;
    }
    setProfileError("");
    return listenToActiveIncidents(user.hotelId, (data) => {
      setIncidents(data);
      if (!selectedId && data.length > 0) setSelectedId(data[0].id);
    });
  }, [user, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    return listenToIncidentTasks(selectedId, setTasks);
  }, [selectedId]);

  const selectedIncident = incidents.find((i) => i.id === selectedId);
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const taskProgress = tasks.length > 0 ? (doneTasks / tasks.length) * 100 : 0;

  async function handleResolve() {
    if (!selectedId) return;
    setResolving(true);
    try {
      await api.patch(`/incidents/${selectedId}/resolve`, { resolvedBy: user?.id });
    } finally {
      setResolving(false);
    }
  }

  async function handleBroadcast() {
    if (!broadcast.trim() || !selectedId) return;
    setSending(true);
    try {
      await api.post("/notifications/broadcast", {
        incidentId: selectedId,
        hotelId: user?.hotelId,
        message: broadcast,
      });
      setBroadcast("");
    } finally {
      setSending(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    setUser(null);
    router.replace("/");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-red-500/20 p-2 border border-red-500/30">
            <ShieldAlert className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h1 className="font-bold text-white">Command Center</h1>
            <p className="text-xs text-gray-400">{user?.name} · Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {incidents.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm text-red-400 font-medium">
                {incidents.length} Active
              </span>
            </div>
          )}
          <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {profileError && (
          <div className="rounded-lg border border-red-600/50 bg-red-900/20 px-4 py-3 text-sm text-red-300">
            {profileError}
          </div>
        )}
        {incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <p className="text-xl font-semibold text-white">All Clear</p>
            <p className="text-gray-400">No active incidents at this time.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Incident list */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                Active Incidents
              </h2>
              {incidents.map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => setSelectedId(inc.id)}
                  className={`w-full text-left rounded-xl border p-4 transition-all ${
                    selectedId === inc.id
                      ? "border-indigo-500 bg-indigo-900/20"
                      : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {INCIDENT_ICON[inc.type]}
                    <span className="font-medium capitalize">{inc.type}</span>
                    <Badge variant={SEVERITY_VARIANT[inc.severity]} className="ml-auto capitalize">
                      {inc.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400">
                    Floor {inc.location.floor} · Room {inc.location.room}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(inc.reportedAt).toLocaleTimeString()}
                  </p>
                </button>
              ))}
            </div>

            {/* Incident detail */}
            {selectedIncident && (
              <div className="lg:col-span-2 space-y-4">
                {/* Overview */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-white">
                        {INCIDENT_ICON[selectedIncident.type]}
                        <span className="capitalize">{selectedIncident.type} Emergency</span>
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge variant={SEVERITY_VARIANT[selectedIncident.severity]} className="capitalize">
                          {selectedIncident.severity}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {selectedIncident.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-gray-700/50 p-3">
                        <p className="text-gray-400">Location</p>
                        <p className="font-medium">Floor {selectedIncident.location.floor}, Room {selectedIncident.location.room}</p>
                      </div>
                      <div className="rounded-lg bg-gray-700/50 p-3">
                        <p className="text-gray-400">Reported At</p>
                        <p className="font-medium">
                          {new Date(selectedIncident.reportedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleResolve}
                      variant="outline"
                      className="w-full border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                      disabled={resolving}
                    >
                      {resolving ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Resolving...</>
                      ) : (
                        <><CheckCircle2 className="h-4 w-4" /> Declare All Clear</>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Task Progress */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="h-4 w-4 text-indigo-400" />
                      Staff Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white font-medium">
                          {doneTasks}/{tasks.length} done
                        </span>
                      </div>
                      <Progress value={taskProgress} />
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 rounded-lg bg-gray-700/50 px-3 py-2 text-sm"
                        >
                          {task.status === "done" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                          ) : task.status === "in_progress" ? (
                            <Clock className="h-4 w-4 text-indigo-400 shrink-0 animate-pulse" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-gray-500 shrink-0" />
                          )}
                          <span className={task.status === "done" ? "text-gray-500 line-through" : "text-white"}>
                            {task.title}
                          </span>
                          <Badge
                            variant={task.status === "done" ? "success" : task.status === "in_progress" ? "default" : "outline"}
                            className="ml-auto capitalize text-xs"
                          >
                            {task.status.replace("_", " ")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Live Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-48 overflow-y-auto">
                    {[...selectedIncident.timeline].reverse().map((t, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                        <div>
                          <p className="text-white">{t.event}</p>
                          <p className="text-gray-500 text-xs">
                            {new Date(t.time).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Broadcast */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Broadcast Message</CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <input
                      value={broadcast}
                      onChange={(e) => setBroadcast(e.target.value)}
                      placeholder="Send message to all guests and staff..."
                      className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Button
                      onClick={handleBroadcast}
                      size="icon"
                      disabled={sending || !broadcast.trim()}
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
