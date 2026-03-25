"use client";

import React, { useState } from "react";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { Button } from "@vayva/ui";
import {
  TrendUp,
  TrendDown,
  Users,
  Globe,
  Cursor,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Clock,
  Pulse,
  ChartBar,
  ChartPie,
  MapPin,
  FileText,
  ArrowsClockwise,
} from "@phosphor-icons/react/ssr";

// ============================================================================
// Types
// ============================================================================

interface TrafficMetrics {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
}

interface AnalyticsSummary {
  period: string;
  totalPageViews: number;
  totalUniqueVisitors: number;
  totalSessions: number;
  avgBounceRate: number;
  avgSessionDuration: number;
  dailyData: TrafficMetrics[];
}

interface ConversionFunnel {
  step: string;
  visitors: number;
  conversions: number;
  dropOff: number;
  conversionRate: number;
}

interface ConversionMetrics {
  period: string;
  totalSignups: number;
  trialStarts: number;
  paidConversions: number;
  overallConversionRate: number;
  funnel: ConversionFunnel[];
  bySource: Record<string, { signups: number; conversionRate: number }>;
  byIndustry: Record<string, { signups: number; conversionRate: number }>;
}

interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
  newVisitors: number;
  avgSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
}

interface TrafficSourceData {
  period: string;
  totalVisitors: number;
  sources: TrafficSource[];
}

interface PageMetrics {
  path: string;
  title: string;
  pageViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  conversionRate: number;
}

interface PagesData {
  period: string;
  topPages: PageMetrics[];
  industryPages: Array<PageMetrics & { industry: string; ctaClicks: number }>;
}

type Period = "24h" | "7d" | "30d" | "90d";

// ============================================================================
// Components
// ============================================================================

function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  trendUp,
  color = "bg-white",
}: {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}) {
  return (
    <div className={`${color} p-6 rounded-2xl border border-gray-200 shadow-sm`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 bg-gray-100 rounded-xl">
          <Icon className="h-5 w-5 text-gray-700" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
              trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend}
          </div>
        )}
      </div>
      <div className="text-3xl font-black text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500 font-medium">{title}</div>
      {subValue && <div className="text-xs text-gray-400 mt-1">{subValue}</div>}
    </div>
  );
}

