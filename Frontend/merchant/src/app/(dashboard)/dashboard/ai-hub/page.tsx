"use client";
import { Button } from "@vayva/ui";

import { useState } from "react";
import useSWR from "swr";
import {
  Brain,
  MessageSquare,
  Sparkles,
  Bot,
  TrendingUp,
  Zap,
  Clock,
  FileText,
  Phone,
  ShieldCheck,
  Lock,
  BarChart3,
  CreditCard,
  ChevronRight,
  Activity,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

// ===========================================================================
// TYPES
// ===========================================================================

interface AIUsageData {
  credits: {
    total: number;
    used: number;
  };
  usageCategories: { label: string; value: number; color: string }[];
  dailyUsage: { day: string; value: number }[];
  recentActivity: { action: string; type: string; time: string; credits: number }[];
  whatsappMessages: { used: number; limit: number; plan: string };
  features: {
    whatsapp: { conversationsToday: number; satisfactionRate: string };
    productWriter: { productsEnhanced: number };
    predictive: { forecastsGenerated: number; accuracyRate: string };
  };
  resetDate: string;
}

// ===========================================================================
// SWR FETCHER
// ===========================================================================

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
});

// ===========================================================================
// SKELETON COMPONENTS
// ===========================================================================

function AIHubSkeleton() {
  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl space-y-8">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-200" />
            <div>
              <div className="w-24 h-7 bg-gray-200 rounded mb-1" />
              <div className="w-48 h-4 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
        {/* Credit usage hero skeleton */}
        <div className="rounded-2xl shadow-sm border border-gray-100 bg-gray-50 p-6 lg:p-8 animate-pulse">
          <div className="w-32 h-5 bg-gray-200 rounded mb-2" />
          <div className="w-56 h-4 bg-gray-200 rounded mb-6" />
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="w-[210px] h-[210px] bg-gray-200 rounded-full" />
            <div className="flex-1 w-full space-y-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1.5">
                    <div className="w-24 h-4 bg-gray-200 rounded" />
                    <div className="w-16 h-4 bg-gray-200 rounded" />
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Feature cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4" />
              <div className="w-32 h-5 bg-gray-200 rounded mb-2" />
              <div className="w-full h-12 bg-gray-200 rounded mb-4" />
              <div className="space-y-3">
                <div className="h-10 bg-gray-100 rounded-xl" />
                <div className="h-10 bg-gray-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
        {/* Chart + message limit skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
            <div className="w-32 h-5 bg-gray-200 rounded mb-2" />
            <div className="w-48 h-4 bg-gray-200 rounded mb-6" />
            <div className="h-40 bg-gray-100 rounded-xl" />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
            <div className="w-28 h-5 bg-gray-200 rounded mb-4" />
            <div className="w-20 h-10 bg-gray-200 rounded mb-4" />
            <div className="h-3 bg-gray-200 rounded-full mb-4" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-16 bg-gray-100 rounded-xl" />
              <div className="h-16 bg-gray-100 rounded-xl" />
            </div>
          </div>
        </div>
        {/* Activity skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="w-36 h-5 bg-gray-200 rounded" />
          </div>
          <div className="divide-y divide-gray-50">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="px-6 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl" />
                  <div>
                    <div className="w-48 h-4 bg-gray-200 rounded mb-1" />
                    <div className="w-20 h-3 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-5 bg-gray-200 rounded-full" />
                  <div className="w-16 h-3 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// CREDIT PROGRESS RING (SVG)
// ===========================================================================

function CreditProgressRing({
  used,
  total,
  size = 200,
  strokeWidth = 16,
}: {
  used: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = total > 0 ? Math.min(used / total, 1) : 0;
  const offset = circumference - percentage * circumference;
  const remaining = total - used;

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="50%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <filter id="ringShadow">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#22C55E" floodOpacity="0.3" />
          </filter>
        </defs>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter="url(#ringShadow)"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none">
          {remaining.toLocaleString()}
        </span>
        <span className="text-sm font-medium text-gray-400 mt-1">credits remaining</span>
        <span className="text-xs font-semibold text-green-600 mt-1.5 bg-green-50 px-2.5 py-0.5 rounded-full">
          {Math.round((1 - percentage) * 100)}% left
        </span>
      </div>
    </div>
  );
}

// ===========================================================================
// USAGE HISTORY BAR CHART (SVG)
// ===========================================================================

function UsageBarChart({ data }: { data: { day: string; value: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.value));
  const chartHeight = 160;
  const barWidth = 36;
  const gap = 16;
  const chartWidth = data.length * (barWidth + gap) - gap;

  // Y-axis labels
  const yLabels = [0, Math.round(maxVal / 2), maxVal];

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-end gap-2" style={{ minWidth: chartWidth + 60 }}>
        {/* Y-axis */}
        <div
          className="flex flex-col justify-between text-xs text-gray-400 font-medium pr-2 shrink-0"
          style={{ height: chartHeight }}
        >
          <span>{yLabels[2].toLocaleString()}</span>
          <span>{yLabels[1].toLocaleString()}</span>
          <span>{yLabels[0]}</span>
        </div>

        {/* Bars */}
        <div className="flex items-end gap-3 flex-1">
          {data.map((item, idx) => {
            const barHeight = maxVal > 0 ? (item.value / maxVal) * chartHeight : 0;
            return (
              <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                <span className="text-xs font-bold text-gray-700">
                  {item.value.toLocaleString()}
                </span>
                <div
                  className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-green-500 to-green-300 transition-all duration-700 ease-out hover:from-green-600 hover:to-green-400 cursor-pointer"
                  style={{ height: Math.max(barHeight, 4) }}
                  title={`${item.day}: ${item.value.toLocaleString()} credits`}
                />
                <span className="text-xs font-medium text-gray-500">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// MAIN PAGE COMPONENT
// ===========================================================================

export default function AIHubPage() {
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  const { data, error, isLoading, mutate } = useSWR<AIUsageData>(
    '/api/ai/usage',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  // Error state
  if (error) {
    return (
      <div className="bg-gray-50 flex items-center justify-center py-16">
        <div className="bg-white rounded-2xl border border-red-100 p-8 text-center max-w-md">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Failed to load AI Hub</h3>
          <p className="text-sm text-gray-500 mb-4">There was a problem fetching your AI usage data. Please try again.</p>
          <Button
            onClick={() => mutate()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return <AIHubSkeleton />;
  }

  // Empty state
  if (!data) {
    return (
      <div className="bg-gray-50">
        <div className="max-w-7xl space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
              <Brain size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">AI Hub</h1>
              <p className="text-sm text-gray-500">Your AI-powered commerce assistant</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Brain className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">AI Hub</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-4">Start using AI features to see usage statistics here</p>
          </div>
        </div>
      </div>
    );
  }

  const CREDIT_TOTAL = data.credits.total;
  const CREDIT_USED = data.credits.used;
  const USAGE_CATEGORIES = data.usageCategories;
  const DAILY_USAGE = data.dailyUsage;
  const RECENT_ACTIVITY = data.recentActivity;
  const WHATSAPP_MESSAGES = data.whatsappMessages;
  const features = data.features;

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl space-y-8">
        {/* ================================================================ */}
        {/* HEADER                                                           */}
        {/* ================================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
              <Brain size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">AI Hub</h1>
              <p className="text-sm text-gray-500">Your AI-powered commerce assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => mutate()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {WHATSAPP_MESSAGES.plan} Plan
            </span>
            <span className="text-xs text-gray-400 font-medium">Resets {data.resetDate ?? "next cycle"}</span>
          </div>
        </div>

        {/* ================================================================ */}
        {/* CREDIT USAGE HERO CARD                                           */}
        {/* ================================================================ */}
        <div className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden bg-gradient-to-br from-green-50 via-green-50/50 to-white">
          <div className="p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Credit Usage</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {CREDIT_USED.toLocaleString()} of {CREDIT_TOTAL.toLocaleString()} credits used
                  this cycle
                </p>
              </div>
              <Button className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-green-500/25 transition-all">
                <CreditCard size={16} />
                Buy more credits
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-10">
              {/* Ring */}
              <CreditProgressRing used={CREDIT_USED} total={CREDIT_TOTAL} size={210} />

              {/* Breakdown bars */}
              <div className="flex-1 w-full space-y-5">
                {USAGE_CATEGORIES.map((cat, idx) => {
                  const pct =
                    CREDIT_USED > 0 ? Math.round((cat.value / CREDIT_USED) * 100) : 0;
                  const barPct = CREDIT_TOTAL > 0 ? (cat.value / CREDIT_TOTAL) * 100 : 0;

                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">
                            {cat.value.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">({pct}%)</span>
                        </div>
                      </div>
                      <div className="h-2.5 bg-white rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-700 ease-out"
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Credit rates footer */}
          <div className="bg-white/60 backdrop-blur-sm border-t border-green-100 px-6 lg:px-8 py-3 flex flex-wrap items-center gap-6 text-xs text-gray-500">
            <span>
              <strong className="text-gray-700">1</strong> credit / WhatsApp reply
            </span>
            <span>
              <strong className="text-gray-700">12</strong> credits / product description
            </span>
            <span>
              <strong className="text-gray-700">3</strong> credits / smart reply
            </span>
            <span>
              <strong className="text-gray-700">25</strong> credits / analytics forecast
            </span>
          </div>
        </div>

        {/* ================================================================ */}
        {/* 3 FEATURE CARDS ROW                                              */}
        {/* ================================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* WhatsApp AI Agent */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Phone size={22} className="text-green-600" />
              </div>
              {/* Toggle */}
              <Button
                onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                  whatsappEnabled ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    whatsappEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </Button>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">WhatsApp AI Agent</h3>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              AI handles customer inquiries on WhatsApp automatically, from order tracking to product
              questions.
            </p>
            <div className="mt-auto space-y-3">
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                <span className="text-xs text-gray-500">Conversations today</span>
                <span className="text-sm font-extrabold text-gray-900">{features?.whatsapp?.conversationsToday ?? 0}</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                <span className="text-xs text-gray-500">Satisfaction rate</span>
                <span className="text-sm font-extrabold text-green-600">{features?.whatsapp?.satisfactionRate ?? "--"}</span>
              </div>
            </div>
          </div>

          {/* Smart Product Writer */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <FileText size={22} className="text-emerald-600" />
              </div>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Smart Product Writer</h3>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Auto-generate compelling product descriptions optimized for Nigerian shoppers and SEO.
            </p>
            <div className="mt-auto">
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5 mb-3">
                <span className="text-xs text-gray-500">Products enhanced</span>
                <span className="text-sm font-extrabold text-gray-900">{features?.productWriter?.productsEnhanced ?? 0}</span>
              </div>
              <Button className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-green-500/20 transition-all">
                <Sparkles size={16} />
                Generate Descriptions
              </Button>
            </div>
          </div>

          {/* Predictive Analytics (PRO) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white uppercase tracking-wider">
                PRO
              </span>
            </div>
            <div className="flex items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                <TrendingUp size={22} className="text-teal-600" />
              </div>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Predictive Analytics</h3>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              AI-powered demand forecasting to optimize inventory for peak seasons like Owambe and
              Detty December.
            </p>
            <div className="mt-auto space-y-3">
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                <span className="text-xs text-gray-500">Forecasts generated</span>
                <span className="text-sm font-extrabold text-gray-900">{features?.predictive?.forecastsGenerated ?? 0}</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                <span className="text-xs text-gray-500">Accuracy rate</span>
                <span className="text-sm font-extrabold text-green-600">{features?.predictive?.accuracyRate ?? "--"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* USAGE HISTORY CHART + MESSAGE LIMIT TRACKER                      */}
        {/* ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Usage History Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-gray-900">Usage History</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Daily credit consumption — last 7 days
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                <BarChart3 size={14} />
                <span>
                  Avg:{" "}
                  {Math.round(
                    DAILY_USAGE.reduce((s, d) => s + d.value, 0) / DAILY_USAGE.length
                  ).toLocaleString()}{" "}
                  / day
                </span>
              </div>
            </div>
            <UsageBarChart data={DAILY_USAGE} />
          </div>

          {/* Message Limit Tracker */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <MessageSquare size={18} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Message Limit</h2>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  WhatsApp — {WHATSAPP_MESSAGES.plan} Plan
                </p>
              </div>
            </div>

            {/* Big counter */}
            <div className="mb-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
                  {WHATSAPP_MESSAGES.used.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-gray-400">
                  / {WHATSAPP_MESSAGES.limit.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">messages used this month</p>
            </div>

            {/* Progress bar */}
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-400 via-green-500 to-emerald-600 transition-all duration-700"
                style={{
                  width: `${(WHATSAPP_MESSAGES.used / WHATSAPP_MESSAGES.limit) * 100}%`,
                }}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mt-auto">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Daily avg
                </p>
                <p className="text-lg font-extrabold text-gray-900">98</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Remaining
                </p>
                <p className="text-lg font-extrabold text-green-600">
                  {(WHATSAPP_MESSAGES.limit - WHATSAPP_MESSAGES.used).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Plan comparison hint */}
            <div className="mt-4 bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-600">
                <span className="font-semibold text-gray-700">Starter:</span> 342/500 &middot;{" "}
                <span className="font-bold text-green-700">Pro: 2,150/5,000</span>
              </p>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* RECENT AI ACTIVITY FEED                                          */}
        {/* ================================================================ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-green-500" />
              <h2 className="text-base font-bold text-gray-900">Recent AI Activity</h2>
            </div>
            <Button className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Button>
          </div>
          <div className="divide-y divide-gray-50">
            {RECENT_ACTIVITY.map((item, idx) => (
              <div
                key={idx}
                className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                    {item.type === "WhatsApp AI" ? (
                      <Phone size={16} className="text-green-600" />
                    ) : item.type === "Product Writer" ? (
                      <FileText size={16} className="text-emerald-600" />
                    ) : item.type === "Predictive Analytics" ? (
                      <TrendingUp size={16} className="text-teal-600" />
                    ) : (
                      <Zap size={16} className="text-green-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.action}</p>
                    <p className="text-xs text-gray-400">{item.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    -{item.credits} cr
                  </span>
                  <span className="text-xs text-gray-400 font-medium">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

