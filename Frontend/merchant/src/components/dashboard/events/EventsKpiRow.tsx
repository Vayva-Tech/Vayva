// @ts-nocheck
"use client";

import React from "react";
import { TrendingUp, Ticket, Users, Handshake, Percent } from "lucide-react";
import { formatCurrency } from "@vayva/ui";

interface Metric {
  value: number;
  change: number;
  trend: "up" | "down";
  isLive?: boolean;
  totalValue?: number;
}

interface Metrics {
  revenue?: Metric;
  ticketsSold?: Metric;
  attendees?: Metric;
  sponsors?: Metric & { totalValue?: number };
  conversionRate?: Metric;
}

interface EventsKpiRowProps {
  metrics?: Metrics;
  planTier?: string;
}

const ICON_MAP = {
  revenue: TrendingUp,
  ticketsSold: Ticket,
  attendees: Users,
  sponsors: Handshake,
  conversionRate: Percent,
};

export function EventsKpiRow({ metrics, planTier }: EventsKpiRowProps) {
  if (!metrics) {
    return null;
  }

  const metricEntries = Object.entries(metrics).filter(([_, data]) => data !== undefined);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {metricEntries.map(([key, data]: [string, any]) => {
        const Icon = ICON_MAP[key as keyof typeof ICON_MAP] || TrendingUp;
        const isLive = data.isLive;
        
        return (
          <div
            key={key}
            className="relative bg-white border-2 border-black rounded-xl p-5 shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] transition-all cursor-pointer group"
          >
            {/* Live Indicator */}
            {isLive && (
              <div className="absolute top-2 right-2">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 border-2 border-black"></span>
                </span>
              </div>
            )}

            {/* Icon */}
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center border-2 border-black mb-3 group-hover:scale-110 transition-transform">
              <Icon className="w-5 h-5 text-white" />
            </div>

            {/* Label */}
            <p className="text-xs font-black text-gray-700 uppercase tracking-wider mb-1">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </p>

            {/* Value */}
            <p className="text-3xl font-black text-gray-900 tracking-tight mb-2">
              {key === "revenue" || data.totalValue 
                ? formatCurrency(data.value) 
                : key === "conversionRate"
                ? `${data.value}%`
                : data.value.toLocaleString()}
            </p>

            {/* Change */}
            <div className={`flex items-center gap-1 text-xs font-bold ${
              data.trend === "up" ? "text-green-700" : "text-red-700"
            }`}>
              <span>{data.trend === "up" ? "↑" : "↓"}</span>
              <span>{Math.abs(data.change)}%</span>
            </div>

            {/* Sponsor total value */}
            {key === "sponsors" && data.totalValue && (
              <p className="text-xs font-bold text-gray-600 mt-2">
                Total: {formatCurrency(data.totalValue)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
