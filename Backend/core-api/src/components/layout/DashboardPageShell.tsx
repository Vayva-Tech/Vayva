"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "./Breadcrumbs";

interface DashboardPageShellProps {
  title: string;
  description?: string;
  category?: string;
  actions?: React.ReactNode;
  /** Custom breadcrumbs override. Pass `false` to hide breadcrumbs entirely. */
  breadcrumbs?: React.ReactNode | false;
  children: React.ReactNode;
  className?: string;
  /** Use glassmorphism hero style (dashboard home, wallet) vs flat data style */
  variant?: "default" | "hero";
}

export function DashboardPageShell({
  title,
  description,
  category,
  actions,
  breadcrumbs,
  children,
  className,
}: DashboardPageShellProps) {
  const showBreadcrumbs = breadcrumbs !== false;

  return (
    <div className={cn("flex-1 space-y-6", className)}>
      <div className="mx-auto w-full max-w-6xl px-6 py-6 space-y-6">
        {showBreadcrumbs && (
          <div className="-mb-3">
            {breadcrumbs && breadcrumbs !== true ? (
              breadcrumbs
            ) : (
              <Breadcrumbs />
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            {category && (
              <p className="text-[11px] uppercase tracking-[0.2em] text-text-tertiary font-semibold">
                {category}
              </p>
            )}
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-text-primary">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-text-secondary max-w-2xl">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-3 shrink-0">{actions}</div>
          )}
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
