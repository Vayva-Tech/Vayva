/**
 * Loading Skeleton Components
 *
 * Reusable skeleton components for loading states across the dashboard.
 *
 * Usage:
 * ```tsx
 * import { CardSkeleton, TableSkeleton, ListSkeleton } from '@/components/LoadingSkeletons';
 *
 * {loading ? <TableSkeleton rows={5} /> : <Table data={data} />}
 * ``// 
 */

import React from "react";
import { cn } from "@vayva/ui";

// Base skeleton component with premium shimmer
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-white/40 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
        className,
      )}
      {...props}
    />
  );
}

// Card skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-background rounded-xl border border-border p-6",
        className,
      )}
    >
      <Skeleton className="h-4 w-1/3 mb-4" />
      <Skeleton className="h-8 w-2/3 mb-2" />
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
}

// Table skeleton
export function TableSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="bg-background rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="border-b border-border p-4 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="border-b border-border/40 p-4 flex gap-4"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// List skeleton
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="bg-background rounded-lg border border-border p-4 flex items-center gap-4"
        >
          <Skeleton className="h-12 w-12 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

// Stats card skeleton
export function StatsCardSkeleton() {
  return (
    <div className="bg-background rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

// Chart skeleton
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-background rounded-xl border border-border p-6",
        className,
      )}
    >
      <Skeleton className="h-4 w-1/4 mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-end gap-2" style={{ height: 120 }}>
            {Array.from({ length: 7 }).map((_, j) => (
              <Skeleton
                key={j}
                className="flex-1"
                style={{ height: `${Math.random() * 100 + 20}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Page skeleton (full page loading state)
export function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Logo Loading State */}
      <div className="flex items-center justify-center py-12">
        <div className="relative w-16 h-16 animate-pulse">
          <img
            src="/vayva-logo-official.svg"
            alt="Vayva Logo"
            className="h-12 w-12 animate-pulse"
            style={{ width: "auto", height: "auto" }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      {/* Main Content */}
      <TableSkeleton rows={8} columns={5} />
    </div>
  );
}

// Wallet page skeleton
export function WalletPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Transactions Table */}
      <div className="bg-background rounded-xl border border-border p-6">
        <Skeleton className="h-6 w-40 mb-6" />
        <TableSkeleton rows={6} columns={4} />
      </div>
    </div>
  );
}

// Orders page skeleton
export function OrdersPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      {/* Orders List */}
      <ListSkeleton items={6} />
    </div>
  );
}

// Products page skeleton
export function ProductsPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Products Table */}
      <TableSkeleton rows={8} columns={6} />
    </div>
  );
}

// Control Center skeleton
export function ControlCenterSkeleton() {
  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
      <Skeleton className="h-20 w-full rounded-xl mb-8" />
      <Skeleton className="h-64 w-full rounded-xl mb-8" />
      <Skeleton className="h-40 w-full rounded-xl mb-8" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}
