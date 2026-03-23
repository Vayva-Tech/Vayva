// @ts-nocheck
"use client";

import React, { useState } from "react";
import {
  Brain,
  Coins,
  Users,
  Zap,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Download,
  RefreshCw,
  Cpu,
} from "lucide-react";
import { AI_MODEL_RATES, DEFAULT_NGN_RATE } from "@/config/ai-model-rates";

// ---------------------------------------------------------------------------
// Mock data – in production this would come from backend APIs
// ---------------------------------------------------------------------------

type DateRange = "7d" | "30d" | "90d";

const MOCK_KPI: Record<DateRange, { totalSpend: number; totalTokens: number; activeMerchants: number; avgCost: number; spendTrend: number; tokenTrend: number }> = {
  "7d": { totalSpend: 487_200, totalTokens: 12_450_000, activeMerchants: 142, avgCost: 3_431, spendTrend: 8.3, tokenTrend: 12.1 },
  "30d": { totalSpend: 1_945_600, totalTokens: 48_200_000, activeMerchants: 318, avgCost: 6_118, spendTrend: 14.7, tokenTrend: 18.4 },
  "90d": { totalSpend: 5_420_000, totalTokens: 134_500_000, activeMerchants: 412, avgCost: 13_155, spendTrend: 22.1, tokenTrend: 26.8 },
};

const MOCK_MERCHANTS = [
  { id: "m1", name: "Eko Fresh Market", plan: "Pro", tokens: 4_820_000, requests: 12_400, cost: 72_300, credits: 150_000 },
  { id: "m2", name: "Lagos Bites Kitchen", plan: "Scale", tokens: 3_150_000, requests: 8_200, cost: 48_600, credits: 80_000 },
  { id: "m3", name: "Abuja Glow Beauty", plan: "Pro", tokens: 2_740_000, requests: 6_800, cost: 41_200, credits: 200_000 },
  { id: "m4", name: "Port Harcourt Autos", plan: "Starter", tokens: 1_920_000, requests: 5_100, cost: 28_800, credits: 25_000 },
  { id: "m5", name: "Ibadan Wellness Hub", plan: "Scale", tokens: 1_680_000, requests: 4_300, cost: 25_200, credits: 120_000 },
  { id: "m6", name: "Kano Fashions", plan: "Pro", tokens: 1_340_000, requests: 3_600, cost: 20_100, credits: 90_000 },
  { id: "m7", name: "Enugu Tech Store", plan: "Starter", tokens: 980_000, requests: 2_500, cost: 14_700, credits: 10_000 },
  { id: "m8", name: "Calabar Events Co", plan: "Scale", tokens: 870_000, requests: 2_200, cost: 13_050, credits: 60_000 },
];

const MOCK_DAILY_COSTS_7D = [
  { day: "Mon", cost: 62_400 },
  { day: "Tue", cost: 71_300 },
  { day: "Wed", cost: 68_900 },
  { day: "Thu", cost: 74_200 },
  { day: "Fri", cost: 80_100 },
  { day: "Sat", cost: 54_600 },
  { day: "Sun", cost: 75_700 },
];

