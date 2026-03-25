"use client";
import { Button } from "@vayva/ui";

import React, { useState } from "react";
import {
  CreditCard,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  PieChart,
  UserMinus,
  Zap,
} from "lucide-react";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Subscription {
  id: string;
  storeId: string;
  storeName: string;
  storeSlug: string;
  planKey: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  trialExpiresAt: string | null;
  createdAt: string;
}

interface SubscriptionStats {
  totalActive: number;
  totalTrial: number;
  totalCancelled: number;
  mrr: number;
  mrrGrowth: number;
  planBreakdown: { plan: string; count: number; revenue: number }[];
  recentSubscriptions: Subscription[];
  expiringTrials: Subscription[];
}

// ---------------------------------------------------------------------------
// Mock data for enhanced sections
// ---------------------------------------------------------------------------

const MOCK_TIER_DISTRIBUTION = {
  STARTER: { count: 187, color: "#3b82f6", revenue: 4_675_000, price: 25_000 },
  PRO: { count: 124, color: "#22c55e", revenue: 4_340_000, price: 35_000 },
  PRO_PLUS: { count: 68, color: "#a855f7", revenue: 3_400_000, price: 50_000 },
};

const MOCK_MRR_HISTORY = [
  { month: "Oct", starter: 3_200_000, pro: 2_800_000, proPlus: 1_600_000 },
  { month: "Nov", starter: 3_575_000, pro: 3_150_000, proPlus: 2_050_000 },
  { month: "Dec", starter: 3_900_000, pro: 3_500_000, proPlus: 2_400_000 },
  { month: "Jan", starter: 4_100_000, pro: 3_850_000, proPlus: 2_800_000 },
  { month: "Feb", starter: 4_425_000, pro: 4_060_000, proPlus: 3_100_000 },
  { month: "Mar", starter: 4_675_000, pro: 4_340_000, proPlus: 3_400_000 },
];

const MOCK_TRIAL_STATUS = {
  totalTrials: 42,
  convertedThisMonth: 18,
  conversionRate: 42.9,
  avgTrialDays: 14,
  distribution: [
    { range: "1-3 days left", count: 8, color: "bg-red-500" },
    { range: "4-7 days left", count: 12, color: "bg-yellow-500" },
    { range: "8-14 days left", count: 15, color: "bg-green-500" },
    { range: "14+ days left", count: 7, color: "bg-blue-500" },
  ],
};

