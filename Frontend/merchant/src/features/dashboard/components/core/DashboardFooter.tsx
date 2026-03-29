/**
 * Dashboard Footer Component
 * 
 * Simple footer with copyright and links
 */

'use client';

import React from 'react';
import { cn } from '@vayva/ui';

export interface DashboardFooterProps {
  className?: string;
}

export function DashboardFooter({ className }: DashboardFooterProps) {
  return (
    <footer
      className={cn(
        'border-t bg-white px-6 py-4 dark:bg-gray-800 dark:border-gray-700',
        className
      )}
    >
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Vayva. All rights reserved.
        </p>
        <div className="flex gap-4">
          <a
            href="/docs"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Documentation
          </a>
          <a
            href="/support"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Support
          </a>
          <a
            href="/privacy"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}
