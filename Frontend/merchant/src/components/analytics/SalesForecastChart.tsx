"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SalesForecast } from "@/types/intelligence";

interface SalesForecastChartProps {
  data: SalesForecast[];
}

export function SalesForecastChart({ data }: SalesForecastChartProps) {
  const chartData = data.map((forecast) => ({
    date: new Date(forecast.period).toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
    }),
    predicted: forecast.predictedRevenue,
    upper: forecast.upperBound,
    lower: forecast.lowerBound,
    confidence: forecast.confidence,
  }));

  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
            </linearGradient>
          </defs>
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
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-500">
                        Predicted: {formatCurrency(payload[0].value as number)}
                      </p>
                      {payload[1] && (
                        <p className="text-xs text-gray-500">
                          Range: {formatCurrency(payload[1].value as number)} - {formatCurrency(payload[2]?.value as number)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="upper"
            stroke="transparent"
            fill="url(#colorConfidence)"
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="transparent"
            fill="transparent"
          />
          <Area
            type="monotone"
            dataKey="predicted"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorPredicted)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