const MOCK_CHURN = {
  monthlyRate: 3.2,
  prevMonthRate: 4.1,
  totalChurned30d: 14,
  recoveredRevenue: 280_000,
  recentChurned: [
    { id: "c1", name: "Warri Quick Mart", plan: "STARTER", churnDate: "2026-03-21", reason: "Cost concerns", revenue: 25_000 },
    { id: "c2", name: "Ikeja Fashion Hub", plan: "PRO", churnDate: "2026-03-19", reason: "Switched competitor", revenue: 35_000 },
    { id: "c3", name: "Benin Eats Delivery", plan: "PRO_PLUS", churnDate: "2026-03-17", reason: "Business closed", revenue: 50_000 },
    { id: "c4", name: "Abeokuta Wellness", plan: "STARTER", churnDate: "2026-03-15", reason: "No longer needed", revenue: 25_000 },
    { id: "c5", name: "Jos Beauty Supply", plan: "PRO", churnDate: "2026-03-12", reason: "Cost concerns", revenue: 35_000 },
    { id: "c6", name: "Uyo Tech Store", plan: "STARTER", churnDate: "2026-03-10", reason: "Payment failed", revenue: 25_000 },
  ],
  monthlyChurnHistory: [
    { month: "Oct", rate: 5.8 },
    { month: "Nov", rate: 5.1 },
    { month: "Dec", rate: 4.6 },
    { month: "Jan", rate: 4.1 },
    { month: "Feb", rate: 4.1 },
    { month: "Mar", rate: 3.2 },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNaira(val: number): string {
  return "₦" + val.toLocaleString("en-NG");
}

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
        <div className={`${iconBg} p-3 rounded-xl`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1">
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

function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    STARTER: "bg-blue-100 text-blue-700",
    PRO: "bg-green-100 text-green-700",
    PRO_PLUS: "bg-purple-100 text-purple-700",
  };

  const labels: Record<string, string> = {
    STARTER: "Starter",
    PRO: "Pro",
    PRO_PLUS: "Pro+",
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors[plan?.toUpperCase()] || "bg-gray-100 text-gray-700"}`}>
      {labels[plan?.toUpperCase()] || plan}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; icon: React.ReactNode }> = {
    active: { bg: "bg-green-100 text-green-700", icon: <CheckCircle size={12} /> },
    trial: { bg: "bg-blue-100 text-blue-700", icon: <Clock size={12} /> },
    cancelled: { bg: "bg-red-100 text-red-700", icon: <XCircle size={12} /> },
    pending: { bg: "bg-yellow-100 text-yellow-700", icon: <Clock size={12} /> },
  };

  const style = styles[status?.toLowerCase()] || styles.pending;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg}`}>
      {style.icon}
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Tier Distribution Donut (SVG)
// ---------------------------------------------------------------------------

function TierDistributionDonut() {
  const tiers = MOCK_TIER_DISTRIBUTION;
  const total = Object.values(tiers).reduce((sum, t) => sum + t.count, 0);

  // Build donut segments
  const segments: { name: string; count: number; pct: number; color: string; price: number }[] = Object.entries(tiers).map(
    ([name, data]) => ({
      name,
      count: data.count,
      pct: (data.count / total) * 100,
      color: data.color,
      price: data.price,
    })
  );

  // SVG donut
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Tier Distribution</h3>
          <p className="text-sm text-gray-400">{total} total merchants</p>
        </div>
        <PieChart size={18} className="text-gray-400" />
      </div>

      <div className="flex items-center gap-8">
        {/* Donut */}
        <div className="relative">
          <svg width="180" height="180" viewBox="0 0 180 180">
            {segments.map((seg) => {
              const dashLength = (seg.pct / 100) * circumference;
              const dashGap = circumference - dashLength;
              const currentOffset = offset;
              offset += dashLength;
              return (
                <circle
                  key={seg.name}
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="24"
                  strokeDasharray={`${dashLength} ${dashGap}`}
                  strokeDashoffset={-currentOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 90 90)"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{total}</span>
            <span className="text-xs text-gray-400">merchants</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-4 flex-1">
          {segments.map((seg) => (
            <div key={seg.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {seg.name === "PRO_PLUS" ? "Pro+" : seg.name.charAt(0) + seg.name.slice(1).toLowerCase()}
                  </p>
                  <p className="text-xs text-gray-400">{formatNaira(seg.price)}/mo</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{seg.count}</p>
                <p className="text-xs text-gray-400">{seg.pct.toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MRR by Tier stacked bar chart (SVG)
// ---------------------------------------------------------------------------

function MRRByTierChart() {
  const data = MOCK_MRR_HISTORY;
  const maxTotal = Math.max(...data.map((d) => d.starter + d.pro + d.proPlus));
  const chartHeight = 180;
  const barWidth = 48;
  const gap = 90;

  const totalMRR = Object.values(MOCK_TIER_DISTRIBUTION).reduce((sum, t) => sum + t.revenue, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900">MRR by Tier</h3>
          <p className="text-sm text-gray-400">Monthly recurring revenue breakdown</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">{formatNaira(totalMRR)}</p>
          <p className="text-xs text-gray-400">Current MRR</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-4">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-xs text-gray-500">Starter</span></div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className="text-xs text-gray-500">Pro</span></div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /><span className="text-xs text-gray-500">Pro+</span></div>
      </div>

      <svg width="100%" height={chartHeight + 40} viewBox={`0 0 ${data.length * gap} ${chartHeight + 40}`}>
        {data.map((d, i) => {
          const total = d.starter + d.pro + d.proPlus;
          const scale = maxTotal > 0 ? chartHeight / maxTotal : 0;
          const x = i * gap + 16;

          const proPlusH = d.proPlus * scale;
          const proH = d.pro * scale;
          const starterH = d.starter * scale;

          let y = chartHeight;
          const bars = [
            { h: starterH, color: "#3b82f6" },
            { h: proH, color: "#22c55e" },
            { h: proPlusH, color: "#a855f7" },
          ];

          return (
            <g key={d.month}>
              {bars.map((bar, bi) => {
                const barY = y - bar.h;
                y = barY;
                return (
                  <rect key={bi} x={x} y={barY} width={barWidth} height={bar.h} rx={bi === 2 ? 6 : 0} fill={bar.color} opacity={0.85} />
                );
              })}
              <text x={x + barWidth / 2} y={chartHeight + 20} textAnchor="middle" fill="#9ca3af" fontSize={11}>
                {d.month}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trial Status Section
// ---------------------------------------------------------------------------

function TrialStatusSection() {
  const trial = MOCK_TRIAL_STATUS;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Trial Status</h3>
          <p className="text-sm text-gray-400">{trial.totalTrials} merchants currently in trial</p>
        </div>
        <Clock size={18} className="text-blue-500" />
      </div>

      {/* Conversion stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{trial.convertedThisMonth}</p>
          <p className="text-xs text-green-600 font-medium">Converted this month</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{trial.conversionRate}%</p>
          <p className="text-xs text-blue-600 font-medium">Conversion rate</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-700">{trial.avgTrialDays}d</p>
          <p className="text-xs text-gray-500 font-medium">Avg trial length</p>
        </div>
      </div>

      {/* Days remaining distribution */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Days Remaining Distribution</p>
        {trial.distribution.map((d) => {
          const pct = (d.count / trial.totalTrials) * 100;
          return (
            <div key={d.range} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-28 shrink-0">{d.range}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-3">
                <div className={`${d.color} h-3 rounded-full transition-all`} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-semibold text-gray-700 w-8 text-right">{d.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Churn Section
// ---------------------------------------------------------------------------

function ChurnSection() {
  const churn = MOCK_CHURN;
  const churnImproving = churn.monthlyRate < churn.prevMonthRate;

  return (
    <div className="space-y-6">
      {/* Churn KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <KPICard
          title="Monthly Churn Rate"
          value={`${churn.monthlyRate}%`}
          subtitle={`Previous: ${churn.prevMonthRate}%`}
          icon={UserMinus}
          iconBg={churn.monthlyRate > 5 ? "bg-red-500" : "bg-yellow-500"}
          trend={churnImproving ? -(churn.prevMonthRate - churn.monthlyRate) : churn.monthlyRate - churn.prevMonthRate}
        />
        <KPICard
          title="Churned (30d)"
          value={churn.totalChurned30d.toString()}
          subtitle="Merchants lost"
          icon={XCircle}
          iconBg="bg-red-500"
        />
        <KPICard
          title="Lost Revenue"
          value={formatNaira(churn.recentChurned.reduce((s, c) => s + c.revenue, 0))}
          subtitle="From churned merchants"
          icon={DollarSign}
          iconBg="bg-orange-500"
        />
        <KPICard
          title="Recovered Revenue"
          value={formatNaira(churn.recoveredRevenue)}
          subtitle="Win-backs this month"
          icon={Zap}
          iconBg="bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Churn Rate Trend */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Churn Rate Trend</h3>
              <p className="text-sm text-gray-400">Monthly churn rate over 6 months</p>
            </div>
            <TrendingUp size={18} className="text-green-500" />
          </div>
          {(() => {
            const data = churn.monthlyChurnHistory;
            const maxRate = Math.max(...data.map((d) => d.rate));
            const chartHeight = 140;
            const gap = 80;

            return (
              <svg width="100%" height={chartHeight + 40} viewBox={`0 0 ${data.length * gap} ${chartHeight + 40}`}>
                {/* Grid lines */}
                {[0, 2, 4, 6].map((v) => {
                  const y = chartHeight - (v / (maxRate + 1)) * chartHeight;
                  return (
                    <g key={v}>
                      <line x1="0" y1={y} x2={data.length * gap} y2={y} stroke="#f3f4f6" strokeWidth={1} />
                      <text x={data.length * gap - 5} y={y - 4} textAnchor="end" fill="#9ca3af" fontSize={9}>{v}%</text>
                    </g>
                  );
                })}
                {data.map((d, i) => {
                  const barHeight = (d.rate / (maxRate + 1)) * chartHeight;
                  const x = i * gap + 20;
                  const barW = 36;
                  const isGood = d.rate <= 4;
                  return (
                    <g key={d.month}>
                      <rect
                        x={x}
                        y={chartHeight - barHeight}
                        width={barW}
                        height={barHeight}
                        rx={6}
                        fill={isGood ? "#22c55e" : d.rate <= 5 ? "#f59e0b" : "#ef4444"}
                        opacity={0.85}
                      />
                      <text x={x + barW / 2} y={chartHeight + 20} textAnchor="middle" fill="#9ca3af" fontSize={11}>
                        {d.month}
                      </text>
                      <text x={x + barW / 2} y={chartHeight - barHeight - 6} textAnchor="middle" fill="#374151" fontSize={10} fontWeight={600}>
                        {d.rate}%
                      </text>
                    </g>
                  );
                })}
              </svg>
            );
          })()}
        </div>

        {/* Recently Churned */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Recently Churned</h3>
              <p className="text-sm text-gray-400">Merchants who cancelled recently</p>
            </div>
            <UserMinus size={18} className="text-red-500" />
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {churn.recentChurned.map((merchant) => (
              <div key={merchant.id} className="flex items-center justify-between p-3 bg-red-50/50 rounded-xl border border-red-100">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{merchant.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <PlanBadge plan={merchant.plan} />
                    <span className="text-xs text-gray-400">{new Date(merchant.churnDate).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-600">-{formatNaira(merchant.revenue)}/mo</p>
                  <p className="text-xs text-gray-400">{merchant.reason}</p>
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

export default function SubscriptionsPage(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<"overview" | "churn">("overview");

  // Use mock data directly since the API may not be available
  const stats: SubscriptionStats = {
    totalActive: 379,
    totalTrial: 42,
    totalCancelled: 14,
    mrr: 12_415_000,
    mrrGrowth: 12.4,
    planBreakdown: [
      { plan: "STARTER", count: 187, revenue: 4_675_000 },
      { plan: "PRO", count: 124, revenue: 4_340_000 },
      { plan: "PRO_PLUS", count: 68, revenue: 3_400_000 },
    ],
    recentSubscriptions: [
      { id: "s1", storeId: "st1", storeName: "Eko Fresh Market", storeSlug: "eko-fresh", planKey: "PRO", status: "active", periodStart: "2026-03-01", periodEnd: "2026-04-01", trialExpiresAt: null, createdAt: "2026-03-18" },
      { id: "s2", storeId: "st2", storeName: "Lagos Bites Kitchen", storeSlug: "lagos-bites", planKey: "PRO_PLUS", status: "active", periodStart: "2026-03-01", periodEnd: "2026-04-01", trialExpiresAt: null, createdAt: "2026-03-17" },
      { id: "s3", storeId: "st3", storeName: "Abuja Glow Beauty", storeSlug: "abuja-glow", planKey: "STARTER", status: "trial", periodStart: "2026-03-15", periodEnd: "2026-04-15", trialExpiresAt: "2026-03-29", createdAt: "2026-03-15" },
      { id: "s4", storeId: "st4", storeName: "Kaduna Auto Parts", storeSlug: "kaduna-auto", planKey: "PRO", status: "active", periodStart: "2026-03-01", periodEnd: "2026-04-01", trialExpiresAt: null, createdAt: "2026-03-14" },
      { id: "s5", storeId: "st5", storeName: "Enugu Fresh Foods", storeSlug: "enugu-fresh", planKey: "STARTER", status: "trial", periodStart: "2026-03-10", periodEnd: "2026-04-10", trialExpiresAt: "2026-03-24", createdAt: "2026-03-10" },
    ],
    expiringTrials: [
      { id: "t1", storeId: "st3", storeName: "Abuja Glow Beauty", storeSlug: "abuja-glow", planKey: "STARTER", status: "trial", periodStart: "2026-03-15", periodEnd: "2026-04-15", trialExpiresAt: "2026-03-25", createdAt: "2026-03-15" },
      { id: "t2", storeId: "st5", storeName: "Enugu Fresh Foods", storeSlug: "enugu-fresh", planKey: "STARTER", status: "trial", periodStart: "2026-03-10", periodEnd: "2026-04-10", trialExpiresAt: "2026-03-24", createdAt: "2026-03-10" },
      { id: "t3", storeId: "st6", storeName: "Oyo Craft Studio", storeSlug: "oyo-craft", planKey: "PRO", status: "trial", periodStart: "2026-03-12", periodEnd: "2026-04-12", trialExpiresAt: "2026-03-26", createdAt: "2026-03-12" },
    ],
  };

  const filteredRecent = searchQuery
    ? stats.recentSubscriptions?.filter((s: Subscription) =>
        s.storeName?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : stats.recentSubscriptions;

  const sectionTabs = [
    { key: "overview" as const, label: "Overview & Tiers", icon: BarChart3 },
    { key: "churn" as const, label: "Churn Analysis", icon: UserMinus },
  ];

  return (
    <OpsPageShell
      title="Subscription Management"
      description="Monitor SaaS revenue, merchant subscriptions, and churn metrics"
      headerActions={
        <Button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors" title="Refresh">
          <RefreshCw size={16} className="text-gray-500" />
        </Button>
      }
    >
      {/* KPI Cards */}
      <section className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Monthly Recurring Revenue"
            value={formatNaira(stats.mrr)}
            subtitle={`${stats.planBreakdown.length} active tiers`}
            icon={DollarSign}
            iconBg="bg-green-500"
            trend={stats.mrrGrowth}
          />
          <KPICard
            title="Active Subscriptions"
            value={stats.totalActive.toString()}
            subtitle="Paying merchants"
            icon={CheckCircle}
            iconBg="bg-blue-500"
            trend={8.3}
          />
          <KPICard
            title="Trial Users"
            value={stats.totalTrial.toString()}
            subtitle={`${stats.expiringTrials?.length} expiring soon`}
            icon={Clock}
            iconBg="bg-yellow-500"
          />
          <KPICard
            title="Churned (30d)"
            value={stats.totalCancelled.toString()}
            subtitle={`${MOCK_CHURN.monthlyRate}% churn rate`}
            icon={XCircle}
            iconBg="bg-red-500"
            trend={-((MOCK_CHURN.prevMonthRate - MOCK_CHURN.monthlyRate) / MOCK_CHURN.prevMonthRate * 100)}
          />
        </div>
      </section>

      {/* Section Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 flex gap-1 mb-8">
        {sectionTabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <Button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex-1 justify-center ${
                activeSection === tab.key
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

      {activeSection === "overview" && (
        <>
          {/* Tier Distribution + MRR Chart */}
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TierDistributionDonut />
              <MRRByTierChart />
            </div>
          </section>

          {/* Trial Status + Expiring Trials */}
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrialStatusSection />

              {/* Expiring Trials Alert */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Trials Expiring Soon</h3>
                    <p className="text-sm text-gray-400">Merchants needing conversion outreach</p>
                  </div>
                  <AlertTriangle size={18} className="text-orange-500" />
                </div>
                {stats?.expiringTrials?.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No trials expiring soon</div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {stats?.expiringTrials?.map((sub: Subscription) => {
                      const now = new Date();
                      const daysLeft = sub.trialExpiresAt
                        ? Math.ceil((new Date(sub.trialExpiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                        : 0;

                      return (
                        <div key={sub.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                          <div>
                            <Link href={`/ops/merchants/${sub.storeId}`} className="font-medium text-gray-900 hover:text-green-600 text-sm">
                              {sub.storeName}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <PlanBadge plan={sub.planKey} />
                              <span className="text-xs text-gray-400">{sub.storeSlug}</span>
                            </div>
                          </div>
                          <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${daysLeft <= 2 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                            {daysLeft <= 0 ? "Expired" : `${daysLeft}d left`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Recent Subscriptions */}
          <section>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Recent Subscriptions</h3>
                  <p className="text-sm text-gray-400">Latest subscription activity</p>
                </div>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search merchants..."
                    className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target?.value)}
                  />
                </div>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {filteredRecent.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No subscriptions found</div>
                ) : (
                  filteredRecent.map((sub: Subscription) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div>
                          <Link href={`/ops/merchants/${sub.storeId}`} className="font-medium text-gray-900 hover:text-green-600 text-sm">
                            {sub.storeName}
                          </Link>
                          <div className="text-xs text-gray-400">{new Date(sub.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <PlanBadge plan={sub.planKey} />
                        <StatusBadge status={sub.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {activeSection === "churn" && <ChurnSection />}
    </OpsPageShell>
  );
}

