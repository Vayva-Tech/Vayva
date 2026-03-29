/**
 * Dashboard Shell Component
 * 
 * Main container for all dashboard pages
 * Provides consistent layout, header, sidebar, and footer
 */

'use client';

import React from 'react';
import { cn } from '@vayva/ui';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardFooter } from './DashboardFooter';
import { DashboardGrid } from './DashboardGrid';

export interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function DashboardShell({
  children,
  title,
  description,
  actions,
  className,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Desktop */}
      <DashboardSidebar />
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <DashboardHeader title={title} description={description} actions={actions} />
        
        {/* Page Content */}
        <main className={cn('flex-1 overflow-y-auto p-6', className)}>
          <DashboardGrid>{children}</DashboardGrid>
        </main>
        
        {/* Footer */}
        <DashboardFooter />
      </div>
    </div>
  );
}
