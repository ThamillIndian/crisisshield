"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "guest")) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;
  return <>{children}</>;
}
