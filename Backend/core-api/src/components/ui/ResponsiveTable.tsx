"use client";

import React from "react";
import { Card } from "@vayva/ui";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  mobileLabel?: string; // Optional label for mobile card view
  priority?: "high" | "medium" | "low"; // Determines visibility on mobile
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function ResponsiveTable<T extends object>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  loading,
  emptyMessage = "No data available",
}: ResponsiveTableProps<T>) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-white/40 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-8 text-center text-text-tertiary">{emptyMessage}</Card>
    );
  }

  return (
    <>
      {/* Desktop Table View (hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? "button" : undefined}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onRowClick(item);
                  }
                }}
                className={`
                  hover:bg-white/40 transition-colors focus:outline-none focus:bg-white/60
                  ${onRowClick ? "cursor-pointer" : ""}
                `}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-4 text-sm text-text-primary"
                  >
                    {col.render
                      ? col.render(item)
                      : ((item as Record<string, unknown>)[
                          col.key
                        ] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (visible only on mobile) */}
      <div className="md:hidden space-y-3">
        {data.map((item) => (
          <Card
            key={keyExtractor(item)}
            role={onRowClick ? "button" : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            onKeyDown={(e) => {
              if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onRowClick(item);
              }
            }}
            className={`
              p-4 space-y-2 focus:outline-none focus:ring-2 focus:ring-primary/50
              ${onRowClick ? "cursor-pointer active:scale-[0.98] transition-transform" : ""}
            `}
            onClick={() => onRowClick?.(item)}
          >
            {columns
              .filter((col) => col.priority !== "low") // Hide low-priority columns on mobile
              .map((col) => (
                <div
                  key={col.key}
                  className="flex justify-between items-start gap-2"
                >
                  <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wide min-w-[80px]">
                    {col.mobileLabel || col.label}
                  </span>
                  <span className="text-sm text-text-primary text-right flex-1">
                    {col.render
                      ? col.render(item)
                      : ((item as Record<string, unknown>)[
                          col.key
                        ] as React.ReactNode)}
                  </span>
                </div>
              ))}
          </Card>
        ))}
      </div>
    </>
  );
}
