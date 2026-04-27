"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LANGUAGE_LABELS } from "@/types/user";
import type { SupportedLanguage } from "@/types/user";
import {
  ShieldAlert, Mic, Type, Globe, LogOut, Loader2, ChevronRight, Square,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore as useStore } from "@/store/authStore";

export default function GuestHomePage() {
  const { user } = useAuthStore();
  const setUser = useStore((s) => s.setUser);
  const router = useRouter();
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"home" | "text" | "voice">("home");
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState<SupportedLanguage>(
    (user?.language as SupportedLanguage) ?? "en"
  );

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        await handleVoiceUpload(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Please allow microphone access to use voice reporting.");
    }
  }

  function stopRecording() {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setLoading(true);
    }
  }

  async function handleVoiceUpload(blob: Blob) {
    if (!user) return;
    
    const formData = new FormData();
    formData.append("file", blob, "report.wav");
    formData.append("userId", user.id);
    formData.append("hotelId", user.hotelId);
    formData.append("floor", String(user.floor || 1));
    formData.append("room", user.roomNumber || "101");

    try {
      const BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
      console.log(`[DEBUG] Sending voice report to: ${BASE}/voice/report`);
      
      const response = await fetch(`${BASE}/voice/report`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log("[DEBUG] Voice report success:", data);
      
      if (!data.incidentId) {
        throw new Error("No incident ID received from server");
      }

      router.push(`/guest/evacuation?incidentId=${data.incidentId}`);
    } catch (err: any) {
      console.error("Voice report error:", err);
      alert(`Voice report failed: ${err.message || "Unknown error"}`);
      setMode("home");
    } finally {
      setLoading(false);
    }
  }

  async function reportPanic() {
    setLoading(true);
    try {
      const res = await api.post<{ incidentId: string }>("/incidents/report", {
        inputType: "panic_button",
        rawInput: "Emergency! Panic button pressed.",
        language,
        userId: user?.id,
        hotelId: user?.hotelId,
        floor: user?.floor || 1,
        room: user?.roomNumber || "101",
      });
      router.push(`/guest/evacuation?incidentId=${res.incidentId}`);
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to send emergency report.");
    } finally {
      setLoading(false);
    }
  }

  async function reportText() {
    if (!textInput.trim()) return;
    setLoading(true);
    try {
      const res = await api.post<{ incidentId: string }>("/incidents/report", {
        inputType: "text",
        rawInput: textInput,
        language,
        userId: user?.id,
        hotelId: user?.hotelId,
        floor: user?.floor || 1,
        room: user?.roomNumber || "101",
      });
      router.push(`/guest/evacuation?incidentId=${res.incidentId}`);
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to send emergency report.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    setUser(null);
    router.replace("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-400" />
          <span className="text-white font-semibold">CrisisShield</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">
            {user?.name} · Room {user?.roomNumber}
          </span>
          <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Language selector */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50">
        <Globe className="h-4 w-4 text-slate-400" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
          className="bg-transparent text-slate-300 text-sm focus:outline-none"
        >
          {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
            <option key={code} value={code} className="bg-slate-800">
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        <AnimatePresence mode="wait">
          {mode === "home" ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-6"
            >
              <div className="flex flex-col items-center space-y-3">
                <p className="text-slate-400 text-sm uppercase tracking-widest">Emergency</p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={reportPanic}
                  disabled={loading}
                  className="w-48 h-48 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xl shadow-[0_0_60px_rgba(239,68,68,0.4)] border-4 border-red-400 disabled:opacity-70 transition-all flex flex-col items-center justify-center gap-1"
                >
                  {loading ? (
                    <Loader2 className="h-10 w-10 animate-spin" />
                  ) : (
                    <>
                      <ShieldAlert className="h-10 w-10" />
                      <span>PANIC</span>
                    </>
                  )}
                </motion.button>
                <p className="text-slate-500 text-xs text-center">
                  Press and hold for immediate emergency alert
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode("voice")}
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-600 bg-slate-700/50 p-4 hover:bg-slate-700 transition-colors"
                >
                  <Mic className="h-6 w-6 text-indigo-400" />
                  <span className="text-sm text-slate-300">Voice Report</span>
                </button>
                <button
                  onClick={() => setMode("text")}
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-600 bg-slate-700/50 p-4 hover:bg-slate-700 transition-colors"
                >
                  <Type className="h-6 w-6 text-indigo-400" />
                  <span className="text-sm text-slate-300">Text Report</span>
                </button>
              </div>
            </motion.div>
          ) : mode === "text" ? (
            <motion.div
              key="text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-4"
            >
              <button
                onClick={() => setMode("home")}
                className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
              >
                ← Back
              </button>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-5 space-y-4">
                  <p className="text-white font-medium">Describe the emergency</p>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="E.g. There is smoke coming from Room 302..."
                    rows={4}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                  <Button
                    onClick={reportText}
                    variant="destructive"
                    size="lg"
                    className="w-full"
                    disabled={loading || !textInput.trim()}
                  >
                    {loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                    ) : (
                      <>Send Emergency Report <ChevronRight className="h-4 w-4" /></>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="voice"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm flex flex-col items-center space-y-8"
            >
              <button
                onClick={() => setMode("home")}
                className="text-slate-400 hover:text-white text-sm flex items-center gap-1 self-start transition-colors"
              >
                ← Back
              </button>

              <div className="relative">
                <AnimatePresence>
                  {isRecording && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-indigo-500 rounded-full"
                    />
                  )}
                </AnimatePresence>
                
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={loading}
                  className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                    isRecording ? "bg-red-500" : "bg-indigo-600"
                  } shadow-xl hover:scale-105 active:scale-95`}
                >
                  {loading ? (
                    <Loader2 className="h-10 w-10 animate-spin text-white" />
                  ) : isRecording ? (
                    <Square className="h-10 w-10 text-white fill-current" />
                  ) : (
                    <Mic className="h-12 w-12 text-white" />
                  )}
                </button>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-white">
                  {isRecording ? "Listening..." : loading ? "Processing..." : "Tap to Speak"}
                </h2>
                <p className="text-slate-400 text-sm">
                  {isRecording 
                    ? "Speak in any language (Hindi, Tamil, etc.)" 
                    : "Tell us what's happening calmly"}
                </p>
              </div>

              {isRecording && (
                <div className="flex gap-1 items-end h-8">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [10, 30, 10] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1.5 bg-indigo-400 rounded-full"
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
