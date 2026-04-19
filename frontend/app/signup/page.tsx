"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Loader2 } from "lucide-react";
import type { AppUser } from "@/types/user";

export default function SignupPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [hotelId, setHotelId] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [floor, setFloor] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!name.trim() || !hotelId.trim() || !roomNumber.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      
      const newUser = {
        role: "guest",
        email: cred.user.email || email,
        name: name.trim(),
        hotelId: hotelId.trim(),
        language: "en",
        roomNumber: roomNumber.trim(),
        floor: Number(floor),
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, "users", cred.user.uid), newUser);
      
      const user = { id: cred.user.uid, ...newUser } as AppUser;
      setUser(user);
      
      router.push("/guest");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      let snap = await getDoc(doc(db, "users", cred.user.uid));
      
      if (!snap.exists()) {
        // If Google user doesn't have a profile, they still need to complete it.
        // For now, we'll create a partial profile and the AuthProvider guardrail will catch it.
        const newUser = {
          role: "guest",
          email: cred.user.email || "",
          name: cred.user.displayName || "",
          hotelId: "", // Empty so guardrail blocks them until fixed
          language: "en",
          roomNumber: "",
          floor: 1,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, "users", cred.user.uid), newUser);
        snap = await getDoc(doc(db, "users", cred.user.uid));
      }
      
      const user = { id: snap.id, ...snap.data() } as AppUser;
      setUser(user);
      
      if (user.role === "admin") router.push("/admin");
      else if (user.role === "staff") router.push("/staff");
      else router.push("/guest");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="rounded-2xl bg-red-500/20 p-4 border border-red-500/30">
              <ShieldAlert className="h-10 w-10 text-red-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">CrisisShield</h1>
          <p className="text-slate-400 text-sm">AI-Powered Emergency Response System</p>
        </div>

        {/* Signup Card */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-center">Create Guest Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm text-slate-300 font-medium">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-300 font-medium">Hotel Code</label>
                  <input
                    type="text"
                    value={hotelId}
                    onChange={(e) => setHotelId(e.target.value)}
                    required
                    placeholder="e.g. GRAND-01"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm text-slate-300 font-medium">Floor</label>
                  <input
                    type="number"
                    value={floor}
                    onChange={(e) => setFloor(parseInt(e.target.value))}
                    required
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-300 font-medium">Room Number</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    required
                    placeholder="101"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-300 font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm text-slate-300 font-medium">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-300 font-medium">Confirm</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              {error && (
                <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400 text-center">
                  {error}
                </p>
              )}
              
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</>
                ) : (
                  "Sign Up"
                )}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-700"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-800 px-2 text-slate-400">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-slate-600 bg-transparent text-white hover:bg-slate-700"
                size="lg"
                onClick={handleGoogleSignup}
                disabled={loading}
              >
                <FcGoogle className="mr-2 h-5 w-5" />
                Google
              </Button>

              <div className="text-center mt-4 text-sm text-slate-400">
                Already have an account?{" "}
                <Link href="/" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
