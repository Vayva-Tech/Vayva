"use client";

import React from "react";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import {
  Lifebuoy,
  TrendUp,
  Clock,
  CheckCircle,
  Warning,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  ChartBar,
  ChartPie,
  Pulse,
  Storefront,
} from "@phosphor-icons/react/ssr";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import Link from "next/link";

interface SupportAnalytics {
  overview: {
    totalTickets: number;
    openTickets: number;
    resolvedToday: number;
    avgResolutionTime: number;
    satisfactionScore: number;
  };
  byCategory: {
    category: string;
    count: number;
    avgResolutionTime: number;
    percentage: number;
  }[];
  byPriority: {
    priority: string;
    count: number;
    avgResolutionTime: number;
  }[];
  volumeTrend: {
    date: string;
    created: number;
    resolved: number;
  }[];
  agentPerformance: {
    agentId: string;
    agentName: string;
    ticketsResolved: number;
    avgResolutionTime: number;
    satisfactionScore: number;
  }[];
  escalationMetrics: {
    totalEscalations: number;
    escalationRate: number;
    avgEscalationTime: number;
  };
  merchantHealth: {
    highTicketMerchants: { storeId: string; storeName: string; ticketCount: number }[];
    avgTicketsPerMerchant: number;
  };
}

export default function SupportAnalyticsPage(): React.JSX.Element {
  const { data: analytics, isLoading } = useOpsQuery<SupportAnalytics>(
    ["support-analytics"],
    () =>
      fetch("/api/ops/support/analytics").then((res) =>
        res.json().then((j) => j.data),
      ),
    { refetchInterval: 60000 },
  );

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "CRITICAL":
        return "bg-red-100 text-red-700";
      case "HIGH":
        return "bg-orange-100 text-orange-700";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";
      case "LOW":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatHours = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  if (isLoading) {
    return (
      <OpsPageShell
        title="Support Analytics"
        description="Comprehensive support metrics and performance insights"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      </OpsPageShell>
    );
  }

  return (
    <OpsPageShell
      title="Support Analytics"
      description="Comprehensive support metrics and performance insights"
    >
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">Total Tickets (30d)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {analytics?.overview.totalTickets.toLocaleString() || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Lifebuoy className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">Open Tickets</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {analytics?.overview.openTickets.toLocaleString() || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Warning className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">Resolved Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {analytics?.overview.resolvedToday.toLocaleString() || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">Avg Resolution</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatHours(analytics?.overview.avgResolutionTime || 0)}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">Satisfaction</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {analytics?.overview.satisfactionScore.toFixed(1) || "0.0"}/5
              </p>
            </div>
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <TrendUp className="w-5 h-5 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volume Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Pulse className="w-5 h-5 text-indigo-600" />
              Ticket Volume Trend (14 Days)
            </h3>
          </div>
          <div className="h-64 flex items-end gap-2">
            {analytics?.volumeTrend.map((day, idx) => {
              const maxVal = Math.max(
                ...analytics.volumeTrend.map((d) => Math.max(d.created, d.resolved)),
                1
              );
              const createdHeight = (day.created / maxVal) * 100;
              const resolvedHeight = (day.resolved / maxVal) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-0.5 items-end h-48">
                    <div
                      className="flex-1 bg-indigo-500 rounded-t"
                      style={{ height: `${createdHeight}%` }}
                      title={`Created: ${day.created}`}
                    />
                    <div
                      className="flex-1 bg-green-500 rounded-t"
                      style={{ height: `${resolvedHeight}%` }}
                      title={`Resolved: ${day.resolved}`}
                    />
                  </div>
                  <span className="text-xs text-gray-500 rotate-45 origin-left translate-y-2">
                    {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-indigo-500 rounded" />
              <span className="text-sm text-gray-600">Created</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-sm text-gray-600">Resolved</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ChartPie className="w-5 h-5 text-indigo-600" />
            Tickets by Category
          </h3>
          <div className="space-y-3">
            {analytics?.byCategory.map((cat) => (
              <div key={cat.category} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                    <span className="text-sm text-gray-500">{cat.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-400 w-12 text-right">
                  {cat.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ChartBar className="w-5 h-5 text-indigo-600" />
            Priority Breakdown
          </h3>
          <div className="space-y-3">
            {analytics?.byPriority.map((pri) => (
              <div
                key={pri.priority}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${getPriorityColor(pri.priority)}`}>
                    {pri.priority}
                  </span>
                  <span className="text-sm text-gray-600">{pri.count} tickets</span>
                </div>
                <span className="text-xs text-gray-500">
                  avg {formatHours(pri.avgResolutionTime)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Performance */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Agent Performance
          </h3>
          <div className="space-y-3">
            {analytics?.agentPerformance.slice(0, 5).map((agent) => (
              <div key={agent.agentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{agent.agentName}</div>
                  <div className="text-xs text-gray-500">
                    {agent.ticketsResolved} resolved · avg {formatHours(agent.avgResolutionTime)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {agent.satisfactionScore > 0 ? `${agent.satisfactionScore}/5` : "N/A"}
                  </div>
                  <div className="text-xs text-gray-500">rating</div>
                </div>
              </div>
            ))}
            {(!analytics?.agentPerformance || analytics.agentPerformance.length === 0) && (
              <div className="text-center text-gray-500 py-4">No agent data available</div>
            )}
          </div>
        </div>

        {/* Escalation Metrics */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-indigo-600" />
            Escalation Metrics
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Total Escalations (30d)</div>
              <div className="text-2xl font-bold text-gray-900">
                {analytics?.escalationMetrics.totalEscalations || 0}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Escalation Rate</div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-gray-900">
                  {analytics?.escalationMetrics.escalationRate || 0}%
                </div>
                {analytics && analytics.escalationMetrics.escalationRate > 10 && (
                  <ArrowUpRight className="w-5 h-5 text-red-500" />
                )}
                {analytics && analytics.escalationMetrics.escalationRate < 5 && (
                  <ArrowDownRight className="w-5 h-5 text-green-500" />
                )}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Avg Time to Escalate</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatHours(analytics?.escalationMetrics.avgEscalationTime || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Merchant Health */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Storefront className="w-5 h-5 text-indigo-600" />
            Merchant Health
          </h3>
          <div className="text-sm text-gray-500">
            Avg {analytics?.merchantHealth.avgTicketsPerMerchant.toFixed(1) || 0} tickets per merchant
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {analytics?.merchantHealth.highTicketMerchants.slice(0, 10).map((merchant) => (
            <Link
              key={merchant.storeId}
              href={`/ops/merchants/${merchant.storeId}`}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="font-medium text-gray-900 truncate">{merchant.storeName}</div>
              <div className={`text-sm mt-1 ${merchant.ticketCount > 5 ? "text-red-600 font-medium" : "text-gray-500"}`}>
                {merchant.ticketCount} tickets
              </div>
            </Link>
          ))}
          {(!analytics?.merchantHealth.highTicketMerchants ||
            analytics.merchantHealth.highTicketMerchants.length === 0) && (
            <div className="col-span-full text-center text-gray-500 py-4">
              No merchants with high ticket volume
            </div>
          )}
        </div>
      </div>
    </OpsPageShell>
  );
}
