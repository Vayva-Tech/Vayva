"use client";
// @ts-nocheck

import { useState } from "react";
import useSWR from "swr";
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock,
  Banknote,
  RefreshCw,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FinanceData {
  revenueData: { month: string; value: number }[];
  transactions: { id: number; date: string; description: string; amount: number; type: "Credit" | "Debit"; status: "Completed" | "Pending" | "Failed" }[];
  payouts: { id: number; amount: number; bank: string; date: string; status: "Completed" | "Pending" | "Failed" }[];
  expenseBreakdown: { label: string; value: number; color: string }[];
  profitMarginData: { month: string; margin: number }[];
  kpis: {
    totalRevenue: string;
    revenueTrend: string;
    revenueTrendUp: boolean;
    availableBalance: string;
    balanceTrend: string;
    balanceTrendUp: boolean;
    pendingPayouts: string;
    payoutsTrend: string;
    payoutsTrendUp: boolean;
    monthlyGrowth: string;
    growthTrend: string;
    growthTrendUp: boolean;
    totalExpenses: string;
    currentMargin: string;
  };
}

/* ------------------------------------------------------------------ */
/*  SWR Fetcher                                                        */
/* ------------------------------------------------------------------ */

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
});

/* ------------------------------------------------------------------ */
/*  Skeleton Components                                                */
/* ------------------------------------------------------------------ */

function KPICardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-gray-100 rounded-xl" />
        <div className="w-16 h-6 bg-gray-100 rounded-lg" />
      </div>
      <div className="w-20 h-7 bg-gray-100 rounded mb-1" />
      <div className="w-24 h-4 bg-gray-100 rounded" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
      <div className="w-40 h-5 bg-gray-100 rounded mb-2" />
      <div className="w-56 h-4 bg-gray-100 rounded mb-6" />
      <div className="w-full h-52 bg-gray-50 rounded-xl" />
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
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

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatNaira(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1000000) return `${value < 0 ? "-" : ""}₦${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${value < 0 ? "-" : ""}₦${(abs / 1000).toFixed(0)}K`;
  return `${value < 0 ? "-" : ""}₦${abs.toLocaleString()}`;
}

function formatNairaFull(value: number): string {
  return `${value < 0 ? "-" : ""}₦${Math.abs(value).toLocaleString()}`;
}

/* ------------------------------------------------------------------ */
/*  Revenue Area Chart SVG                                             */
/* ------------------------------------------------------------------ */

