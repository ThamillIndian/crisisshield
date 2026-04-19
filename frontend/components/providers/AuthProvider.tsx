"use client";

import { useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import type { AppUser } from "@/types/user";
import { ShieldAlert, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";

import { usePathname } from "next/navigation";
import OnboardingForm from "@/components/auth/OnboardingForm";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          if (snap.exists()) {
            setUser({ id: snap.id, ...snap.data() } as AppUser);
          } else {
            // Case where user exists in Auth but not Firestore
            setUser({ id: firebaseUser.uid, name: firebaseUser.displayName || "", role: "" } as any);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  // Public routes that should NEVER be blocked by the onboarding guardrail
  const isPublicRoute = pathname === "/" || pathname === "/signup";

  // Blocking logic for incomplete profiles
  const isProfileIncomplete = user && (!user.hotelId || !user.name || !user.role);
  
  // Debug log to help identify why staff profiles might be bypassing
  if (user && isProfileIncomplete) {
    console.debug("[AuthProvider] Profile incomplete for:", user.email, "HotelId:", user.hotelId);
  }

  // Only show the onboarding form if:
  // 1. User is authenticated
  // 2. Profile is incomplete
  // 3. We are NOT on a public route (like the login page)
  if (user && isProfileIncomplete && !isPublicRoute) {
    return <OnboardingForm />;
  }

  return <>{children}</>;
}
