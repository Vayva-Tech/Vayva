"use client";

import React from "react";
import { cn } from "@vayva/ui";

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4", className)}>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-gray-900 tracking-tight truncate">
          {title}
        </div>
        {subtitle ? (
          <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

