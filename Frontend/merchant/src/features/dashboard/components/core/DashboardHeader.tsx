/**
 * Dashboard Header Component
 * 
 * Unified header with title, description, and actions
 */

'use client';

import React from 'react';
import { cn } from '@vayva/ui';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export interface DashboardHeaderProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function DashboardHeader({
  title,
  description,
  actions,
  className,
}: DashboardHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b bg-white dark:bg-gray-800 dark:border-gray-700',
        className
      )}
    >
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left: Breadcrumbs + Title */}
        <div className="flex flex-1 items-center gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {title && (
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        {actions && (
          <div className="flex items-center gap-2">{actions}</div>
        )}
      </div>
    </header>
  );
}
