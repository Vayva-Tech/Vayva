// @ts-nocheck
"use client";

import React from "react";
import { Card } from "@vayva/ui";
import { Briefcase, Clock, CurrencyDollar as DollarSign } from "@phosphor-icons/react";
import type { FirmPerformanceMetrics } from "@/types/legal";

interface FirmPerformanceProps {
  data?: FirmPerformanceMetrics;
}

export function FirmPerformance({ data }: FirmPerformanceProps) {
  if (!data) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-l-4 border-blue-900 shadow-lg  bg-white/90">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase size={24} className="text-blue-900" />
        <h2 className="text-xl font-bold text-gray-900">Firm Performance</h2>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Active Cases */}
        <div className="space-y-2">
          <div className="text-sm text-gray-500">Active Cases</div>
          <div className="text-3xl font-bold text-gray-900 font-serif">
            {data.activeCases}
          </div>
          <div className="text-xs text-green-600">
            ▲ {data.newCasesThisWeek} new this week
          </div>
        </div>

        {/* Billable Hours MTD */}
        <div className="space-y-2">
          <div className="text-sm text-gray-500">Billable Hours MTD</div>
          <div className="text-3xl font-bold text-gray-900 font-serif">
            {data.billableHoursMTD.toFixed(1)}h
          </div>
          <div className="text-xs text-gray-500">
            Target: {data.billableHoursTarget}h
          </div>
        </div>

        {/* Collections MTD */}
        <div className="space-y-2">
          <div className="text-sm text-gray-500">Collections MTD</div>
          <div className="text-3xl font-bold text-gray-900 font-serif">
            ₦{(data.collectionsMTD / 1000000).toFixed(1)}M
          </div>
          <div className="text-xs text-green-600">
            ▲ {data.collectionsVariancePercent}% vs plan
          </div>
        </div>
      </div>
    </Card>
  );
}
