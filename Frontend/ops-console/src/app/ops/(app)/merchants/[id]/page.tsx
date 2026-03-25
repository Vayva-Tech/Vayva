"use client";
import { Button } from "@vayva/ui";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Zap,
  CreditCard,
  Globe,
  Shield,
  AlertCircle,
  Clock,
  Loader2,
  BarChart3,
  Activity,
  Server,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  TrendingUp,
  History,
  Coins,
} from "lucide-react";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DiagnosticData {
  id: string;
  name: string;
  slug: string;
  onboardingStatus: string;
  industrySlug: string;
  kycStatus: string;
  isActive: boolean;
  payoutsEnabled: boolean;
  kycDetails: any;
  walletStatus: any;
  history: any[];
}

// ---------------------------------------------------------------------------
// Mock data for new sections
// ---------------------------------------------------------------------------

const MOCK_AI_CREDITS = {
  totalCredits: 200_000,
  creditsUsed: 127_400,
  creditsRemaining: 72_600,
  plan: "PRO",
  dailyUsage: [
    { day: "Mon", credits: 4_200 },
    { day: "Tue", credits: 5_800 },
    { day: "Wed", credits: 3_600 },
    { day: "Thu", credits: 6_100 },
    { day: "Fri", credits: 7_400 },
    { day: "Sat", credits: 2_900 },
    { day: "Sun", credits: 4_500 },
  ],
  topFeatures: [
    { feature: "Product Descriptions", credits: 42_300, pct: 33 },
    { feature: "Customer Insights", credits: 31_200, pct: 25 },
    { feature: "Marketing Copy", credits: 25_800, pct: 20 },
    { feature: "Analytics Reports", credits: 18_100, pct: 14 },
    { feature: "Chat Support", credits: 10_000, pct: 8 },
  ],
};

const MOCK_API_CALLS = {
  totalRequests: 48_720,
  avgResponseMs: 245,
  errorRate: 1.8,
  errorCount: 877,
  endpoints: [
    { path: "/api/products", calls: 12_400, avgMs: 180, errors: 42 },
    { path: "/api/orders", calls: 9_800, avgMs: 220, errors: 156 },
    { path: "/api/customers", calls: 8_100, avgMs: 195, errors: 89 },
    { path: "/api/analytics", calls: 6_320, avgMs: 340, errors: 210 },
    { path: "/api/ai/generate", calls: 5_900, avgMs: 890, errors: 312 },
    { path: "/api/inventory", calls: 4_200, avgMs: 150, errors: 38 },
    { path: "/api/webhooks", calls: 2_000, avgMs: 120, errors: 30 },
  ],
  dailyRequests: [
    { day: "Mon", requests: 6_200, errors: 98 },
    { day: "Tue", requests: 7_400, errors: 142 },
    { day: "Wed", requests: 6_800, errors: 105 },
    { day: "Thu", requests: 7_900, errors: 168 },
    { day: "Fri", requests: 8_200, errors: 134 },
    { day: "Sat", requests: 5_100, errors: 89 },
    { day: "Sun", requests: 7_120, errors: 141 },
  ],
};

const MOCK_SUBSCRIPTION_HISTORY = [
  { date: "2026-03-01", event: "Subscription Renewed", plan: "PRO", amount: 35_000, status: "success" },
  { date: "2026-02-15", event: "AI Credits Purchased", plan: "PRO", amount: 15_000, status: "success" },
  { date: "2026-02-01", event: "Subscription Renewed", plan: "PRO", amount: 35_000, status: "success" },
  { date: "2026-01-15", event: "Plan Upgraded", plan: "PRO", amount: 35_000, status: "success" },
  { date: "2026-01-01", event: "Subscription Renewed", plan: "STARTER", amount: 25_000, status: "success" },
  { date: "2025-12-01", event: "Subscription Renewed", plan: "STARTER", amount: 25_000, status: "success" },
  { date: "2025-11-20", event: "Payment Failed", plan: "STARTER", amount: 25_000, status: "failed" },
  { date: "2025-11-15", event: "Trial Ended", plan: "STARTER", amount: 0, status: "info" },
  { date: "2025-11-01", event: "Trial Started", plan: "STARTER", amount: 0, status: "info" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNaira(val: number): string {
  return "₦" + val.toLocaleString("en-NG");
}

// ---------------------------------------------------------------------------
// Tab type
// ---------------------------------------------------------------------------

type TabKey = "overview" | "ai-credits" | "api-calls" | "subscription-history";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KPICard({ title, value, subtitle, icon: Icon, iconBg, trend }: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  iconBg: string;
  trend?: number;
}) {
  const trendUp = trend !== undefined && trend >= 0;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
        <div className={`${iconBg} p-2.5 rounded-xl`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1">
          {trendUp ? <ArrowUpRight size={14} className="text-green-500" /> : <ArrowDownRight size={14} className="text-red-500" />}
          <span className={`text-xs font-semibold ${trendUp ? "text-green-600" : "text-red-600"}`}>
            {Math.abs(trend).toFixed(1)}%
          </span>
          <span className="text-xs text-gray-400 ml-1">vs prev period</span>
        </div>
      )}
    </div>
  );
}

