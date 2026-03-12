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

export interface AIUsageChartProps {
  data: { label: string; value: number }[];
}

export function AIUsageChart({ data }: AIUsageChartProps) {
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: "rgba(255,255,255,0.92)",
      border: "1px solid rgba(0,0,0,0.06)",
      borderRadius: "14px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    },
    itemStyle: { color: "#0f172a", fontSize: 12, fontWeight: 600 },
    labelStyle: { color: "#64748b", fontSize: 11, marginBottom: 4 },
  };

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
            tick={{ fill: "#94a3b8", fontSize: 10 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 10 }}
          />
          <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={24}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === data.length - 1 ? "#10b981" : "#d1fae5"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
