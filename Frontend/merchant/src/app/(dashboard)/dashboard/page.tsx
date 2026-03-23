// @ts-nocheck
"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Target,
  ChevronDown,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Sparkles,
  Bot,
  Zap,
  AlertCircle,
  RefreshCw,
  Plus,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type TimeFilter = "today" | "7d" | "30d" | "90d";

interface KpiMetric {
  value: string;
  raw: number;
  change: number;
}

interface KpiData {
  revenue: KpiMetric;
  orders: KpiMetric;
  customers: KpiMetric;
  conversion: KpiMetric;
  sparklines?: Record<string, number[]>;
}

interface OrderStatus {
  label: string;
  count: number;
  color: string;
}

interface AIStats {
  whatsappOrders: number;
  smartResponses: number;
  recommendations: number;
  creditsUsed: number;
  creditsTotal: number;
}

interface TopProduct {
  name: string;
  emoji: string;
  sold: number;
  revenue: string;
}

interface RecentOrder {
  id: string;
  customer: string;
  amount: string;
  status: string;
  time: string;
}

interface DashboardData {
  kpis: KpiData;
  orderStatuses: OrderStatus[];
  aiAgent: AIStats;
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
  revenueChart: number[];
}

// ─── SWR Fetcher ─────────────────────────────────────────────────────────────

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Failed to fetch dashboard data");
  return res.json();
});

// ─── Skeleton Components ────────────────────────────────────────────────────

function KPICardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 bg-gray-100 rounded-xl" />
        <div className="w-20 h-8 bg-gray-100 rounded" />
      </div>
      <div>
        <div className="w-16 h-4 bg-gray-100 rounded mb-2" />
        <div className="w-28 h-7 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="w-40 h-5 bg-gray-100 rounded mb-2" />
      <div className="w-56 h-4 bg-gray-100 rounded mb-6" />
      <div className="w-full h-[220px] bg-gray-50 rounded-xl" />
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="w-36 h-5 bg-gray-100 rounded mb-2" />
      <div className="w-52 h-4 bg-gray-100 rounded mb-6" />
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-20 h-4 bg-gray-100 rounded" />
            <div className="w-32 h-4 bg-gray-100 rounded" />
            <div className="flex-1" />
            <div className="w-20 h-4 bg-gray-100 rounded" />
            <div className="w-16 h-5 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
      {actionLabel && actionHref && (
        <a
          href={actionHref}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </a>
      )}
    </div>
  );
}

// ─── Sparkline Component ─────────────────────────────────────────────────────

function Sparkline({ data, color = "#22C55E" }: { data: number[]; color?: string }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 32;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Revenue Area Chart Component ────────────────────────────────────────────

function RevenueChart({ data }: { data: number[] }) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No revenue data yet"
        description="Revenue data will appear here once you start receiving orders."
      />
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data) * 0.8;
  const range = max - min || 1;
  const w = 600;
  const h = 220;
  const padL = 50;
  const padR = 10;
  const padT = 10;
  const padB = 30;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  const points = data.map((v, i) => {
    const x = padL + (i / (data.length - 1)) * chartW;
    const y = padT + chartH - ((v - min) / range) * chartH;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${padT + chartH} L${points[0].x},${padT + chartH} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => {
    const val = min + pct * range;
    const y = padT + chartH - pct * chartH;
    return { val, y };
  });

  const xLabels = ["Day 1", "Day 8", "Day 15", "Day 22", "Day 30"];

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22C55E" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22C55E" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={t.y} x2={w - padR} y2={t.y} stroke="#F1F5F9" strokeWidth="1" />
          <text x={padL - 8} y={t.y + 4} textAnchor="end" fontSize="10" fill="#94A3B8">
            {t.val >= 1000 ? `${(t.val / 1000).toFixed(1)}k` : Math.round(t.val)}
          </text>
        </g>
      ))}

      {xLabels.map((label, i) => {
        const x = padL + (i / (xLabels.length - 1)) * chartW;
        return (
          <text key={i} x={x} y={h - 5} textAnchor="middle" fontSize="10" fill="#94A3B8">
            {label}
          </text>
        );
      })}

      <path d={areaPath} fill="url(#revenueGradient)" />
      <path d={linePath} fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill="#22C55E" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="7" fill="#22C55E" fillOpacity="0.2" />
    </svg>
  );
}

