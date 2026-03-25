"use client";
import { Button } from "@vayva/ui";

import React from "react";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { 
  TrendUp, 
  TrendDown, 
  Users, 
  Storefront, 
  CurrencyDollar, 
  ShoppingBag, 
  CreditCard, 
  Package, 
  Globe, 
  ChartBar, 
  ArrowUpRight, 
  ArrowDownRight,
  Eye,
  Clock,
  CheckCircle,
  Warning,
  Ticket,
  Shield,
  UserPlus,
  ArrowsLeftRight,
  ChartLine,
  ChartPie,
  MapPin,
  DeviceMobile,
  Desktop,
  Browser,
  Lightning
} from "@phosphor-icons/react/ssr";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { useUser } from "@/hooks/useUser";
import { hasPermission, type OpsRole } from "@/lib/roles";

// ============================================================================
// Types
// ============================================================================

interface TimeSeriesPoint {
  date: string;
  value: number;
  label: string;
}

interface ComprehensiveAnalytics {
  // Overview
  overview: {
    totalMerchants: number;
    activeMerchants: number;
    totalGMV: number;
    totalOrders: number;
    avgOrderValue: number;
    mrr: number;
    merchantGrowth: number;
    gmvGrowth: number;
    orderGrowth: number;
  };
  
  // Time Series
  timeSeries: {
    gmv: TimeSeriesPoint[];
    orders: TimeSeriesPoint[];
    merchants: TimeSeriesPoint[];
    revenue: TimeSeriesPoint[];
  };
  
  // Breakdowns
  breakdowns: {
    byIndustry: { name: string; merchants: number; gmv: number; orders: number }[];
    byPlan: { name: string; count: number; revenue: number; percentage: number }[];
    byRegion: { name: string; merchants: number; gmv: number }[];
    byDevice: { name: string; percentage: number }[];
  };
  
  // Top Performers
  topPerformers: {
    merchants: { id: string; name: string; gmv: number; orders: number; growth: number }[];
    products: { id: string; name: string; sales: number; revenue: number }[];
  };
  
  // Operational
  operational: {
    openTickets: number;
    avgResolutionTime: number;
    satisfactionScore: number;
    pendingKyc: number;
    pendingDisputes: number;
    fraudFlags: number;
  };
  
  // Financial
  financial: {
    totalRevenue: number;
    totalRefunds: number;
    netRevenue: number;
    payoutPending: number;
    payoutCompleted: number;
    feesCollected: number;
  };
  
  // Growth
  growth: {
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
    retentionRate: number;
    churnRate: number;
    referralRate: number;
  };
  
