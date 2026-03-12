"use client";

import { cn } from "@/lib/utils";

interface PageSkeletonProps {
  /** Layout variant for the skeleton */
  variant?: "table" | "cards" | "form" | "detail";
  /** Number of rows/cards to show */
  rows?: number;
  className?: string;
}

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-black/[0.06]", className)}
    />
  );
}

function TableSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <SkeletonPulse className="h-10 w-64" />
        <SkeletonPulse className="h-10 w-32" />
        <div className="flex-1" />
        <SkeletonPulse className="h-10 w-28" />
      </div>
      <div className="rounded-xl border border-white/50 bg-white/40 overflow-hidden">
        <div className="border-b border-black/5 px-4 py-3 flex gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonPulse key={i} className="h-4 w-24" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="border-b border-black/5 last:border-0 px-4 py-4 flex gap-6 items-center"
          >
            <SkeletonPulse className="h-4 w-32" />
            <SkeletonPulse className="h-4 w-24" />
            <SkeletonPulse className="h-4 w-20" />
            <SkeletonPulse className="h-4 w-16" />
            <SkeletonPulse className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CardsSkeleton({ rows: _rows }: { rows: number }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/50 bg-white/40 p-5 space-y-3"
          >
            <SkeletonPulse className="h-4 w-20" />
            <SkeletonPulse className="h-7 w-28" />
            <SkeletonPulse className="h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-white/50 bg-white/40 p-6">
        <SkeletonPulse className="h-48 w-full rounded-lg" />
      </div>
    </div>
  );
}

function FormSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-6 max-w-2xl">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonPulse className="h-4 w-24" />
          <SkeletonPulse className="h-10 w-full" />
        </div>
      ))}
      <SkeletonPulse className="h-10 w-32" />
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <SkeletonPulse className="h-5 w-20" />
        <SkeletonPulse className="h-5 w-3" />
        <SkeletonPulse className="h-5 w-32" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-xl border border-white/50 bg-white/40 p-6 space-y-4">
            <SkeletonPulse className="h-5 w-40" />
            <SkeletonPulse className="h-4 w-full" />
            <SkeletonPulse className="h-4 w-3/4" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-white/50 bg-white/40 p-6 space-y-3">
            <SkeletonPulse className="h-5 w-24" />
            <SkeletonPulse className="h-4 w-full" />
            <SkeletonPulse className="h-4 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton({
  variant = "table",
  rows = 5,
  className,
}: PageSkeletonProps) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-6 py-8 space-y-6", className)}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <SkeletonPulse className="h-4 w-16" />
          <SkeletonPulse className="h-8 w-48" />
          <SkeletonPulse className="h-4 w-64" />
        </div>
        <SkeletonPulse className="h-10 w-32" />
      </div>

      {variant === "table" && <TableSkeleton rows={rows} />}
      {variant === "cards" && <CardsSkeleton rows={rows} />}
      {variant === "form" && <FormSkeleton rows={rows} />}
      {variant === "detail" && <DetailSkeleton />}
    </div>
  );
}