function RevenueChart({ revenueData }: { revenueData: { month: string; value: number }[] }) {
  if (!revenueData || revenueData.length === 0) return null;

  const width = 600;
  const height = 200;
  const paddingX = 40;
  const paddingY = 20;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2 - 20;

  const maxVal = Math.max(...revenueData.map((d) => d.value)) * 1.1;
  const minVal = 0;

  const getX = (i: number) => paddingX + (i / (revenueData.length - 1)) * chartW;
  const getY = (v: number) => paddingY + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

  const linePath = revenueData.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d.value)}`).join(" ");
  const areaPath = `${linePath} L ${getX(revenueData.length - 1)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22C55E" stopOpacity={0.25} />
          <stop offset="100%" stopColor="#22C55E" stopOpacity={0.02} />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
        const y = paddingY + chartH - pct * chartH;
        const val = minVal + pct * (maxVal - minVal);
        return (
          <g key={i}>
            <line x1={paddingX} x2={width - paddingX} y1={y} y2={y} stroke="#f3f4f6" strokeWidth={1} />
            <text x={paddingX - 6} y={y + 4} textAnchor="end" fill="#9ca3af" style={{ fontSize: "10px" }}>
              {val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${(val / 1000).toFixed(0)}K`}
            </text>
          </g>
        );
      })}

      {/* Area */}
      <path d={areaPath} fill="url(#revGrad)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#22C55E" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

      {/* Dots */}
      {revenueData.map((d, i) => (
        <circle key={i} cx={getX(i)} cy={getY(d.value)} r={4} fill="#22C55E" stroke="white" strokeWidth={2} />
      ))}

      {/* X labels */}
      {revenueData.map((d, i) => (
        <text key={i} x={getX(i)} y={height - 4} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "11px" }}>
          {d.month}
        </text>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Donut Chart for Expenses                                           */
/* ------------------------------------------------------------------ */

function ExpenseDonut({ expenseBreakdown, totalExpenses }: { expenseBreakdown: { label: string; value: number; color: string }[]; totalExpenses: string }) {
  if (!expenseBreakdown || expenseBreakdown.length === 0) return null;

  const size = 160;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {expenseBreakdown.map((seg, i) => {
          const arc = (seg.value / 100) * circumference;
          const dashOffset = -offset;
          offset += arc;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arc} ${circumference - arc}`}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
        })}
        <text x={size / 2} y={size / 2 - 6} textAnchor="middle" fill="#111827" style={{ fontSize: "20px", fontWeight: 700 }}>
          {totalExpenses}
        </text>
        <text x={size / 2} y={size / 2 + 12} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "11px" }}>
          Total Expenses
        </text>
      </svg>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {expenseBreakdown.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-gray-600">{seg.label} ({seg.value}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Profit Margin Line Chart                                           */
/* ------------------------------------------------------------------ */

function ProfitMarginChart({ profitMarginData }: { profitMarginData: { month: string; margin: number }[] }) {
  if (!profitMarginData || profitMarginData.length === 0) return null;

  const width = 300;
  const height = 140;
  const px = 30;
  const py = 15;
  const cw = width - px * 2;
  const ch = height - py * 2 - 16;
  const maxM = 30;

  const getX = (i: number) => px + (i / (profitMarginData.length - 1)) * cw;
  const getY = (v: number) => py + ch - (v / maxM) * ch;

  const path = profitMarginData.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d.margin)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      {[0, 10, 20, 30].map((v) => (
        <g key={v}>
          <line x1={px} x2={width - px} y1={getY(v)} y2={getY(v)} stroke="#f3f4f6" strokeWidth={1} />
          <text x={px - 4} y={getY(v) + 4} textAnchor="end" fill="#9ca3af" style={{ fontSize: "9px" }}>
            {v}%
          </text>
        </g>
      ))}
      <path d={path} fill="none" stroke="#22C55E" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {profitMarginData.map((d, i) => (
        <g key={i}>
          <circle cx={getX(i)} cy={getY(d.margin)} r={3} fill="#22C55E" stroke="white" strokeWidth={1.5} />
          <text x={getX(i)} y={height - 2} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "9px" }}>
            {d.month}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: "Completed" | "Pending" | "Failed" }) {
  const styles = {
    Completed: "bg-green-50 text-green-700 border-green-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Failed: "bg-red-50 text-red-700 border-red-200",
  };
  const icons = {
    Completed: <CheckCircle2 size={12} />,
    Pending: <Clock size={12} />,
    Failed: <XCircle size={12} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function FinancePage() {
  const [userPlan] = useState<"FREE" | "STARTER" | "PRO">("FREE");

  const { data, error, isLoading, mutate } = useSWR<FinanceData>(
    '/api/finance/overview',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  const revenueData = data?.revenueData || [];
  const transactions = data?.transactions || [];
  const payouts = data?.payouts || [];
  const expenseBreakdown = data?.expenseBreakdown || [];
  const profitMarginData = data?.profitMarginData || [];
  const finKpis = data?.kpis;

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-red-100 p-8 text-center max-w-md">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Failed to load financial data</h3>
          <p className="text-sm text-gray-500 mb-4">There was a problem fetching your finance data. Please try again.</p>
          <button
            onClick={() => mutate()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen space-y-6">
        <div className="flex items-center justify-between">
          <div className="animate-pulse">
            <div className="w-32 h-7 bg-gray-100 rounded mb-2" />
            <div className="w-64 h-4 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <KPICardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><ChartSkeleton /></div>
          <ChartSkeleton />
        </div>
        <TableSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || (revenueData.length === 0 && transactions.length === 0)) {
    return (
      <div className="min-h-screen space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Finance</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your revenue, payouts, and financial health</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <DollarSign className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No financial data yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mb-4">Revenue and transactions will appear after your first sale</p>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: "Total Revenue", value: finKpis?.totalRevenue ?? "--", icon: DollarSign, iconBg: "bg-green-100 text-green-600", trend: finKpis?.revenueTrend ?? "--", trendUp: finKpis?.revenueTrendUp ?? true },
    { label: "Available Balance", value: finKpis?.availableBalance ?? "--", icon: Wallet, iconBg: "bg-blue-100 text-blue-600", trend: finKpis?.balanceTrend ?? "--", trendUp: finKpis?.balanceTrendUp ?? true },
    { label: "Pending Payouts", value: finKpis?.pendingPayouts ?? "--", icon: Clock, iconBg: "bg-amber-100 text-amber-600", trend: finKpis?.payoutsTrend ?? "--", trendUp: finKpis?.payoutsTrendUp ?? false },
    { label: "Monthly Growth", value: finKpis?.monthlyGrowth ?? "--", icon: TrendingUp, iconBg: "bg-purple-100 text-purple-600", trend: finKpis?.growthTrend ?? "--", trendUp: finKpis?.growthTrendUp ?? true },
  ];

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Finance</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your revenue, payouts, and financial health</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => mutate()}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors shadow-sm">
            <Banknote size={16} />
            Request Payout
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${kpi.iconBg}`}>
                <kpi.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${kpi.trendUp ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50"}`}>
                {kpi.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {kpi.trend}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{kpi.value}</p>
            <p className="text-xs font-medium text-gray-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart + Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart (2 col span) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Revenue Overview</h3>
              <p className="text-xs text-gray-500 mt-0.5">Last 6 months performance</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-green-500 rounded" />
                Revenue
              </div>
            </div>
          </div>
          <div className="h-52">
            <RevenueChart revenueData={revenueData} />
          </div>
        </div>

        {/* Transactions Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Recent Transactions</h3>
          <p className="text-xs text-gray-500 mb-4">Latest 5 transactions</p>
          <div className="space-y-3">
            {transactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${txn.type === "Credit" ? "bg-green-50" : "bg-red-50"}`}>
                    {txn.type === "Credit" ? (
                      <ArrowUpRight size={14} className="text-green-600" />
                    ) : (
                      <ArrowDownRight size={14} className="text-red-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{txn.description}</p>
                    <p className="text-[11px] text-gray-400">{txn.date}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className={`text-sm font-semibold ${txn.type === "Credit" ? "text-green-600" : "text-red-600"}`}>
                    {txn.type === "Credit" ? "+" : ""}{formatNairaFull(txn.amount)}
                  </p>
                  <StatusBadge status={txn.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Payout History</h3>
          <p className="text-xs text-gray-500 mt-0.5">Track your withdrawal status</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bank Account</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-center py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-6">
                    <span className="text-sm font-semibold text-gray-900">{formatNairaFull(payout.amount)}</span>
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-700">{payout.bank}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="text-sm text-gray-500">{payout.date}</span>
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    <StatusBadge status={payout.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Charts (Gated) */}
      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Breakdown Donut */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Expense Breakdown</h3>
            <p className="text-xs text-gray-500 mb-4">Where your money goes</p>
            <ExpenseDonut expenseBreakdown={expenseBreakdown} totalExpenses={finKpis?.totalExpenses ?? "₦0"} />
          </div>

          {/* Profit Margin Trend */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Profit Margin Trend</h3>
            <p className="text-xs text-gray-500 mb-4">Monthly profit margin (%)</p>
            <div className="h-36">
              <ProfitMarginChart profitMarginData={profitMarginData} />
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <TrendingUp size={14} className="text-green-500" />
              <span className="text-gray-600">Current margin:</span>
              <span className="font-semibold text-gray-900">{finKpis?.currentMargin ?? "--"}</span>
            </div>
          </div>
        </div>

        {/* Gate overlay for FREE users */}
        {userPlan === "FREE" && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
            <div className="text-center p-8 max-w-sm">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Lock size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Unlock Financial Analytics</h3>
              <p className="text-sm text-gray-500 mb-5">
                Get detailed expense breakdowns and profit margin trends to make smarter financial decisions.
              </p>
              <button className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors shadow-sm">
                Upgrade to Starter
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