// ─── Status Badge Component ──────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Delivered: "bg-green-100 text-green-700",
    Processing: "bg-blue-100 text-blue-700",
    Shipped: "bg-purple-100 text-purple-700",
    Pending: "bg-amber-100 text-amber-700",
    Cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

// ─── Main Dashboard Component ────────────────────────────────────────────────

export default function DashboardPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30d");
  const [filterOpen, setFilterOpen] = useState(false);

  // Fetch dashboard data from API
  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    `/api/dashboard/kpis?period=${timeFilter}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  const filterLabels: Record<TimeFilter, string> = {
    today: "Today",
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "90d": "Last 90 days",
  };

  const orderStatusIcons: Record<string, React.ReactNode> = {
    Pending: <Clock className="w-4 h-4" />,
    Processing: <Package className="w-4 h-4" />,
    Shipped: <Truck className="w-4 h-4" />,
    Delivered: <CheckCircle2 className="w-4 h-4" />,
    Cancelled: <XCircle className="w-4 h-4" />,
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-[1400px] mx-auto">
          <div className="bg-white rounded-2xl border border-red-100 p-8 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Failed to load dashboard</h3>
            <p className="text-sm text-gray-500 mb-4">There was a problem fetching your dashboard data. Please try again.</p>
            <button
              onClick={() => mutate()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-[1400px] mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="animate-pulse">
              <div className="w-40 h-7 bg-gray-100 rounded mb-2" />
              <div className="w-64 h-4 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <KPICardSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2"><ChartSkeleton /></div>
            <ChartSkeleton />
          </div>
          <TableSkeleton />
        </div>
      </div>
    );
  }

  // Extract data (handle both API response shapes)
  const kpis = data?.kpis;
  const orderStatuses = data?.orderStatuses || [];
  const aiAgentStats = data?.aiAgent || { whatsappOrders: 0, smartResponses: 0, recommendations: 0, creditsUsed: 0, creditsTotal: 1 };
  const topProducts = data?.topProducts || [];
  const recentOrders = data?.recentOrders || [];
  const revenueChartData = data?.revenueChart || [];

  const defaultSparklines: Record<string, number[]> = {
    revenue: [65, 72, 68, 80, 85, 78, 92, 88, 95, 100],
    orders: [40, 45, 38, 52, 48, 55, 60, 58, 65, 70],
    customers: [30, 35, 40, 38, 42, 45, 50, 55, 52, 60],
    conversion: [3.2, 3.5, 3.1, 3.8, 4.0, 3.6, 4.2, 4.5, 4.1, 3.8],
  };
  const sparklines = data?.kpis?.sparklines || defaultSparklines;

  const kpiCards = kpis ? [
    {
      title: "Revenue",
      value: kpis.revenue.value,
      change: kpis.revenue.change,
      icon: DollarSign,
      sparkData: sparklines.revenue || defaultSparklines.revenue,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Orders",
      value: kpis.orders.value,
      change: kpis.orders.change,
      icon: ShoppingCart,
      sparkData: sparklines.orders || defaultSparklines.orders,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Customers",
      value: kpis.customers.value,
      change: kpis.customers.change,
      icon: Users,
      sparkData: sparklines.customers || defaultSparklines.customers,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Conversion Rate",
      value: kpis.conversion.value,
      change: kpis.conversion.change,
      icon: Target,
      sparkData: sparklines.conversion || defaultSparklines.conversion,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ] : [];

  const creditPct = aiAgentStats.creditsTotal > 0
    ? Math.round((aiAgentStats.creditsUsed / aiAgentStats.creditsTotal) * 100)
    : 0;

  // No data / empty store state
  if (!kpis && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-[1400px] mx-auto">
          <EmptyState
            icon={ShoppingCart}
            title="Welcome to your store dashboard"
            description="Start by adding your first product to see your store analytics come to life."
            actionLabel="Add your first product"
            actionHref="/dashboard/products"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Monitor sales, track orders, and manage your business</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Time filter dropdown */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                aria-label={`Filter: ${filterLabels[timeFilter]}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                {filterLabels[timeFilter]}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${filterOpen ? "rotate-180" : ""}`} />
              </button>
              {filterOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                  {(Object.keys(filterLabels) as TimeFilter[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setTimeFilter(key);
                        setFilterOpen(false);
                      }}
                      aria-label={`Filter: ${filterLabels[key]}`}
                      className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        timeFilter === key
                          ? "bg-green-50 text-green-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {filterLabels[key]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh */}
            <button
              onClick={() => mutate()}
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              title="Refresh data"
              aria-label="Refresh dashboard data"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>

          </div>
        </div>

        {/* ── KPI Cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card) => {
            const isPositive = card.change >= 0;
            return (
              <div
                key={card.title}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                    <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                  <Sparkline data={card.sparkData} color={isPositive ? "#22C55E" : "#EF4444"} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                  <div className="flex items-end gap-2 mt-1">
                    <span className="text-2xl font-bold text-gray-900">{card.value}</span>
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                        isPositive ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
                      }`}
                    >
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(card.change)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Main Grid: Revenue Chart + Order Status ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Chart (spans 2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
                <p className="text-sm text-gray-500 mt-0.5">Last 30 days performance</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-500">Revenue (₦ thousands)</span>
              </div>
            </div>
            <RevenueChart data={revenueChartData} />
          </div>

          {/* Order Status Widget */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Order Status</h2>
            <p className="text-sm text-gray-500 mb-5">Current distribution</p>
            {orderStatuses.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orderStatuses.map((s) => {
                  const total = orderStatuses.reduce((sum, st) => sum + st.count, 0);
                  const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
                  return (
                    <div key={s.label} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color.split(" ")[0]}`}>
                        {orderStatusIcons[s.label]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{s.label}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.color}`}>
                            {s.count}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${s.color.split(" ")[0].replace("100", "400")}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── AI Commerce Agent + Top Products ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* AI Commerce Agent */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">AI Commerce Agent</h2>
                <p className="text-xs text-gray-500">WhatsApp + Smart Commerce</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-green-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <MessageSquare className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">WhatsApp Orders</span>
                </div>
                <span className="text-xl font-bold text-green-900">{aiAgentStats.whatsappOrders}</span>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs text-blue-700 font-medium">Smart Responses</span>
                </div>
                <span className="text-xl font-bold text-blue-900">{aiAgentStats.smartResponses}</span>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 col-span-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-xs text-purple-700 font-medium">Product Recommendations</span>
                </div>
                <span className="text-xl font-bold text-purple-900">{aiAgentStats.recommendations}</span>
              </div>
            </div>
            {/* Credit usage bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">AI Credits Used</span>
                <span className="text-xs font-semibold text-gray-700">
                  {aiAgentStats.creditsUsed.toLocaleString()} / {aiAgentStats.creditsTotal.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
                  style={{ width: `${creditPct}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">{creditPct}% of monthly credits used</p>
            </div>
          </div>

          {/* Top Products */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
                <p className="text-sm text-gray-500 mt-0.5">Best sellers this period</p>
              </div>
            </div>
            {topProducts.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No products yet"
                description="Add your first product to start tracking your best sellers."
                actionLabel="Add product"
                actionHref="/dashboard/products"
              />
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, idx) => (
                  <div
                    key={product.name}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-semibold text-gray-400 w-5">#{idx + 1}</span>
                    <span className="text-2xl">{product.emoji || "📦"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sold} units sold</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{product.revenue}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Recent Orders Table ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <p className="text-sm text-gray-500 mt-0.5">Latest customer transactions</p>
            </div>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="No orders yet"
              description="Your recent orders will appear here. Share your store to start receiving orders."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 pr-4">
                      Order ID
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 pr-4">
                      Customer
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 pr-4">
                      Amount
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 pr-4">
                      Status
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 pr-4">
                        <span className="text-sm font-mono font-semibold text-green-600">{order.id}</span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="text-sm font-medium text-gray-900">{order.customer}</span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="text-sm font-semibold text-gray-900">{order.amount}</span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="text-sm text-gray-400">{order.time}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Click-away overlay for dropdown */}
      {filterOpen && <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />}
    </div>
  );
}
