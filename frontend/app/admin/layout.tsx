"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  return (
    <>
      <header className="p-4 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-6">
          <h1 className="font-bold text-white">Command Center</h1>
          <nav className="flex gap-4 text-xs font-medium">
            <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">Emergency Center</Link>
            <Link href="/admin/knowledge" className="text-gray-400 hover:text-white transition-colors">Knowledge Hub</Link>
            <Link href="/admin/reports" className="text-gray-400 hover:text-white transition-colors">Incident Archives</Link>
          </nav>
        </div>
      </header>
      {children}
    </>
  );
}
