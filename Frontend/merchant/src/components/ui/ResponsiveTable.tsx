"use client";

import React from "react";
import { Card } from "@vayva/ui";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  mobileLabel?: string;
  priority?: "high" | "medium" | "low";
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function ResponsiveTable<T>({
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
          <div key={i} className="h-16 bg-white-2/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-8 text-center text-gray-400">{emptyMessage}</Card>
    );
  }

  return (
    <>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
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
                onKeyDown={(e: React.KeyboardEvent<HTMLTableRowElement>) => {
                  if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onRowClick(item);
                  }
                }}
                className={`
                  hover:bg-white-2/50 transition-colors focus:outline-none focus:bg-white-2/60
                  ${onRowClick ? "cursor-pointer" : ""}
                `}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-4 text-sm text-gray-900"
                  >
                    {col.render
                      ? col.render(item)
                      : ((item as Record<string, unknown>)[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {data.map((item) => (
          <Card
            key={keyExtractor(item)}
            role={onRowClick ? "button" : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
              if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onRowClick(item);
              }
            }}
            className={`
              p-4 space-y-2 focus:outline-none focus:ring-2 focus:ring-green-500/50
              ${onRowClick ? "cursor-pointer active:scale-[0.98] transition-transform" : ""}
            `}
            onClick={() => onRowClick?.(item)}
          >
            {columns
              .filter((col) => col.priority !== "low")
              .map((col) => (
                <div
                  key={col.key}
                  className="flex justify-between items-start gap-2"
                >
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide min-w-[80px]">
                    {col.mobileLabel || col.label}
                  </span>
                  <span className="text-sm text-gray-900 text-right flex-1">
                    {col.render
                      ? col.render(item)
                      : ((item as Record<string, unknown>)[col.key] as React.ReactNode)}
                  </span>
                </div>
              ))}
          </Card>
        ))}
      </div>
    </>
  );
}