const MOCK_MODEL_BREAKDOWN = [
  { model: "openai/gpt-4o-mini", pct: 52, tokens: 6_474_000, color: "#22c55e" },
  { model: "meta-llama/llama-3.3-70b-instruct", pct: 24, tokens: 2_988_000, color: "#3b82f6" },
  { model: "anthropic/claude-3-sonnet", pct: 14, tokens: 1_743_000, color: "#a855f7" },
  { model: "mistralai/mistral-large", pct: 10, tokens: 1_245_000, color: "#f59e0b" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNaira(val: number): string {
  return "₦" + val.toLocaleString("en-NG");
}

function formatTokens(val: number): string {
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + "M";
  if (val >= 1_000) return (val / 1_000).toFixed(0) + "K";
  return val.toString();
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KPICard({ title, value, subtitle, icon: Icon, trend, iconBg }: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: number;
  iconBg: string;
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

function DailyCostChart({ data }: { data: { day: string; cost: number }[] }) {
  const maxCost = Math.max(...data.map((d) => d.cost));
  const chartHeight = 180;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Daily AI Spend</h3>
          <p className="text-sm text-gray-400">Cost trend over the selected period</p>
        </div>
        <TrendingUp size={18} className="text-green-500" />
      </div>
      <svg width="100%" height={chartHeight + 40} viewBox={`0 0 ${data.length * 80} ${chartHeight + 40}`}>
        {data.map((d, i) => {
          const barHeight = maxCost > 0 ? (d.cost / maxCost) * chartHeight : 0;
          const x = i * 80 + 20;
          const barWidth = 40;
          return (
            <g key={d.day}>
              <rect
                x={x}
                y={chartHeight - barHeight}
                width={barWidth}
                height={barHeight}
                rx={6}
                fill="#22c55e"
                opacity={0.85}
              />
              <text x={x + barWidth / 2} y={chartHeight + 20} textAnchor="middle" className="text-xs" fill="#9ca3af" fontSize={12}>
                {d.day}
              </text>
              <text x={x + barWidth / 2} y={chartHeight - barHeight - 6} textAnchor="middle" fill="#374151" fontSize={10} fontWeight={600}>
                {formatNaira(d.cost)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ModelBreakdown({ data }: { data: typeof MOCK_MODEL_BREAKDOWN }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Model Usage Breakdown</h3>
          <p className="text-sm text-gray-400">Token distribution across AI models</p>
        </div>
        <Cpu size={18} className="text-gray-400" />
      </div>

      {/* Stacked bar */}
      <div className="flex rounded-full overflow-hidden h-4 mb-6">
        {data.map((m) => (
          <div key={m.model} style={{ width: `${m.pct}%`, backgroundColor: m.color }} title={AI_MODEL_RATES[m.model]?.displayName ?? m.model} />
        ))}
      </div>

      <div className="space-y-4">
        {data.map((m) => {
          const rate = AI_MODEL_RATES[m.model];
          return (
            <div key={m.model} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                <div>
                  <p className="text-sm font-medium text-gray-800">{rate?.displayName ?? m.model}</p>
                  <p className="text-xs text-gray-400">{formatTokens(m.tokens)} tokens</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900">{m.pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MerchantTable({ merchants, search }: { merchants: typeof MOCK_MERCHANTS; search: string }) {
  const filtered = merchants.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  const planColor: Record<string, string> = {
    Starter: "bg-gray-100 text-gray-700",
    Pro: "bg-green-50 text-green-700",
    Scale: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Merchant</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Plan</th>
              <th className="text-right px-6 py-3 font-semibold text-gray-600">Tokens Used</th>
              <th className="text-right px-6 py-3 font-semibold text-gray-600">Requests</th>
              <th className="text-right px-6 py-3 font-semibold text-gray-600">Est. Cost (₦)</th>
              <th className="text-right px-6 py-3 font-semibold text-gray-600">Credit Balance</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{m.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${planColor[m.plan] ?? "bg-gray-100 text-gray-700"}`}>
                    {m.plan}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-gray-700 font-mono">{formatTokens(m.tokens)}</td>
                <td className="px-6 py-4 text-right text-gray-700 font-mono">{m.requests.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-semibold text-gray-900">{formatNaira(m.cost)}</td>
                <td className="px-6 py-4 text-right text-gray-700">{formatNaira(m.credits)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No merchants found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AICostMonitorPage() {
  const [range, setRange] = useState<DateRange>("7d");
  const [search, setSearch] = useState("");

  const kpi = MOCK_KPI[range];

  const ranges: { label: string; value: DateRange }[] = [
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
    { label: "90 Days", value: "90d" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/60 p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-500 p-3 rounded-xl">
            <Brain size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Cost Monitor</h1>
            <p className="text-sm text-gray-500">Track AI token usage and costs across all merchants</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Date range tabs */}
          <div className="flex bg-white rounded-xl border border-gray-200 p-1">
            {ranges.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  range === r.value
                    ? "bg-green-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors" title="Refresh">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors" title="Export CSV">
            <Download size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total AI Spend"
          value={formatNaira(kpi.totalSpend)}
          subtitle={`≈ $${(kpi.totalSpend / DEFAULT_NGN_RATE).toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
          icon={Coins}
          trend={kpi.spendTrend}
          iconBg="bg-green-500"
        />
        <KPICard
          title="Total Tokens Used"
          value={formatTokens(kpi.totalTokens)}
          subtitle="Input + Output"
          icon={Zap}
          trend={kpi.tokenTrend}
          iconBg="bg-blue-500"
        />
        <KPICard
          title="Active AI Merchants"
          value={kpi.activeMerchants.toLocaleString()}
          subtitle="Used AI features this period"
          icon={Users}
          iconBg="bg-purple-500"
        />
        <KPICard
          title="Avg Cost / Merchant"
          value={formatNaira(kpi.avgCost)}
          subtitle={`≈ $${(kpi.avgCost / DEFAULT_NGN_RATE).toFixed(2)}`}
          icon={TrendingUp}
          iconBg="bg-amber-500"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DailyCostChart data={MOCK_DAILY_COSTS_7D} />
        </div>
        <ModelBreakdown data={MOCK_MODEL_BREAKDOWN} />
      </div>

      {/* Merchant Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Per-Merchant Usage</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search merchants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 w-64"
            />
          </div>
        </div>
        <MerchantTable merchants={MOCK_MERCHANTS} search={search} />
      </div>

      {/* Footer note */}
      <div className="text-xs text-gray-400 text-center pt-4">
        Costs are estimated using model rates at {DEFAULT_NGN_RATE} NGN/USD. Actual billing may vary.
      </div>
    </div>
  );
}
