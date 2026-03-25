"use client";

import React from "react";
import { cn } from "@vayva/ui";

export interface PageWithInsightsProps {
  children: React.ReactNode;
  insights?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  insightsClassName?: string;
}

export function PageWithInsights({
  children,
  insights,
  className,
  contentClassName,
  insightsClassName,
}: PageWithInsightsProps) {
  if (!insights) {
    return <div className={cn("min-w-0", className)}>{children}</div>;
  }

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start", className)}>
      <div className={cn("min-w-0", contentClassName)}>{children}</div>
      <aside className={cn("hidden lg:block sticky top-6 self-start", insightsClassName)}>
        <div className="space-y-4">{insights}</div>
      </aside>
    </div>
  );
}

