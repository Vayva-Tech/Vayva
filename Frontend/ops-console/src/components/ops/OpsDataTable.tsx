"use client";

import React from "react";
import { cn , Card } from "@vayva/ui";
import { EmptyState } from "./EmptyState";
import { TableSkeleton } from "./Skeleton";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  mobileLabel?: string;
  priority?: "high" | "medium" | "low";
  className?: string;
}

interface OpsDataTableProps<T extends object> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelect?: (id: string) => void;
  onSelectAll?: () => void;
  className?: string;
}

export function OpsDataTable<T extends object>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  loading,
  emptyMessage = "No data available",
  emptyAction,
  selectable,
  selectedIds,
  onSelect,
  onSelectAll,
  className,
}: OpsDataTableProps<T>): React.JSX.Element {
  // Calculate selection state
  const allSelected = data.length > 0 && data.every((item) => selectedIds?.has(keyExtractor(item)));
  const someSelected = data.some((item) => selectedIds?.has(keyExtractor(item))) && !allSelected;

  if (loading) {
    return <TableSkeleton rows={5} columns={columns.length} className={className} />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        variant="default"
        title={emptyMessage}
        action={emptyAction}
        className={cn("py-12", className)}
      />
    );
  }

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 overflow-hidden", className)}>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 border-b border-gray-200">
            <tr>
              {selectable && (
                <th className="px-6 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={onSelectAll}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider",
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item: T) => {
              const itemKey = keyExtractor(item);
              const isSelected = selectedIds?.has(itemKey);

              return (
                <tr
                  key={itemKey}
                  onClick={() => onRowClick?.(item)}
                  tabIndex={onRowClick ? 0 : undefined}
                  role={onRowClick ? "button" : undefined}
                  onKeyDown={(e) => {
                    if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onRowClick(item);
                    }
                  }}
                  className={cn(
                    "transition-colors focus:outline-none focus:bg-indigo-50/50",
                    onRowClick && "cursor-pointer hover:bg-gray-50/50",
                    isSelected && "bg-indigo-50"
                  )}
                >
                  {selectable && (
                    <td
                      className="px-6 py-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect?.(itemKey);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelect?.(itemKey)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        aria-label={`Select row ${itemKey}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-6 py-4 text-sm text-gray-900",
                        col.className
                      )}
                    >
                      {col.render ? col.render(item) : (item as Record<string, React.ReactNode>)[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 p-4">
        {data.map((item: T) => {
          const itemKey = keyExtractor(item);
          const isSelected = selectedIds?.has(itemKey);

          return (
            <Card
              key={itemKey}
              role={onRowClick ? "button" : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={(e) => {
                if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onRowClick(item);
                }
              }}
              className={cn(
                "p-4 space-y-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
                onRowClick && "cursor-pointer active:scale-[0.98] transition-transform",
                isSelected && "ring-2 ring-indigo-500/20 bg-indigo-50/30"
              )}
              onClick={() => onRowClick?.(item)}
            >
              {/* Mobile Header with Checkbox */}
              {selectable && (
                <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      onSelect?.(itemKey);
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    aria-label={`Select row ${itemKey}`}
                  />
                </div>
              )}

              {/* Mobile Card Content */}
              {columns
                .filter((col) => col.priority !== "low")
                .map((col) => (
                  <div
                    key={col.key}
                    className="flex justify-between items-start gap-3"
                  >
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[100px]">
                      {col.mobileLabel || col.label}
                    </span>
                    <span className="text-sm text-gray-900 text-right flex-1">
                      {col.render
                        ? col.render(item)
                        : (item as Record<string, React.ReactNode>)[col.key]}
                    </span>
                  </div>
                ))}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