  // System Health
  health: {
    apiUptime: number;
    avgResponseTime: number;
    errorRate: number;
    lastIncident: string | null;
  };
}

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
  loading = false,
}: {
  title: string;
  value: string | number;
  subValue?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  trend?: string;
  trendUp?: boolean;
  color?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className={`${color} p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse`}>
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 bg-gray-200 rounded-xl h-10 w-10" />
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
        </div>
        <div className="h-8 w-24 bg-gray-200 rounded mb-1" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className={`${color} p-6 rounded-2xl border border-gray-100 shadow-sm`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 bg-gray-100 rounded-xl">
          <Icon className="h-5 w-5 text-gray-700" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
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

function SectionCard({ 
  title, 
  icon: Icon, 
  children,
  loading = false,
  className = ""
}: { 
  title: string; 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any; 
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}) {
  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-gray-200 rounded-lg h-9 w-9 animate-pulse" />
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i: any) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Icon className="h-5 w-5 text-indigo-600" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function BarChart({ 
  data, 
  maxValue,
  showValues = true 
}: { 
  data: { label: string; value: number; subValue?: string }[]; 
  maxValue: number;
  showValues?: boolean;
}) {
  return (
    <div className="space-y-3">
      {data.map((item: any) => (
        <div key={item.label} className="flex items-center gap-4">
          <div className="w-32 text-sm font-medium text-gray-700 truncate">
            {item.label}
          </div>
          <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg transition-all duration-500"
              style={{ width: `${Math.min((item.value / maxValue) * 100, 100)}%` }}
            />
            {showValues && (
              <div className="absolute inset-0 flex items-center justify-between px-3">
                <span className="text-xs font-bold text-white drop-shadow">
                  {item?.value?.toLocaleString()}
                </span>
                {item.subValue && (
                  <span className="text-xs font-bold text-gray-600">
                    {item.subValue}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ 
  data 
}: { 
  data: { name: string; value: number; color: string }[] 
}) {
  const total = data.reduce((sum: any, d: any) => sum + d.value, 0);
  // Pre-compute offsets immutably to avoid mutating variables during render
  const segments = data.map((item: any, i: number) => {
    const cumulativeBefore = data.slice(0, i).reduce((s: number, d: any) => s + (d.value / total) * 100, 0);
    const percent = (item.value / total) * 100;
    return { item, percent, offset: 100 - cumulativeBefore };
  });

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          {segments.map(({ item, percent, offset }, i: number) => {
            const dashArray = `${percent} ${100 - percent}`;
            return (
              <circle
                key={i}
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke={item.color}
                strokeWidth="3"
                strokeDasharray={dashArray}
                strokeDashoffset={offset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl font-bold">{total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {data.map((item: any) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-gray-700">{item.name}</span>
            </div>
            <span className="text-sm font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function ComprehensiveAnalyticsPage(): React.JSX.Element {
  const { user } = useUser();
  const userRole = user?.role || "OPERATOR";

  const { data, isLoading } = useOpsQuery<ComprehensiveAnalytics>(
    ["comprehensive-analytics"],
    () => fetch("/api/ops/analytics/comprehensive").then((res: any) => {
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    }),
    {
      enabled: hasPermission(userRole as OpsRole, "analytics", "view"),
    }
  );

  // Permission checks
  const canViewFinancial = hasPermission(userRole as OpsRole, "finance", "view");
  const canViewOperational = hasPermission(userRole as OpsRole, "support", "view") || hasPermission(userRole as OpsRole, "risk", "view");
  const canViewSystem = hasPermission(userRole as OpsRole, "tools", "view");
  const canExport = hasPermission(userRole as OpsRole, "analytics", "export");

  // Access denied state
  if (!hasPermission(userRole as OpsRole, "analytics", "view")) {
    return (
      <OpsPageShell
        title="Analytics"
        description="Platform insights and metrics"
      >
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <Shield className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900">Access Restricted</h3>
          <p className="text-gray-500 max-w-md mt-2">
            Your role ({userRole}) does not have permission to view analytics data.
            Contact an administrator if you need access.
          </p>
        </div>
      </OpsPageShell>
    );
  }

  const stats = data || {
    overview: {
      totalMerchants: 0,
      activeMerchants: 0,
      totalGMV: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      mrr: 0,
      merchantGrowth: 0,
      gmvGrowth: 0,
      orderGrowth: 0,
    },
    breakdowns: { byIndustry: [], byPlan: [], byRegion: [], byDevice: [] },
    topPerformers: { merchants: [], products: [] },
    operational: {
      openTickets: 0,
      avgResolutionTime: 0,
      satisfactionScore: 0,
      pendingKyc: 0,
      pendingDisputes: 0,
      fraudFlags: 0,
    },
    financial: {
      totalRevenue: 0,
      totalRefunds: 0,
      netRevenue: 0,
      payoutPending: 0,
      payoutCompleted: 0,
      feesCollected: 0,
    },
    growth: {
      dailyActiveUsers: 0,
      monthlyActiveUsers: 0,
      retentionRate: 0,
      churnRate: 0,
      referralRate: 0,
    },
    health: {
      apiUptime: 0,
      avgResponseTime: 0,
      errorRate: 0,
      lastIncident: null,
    },
  };

  const planColors: Record<string, string> = {
    FREE: "#9CA3AF",
    STARTER: "#3B82F6",
    GROWTH: "#22C55E",
    PRO: "#A855F7",
    ENTERPRISE: "#F59E0B",
  };

  return (
    <OpsPageShell
      title="Comprehensive Analytics"
      description="Complete platform insights and metrics"
      headerActions={
        canExport && (
          <Button
            onClick={() => window.open("/api/ops/analytics/export", "_blank")}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Export Data
          </Button>
        )
      }
    >
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Primary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Merchants"
            value={stats?.overview?.totalMerchants.toLocaleString()}
            subValue={`${stats?.overview?.activeMerchants} active`}
            icon={Storefront}
            trend={`${stats?.overview?.merchantGrowth > 0 ? "+" : ""}${stats?.overview?.merchantGrowth}%`}
            trendUp={stats?.overview?.merchantGrowth > 0}
            color="bg-gradient-to-br from-blue-50 to-indigo-50"
            loading={isLoading}
          />
          <StatCard
            title="Platform GMV"
            value={`₦${(stats.overview?.totalGMV / 1000000).toFixed(1)}M`}
            subValue={`₦${stats?.overview?.avgOrderValue.toLocaleString()} AOV`}
            icon={CurrencyDollar}
            trend={`${stats?.overview?.gmvGrowth > 0 ? "+" : ""}${stats?.overview?.gmvGrowth}%`}
            trendUp={stats?.overview?.gmvGrowth > 0}
            color="bg-gradient-to-br from-green-50 to-emerald-50"
            loading={isLoading}
          />
          <StatCard
            title="Total Orders"
            value={stats?.overview?.totalOrders.toLocaleString()}
            subValue={`${stats?.overview?.totalOrders > 0 ? Math.round(stats.overview?.totalOrders / 30) : 0}/day avg`}
            icon={ShoppingBag}
            trend={`${stats?.overview?.orderGrowth > 0 ? "+" : ""}${stats?.overview?.orderGrowth}%`}
            trendUp={stats?.overview?.orderGrowth > 0}
            loading={isLoading}
          />
          <StatCard
            title="Monthly Revenue"
            value={`₦${stats?.overview?.mrr.toLocaleString()}`}
            subValue="MRR"
            icon={CreditCard}
            color="bg-gradient-to-br from-purple-50 to-pink-50"
            loading={isLoading}
          />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Daily Active Users"
            value={stats?.growth?.dailyActiveUsers.toLocaleString()}
            subValue={`${stats?.growth?.monthlyActiveUsers.toLocaleString()} MAU`}
            icon={Users}
            loading={isLoading}
          />
          <StatCard
            title="Retention Rate"
            value={`${stats?.growth?.retentionRate}%`}
            subValue={`${stats?.growth?.churnRate}% churn`}
            icon={ChartLine}
            trendUp={stats?.growth?.retentionRate > 50}
            loading={isLoading}
          />
          <StatCard
            title="Referral Rate"
            value={`${stats?.growth?.referralRate}%`}
            subValue="Organic growth"
            icon={UserPlus}
            loading={isLoading}
          />
        </div>

        {/* Breakdown Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Industry Breakdown */}
          <SectionCard title="GMV by Industry" icon={ChartPie} loading={isLoading}>
            {stats?.breakdowns?.byIndustry.length > 0 ? (
              <BarChart 
                data={stats?.breakdowns?.byIndustry.map((i: any) => ({
                  label: i.name,
                  value: i.gmv,
                  subValue: `₦${(i.gmv / 1000000).toFixed(1)}M`
                }))}
                maxValue={Math.max(...(stats.breakdowns?.byIndustry.map((i: unknown) => (i as { gmv: number }).gmv) ?? []), 1)}
              />
            ) : (
              <div className="text-center py-8 text-gray-400">No data available</div>
            )}
          </SectionCard>

          {/* Plan Distribution */}
          <SectionCard title="Subscription Plans" icon={CreditCard} loading={isLoading}>
            {stats?.breakdowns?.byPlan.length > 0 ? (
              <DonutChart 
                data={stats?.breakdowns?.byPlan.map((p: any) => ({
                  name: p.name,
                  value: p.count,
                  color: planColors[p.name] || "#9CA3AF"
                }))}
              />
            ) : (
              <div className="text-center py-8 text-gray-400">No data available</div>
            )}
          </SectionCard>
        </div>

        {/* Top Performers */}
        <div className="grid md:grid-cols-2 gap-6">
          <SectionCard title="Top Merchants by GMV" icon={TrendUp} loading={isLoading}>
            <div className="space-y-4">
              {stats?.topPerformers?.merchants.length > 0 ? (
                stats.topPerformers?.merchants.map((merchant: any, idx: number) => (
                  <div key={merchant.id} className="flex items-center gap-4 p-3 bg-white/50 rounded-xl">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      idx === 0 ? "bg-amber-100 text-amber-700" :
                      idx === 1 ? "bg-gray-200 text-gray-700" :
                      idx === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{merchant.name}</div>
                      <div className="text-sm text-gray-500">{merchant.orders} orders</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">₦{merchant?.gmv?.toLocaleString()}</div>
                      <div className={`text-xs ${merchant.growth > 0 ? "text-green-600" : "text-red-600"}`}>
                        {merchant.growth > 0 ? "+" : ""}{merchant.growth}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">No data available</div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Regional Distribution" icon={MapPin} loading={isLoading}>
            {stats?.breakdowns?.byRegion.length > 0 ? (
              <BarChart 
                data={stats?.breakdowns?.byRegion.map((r: any) => ({
                  label: r.name,
                  value: r.merchants,
                  subValue: `₦${(r.gmv / 1000000).toFixed(1)}M`
                }))}
                maxValue={Math.max(...(stats.breakdowns?.byRegion.map((r: unknown) => (r as { merchants: number }).merchants) ?? []), 1)}
              />
            ) : (
              <div className="text-center py-8 text-gray-400">No data available</div>
            )}
          </SectionCard>
        </div>

        {/* Operational Metrics (Conditional) */}
        {canViewOperational && (
          <SectionCard title="Operational Health" icon={Lightning} loading={isLoading}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-yellow-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700">Open Tickets</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats?.operational?.openTickets}</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Avg Resolution</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats?.operational?.avgResolutionTime}h</div>
              </div>
              <div className="p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Satisfaction</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats?.operational?.satisfactionScore}%</div>
              </div>
              <div className="p-4 bg-red-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Warning className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-700">Fraud Flags</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats?.operational?.fraudFlags}</div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Financial Metrics (Conditional) */}
        {canViewFinancial && (
          <SectionCard title="Financial Overview" icon={CurrencyDollar} loading={isLoading}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">Net Revenue</div>
                <div className="text-2xl font-bold text-green-700">₦{stats?.financial?.netRevenue.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-red-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">Total Refunds</div>
                <div className="text-2xl font-bold text-red-700">₦{stats?.financial?.totalRefunds.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">Fees Collected</div>
                <div className="text-2xl font-bold text-blue-700">₦{stats?.financial?.feesCollected.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">Pending Payouts</div>
                <div className="text-2xl font-bold text-amber-700">₦{stats?.financial?.payoutPending.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">Completed Payouts</div>
                <div className="text-2xl font-bold text-purple-700">₦{stats?.financial?.payoutCompleted.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">Total Revenue</div>
                <div className="text-2xl font-bold text-gray-700">₦{stats?.financial?.totalRevenue.toLocaleString()}</div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* System Health (Conditional) */}
        {canViewSystem && (
          <SectionCard title="System Health" icon={Lightning} loading={isLoading}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">API Uptime</div>
                <div className="text-2xl font-bold text-green-700">{stats?.health?.apiUptime}%</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">Avg Response</div>
                <div className="text-2xl font-bold text-blue-700">{stats?.health?.avgResponseTime}ms</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">Error Rate</div>
                <div className="text-2xl font-bold text-yellow-700">{stats?.health?.errorRate}%</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">Last Incident</div>
                <div className="text-lg font-bold text-gray-700">
                  {stats?.health?.lastIncident ? new Date(stats.health?.lastIncident).toLocaleDateString() : "Never"}
                </div>
              </div>
            </div>
          </SectionCard>
        )}

      </div>
    </OpsPageShell>
  );
}

