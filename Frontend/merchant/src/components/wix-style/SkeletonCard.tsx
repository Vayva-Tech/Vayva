"use client";

import React from "react";
import { cn } from "@vayva/ui";

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-[32px] border border-gray-100 bg-white/30 animate-pulse overflow-hidden",
        className,
      )}
    >
      <div className="h-48 bg-white/30" />
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="h-6 bg-white/30 rounded-lg w-3/4" />
          <div className="h-4 bg-white/30 rounded-lg w-1/2" />
        </div>
        <div className="pt-2 flex gap-3">
          <div className="h-10 bg-white/30 rounded-xl flex-1" />
          <div className="h-10 bg-white/30 rounded-xl w-10" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