function UsageBarChart({ data, valueKey, labelKey, color = "#22c55e", height = 160 }: {
  data: any[];
  valueKey: string;
  labelKey: string;
  color?: string;
  height?: number;
}) {
  const maxVal = Math.max(...data.map((d) => d[valueKey]));
  const barWidth = 36;
  const gap = 80;

  return (
    <svg width="100%" height={height + 40} viewBox={`0 0 ${data.length * gap} ${height + 40}`}>
      {data.map((d, i) => {
        const barHeight = maxVal > 0 ? (d[valueKey] / maxVal) * height : 0;
        const x = i * gap + 20;
        return (
          <g key={i}>
            <rect
              x={x}
              y={height - barHeight}
              width={barWidth}
              height={barHeight}
              rx={6}
              fill={color}
              opacity={0.85}
            />
            <text x={x + barWidth / 2} y={height + 20} textAnchor="middle" fill="#9ca3af" fontSize={11}>
              {d[labelKey]}
            </text>
            <text x={x + barWidth / 2} y={height - barHeight - 6} textAnchor="middle" fill="#374151" fontSize={9} fontWeight={600}>
              {d[valueKey].toLocaleString()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ProgressBar({ value, max, color = "bg-green-500" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-2.5">
      <div className={`${color} h-2.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Overview (original diagnostic content)
// ---------------------------------------------------------------------------

function OverviewTab({ data }: { data: DiagnosticData }) {
  const kycStatusColor =
    {
      VERIFIED: "text-green-600 bg-green-50 border-green-200",
      PENDING: "text-yellow-600 bg-yellow-50 border-yellow-200",
      FAILED: "text-red-600 bg-red-50 border-red-200",
      NOT_STARTED: "text-gray-600 bg-gray-100 border-gray-200",
    }[data.kycStatus] || "text-gray-400";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500 p-2.5 rounded-xl">
              <Globe size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">Onboarding</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Status</span>
              <span className="font-semibold text-sm uppercase">{data.onboardingStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Industry</span>
              <span className="font-semibold text-sm uppercase">{data.industrySlug || "Not Set"}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-500 p-2.5 rounded-xl">
              <Shield size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">Security & Gating</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Active</span>
              <span className={`font-semibold text-sm ${data.isActive ? "text-green-600" : "text-red-600"}`}>
                {data.isActive ? "YES" : "NO"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Payouts</span>
              <span className={`font-semibold text-sm ${data.payoutsEnabled ? "text-green-600" : "text-red-600"}`}>
                {data.payoutsEnabled ? "ENABLED" : "BLOCKED"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-500 p-2.5 rounded-xl">
              <CreditCard size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">Wallet</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Balance</span>
              <span className="font-bold text-sm">
                {formatNaira((data.walletStatus?.availableKobo || 0) / 100)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Locked</span>
              <span className="text-sm">{data.walletStatus?.isLocked ? "YES" : "NO"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-gray-500" />
            Verification History
          </h3>
          <div className="space-y-4">
            {data.history?.map((log, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0">
                <div>
                  <div className="text-sm font-bold text-gray-800">{log?.action?.replace(/_/g, " ")}</div>
                  <div className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</div>
                </div>
                <div className="text-xs text-gray-300">{log.ip}</div>
              </div>
            ))}
            {(!data.history || data.history?.length === 0) && (
              <p className="text-gray-400 text-sm">No verification events logged.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-gray-500" />
            Gating Determination
          </h3>
          <div className="space-y-4">
            <div className={`p-4 rounded-xl flex items-start gap-3 ${data.kycStatus === "VERIFIED" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {data.kycStatus === "VERIFIED" ? <Shield size={20} /> : <AlertCircle size={20} />}
              <div>
                <div className="font-bold">Finance Block</div>
                <p className="text-sm">
                  {data.kycStatus === "VERIFIED"
                    ? "Merchant has passed identity verification. Withdrawals are unlocked."
                    : "Merchant has not passed BVN/NIN verification. Withdrawals are blocked."}
                </p>
              </div>
            </div>
            {!data.industrySlug && (
              <div className="p-4 rounded-xl bg-orange-50 text-orange-700 flex items-start gap-3">
                <AlertTriangle size={20} />
                <div>
                  <div className="font-bold">Industry Gate Active</div>
                  <p className="text-sm">Merchant will be redirected to onboarding/industry.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: AI Credits Usage
// ---------------------------------------------------------------------------

function AICreditsTab() {
  const credits = MOCK_AI_CREDITS;
  const usagePct = (credits.creditsUsed / credits.totalCredits) * 100;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <KPICard
          title="Credits Remaining"
          value={formatNaira(credits.creditsRemaining)}
          subtitle={`${(100 - usagePct).toFixed(1)}% of allocation`}
          icon={Coins}
          iconBg="bg-green-500"
        />
        <KPICard
          title="Credits Used"
          value={formatNaira(credits.creditsUsed)}
          subtitle={`${usagePct.toFixed(1)}% consumed`}
          icon={Zap}
          iconBg="bg-blue-500"
          trend={12.4}
        />
        <KPICard
          title="Plan Allocation"
          value={formatNaira(credits.totalCredits)}
          subtitle={`${credits.plan} tier`}
          icon={CreditCard}
          iconBg="bg-purple-500"
        />
      </div>

      {/* Usage gauge */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Credit Usage</h3>
            <p className="text-sm text-gray-400">{formatNaira(credits.creditsUsed)} of {formatNaira(credits.totalCredits)} used</p>
          </div>
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${usagePct > 80 ? "bg-red-100 text-red-700" : usagePct > 60 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
            {usagePct.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${usagePct > 80 ? "bg-red-500" : usagePct > 60 ? "bg-yellow-500" : "bg-green-500"}`}
            style={{ width: `${usagePct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Usage Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Daily Credit Usage</h3>
              <p className="text-sm text-gray-400">Credits consumed per day (last 7 days)</p>
            </div>
            <BarChart3 size={18} className="text-green-500" />
          </div>
          <UsageBarChart data={credits.dailyUsage} valueKey="credits" labelKey="day" color="#22c55e" />
        </div>

        {/* Top Features */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Usage by Feature</h3>
              <p className="text-sm text-gray-400">Credit consumption breakdown</p>
            </div>
            <Activity size={18} className="text-gray-400" />
          </div>
          <div className="space-y-5">
            {credits.topFeatures.map((f) => (
              <div key={f.feature}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{f.feature}</span>
                  <span className="text-sm font-semibold text-gray-900">{formatNaira(f.credits)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <ProgressBar value={f.pct} max={100} color="bg-green-500" />
                  <span className="text-xs text-gray-400 w-10 text-right">{f.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: API Calls
// ---------------------------------------------------------------------------

function APICallsTab() {
  const api = MOCK_API_CALLS;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <KPICard
          title="Total Requests"
          value={api.totalRequests.toLocaleString()}
          subtitle="Last 30 days"
          icon={Server}
          iconBg="bg-green-500"
          trend={8.2}
        />
        <KPICard
          title="Avg Response Time"
          value={`${api.avgResponseMs}ms`}
          subtitle="Across all endpoints"
          icon={Activity}
          iconBg="bg-blue-500"
          trend={-3.1}
        />
        <KPICard
          title="Error Rate"
          value={`${api.errorRate}%`}
          subtitle={`${api.errorCount} total errors`}
          icon={AlertTriangle}
          iconBg="bg-red-500"
          trend={-0.4}
        />
        <KPICard
          title="Success Rate"
          value={`${(100 - api.errorRate).toFixed(1)}%`}
          subtitle="Healthy"
          icon={TrendingUp}
          iconBg="bg-emerald-500"
        />
      </div>

      {/* Request Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Daily API Requests</h3>
            <p className="text-sm text-gray-400">Request volume over the last 7 days</p>
          </div>
          <BarChart3 size={18} className="text-green-500" />
        </div>
        <UsageBarChart data={api.dailyRequests} valueKey="requests" labelKey="day" color="#22c55e" height={140} />
      </div>

      {/* Endpoint Breakdown Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Endpoint Breakdown</h3>
          <p className="text-sm text-gray-400">Per-endpoint performance metrics</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Endpoint</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-600">Calls</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-600">Avg Latency</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-600">Errors</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-600">Error Rate</th>
              </tr>
            </thead>
            <tbody>
              {api.endpoints.map((ep) => {
                const errRate = ((ep.errors / ep.calls) * 100).toFixed(2);
                const errRateNum = parseFloat(errRate);
                return (
                  <tr key={ep.path} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-gray-900">{ep.path}</td>
                    <td className="px-6 py-4 text-right font-mono text-gray-700">{ep.calls.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-mono ${ep.avgMs > 500 ? "text-red-600" : ep.avgMs > 300 ? "text-yellow-600" : "text-green-600"}`}>
                        {ep.avgMs}ms
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-gray-700">{ep.errors.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${errRateNum > 3 ? "bg-red-100 text-red-700" : errRateNum > 1 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                        {errRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Subscription History
// ---------------------------------------------------------------------------

function SubscriptionHistoryTab() {
  const history = MOCK_SUBSCRIPTION_HISTORY;

  const statusStyles: Record<string, string> = {
    success: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <div className="w-3 h-3 rounded-full bg-green-500" />;
      case "failed":
        return <div className="w-3 h-3 rounded-full bg-red-500" />;
      default:
        return <div className="w-3 h-3 rounded-full bg-blue-500" />;
    }
  };

  // Calculate summary
  const totalPaid = history.filter((h) => h.status === "success" && h.amount > 0).reduce((sum, h) => sum + h.amount, 0);
  const planChanges = history.filter((h) => h.event.includes("Upgraded") || h.event.includes("Downgraded")).length;
  const failedPayments = history.filter((h) => h.status === "failed").length;

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <KPICard
          title="Total Billed"
          value={formatNaira(totalPaid)}
          subtitle="Lifetime revenue"
          icon={CreditCard}
          iconBg="bg-green-500"
        />
        <KPICard
          title="Plan Changes"
          value={planChanges.toString()}
          subtitle="Upgrades & downgrades"
          icon={TrendingUp}
          iconBg="bg-blue-500"
        />
        <KPICard
          title="Failed Payments"
          value={failedPayments.toString()}
          subtitle={failedPayments === 0 ? "Clean record" : "Needs attention"}
          icon={AlertTriangle}
          iconBg={failedPayments > 0 ? "bg-red-500" : "bg-gray-400"}
        />
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Billing Timeline</h3>
            <p className="text-sm text-gray-400">Complete subscription and payment history</p>
          </div>
          <History size={18} className="text-gray-400" />
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[7px] top-3 bottom-3 w-px bg-gray-200" />

          <div className="space-y-6">
            {history.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 relative">
                <div className="relative z-10 mt-1.5">
                  {statusIcon(item.status)}
                </div>
                <div className="flex-1 bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{item.event}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyles[item.status] || "bg-gray-100 text-gray-700"}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(item.date).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-200 rounded text-xs font-medium text-gray-600">{item.plan}</span>
                    {item.amount > 0 && (
                      <span className="font-semibold text-gray-700">{formatNaira(item.amount)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function MerchantDiagnosticPage() {
  const { id } = useParams() as { id: string };
  const [data, setData] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  useEffect(() => {
    fetch(`/api/ops/merchants/${id}`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => toast.error("Failed to load diagnostics"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-gray-400" size={24} />
      </div>
    );

  if (!data) return <div className="text-center py-20 text-gray-400">Merchant not found</div>;

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: Globe },
    { key: "ai-credits", label: "AI Credits", icon: Zap },
    { key: "api-calls", label: "API Calls", icon: Server },
    { key: "subscription-history", label: "Subscription History", icon: History },
  ];

  return (
    <OpsPageShell title={data.name} description={`Merchant ID: ${data.id}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 flex gap-1">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <Button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex-1 justify-center ${
                  activeTab === tab.key
                    ? "bg-green-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <TabIcon size={16} />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && <OverviewTab data={data} />}
        {activeTab === "ai-credits" && <AICreditsTab />}
        {activeTab === "api-calls" && <APICallsTab />}
        {activeTab === "subscription-history" && <SubscriptionHistoryTab />}
      </div>
    </OpsPageShell>
  );
}

