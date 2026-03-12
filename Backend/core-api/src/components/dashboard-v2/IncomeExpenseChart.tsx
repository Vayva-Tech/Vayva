"use client";

import { formatCurrency } from "@vayva/shared";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export function IncomeExpenseChart({
  data,
  currency,
  chart = "line",
}: {
  data: { label: string; income: number; expense: number }[];
  currency: string;
  chart?: "line" | "area";
}) {
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: "rgba(255,255,255,0.92)",
      border: "1px solid rgba(0,0,0,0.06)",
      borderRadius: "14px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    },
    itemStyle: { color: "#0f172a", fontSize: 12, fontWeight: 600 },
    labelStyle: { color: "#64748b", fontSize: 11, marginBottom: 6 },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any, name: any) => [
    formatCurrency(Number(value || 0), currency),
    name === "income" ? "Income" : "Expense",
  ];

  const axisProps = {
    axisLine: false as const,
    tickLine: false as const,
    tick: { fill: "rgba(100,116,139,0.9)", fontSize: 11 },
  };

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {chart === "area" ? (
          <AreaChart
            data={data}
            margin={{ top: 8, right: 12, bottom: 4, left: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="rgba(0,0,0,0.06)"
              strokeDasharray="3 3"
            />
            <XAxis dataKey="label" {...axisProps} dy={10} />
            <YAxis
              {...axisProps}
              width={36}
              tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
            />
            <Tooltip {...tooltipStyle} formatter={tooltipFormatter} />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#3B82F6"
              fill="rgba(59,130,246,0.18)"
              strokeWidth={3}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#F97316"
              fill="rgba(249,115,22,0.18)"
              strokeWidth={3}
            />
          </AreaChart>
        ) : (
          <LineChart
            data={data}
            margin={{ top: 8, right: 12, bottom: 4, left: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="rgba(0,0,0,0.06)"
              strokeDasharray="3 3"
            />
            <XAxis dataKey="label" {...axisProps} dy={10} />
            <YAxis
              {...axisProps}
              width={36}
              tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
            />
            <Tooltip {...tooltipStyle} formatter={tooltipFormatter} />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{
                r: 3,
                fill: "#3B82F6",
                stroke: "rgba(255,255,255,0.9)",
                strokeWidth: 2,
              }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#F97316"
              strokeWidth={3}
              dot={{
                r: 3,
                fill: "#F97316",
                stroke: "rgba(255,255,255,0.9)",
                strokeWidth: 2,
              }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
