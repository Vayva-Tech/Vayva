"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "./Breadcrumbs";

interface PageShellProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageShell({
  title,
  description,
  actions,
  children,
  className,
}: PageShellProps) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-6 py-8 space-y-6", className)}
    >
      <Breadcrumbs />
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold text-text-primary">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-text-secondary max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {actions ? (
          <div className="flex items-center gap-3">{actions}</div>
        ) : null}
      </div>
      <div>{children}</div>
    </div>
  );
}
