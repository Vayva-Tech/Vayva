"use client";

import React from "react";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { TrendUp as TrendingUp, TrendDown as TrendingDown, Users, Storefront as Store, CurrencyDollar as DollarSign, ShoppingBag, CreditCard, Package, Globe, ChartBar, ArrowUpRight, ArrowDownRight } from "@phosphor-icons/react/ssr";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

interface PlatformStats {
  totalMerchants: number;
  activeMerchants: number;
  newMerchantsThisMonth: number;
  merchantGrowth: number;
  totalGMV: number;
  gmvThisMonth: number;
  gmvGrowth: number;
  totalOrders: number;
  ordersThisMonth: number;
  orderGrowth: number;
  totalSubscriptionRevenue: number;
  subscriptionRevenueThisMonth: number;
  subscriptionGrowth: number;
  marketplaceListings: number;
  pendingListings: number;
  industryBreakdown: { industry: string; count: number; gmv: number }[];
  planBreakdown: { plan: string; count: number; revenue: number }[];
  topMerchants: { id: string; name: string; gmv: number; orders: number }[];
}

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}) {
  return (
    <div
      className={`${color} p-6 rounded-2xl border border-gray-200 shadow-sm`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 bg-gray-100 rounded-xl">
          <Icon className="h-5 w-5 text-gray-700" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {trendUp ? (
              <ArrowUpRight size={12} />
            ) : (
              <ArrowDownRight size={12} />
            )}
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

function IndustryChart({
  data,
}: {
  data: { industry: string; count: number; gmv: number }[];
}) {
  const maxGMV = Math.max(...data.map((d: any) => d.gmv), 1);

  return (
    <div className="space-y-3">
      {data.map((item: any) => (
        <div key={item.industry} className="flex items-center gap-4">
          <div className="w-32 text-sm font-medium text-gray-700 truncate">
            {item.industry}
          </div>
          <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg transition-all duration-500"
              style={{ width: `${(item.gmv / maxGMV) * 100}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-3">
              <span className="text-xs font-bold text-white drop-shadow">
                {item.count} merchants
              </span>
              <span className="text-xs font-bold text-gray-600">
                ₦{(item.gmv / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PlanBreakdown({
  data,
}: {
  data: { plan: string; count: number; revenue: number }[];
}) {
  const total = data.reduce((sum: any, d: any) => sum + d.count, 0) || 1;
  const colors: Record<string, string> = {
    FREE: "bg-gray-400",
    STARTER: "bg-blue-500",
    GROWTH: "bg-green-500",
    PRO: "bg-purple-500",
    ENTERPRISE: "bg-amber-500",
  };

  return (
    <div className="space-y-4">
      <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
        {data.map((item: any) => (
          <div
            key={item.plan}
            className={`${colors[item.plan] || "bg-gray-300"} transition-all duration-500`}
            style={{ width: `${(item.count / total) * 100}%` }}
            title={`${item.plan}: ${item.count} merchants`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {data.map((item: any) => (
          <div
            key={item.plan}
            className="text-center p-3 bg-gray-50 rounded-xl"
          >
            <div
              className={`w-3 h-3 rounded-full ${colors[item.plan] || "bg-gray-300"} mx-auto mb-2`}
            />
            <div className="text-xs font-bold text-gray-900">{item.plan}</div>
            <div className="text-lg font-black text-gray-900">{item.count}</div>
            <div className="text-xs text-gray-500">
              ₦{item?.revenue?.toLocaleString()}/mo
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PlatformAnalyticsPage(): React.JSX.Element {
  const { data, isLoading } = useOpsQuery<PlatformStats>(
    ["platform-analytics"],
    () => fetch("/api/ops/analytics/platform").then((res: any) => res.json()),
  );

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i: any) => (
            <div key={i} className="h-40 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data || {
    totalMerchants: 0,
    activeMerchants: 0,
    newMerchantsThisMonth: 0,
    merchantGrowth: 0,
    totalGMV: 0,
    gmvThisMonth: 0,
    gmvGrowth: 0,
    totalOrders: 0,
    ordersThisMonth: 0,
    orderGrowth: 0,
    totalSubscriptionRevenue: 0,
    subscriptionRevenueThisMonth: 0,
    subscriptionGrowth: 0,
    marketplaceListings: 0,
    pendingListings: 0,
    industryBreakdown: [],
    planBreakdown: [],
    topMerchants: [],
  };

  return (
    <OpsPageShell
      title="Platform Analytics"
      description="Real-time overview of Vayva platform performance"
    >
      <div className="max-w-7xl mx-auto space-y-8">

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Merchants"
          value={stats?.totalMerchants?.toLocaleString()}
          subValue={`${stats.activeMerchants} active`}
          icon={Store}
          trend={`${stats.merchantGrowth > 0 ? "+" : ""}${stats.merchantGrowth}%`}
          trendUp={stats.merchantGrowth > 0}
          color="bg-gradient-to-br from-blue-50 to-indigo-50"
        />
        <StatCard
          title="Platform GMV"
          value={`₦${(stats.totalGMV / 1000000).toFixed(1)}M`}
          subValue={`₦${stats?.gmvThisMonth?.toLocaleString()} this month`}
          icon={DollarSign}
          trend={`${stats.gmvGrowth > 0 ? "+" : ""}${stats.gmvGrowth}%`}
          trendUp={stats.gmvGrowth > 0}
          color="bg-gradient-to-br from-green-50 to-emerald-50"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders?.toLocaleString()}
          subValue={`${stats?.ordersThisMonth?.toLocaleString()} this month`}
          icon={ShoppingBag}
          trend={`${stats.orderGrowth > 0 ? "+" : ""}${stats.orderGrowth}%`}
          trendUp={stats.orderGrowth > 0}
        />
        <StatCard
          title="SaaS Revenue"
          value={`₦${stats?.totalSubscriptionRevenue?.toLocaleString()}`}
          subValue={`₦${stats?.subscriptionRevenueThisMonth?.toLocaleString()}/mo`}
          icon={CreditCard}
          trend={`${stats.subscriptionGrowth > 0 ? "+" : ""}${stats.subscriptionGrowth}%`}
          trendUp={stats.subscriptionGrowth > 0}
          color="bg-gradient-to-br from-purple-50 to-pink-50"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="New Merchants (30d)"
          value={stats.newMerchantsThisMonth}
          icon={Users}
        />
        <StatCard
          title="Marketplace Listings"
          value={stats.marketplaceListings}
          subValue={`${stats.pendingListings} pending review`}
          icon={Package}
        />
        <StatCard
          title="Active Merchants"
          value={stats.activeMerchants}
          subValue={`${((stats.activeMerchants / (stats.totalMerchants || 1)) * 100).toFixed(0)}% of total`}
          icon={Globe}
        />
      </div>

        {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Industry Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-600" />
            GMV by Industry
          </h3>
          {stats?.industryBreakdown?.length > 0 ? (
            <IndustryChart data={stats.industryBreakdown} />
          ) : (
            <div className="text-center py-8 text-gray-400">
              No data available
            </div>
          )}
        </div>

        {/* Plan Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-600" />
            Subscription Distribution
          </h3>
          {stats?.planBreakdown?.length > 0 ? (
            <PlanBreakdown data={stats.planBreakdown} />
          ) : (
            <div className="text-center py-8 text-gray-400">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Top Merchants */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          Top Performing Merchants
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-gray-600 border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="pb-3 font-medium">Rank</th>
                <th className="pb-3 font-medium">Merchant</th>
                <th className="pb-3 font-medium text-right">GMV (30d)</th>
                <th className="pb-3 font-medium text-right">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats?.topMerchants?.length > 0 ? (
                stats.topMerchants?.map((merchant: any, idx: number) => (
                  <tr key={merchant.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          idx === 0
                            ? "bg-amber-100 text-amber-700"
                            : idx === 1
                              ? "bg-gray-200 text-gray-700"
                              : idx === 2
                                ? "bg-orange-100 text-orange-700"
                                : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-gray-900">
                      {merchant.name}
                    </td>
                    <td className="py-3 text-right font-bold text-green-600">
                      ₦{merchant?.gmv?.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-gray-600">
                      {merchant.orders}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </OpsPageShell>
  );
}
