"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Loader2, Hotel, User, Layers, DoorOpen, Briefcase, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { UserRole, StaffRole } from "@/types/user";

export default function OnboardingForm() {
  const { user, setUser } = useAuthStore();
  const [role, setRole] = useState<UserRole | "">(user?.role || "");
  const [name, setName] = useState(user?.name || "");
  const [hotelId, setHotelId] = useState(user?.hotelId || "");
  const [roomNumber, setRoomNumber] = useState(user?.roomNumber || "");
  const [floor, setFloor] = useState(user?.floor || 1);
  const [staffRole, setStaffRole] = useState<StaffRole>("security");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isRoleSelected = role !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !role) return;
    setError("");

    if (!name.trim() || !hotelId.trim()) {
      setError("Please fill in name and Hotel Code.");
      return;
    }

    if (role === "guest" && !roomNumber.trim()) {
      setError("Room Number is required for guests.");
      return;
    }

    setLoading(true);
    try {
      const updates: any = {
        name: name.trim(),
        hotelId: hotelId.trim(),
        role: role,
        language: user.language || "en",
        updatedAt: new Date().toISOString()
      };

      if (role === "guest") {
        updates.roomNumber = roomNumber.trim();
        updates.floor = Number(floor);
      } else if (role === "staff") {
        updates.staffRole = staffRole;
      }

      await updateDoc(doc(db, "users", user.id), updates);
      
      setUser({ ...user, ...updates });
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    setUser(null);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <Card className="max-w-md w-full border-slate-700 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="rounded-2xl bg-indigo-500/10 p-4 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
              <ShieldAlert className="h-8 w-8 text-indigo-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {!isRoleSelected ? "Choose Your Role" : "Complete Your Profile"}
          </CardTitle>
          <p className="text-slate-400 text-sm mt-1">
            {!isRoleSelected 
              ? "Select how you will be using CrisisShield."
              : `Setting up your ${role} account.`}
          </p>
        </CardHeader>
        <CardContent>
          {!isRoleSelected ? (
            <div className="grid gap-4 pt-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-1 border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-white"
                onClick={() => setRole("guest")}
              >
                <User className="h-5 w-5 text-indigo-400" />
                <span>Guest</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-1 border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-white"
                onClick={() => setRole("staff")}
              >
                <Briefcase className="h-5 w-5 text-orange-400" />
                <span>Hotel Staff</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-1 border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-white"
                onClick={() => setRole("admin")}
              >
                <ShieldAlert className="h-5 w-5 text-red-400" />
                <span>Admin / Management</span>
              </Button>

              <Button 
                variant="ghost" 
                className="mt-4 text-slate-500 hover:text-white"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 pt-4">
              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <User className="h-3.5 w-3.5" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-sans"
                    required
                  />
                </div>

                {/* Hotel Code */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Hotel className="h-3.5 w-3.5" /> Hotel Code
                  </label>
                  <input
                    type="text"
                    value={hotelId}
                    onChange={(e) => setHotelId(e.target.value)}
                    placeholder="e.g. GRAND-01"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                    required
                  />
                </div>

                {/* Guest specific fields */}
                {role === "guest" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5" /> Floor
                      </label>
                      <input
                        type="number"
                        value={floor}
                        onChange={(e) => setFloor(parseInt(e.target.value))}
                        min={0}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <DoorOpen className="h-3.5 w-3.5" /> Room
                      </label>
                      <input
                        type="text"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        placeholder="101"
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Staff specific fields */}
                {role === "staff" && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5" /> Job Function
                    </label>
                    <select
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value as StaffRole)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                    >
                      <option value="security">Security / Guard</option>
                      <option value="medical">Medical / First Aid</option>
                      <option value="manager">Hotel Manager</option>
                    </select>
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 text-center animate-in fade-in slide-in-from-top-1">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="flex-1 text-slate-500 hover:text-white"
                  onClick={() => setRole("")}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
                  ) : (
                    "Finish Setup"
                  )}
                </Button>
              </div>
              
              <div className="text-center">
                 <Button 
                  type="button" 
                  variant="link" 
                  className="text-xs text-slate-600 hover:text-slate-400"
                  onClick={handleSignOut}
                  disabled={loading}
                >
                  Sign Out of Account
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
