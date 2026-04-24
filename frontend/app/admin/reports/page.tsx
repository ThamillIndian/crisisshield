"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, ScrollText, Calendar, Clock, 
  ChevronRight, ArrowLeft, CheckCircle2, 
  HelpCircle, Zap, ShieldCheck, Activity, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function IncidentArchives() {
  const { user } = useAuthStore();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    if (!user?.hotelId) return;
    fetchReports();
  }, [user]);

  async function fetchReports() {
    setLoading(true);
    setError("");
    try {
      const data = await api.get(`/reports/hotel/${user?.hotelId}`);
      setReports(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to fetch reports:", err);
      setError("Unable to connect to the archive system. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6">
        <div className="relative">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <div className="absolute inset-0 h-10 w-10 animate-ping rounded-full bg-indigo-500/20" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-white font-medium text-lg">Retrieving Archives...</p>
          <p className="text-gray-500 text-sm">Accessing secure property safety logs</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6">
        <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20">
          <ShieldAlert className="h-12 w-12 text-red-400" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-red-400 font-medium">{error}</p>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">This may be due to a temporary network issue or server delay.</p>
        </div>
        <Button onClick={fetchReports} variant="outline" className="border-gray-700 hover:bg-gray-800">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <AnimatePresence mode="wait">
          {!selectedReport ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Incident Archives</h1>
                  <p className="text-gray-400 text-sm">Review past emergency responses and AI-generated performance audits.</p>
                </div>
                <Badge variant={reports.length > 0 ? "default" : "outline"} className="px-3 py-1">
                  {reports.length} Total Reports
                </Badge>
              </div>

              {reports.length === 0 ? (
                <Card className="bg-gray-900 border-gray-800 py-12">
                  <div className="flex flex-col items-center justify-center space-y-3 opacity-50">
                    <ScrollText className="h-12 w-12" />
                    <p className="text-lg font-medium">No Archives Found</p>
                    <p className="text-sm">Reports are generated automatically after an incident is resolved.</p>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {reports.map((report) => (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className="group flex items-center gap-6 p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-indigo-500 hover:bg-indigo-900/5 transition-all text-left"
                    >
                      <div className="h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                        <Calendar className="h-5 w-5 text-gray-400 group-hover:text-indigo-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold capitalize">{report.incident_type} Incident</h3>
                          <Badge variant="outline" className="capitalize text-[10px] px-1.5 py-0 border-gray-700">
                            {report.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Resolved on {new Date(report.generatedAt).toLocaleDateString()} at {new Date(report.generatedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-12 text-sm text-gray-400">
                        <div className="hidden md:flex items-center gap-2">
                          <Zap className="h-4 w-4 text-amber-500" />
                          <span>{report.metrics?.classificationTimeMs || 0}ms Response</span>
                        </div>
                        <div className="hidden md:flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>{report.metrics?.guestsEvacuated || 0}/{report.metrics?.guestsTotal || 0} Safety Rate</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 pb-12"
            >
              <button 
                onClick={() => setSelectedReport(null)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-4"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Archives
              </button>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Side: Summary & Audit */}
                <div className="lg:col-span-2 space-y-6">
                  <header>
                    <Badge className="mb-2 capitalize">{selectedReport.incident_type} Audit</Badge>
                    <h1 className="text-3xl font-bold">Post-Incident Improvement Report</h1>
                    <p className="text-gray-400 mt-2 leading-relaxed">
                      {selectedReport.response_summary}
                    </p>
                  </header>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="bg-gray-900 border-gray-800 overflow-hidden">
                      <CardHeader className="bg-green-500/5 pb-2">
                        <CardTitle className="text-sm font-bold text-green-400 flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4" /> What Worked Well
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-3">
                        {selectedReport.whatWorkedWell.map((pt: string, i: number) => (
                          <div key={i} className="flex gap-2 text-sm text-gray-300">
                            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                            {pt}
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800 overflow-hidden">
                      <CardHeader className="bg-amber-500/5 pb-2">
                        <CardTitle className="text-sm font-bold text-amber-400 flex items-center gap-2">
                          <Activity className="h-4 w-4" /> Areas to Improve
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-3">
                        {selectedReport.areasToImprove.map((area: string, i: number) => (
                          <div key={i} className="flex gap-2 text-sm text-gray-300 font-medium">
                            <Zap className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                            {area}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-lg">Management Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedReport.recommendations.map((rec: string, i: number) => (
                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-gray-800/50 border-l-4 border-indigo-500">
                          <HelpCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-200">{rec}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Side: Metrics & Timeline */}
                <div className="space-y-6">
                  <Card className="bg-indigo-950/20 border-indigo-500/20">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-indigo-400">Response Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <MetricItem label="Classification Speed" value={`${selectedReport.metrics.classificationTimeMs}ms`} icon={<Clock className="h-4 w-4" />} />
                      <MetricItem label="Staff Reaction Time" value={`${selectedReport.metrics.firstStaffResponseSec}s`} icon={<Loader2 className="h-4 w-4" />} />
                      <MetricItem label="Total Resolution" value={`${Math.floor(selectedReport.metrics.totalEvacuationSec / 60)}m ${selectedReport.metrics.totalEvacuationSec % 60}s`} icon={<Zap className="h-4 w-4" />} />
                      <div className="pt-2 border-t border-indigo-500/20">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Evacuation Rate</span>
                          <span>{selectedReport.metrics.guestsEvacuated}/{selectedReport.metrics.guestsTotal}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500" 
                            style={{ width: `${(selectedReport.metrics.guestsEvacuated / selectedReport.metrics.guestsTotal) * 100}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">Incident Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                       {selectedReport.fullTimeline.map((ev: any, i: number) => (
                         <div key={i} className="relative pb-4 last:pb-0 border-l border-gray-800 pl-4">
                           <div className="absolute left-[-5px] top-1 h-2 w-2 rounded-full bg-gray-700" />
                           <p className="text-xs font-mono text-gray-500">{new Date(ev.time).toLocaleTimeString()}</p>
                           <p className="text-sm text-gray-300 mt-0.5">{ev.event}</p>
                         </div>
                       ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MetricItem({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        {icon}
        {label}
      </div>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}
