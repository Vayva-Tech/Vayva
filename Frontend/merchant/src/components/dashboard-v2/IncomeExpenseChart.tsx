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
      backgroundColor: "var(--color-background)",
      border: "1px solid var(--color-border)",
      borderRadius: "14px",
      boxShadow: "var(--)",
    },
    itemStyle: { color: "var(--color-text-green-500)", fontSize: 12, fontWeight: 600 },
    labelStyle: { color: "var(--color-text-secondary)", fontSize: 11, marginBottom: 6 },
  };

    const tooltipFormatter = (value: any, name: any) => [
    formatCurrency(Number(value || 0), currency),
    name === "income" ? "Income" : "Expense",
  ];

  const axisProps = {
    axisLine: false as const,
    tickLine: false as const,
    tick: { fill: "var(--color-text-tertiary)", fontSize: 11 },
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
              stroke="hsl(var(--shadow) / 0.06)"
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
              stroke="var(--color-primary-500)"
              fill="var(--color-primary-100)"
              strokeWidth={3}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="var(--color-warning-500)"
              fill="var(--color-warning-100)"
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
              stroke="hsl(var(--shadow) / 0.06)"
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
              stroke="var(--color-primary-500)"
              strokeWidth={3}
              dot={{
                r: 3,
                fill: "var(--color-primary-500)",
                stroke: "var(--color-background)",
                strokeWidth: 2,
              }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="var(--color-warning-500)"
              strokeWidth={3}
              dot={{
                r: 3,
                fill: "var(--color-warning-500)",
                stroke: "var(--color-background)",
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
