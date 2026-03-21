"use client";

import React from "react";
import { cn } from "@vayva/ui";

interface StatusPillProps {
  status: "DRAFT" | "PUBLISHED" | "LIVE" | "MODIFIED" | "APPLIED" | string;
  variant?: "success" | "warning" | "neutral" | "info";
  className?: string;
}

export function StatusPill({ status, variant, className }: StatusPillProps) {
  const normalizedStatus = status.toUpperCase();

  const statusVariants = {
    PUBLISHED: "bg-green-500/10 text-green-600 border-green-500/20",
    LIVE: "bg-green-500/10 text-green-600 border-green-500/20",
    DRAFT: "bg-orange-500/10 text-orange-600 border-amber-500/20",
    MODIFIED: "bg-blue-500/10 text-blue-600 border-blue-500/20 animate-pulse",
    APPLIED: "bg-zinc-100 text-zinc-600 border-zinc-200",
  };

  const manualVariants = {
    success: "bg-green-500/10 text-green-600 border-green-500/20",
    warning: "bg-orange-500/10 text-orange-600 border-amber-500/20",
    neutral: "bg-zinc-100 text-zinc-600 border-zinc-200",
    info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  };

  const currentVariant = variant 
    ? manualVariants[variant]
    : statusVariants[normalizedStatus as keyof typeof statusVariants] ||
      "bg-zinc-100 text-zinc-600 border-zinc-200";

  const displayLabel = normalizedStatus === "PUBLISHED" || normalizedStatus === "LIVE"
    ? "Live"
    : normalizedStatus.charAt(0) + normalizedStatus.slice(1).toLowerCase();

  return (
    <span
      className={cn(
        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm",
        currentVariant,
        className,
      )}
    >
      {displayLabel}
    </span>
  );
}
