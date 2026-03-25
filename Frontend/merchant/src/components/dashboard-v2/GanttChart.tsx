"use client";

import React, { useState, useMemo, useRef } from "react";
import { cn, Button } from "@vayva/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ============================================================================
// Types
// ============================================================================
export interface GanttRow {
  id: string;
  title: string;
  subtitle?: string;
  startDate: Date;
  endDate: Date;
  status: "pending" | "processing" | "delivered" | "cancelled";
  progress: number; // 0-100
}

export interface GanttChartProps {
  rows: GanttRow[];
  startDate?: Date;
  endDate?: Date;
}

type ViewMode = "week" | "month" | "quarter";

// ============================================================================
// Helpers
// ============================================================================
const STATUS_COLORS: Record<GanttRow["status"], { bg: string; fill: string; text: string }> = {
  pending: { bg: "bg-yellow-100", fill: "bg-yellow-400", text: "text-yellow-700" },
  processing: { bg: "bg-blue-100", fill: "bg-blue-400", text: "text-blue-700" },
  delivered: { bg: "bg-green-100", fill: "bg-green-500", text: "text-green-700" },
  cancelled: { bg: "bg-gray-100", fill: "bg-gray-300", text: "text-gray-500" },
};

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ============================================================================
// GanttChart Component
// ============================================================================
export function GanttChart({ rows, startDate: propStart, endDate: propEnd }: GanttChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{
    row: GanttRow;
    x: number;
    y: number;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Compute timeline range
  const { timelineStart, timelineEnd, totalDays, columns } = useMemo(() => {
    let minDate: Date;
    let maxDate: Date;

    if (propStart && propEnd) {
      minDate = startOfDay(propStart);
      maxDate = startOfDay(propEnd);
    } else if (rows.length === 0) {
      minDate = startOfDay(new Date());
      maxDate = addDays(minDate, 14);
    } else {
      minDate = startOfDay(
        new Date(Math.min(...rows.map((r) => r.startDate.getTime())))
      );
      maxDate = startOfDay(
        new Date(Math.max(...rows.map((r) => r.endDate.getTime())))
      );
    }

    // Add padding
    minDate = addDays(minDate, -2);
    maxDate = addDays(maxDate, 3);

    const total = diffDays(minDate, maxDate) + 1;

    // Build column headers based on view mode
    const cols: { label: string; subLabel?: string; date: Date; span: number }[] = [];
    if (viewMode === "week") {
      for (let i = 0; i < total; i++) {
        const d = addDays(minDate, i);
        cols.push({
          label: d.toLocaleDateString("en-US", { weekday: "short" }),
          subLabel: d.getDate().toString(),
          date: d,
          span: 1,
        });
      }
    } else if (viewMode === "month") {
      // Group by weeks
      let i = 0;
      while (i < total) {
        const weekStart = addDays(minDate, i);
        const daysLeft = total - i;
        const span = Math.min(7, daysLeft);
        cols.push({
          label: formatShortDate(weekStart),
          date: weekStart,
          span,
        });
        i += span;
      }
    } else {
      // quarter — group by 2 weeks
      let i = 0;
      while (i < total) {
        const periodStart = addDays(minDate, i);
        const daysLeft = total - i;
        const span = Math.min(14, daysLeft);
        cols.push({
          label: formatShortDate(periodStart),
          date: periodStart,
          span,
        });
        i += span;
      }
    }

    return { timelineStart: minDate, timelineEnd: maxDate, totalDays: total, columns: cols };
  }, [rows, propStart, propEnd, viewMode]);

  // Column width based on view mode
  const cellWidth = viewMode === "week" ? 48 : viewMode === "month" ? 56 : 40;
  const totalWidth = totalDays * cellWidth;
  const labelColumnWidth = 200;

  // Today marker position
  const today = startOfDay(new Date());
  const todayOffset = diffDays(timelineStart, today);
  const todayX = todayOffset * cellWidth + cellWidth / 2;
  const showTodayMarker = todayOffset >= 0 && todayOffset <= totalDays;

  // Compute bar position for a row
  function getBarStyle(row: GanttRow) {
    const startOffset = Math.max(0, diffDays(timelineStart, row.startDate));
    const endOffset = Math.min(totalDays, diffDays(timelineStart, row.endDate));
    const barDays = Math.max(1, endOffset - startOffset + 1);

    return {
      left: startOffset * cellWidth,
      width: barDays * cellWidth - 4,
    };
  }

  function handleScroll(direction: "left" | "right") {
    if (scrollRef.current) {
      const amount = cellWidth * 5;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  }

  const viewModes: { key: ViewMode; label: string }[] = [
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
    { key: "quarter", label: "Quarter" },
  ];

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <p className="text-sm text-gray-500">No orders to display on timeline.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleScroll("left")}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} className="text-gray-500" />
          </Button>
          <Button
            onClick={() => handleScroll("right")}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} className="text-gray-500" />
          </Button>
          <span className="text-xs text-gray-400 ml-2">
            {formatShortDate(timelineStart)} — {formatShortDate(timelineEnd)}
          </span>
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          {viewModes.map((vm) => (
            <Button
              key={vm.key}
              onClick={() => setViewMode(vm.key)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                viewMode === vm.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {vm.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex">
        {/* Left labels column — fixed */}
        <div
          className="flex-shrink-0 border-r border-gray-100"
          style={{ width: labelColumnWidth }}
        >
          {/* Header spacer */}
          <div className="h-12 border-b border-gray-100 px-4 flex items-center">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order
            </span>
          </div>
          {/* Row labels */}
          {rows.map((row) => (
            <div
              key={row.id}
              className={cn(
                "h-12 px-4 flex flex-col justify-center border-b border-gray-50 transition-colors",
                hoveredRow === row.id && "bg-gray-50"
              )}
              onMouseEnter={() => setHoveredRow(row.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <span className="text-sm font-medium text-gray-900 truncate">
                {row.title}
              </span>
              {row.subtitle && (
                <span className="text-xs text-gray-400 truncate">{row.subtitle}</span>
              )}
            </div>
          ))}
        </div>

        {/* Scrollable timeline */}
        <div ref={scrollRef} className="flex-1 overflow-x-auto">
          <div style={{ width: totalWidth, minWidth: "100%" }}>
            {/* Column headers */}
            <div className="h-12 border-b border-gray-100 flex">
              {columns.map((col, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center border-r border-gray-50"
                  style={{ width: col.span * cellWidth }}
                >
                  <span className="text-xs text-gray-400">{col.label}</span>
                  {col.subLabel && (
                    <span className="text-xs font-medium text-gray-600">
                      {col.subLabel}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Rows */}
            <div className="relative">
              {/* Today marker */}
              {showTodayMarker && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10 pointer-events-none"
                  style={{ left: todayX }}
                >
                  <div className="absolute -top-0 -translate-x-1/2 bg-red-400 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-b">
                    Today
                  </div>
                </div>
              )}

              {/* Grid lines (vertical) */}
              {viewMode === "week" &&
                Array.from({ length: totalDays }).map((_, i) => (
                  <div
                    key={`grid-${i}`}
                    className="absolute top-0 bottom-0 border-r border-gray-50"
                    style={{ left: (i + 1) * cellWidth }}
                  />
                ))}

              {/* Bars */}
              {rows.map((row) => {
                const { left, width } = getBarStyle(row);
                const colors = STATUS_COLORS[row.status];

                return (
                  <div
                    key={row.id}
                    className={cn(
                      "h-12 flex items-center border-b border-gray-50 transition-colors relative",
                      hoveredRow === row.id && "bg-gray-50/50"
                    )}
                    onMouseEnter={() => setHoveredRow(row.id)}
                    onMouseLeave={() => {
                      setHoveredRow(null);
                      setTooltipInfo(null);
                    }}
                  >
                    {/* Bar */}
                    <div
                      className={cn(
                        "absolute h-7 rounded-md overflow-hidden cursor-pointer transition-shadow",
                        colors.bg,
                        hoveredRow === row.id && "shadow-md ring-1 ring-black/5"
                      )}
                      style={{ left: left + 2, width: Math.max(width, 24) }}
                      onMouseMove={(e) => {
                        setTooltipInfo({
                          row,
                          x: e.clientX,
                          y: e.clientY,
                        });
                      }}
                      onMouseLeave={() => setTooltipInfo(null)}
                    >
                      {/* Progress fill */}
                      <div
                        className={cn("h-full rounded-md transition-all", colors.fill)}
                        style={{ width: `${row.progress}%`, opacity: 0.7 }}
                      />
                      {/* Label on bar */}
                      {width > 60 && (
                        <span
                          className={cn(
                            "absolute inset-0 flex items-center px-2 text-xs font-medium truncate",
                            colors.text
                          )}
                        >
                          {row.title}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltipInfo && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none shadow-lg"
          style={{
            left: tooltipInfo.x + 12,
            top: tooltipInfo.y - 40,
          }}
        >
          <p className="font-semibold">{tooltipInfo.row.title}</p>
          {tooltipInfo.row.subtitle && (
            <p className="text-gray-300">{tooltipInfo.row.subtitle}</p>
          )}
          <p className="text-gray-400 mt-1">
            {formatFullDate(tooltipInfo.row.startDate)} — {formatFullDate(tooltipInfo.row.endDate)}
          </p>
          <p className="text-gray-400">
            Progress: {tooltipInfo.row.progress}% | Status: {tooltipInfo.row.status}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 py-3 border-t border-gray-100">
        {(["pending", "processing", "delivered", "cancelled"] as const).map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className={cn("w-3 h-3 rounded-sm", STATUS_COLORS[status].fill)} />
            <span className="text-xs text-gray-500 capitalize">{status}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="w-3 h-0.5 bg-red-400 rounded" />
          <span className="text-xs text-gray-500">Today</span>
        </div>
      </div>
    </div>
  );
}
