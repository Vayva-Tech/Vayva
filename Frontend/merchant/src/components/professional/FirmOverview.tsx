// @ts-nocheck
"use client";

import React from "react";
import { Card } from "@vayva/ui";
import { Briefcase, TrendUp as TrendingUp, CurrencyDollar, ChartBar } from "@phosphor-icons/react";
import type { FirmOverviewData } from "@/types/professional";

interface FirmOverviewProps {
  data?: FirmOverviewData;
}

export function FirmOverview({ data }: FirmOverviewProps) {
  if (!data) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  const utilizationPercentage = Math.round((data.utilizationRate / data.utilizationTarget) * 100);
  const revenueChangeClass = data.revenueGrowth >= 0 ? "text-green-600" : "text-red-600";
  const utilizationClass = utilizationPercentage >= 100 ? "text-green-600" : 
                           utilizationPercentage >= 80 ? "text-yellow-600" : "text-red-600";

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Briefcase size={20} className="text-blue-600" />
          Firm Overview
        </h2>
        <div className="text-sm text-gray-500">
          {data.newMattersThisMonth} new this month
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Active Matters */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Active Matters</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{data.activeMatters}</div>
          <div className="text-xs text-blue-700 mt-1">
            {data.closedMattersThisMonth} closed this month
          </div>
        </div>

        {/* Utilization Rate */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <ChartBar size={16} className="text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Utilization</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{data.utilizationRate}%</div>
          <div className={`text-xs mt-1 ${utilizationClass}`}>
            Target: {data.utilizationTarget}% ({utilizationPercentage}% of goal)
          </div>
        </div>

        {/* Revenue MTD */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <CurrencyDollar size={16} className="text-green-600" />
            <span className="text-sm font-medium text-green-800">Revenue MTD</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            ${(data.revenueMTD / 1000).toFixed(1)}K
          </div>
          <div className={`text-xs mt-1 ${revenueChangeClass}`}>
            <TrendingUp size={12} className="inline mr-1" />
            {data.revenueGrowth >= 0 ? '+' : ''}{data.revenueGrowth.toFixed(1)}% vs last period
          </div>
        </div>

        {/* Revenue vs Plan */}
        <div className="bg-orange-50 p-4 rounded-lg border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-orange-600" />
            <span className="text-sm font-medium text-amber-800">vs Plan</span>
          </div>
          <div className="text-2xl font-bold text-amber-900">
            {data.revenueVsPlan >= 0 ? '+' : ''}{data.revenueVsPlan.toFixed(1)}%
          </div>
          <div className="text-xs text-orange-700 mt-1">
            Performance against target
          </div>
        </div>
      </div>
    </Card>
  );
}