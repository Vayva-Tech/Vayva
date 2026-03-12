"use client";

import React from "react";
import { cn } from "@vayva/ui";

interface StatusPillProps {
  status: "DRAFT" | "PUBLISHED" | "LIVE" | "MODIFIED" | string;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  const normalizedStatus = status.toUpperCase();

  const variants = {
    PUBLISHED: "bg-green-500/10 text-green-600 border-green-500/20",
    LIVE: "bg-green-500/10 text-green-600 border-green-500/20",
    DRAFT: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    MODIFIED: "bg-blue-500/10 text-blue-600 border-blue-500/20 animate-pulse",
  };

  const currentVariant =
    variants[normalizedStatus as keyof typeof variants] ||
    "bg-zinc-100 text-zinc-600 border-zinc-200";

  return (
    <span
      className={cn(
        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm",
        currentVariant,
        className,
      )}
    >
      {normalizedStatus === "PUBLISHED" || normalizedStatus === "LIVE"
        ? "Live"
        : normalizedStatus}
    </span>
  );
}
