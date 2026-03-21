"use client";

import React from "react";
import { TrendChart } from "@/components/trend-chart";
import { Icon } from "@vayva/ui";

interface AnalyticsPageClientProps {
  funnel: { step: string; count: number }[];
  dailyRevenue: number[];
  eventCounts: { action: string; category: string; count: number }[];
  totalRevenue: number;
}

export function AnalyticsPageClient({
  funnel,
  dailyRevenue,
  eventCounts,
  totalRevenue,
}: AnalyticsPageClientProps) {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-400 text-sm">
          Performance insights for the last 30 days
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white  p-6 rounded-2xl border border-gray-100 shadow-sm md:col-span-2">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">
                Total Revenue (30d)
              </p>
              <h2 className="text-3xl font-bold font-mono">
                ₦{totalRevenue.toLocaleString()}
              </h2>
            </div>
            <div className="flex items-center gap-1 text-green-600 font-bold text-sm bg-green-50 px-2 py-1 rounded-full">
              <Icon name="TrendingUp" size={14} />
              <span>Live</span>
            </div>
          </div>
          <div className="h-64">
            <TrendChart data={dailyRevenue} color="#10B981" height={250} />
          </div>
        </div>

        {/* Funnel */}
        <div className="bg-white  p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Conversion Funnel</h3>
          <div className="space-y-4">
            {funnel.map((step, i) => (
              <div key={step.step} className="relative">
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span>{step.step}</span>
                  <span>{step.count}</span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width: `${Math.max(5, (step.count / (funnel[0]?.count || 1)) * 100)}%`,
                    }}
                  />
                </div>
                {i < funnel.length - 1 && (
                  <div className="absolute left-4 -bottom-4 z-10 text-gray-400">
                    ↓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Top Events */}
        <div className="bg-white  p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Top Store Events</h3>
          <div className="space-y-3">
            {eventCounts.slice(0, 5).map((event, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold text-xs">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      {event.action}
                    </p>
                    <p className="text-xs text-gray-400">
                      {event.category}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm">
                  {event.count}
                </span>
              </div>
            ))}
            {eventCounts.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">
                No events recorded yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
