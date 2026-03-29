/**
 * KPI Skeleton Component
 * 
 * Loading skeleton for dashboard KPI cards.
 * Matches the exact dimensions of real KPI cards to prevent layout shift.
 * 
 * Usage:
 * {isLoading ? (
 *   <div className="grid grid-cols-4 gap-6">
 *     {[1, 2, 3, 4].map(i => <KpiSkeleton key={i} />)
 *   </div>
 * ) : <KpiGrid data={data} />}
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface KpiSkeletonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function KpiSkeleton({ className, size = 'md' }: KpiSkeletonProps) {
  const sizeClasses = {
    sm: {
      height: 'h-24',
      titleWidth: 'w-20',
      valueWidth: 'w-16',
      trendWidth: 'w-24',
    },
    md: {
      height: 'h-28',
      titleWidth: 'w-24',
      valueWidth: 'w-20',
      trendWidth: 'w-28',
    },
    lg: {
      height: 'h-32',
      titleWidth: 'w-28',
      valueWidth: 'w-24',
      trendWidth: 'w-32',
    },
  };

  const config = sizeClasses[size];

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse',
        config.height,
        className
      )}
      role="status"
      aria-label="Loading metric..."
    >
      {/* Title */}
      <div className="flex items-center gap-2 mb-3">
        <div className={cn('h-4 bg-gray-200 rounded', config.titleWidth)} />
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2 mb-2">
        <div className={cn('h-8 bg-gray-300 rounded', config.valueWidth)} />
      </div>

      {/* Trend/Change */}
      <div className="flex items-center gap-2">
        <div className={cn('h-3 bg-gray-100 rounded', config.trendWidth)} />
        <div className={cn('h-3 bg-gray-100 rounded w-16')} />
      </div>
    </div>
  );
}

/**
 * KPI Grid Skeleton
 * Pre-configured grid of skeleton KPI cards
 */
export function KpiGridSkeleton({
  count = 4,
  size = 'md',
}: {
  count?: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <KpiSkeleton key={i} size={size} />
      ))}
    </div>
  );
}
