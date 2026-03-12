"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { formatCurrency } from "@vayva/shared";

export interface AIUsageChartProps {
  data: { label: string; value: number }[];
  loading?: boolean;
}

export function AIUsageChart({ data, loading }: AIUsageChartProps) {
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: "var(--color-background)",
      border: "1px solid var(--color-border)",
      borderRadius: "14px",
      boxShadow: "var(--shadow-card)",
    },
    itemStyle: { color: "var(--color-text-primary)", fontSize: 12, fontWeight: 600 },
    labelStyle: { color: "var(--color-text-secondary)", fontSize: 11, marginBottom: 4 },
  };

  const SKELETON_HEIGHTS = [35, 55, 45, 70, 40, 60, 50];

  if (loading) {
    return (
      <div className="h-[180px] w-full mt-4 flex items-center justify-center">
        <div className="w-full h-full flex items-end gap-2 px-4 pb-8">
          {SKELETON_HEIGHTS.map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-surface-2 rounded-t animate-pulse"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[180px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
        >
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--color-text-tertiary)", fontSize: 10 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--color-text-tertiary)", fontSize: 10 }}
          />
          <Tooltip {...tooltipStyle} cursor={{ fill: "var(--color-background-hover)" }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={24}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === data.length - 1 ? "var(--color-success-500)" : "var(--color-success-100)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
