"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { cn } from "@vayva/ui";

// --- Revenue Area Chart ---
interface RevenueChartProps {
  data: { date: string; revenue: number; orders: number }[];
}

export const RevenueAreaChart = ({ data }: RevenueChartProps) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-96">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Revenue Performance
          </h3>
          <p className="text-sm text-gray-400">Last 7 Days</p>
        </div>
        <div className="flex gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-xs text-gray-400 font-medium">
            Revenue
          </span>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.1}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="hsl(var(--border))"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--text-tertiary))", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--text-tertiary))", fontSize: 12 }}
              tickFormatter={(value: string) => `₦${Number(value) / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--surface-1))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                padding: "12px",
                boxShadow: "0 10px 15px -3px hsl(var(--shadow) / 0.1)",
              }}
              itemStyle={{ color: "hsl(var(--text-green-500))", fontSize: "12px", fontWeight: 600 }}
              labelStyle={{
                color: "hsl(var(--text-tertiary))",
                fontSize: "11px",
                marginBottom: "4px",
              }}
              formatter={(value: number | undefined) => [
                `₦${(value || 0).toLocaleString()}`,
                "Revenue",
              ]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- Orders Stacked Bar Chart ---
interface OrdersChartProps {
  data: {
    date: string;
    completed: number;
    pending: number;
    cancelled: number;
  }[];
}

export const OrdersBreakdownChart = ({ data }: OrdersChartProps) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-96 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Order Volume</h3>
          <p className="text-sm text-gray-400">Daily Breakdown</p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="hsl(var(--border))"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--text-tertiary))", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--text-tertiary))", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--surface-2))" }}
              contentStyle={{
                backgroundColor: "hsl(var(--surface-1))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px hsl(var(--shadow) / 0.1)",
              }}
              labelStyle={{
                color: "hsl(var(--text-secondary))",
                fontSize: "11px",
                marginBottom: "4px",
              }}
              itemStyle={{ color: "hsl(var(--text-green-500))", fontSize: "12px", fontWeight: 600 }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
              formatter={(value: string) => (
                <span className="text-xs font-bold text-gray-400 ml-1">
                  {value}
                </span>
              )}
            />
            <Bar
              dataKey="completed"
              stackId="a"
              fill="hsl(var(--primary))"
              radius={[0, 0, 4, 4]}
              name="Completed"
              barSize={20}
            />
            <Bar
              dataKey="pending"
              stackId="a"
              fill="hsl(var(--status-warning))"
              name="Pending"
              barSize={20}
            />
            <Bar
              dataKey="cancelled"
              stackId="a"
              fill="hsl(var(--status-danger))"
              radius={[4, 4, 0, 0]}
              name="Cancelled"
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- Fulfillment Indicator ---
interface FulfillmentProps {
  avgTime: string; // e.g. "45m"
  targetTime: string; // e.g. "60m"
  percentage: number; // 0-100
  status: "OPTIMAL" | "SLOW" | "CRITICAL";
}

export const FulfillmentSpeed = ({
  avgTime,
  targetTime,
  percentage,
  status,
}: FulfillmentProps) => {
  const color =
    status === "OPTIMAL"
      ? "bg-status-success"
      : status === "SLOW"
        ? "bg-status-warning"
        : "bg-status-danger";
  const textColor =
    status === "OPTIMAL"
      ? "text-status-success"
      : status === "SLOW"
        ? "text-status-warning"
        : "text-status-danger";
  const bg =
    status === "OPTIMAL"
      ? "bg-status-success/10"
      : status === "SLOW"
        ? "bg-status-warning/10"
        : "bg-status-danger/10";

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center h-full">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
        Fulfillment Speed
      </h3>

      <div className="flex items-end gap-2 mb-2">
        <span className="text-4xl font-bold text-gray-900">{avgTime}</span>
        <span className="text-sm text-gray-400 mb-1">avg. delivery</span>
      </div>

      <div className="w-full h-3 bg-white-2/50 rounded-full overflow-hidden mb-3">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000",
            color,
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-400">Target: {targetTime}</span>
        <span
          className={cn("font-bold px-2 py-0.5 rounded-full", bg, textColor)}
        >
          {status}
        </span>
      </div>
    </div>
  );
};
