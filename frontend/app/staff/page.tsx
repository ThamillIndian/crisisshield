"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { listenToMyTasks, updateTaskStatus } from "@/lib/firestore";
import type { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShieldAlert, CheckCircle2, Clock, AlertCircle,
  LogOut, ChevronRight, Loader2,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const STATUS_STYLES = {
  pending: "bg-slate-700 border-slate-600",
  in_progress: "bg-indigo-900/30 border-indigo-500",
  done: "bg-green-900/20 border-green-700 opacity-60",
};

const PRIORITY_COLORS = {
  1: "destructive" as const,
  2: "warning" as const,
  3: "default" as const,
};

export default function StaffPage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    return listenToMyTasks(user.id, setTasks);
  }, [user]);

  async function handleStatusChange(task: Task) {
    const next: Task["status"] =
      task.status === "pending" ? "in_progress" :
      task.status === "in_progress" ? "done" : "done";
    setUpdating(task.id);
    try {
      await updateTaskStatus(task.id, next);
    } finally {
      setUpdating(null);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    setUser(null);
    router.replace("/");
  }

  const activeTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-700 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-indigo-400" />
          <div>
            <p className="font-semibold text-sm">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.staffRole}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {activeTasks.length > 0 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold">
              {activeTasks.length}
            </span>
          )}
          <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Pending", count: tasks.filter(t => t.status === "pending").length, icon: <Clock className="h-4 w-4" />, color: "text-amber-400" },
            { label: "In Progress", count: tasks.filter(t => t.status === "in_progress").length, icon: <AlertCircle className="h-4 w-4" />, color: "text-indigo-400" },
            { label: "Done", count: doneTasks.length, icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-400" },
          ].map((s) => (
            <Card key={s.label} className="bg-slate-800 border-slate-700">
              <CardContent className="pt-3 pb-3 text-center">
                <div className={`flex justify-center mb-1 ${s.color}`}>{s.icon}</div>
                <p className="text-2xl font-bold">{s.count}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active Tasks */}
        {activeTasks.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-8 pb-8 text-center space-y-2">
              <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto" />
              <p className="text-slate-300 font-medium">All tasks completed!</p>
              <p className="text-slate-500 text-sm">Standby for new assignments.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <h2 className="font-semibold text-slate-300 text-sm uppercase tracking-wide">
              Active Tasks
            </h2>
            <AnimatePresence>
              {activeTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className={`border ${STATUS_STYLES[task.status]}`}>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={PRIORITY_COLORS[task.priority]}>
                              P{task.priority}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {task.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="font-medium text-white">{task.title}</p>
                          <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleStatusChange(task)}
                        variant={task.status === "in_progress" ? "default" : "secondary"}
                        size="sm"
                        className="w-full"
                        disabled={updating === task.id || task.status === "done"}
                      >
                        {updating === task.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : task.status === "pending" ? (
                          <>Start Task <ChevronRight className="h-3 w-3" /></>
                        ) : (
                          <>Mark as Done <CheckCircle2 className="h-3 w-3" /></>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Completed Tasks */}
        {doneTasks.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-slate-300 text-sm uppercase tracking-wide">
              Completed
            </h2>
            {doneTasks.map((task) => (
              <Card key={task.id} className="border border-slate-700 bg-slate-800/40 opacity-60">
                <CardContent className="pt-3 pb-3 flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                  <p className="text-sm text-slate-400 line-through">{task.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
