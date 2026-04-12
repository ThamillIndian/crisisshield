"use client";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "destructive" | "warning" | "success" | "outline";

const variants: Record<BadgeVariant, string> = {
  default: "bg-indigo-100 text-indigo-700",
  destructive: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
  success: "bg-green-100 text-green-700",
  outline: "border border-gray-300 text-gray-600",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
