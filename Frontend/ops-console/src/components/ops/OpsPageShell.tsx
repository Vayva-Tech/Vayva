"use client";

import React from "react";
import { cn } from "@vayva/ui";
import { OpsBreadcrumbs } from "./OpsBreadcrumbs";

interface OpsPageShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: boolean;
  headerActions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function OpsPageShell({
  children,
  title,
  description,
  breadcrumbs = true,
  headerActions,
  className,
  contentClassName,
}: OpsPageShellProps): React.JSX.Element {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Section */}
      {(title || breadcrumbs || headerActions) && (
        <div className="space-y-4">
          {breadcrumbs && <OpsBreadcrumbs />}

          {(title || headerActions) && (
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                {title && (
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-sm text-gray-500">{description}</p>
                )}
              </div>
              {headerActions && (
                <div className="flex items-center gap-2 shrink-0">
                  {headerActions}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={contentClassName}>{children}</div>
    </div>
  );
}
