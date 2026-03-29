/**
 * Dashboard Grid Component
 * 
 * Responsive grid system for dashboard content
 */

'use client';

import React from 'react';
import { cn } from '@vayva/ui';

export interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

export function DashboardGrid({
  children,
  className,
  columns = 4,
  gap = 'lg',
}: DashboardGridProps) {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  const columnsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div
      className={cn(
        'grid',
        gapClasses[gap],
        columnsClasses[columns],
        className
      )}
    >
      {children}
    </div>
  );
}