function TrafficChart({ data }: { data: TrafficMetrics[] }) {
  const maxValue = Math.max(...data.map((d) => d.pageViews), 1);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Traffic Trend</h3>
      <div className="h-64 flex items-end gap-2">
        {data.map((day, i) => (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col gap-1">
              <div
                className="w-full bg-indigo-500 rounded-t transition-all duration-500"
                style={{ height: `${(day.pageViews / maxValue) * 200}px` }}
                title={`${day.pageViews.toLocaleString()} page views`}
              />
            </div>
            <span className="text-xs text-gray-400">
              {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-500 rounded" />
          <span className="text-sm text-gray-600">Page Views</span>
        </div>
      </div>
    </div>
  );
}

function ConversionFunnelChart({ funnel }: { funnel: ConversionFunnel[] }) {
  const maxVisitors = Math.max(...funnel.map((f) => f.visitors), 1);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Conversion Funnel</h3>
      <div className="space-y-4">
        {funnel.map((step, index) => (
          <div key={step.step} className="relative">
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700">{step.step}</div>
              <div className="flex-1 h-10 bg-gray-100 rounded-lg overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg transition-all duration-500"
                  style={{ width: `${(step.visitors / maxVisitors) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-3">
                  <span className="text-sm font-bold text-white drop-shadow">
                    {step.visitors.toLocaleString()}
                  </span>
                  <span className="text-xs font-medium text-gray-600">
                    {step.conversionRate}%
                  </span>
                </div>
              </div>
            </div>
            {index < funnel.length - 1 && (
              <div className="flex justify-center my-2">
                <ArrowDownRight className="text-gray-400 rotate-45" size={16} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TrafficSourcesTable({ sources }: { sources: TrafficSource[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Traffic Sources</h3>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Source</th>
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Visitors</th>
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">%</th>
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Conv. Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sources.map((source) => (
            <tr key={source.source} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{source.source}</td>
              <td className="px-6 py-4 text-sm text-right text-gray-600">
                {source.visitors.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm text-right text-gray-600">{source.percentage}%</td>
              <td className="px-6 py-4 text-sm text-right">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                    source.conversionRate >= 6
                      ? "bg-green-100 text-green-700"
                      : source.conversionRate >= 4
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {source.conversionRate}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TopPagesTable({ pages }: { pages: PageMetrics[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Top Pages</h3>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Page</th>
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Views</th>
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Visitors</th>
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Conv.</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {pages.slice(0, 8).map((page) => (
            <tr key={page.path} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{page.title}</div>
                <div className="text-xs text-gray-500">{page.path}</div>
              </td>
              <td className="px-6 py-4 text-sm text-right text-gray-600">
                {page.pageViews.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm text-right text-gray-600">
                {page.uniqueVisitors.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm text-right">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                    page.conversionRate >= 8
                      ? "bg-green-100 text-green-700"
                      : page.conversionRate >= 5
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {page.conversionRate}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IndustryPagesTable({ pages }: { pages: Array<PageMetrics & { industry: string; ctaClicks: number }> }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Industry Pages Performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Industry</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Views</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">CTA Clicks</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Conv.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pages.slice(0, 10).map((page) => (
              <tr key={page.industry} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 capitalize">{page.industry}</div>
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-600">
                  {page.pageViews.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-600">
                  {page.ctaClicks.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                      page.conversionRate >= 6
                        ? "bg-green-100 text-green-700"
                        : page.conversionRate >= 4
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {page.conversionRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function MarketingDashboardPage(): React.JSX.Element {
  const [period, setPeriod] = useState<Period>("30d");

  const { data: analyticsData, isLoading: analyticsLoading, refetch: refetchAnalytics } = useOpsQuery<AnalyticsSummary>(
    ["marketing-analytics", period],
    () => fetch(`/api/ops/marketing/analytics?period=${period}`).then((res) => res.json()).then((j) => j.data),
    { enabled: true }
  );

  const { data: conversionData, isLoading: conversionLoading, refetch: refetchConversions } = useOpsQuery<ConversionMetrics>(
    ["marketing-conversions", period],
    () => fetch(`/api/ops/marketing/conversions?period=${period}`).then((res) => res.json()).then((j) => j.data),
    { enabled: true }
  );

  const { data: trafficData, isLoading: trafficLoading, refetch: refetchTraffic } = useOpsQuery<TrafficSourceData>(
    ["marketing-traffic", period],
    () => fetch(`/api/ops/marketing/traffic?period=${period}`).then((res) => res.json()).then((j) => j.data),
    { enabled: true }
  );

  const { data: pagesData, isLoading: pagesLoading, refetch: refetchPages } = useOpsQuery<PagesData>(
    ["marketing-pages", period],
    () => fetch(`/api/ops/marketing/pages?period=${period}`).then((res) => res.json()).then((j) => j.data),
    { enabled: true }
  );

  const handleRefresh = () => {
    refetchAnalytics();
    refetchConversions();
    refetchTraffic();
    refetchPages();
  };

  const isLoading = analyticsLoading || conversionLoading || trafficLoading || pagesLoading;

  return (
    <OpsPageShell
      title="Marketing Analytics"
      description="Monitor website performance, conversions, and traffic sources"
      headerActions={
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
            {(["24h", "7d", "30d", "90d"] as Period[]).map((p) => (
              <Button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  period === p
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {p === "24h" ? "24H" : p === "7d" ? "7D" : p === "30d" ? "30D" : "90D"}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <ArrowsClockwise className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      }
    >
      {/* Key Metrics */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Page Views"
            value={analyticsData?.totalPageViews.toLocaleString() ?? "—"}
            icon={Eye}
            trend="+12.5%"
            trendUp={true}
          />
          <StatCard
            title="Unique Visitors"
            value={analyticsData?.totalUniqueVisitors.toLocaleString() ?? "—"}
            icon={Users}
            trend="+8.3%"
            trendUp={true}
          />
          <StatCard
            title="Signups"
            value={conversionData?.totalSignups.toLocaleString() ?? "—"}
            icon={Target}
            trend="+15.2%"
            trendUp={true}
          />
          <StatCard
            title="Paid Conversions"
            value={conversionData?.paidConversions.toLocaleString() ?? "—"}
            icon={Pulse}
            trend="+22.1%"
            trendUp={true}
          />
        </div>
      </section>

      {/* Charts Row */}
      <section className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analyticsData?.dailyData && <TrafficChart data={analyticsData.dailyData} />}
          {conversionData?.funnel && <ConversionFunnelChart funnel={conversionData.funnel} />}
        </div>
      </section>

      {/* Secondary Metrics */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Avg. Session Duration"
            value={analyticsData ? `${Math.floor(analyticsData.avgSessionDuration / 60)}m ${analyticsData.avgSessionDuration % 60}s` : "—"}
            icon={Clock}
            color="bg-blue-50"
          />
          <StatCard
            title="Bounce Rate"
            value={analyticsData ? `${analyticsData.avgBounceRate}%` : "—"}
            icon={Pulse}
            color="bg-amber-50"
          />
          <StatCard
            title="Overall Conv. Rate"
            value={conversionData ? `${conversionData.overallConversionRate}%` : "—"}
            icon={TrendUp}
            color="bg-green-50"
          />
        </div>
      </section>

      {/* Tables Row */}
      <section className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trafficData?.sources && <TrafficSourcesTable sources={trafficData.sources} />}
          {pagesData?.topPages && <TopPagesTable pages={pagesData.topPages} />}
        </div>
      </section>

      {/* Industry Pages */}
      <section>
        {pagesData?.industryPages && <IndustryPagesTable pages={pagesData.industryPages} />}
      </section>
    </OpsPageShell>
  );
}
