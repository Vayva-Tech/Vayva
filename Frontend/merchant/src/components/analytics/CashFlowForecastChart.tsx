"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CashFlowForecast } from "@/types/intelligence";

interface CashFlowForecastChartProps {
  data: CashFlowForecast[];
}

export function CashFlowForecastChart({ data }: CashFlowForecastChartProps) {
  const chartData = data.map((forecast) => ({
    date: new Date(forecast.date).toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
    }),
    inflow: forecast.predictedInflow,
    outflow: forecast.predictedOutflow,
    net: forecast.netFlow,
    runway: forecast.runwayDays,
    lowBalance: forecast.alerts.lowBalance,
  }));

  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-4">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-white p-3 shadow-sm">
                      <p className="font-medium">{label}</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p className="text-green-600">
                          Inflow: {formatCurrency(payload[0].value as number)}
                        </p>
                        <p className="text-red-600">
                          Outflow: {formatCurrency(payload[1].value as number)}
                        </p>
                        <p className="font-medium">
                          Net: {formatCurrency((payload[2]?.value as number) || 0)}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar dataKey="inflow" name="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outflow" name="Outflow" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cash Flow Alerts */}
      <div className="grid gap-4 md:grid-cols-3">
        {data.slice(0, 7).map((day, idx) => (
          <div
            key={idx}
            className={`rounded-lg border p-3 ${
              day.alerts.lowBalance
                ? "border-red-200 bg-red-50"
                : day.alerts.shortfallRisk > 0.3
                ? "border-amber-200 bg-orange-50"
                : "border-green-200 bg-green-50"
            }`}
          >
            <div className="text-sm font-medium">
              {new Date(day.date).toLocaleDateString("en-NG", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="mt-1 text-lg font-bold">
              {formatCurrency(day.netFlow)}
            </div>
            {day.runwayDays !== null && day.runwayDays !== undefined && (
              <div className="text-xs text-gray-500">
                Runway: {day.runwayDays} days
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
