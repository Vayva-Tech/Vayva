"use client";
import React from "react";

interface ActivityItem {
  message: string;
  timestamp: string;
}

interface DashboardData {
  merchants?: { total: number; delta: number };
  revenue?: { total: number; growth: number };
  operations?: { orders24h: number; pendingKYC: number; tickets: number; alerts: number };
  marketplace?: { pendingListings: number };
  subscriptions?: { mrr: number; expiringTrials: number };
  recentActivity?: ActivityItem[];
}

import { useOpsQuery } from "@/hooks/useOpsQuery";
import { Users, CurrencyDollar as DollarSign, WarningCircle as AlertCircle, ArrowRight, Pulse as Activity, TrendUp as TrendingUp, Storefront as Store, ShoppingBag, CreditCard, Package, Clock, CheckCircle, Warning as AlertTriangle, ChartBar, Globe, Lightning as Zap, ArrowsClockwise as RefreshCwIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { cn, Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { OpsStatCard, OpsStatGrid, HealthCard } from "@/components/ops/OpsStatCard";
import { TimeSeriesChart } from "@/components/ops/TimeSeriesChart";

function GatewayHealthCardComponent(): React.JSX.Element {
  const { data: health, isLoading, error } = useOpsQuery<{
    status: string;
    checks?: { whatsapp_gateway?: string };
  }>(["gateway-health"], async () => {
    const res = await fetch("/api/ops/health/ping");
    if (!res.ok) {
      // Return a default error state instead of throwing
      return { status: "UNHEALTHY", checks: { whatsapp_gateway: "DOWN" } };
    }
    return res.json();
  });

  const isHealthy = !error && health?.checks?.whatsapp_gateway === "UP";

  return (
    <HealthCard
      title="WhatsApp Gateway"
      status={isLoading ? "unknown" : isHealthy ? "healthy" : "critical"}
      message={isLoading ? "Checking..." : isHealthy ? "99.9% uptime" : "Gateway Down"}
    />
  );
}

function DashboardCharts(): React.JSX.Element {
  const { data: gmvData } = useOpsQuery(
    ["timeseries", "gmv", "30d"],
    () => fetch("/api/ops/analytics/timeseries?metric=gmv&period=30d").then((res: Response) => {
      if (!res.ok) return { data: { dataPoints: [] } };
      return res.json();
    }),
    { enabled: true }
  );

  const { data: merchantsData } = useOpsQuery(
    ["timeseries", "merchants", "30d"],
    () => fetch("/api/ops/analytics/timeseries?metric=merchants&period=30d").then((res: Response) => {
      if (!res.ok) return { data: { dataPoints: [] } };
      return res.json();
    }),
    { enabled: true }
  );

  const { data: ordersData } = useOpsQuery(
    ["timeseries", "orders", "30d"],
    () => fetch("/api/ops/analytics/timeseries?metric=orders&period=30d").then((res: Response) => {
      if (!res.ok) return { data: { dataPoints: [] } };
      return res.json();
    }),
    { enabled: true }
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <TimeSeriesChart
        data={gmvData?.data?.dataPoints || []}
        title="GMV Trend (30 days)"
        valuePrefix="₦"
        color="#10b981"
      />
      <TimeSeriesChart
        data={merchantsData?.data?.dataPoints || []}
        title="New Merchants (30 days)"
        color="#6366f1"
      />
      <TimeSeriesChart
        data={ordersData?.data?.dataPoints || []}
        title="Daily Orders (30 days)"
        color="#f59e0b"
      />
    </div>
  );
}

export default function OpsDashboardPage(): React.JSX.Element {
  const { data, isLoading: loading, refetch } = useOpsQuery<DashboardData>(
    ["ops-dashboard"],
    () => fetch("/api/ops/dashboard").then((res: Response) => {
      if (!res.ok) {
        // Return empty dashboard data instead of trying to parse HTML error
        return {
          merchants: { total: 0, delta: 0 },
          revenue: { total: 0, growth: 0 },
          operations: { orders24h: 0, pendingKYC: 0, tickets: 0, alerts: 0 },
          marketplace: { pendingListings: 0 },
          subscriptions: { mrr: 0, expiringTrials: 0 },
          recentActivity: [],
        };
      }
      return res.json();
    }),
  );

  // Skeleton loader
  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i: number) => (
            <div key={i} className="h-40 bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const { merchants, revenue, operations, marketplace, subscriptions } = data || {};
  const recentActivity = data?.recentActivity ?? [];

  return (
    <OpsPageShell
      title="Command Center"
      description="Real-time platform monitoring and control"
      breadcrumbs={false}
      headerActions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCwIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              All Systems Operational
            </div>
          </div>
        </div>
      }
    >
      {/* Primary KPIs */}
      <section className="mb-8">
        <OpsStatGrid columns={4}>
          <OpsStatCard
            label="Platform GMV (30d)"
            value={revenue ? `₦${(revenue.total / 1000000).toFixed(1)}M` : "₦0"}
            icon="CurrencyDollar"
            trend={
              revenue?.growth
                ? {
                    value: Math.abs(revenue.growth),
                    label: "vs last period",
                    positive: revenue.growth > 0,
                  }
                : undefined
            }
            variant="success"
          />
          <OpsStatCard
            label="Active Merchants"
            value={merchants?.total || 0}
            icon="Storefront"
            trend={
              merchants?.delta
                ? {
                    value: merchants.delta,
                    label: "vs last period",
                    positive: true,
                  }
                : undefined
            }
          />
          <OpsStatCard
            label="MRR"
            value={subscriptions?.mrr ? `₦${subscriptions?.mrr?.toLocaleString()}` : "₦0"}
            icon="CreditCard"
            variant="info"
          />
          <GatewayHealthCardComponent />
        </OpsStatGrid>
      </section>

      {/* Time Series Charts */}
      <section className="mb-8">
        <DashboardCharts />
      </section>

      {/* Secondary KPIs */}
      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
        <Link
          href="/ops/orders"
          className="block p-5 bg-white border border-gray-200 rounded-xl hover:border-indigo-200 transition-colors"
        >
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <ShoppingBag size={16} />
            <span className="text-xs font-medium">Orders (24h)</span>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {operations?.orders24h || 0}
          </div>
        </Link>

        <Link
          href="/ops/marketplace/listings"
          className="block p-5 bg-white border border-gray-200 rounded-xl hover:border-yellow-200 transition-colors"
        >
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Package size={16} />
            <span className="text-xs font-medium">Pending Listings</span>
          </div>
          <div className="text-2xl font-black text-yellow-600">
            {marketplace?.pendingListings || 0}
          </div>
        </Link>

        <Link
          href="/ops/kyc"
          className="block p-5 bg-white border border-gray-200 rounded-xl hover:border-orange-200 transition-colors"
        >
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Clock size={16} />
            <span className="text-xs font-medium">KYC Queue</span>
          </div>
          <div className="text-2xl font-black text-orange-600">
            {operations?.pendingKYC || 0}
          </div>
        </Link>

        <Link
          href="/ops/subscriptions"
          className="block p-5 bg-white border border-gray-200 rounded-xl hover:border-blue-200 transition-colors"
        >
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Clock size={16} />
            <span className="text-xs font-medium">Expiring Trials</span>
          </div>
          <div className="text-2xl font-black text-blue-600">
            {subscriptions?.expiringTrials || 0}
          </div>
        </Link>

        <Link
          href="/ops/inbox"
          className="block p-5 bg-white border border-gray-200 rounded-xl hover:border-purple-200 transition-colors"
        >
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <AlertCircle size={16} />
            <span className="text-xs font-medium">Open Tickets</span>
          </div>
          <div className="text-2xl font-black text-purple-600">
            {operations?.tickets || 0}
          </div>
        </Link>

        <Link
          href="/ops/alerts"
          className="block p-5 bg-white border border-gray-200 rounded-xl hover:border-red-200 transition-colors"
        >
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <AlertTriangle size={16} />
            <span className="text-xs font-medium">Active Alerts</span>
          </div>
          <div className="text-2xl font-black text-red-600">
            {operations?.alerts || 0}
          </div>
        </Link>
      </div>
      </section>

      {/* Quick Actions & Feed */}
      <section className="mb-8">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Recent Pulse as Activity Feed */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 h-fit">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              Recent Pulse as Activity
            </h3>
            <Link
              href="/ops/audit"
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              View Audit Log
            </Link>
          </div>

          <div className="space-y-6">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity: ActivityItem, i: number) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="h-2 w-2 mt-2 rounded-full bg-indigo-400 shrink-0"></div>
                  <div>
                    <p className="text-sm text-gray-900 font-medium">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
            Quick Actions
          </h3>

          <Link
            href="/ops/analytics"
            className="block p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-colors group"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <ChartBar className="h-5 w-5" />
                <span className="font-medium">Platform Analytics</span>
              </div>
              <ArrowRight className="h-4 w-4 opacity-70 group-hover:opacity-100" />
            </div>
          </Link>

          <Link
            href="/ops/merchants"
            className="block p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors group"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-700 group-hover:text-indigo-700">
                  Manage Merchants
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-500" />
            </div>
          </Link>

          <Link
            href="/ops/marketplace/listings"
            className="block p-4 bg-white border border-gray-200 rounded-xl hover:border-yellow-300 transition-colors group"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-700 group-hover:text-yellow-700">
                  Moderate Listings
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-yellow-500" />
            </div>
          </Link>

          <Link
            href="/ops/rescue"
            className="block p-4 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors group"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-red-500" />
                <span className="font-medium text-red-900">Rescue Console</span>
              </div>
              <ArrowRight className="h-4 w-4 text-red-400 group-hover:text-red-600" />
            </div>
          </Link>
        </div>
      </div>
      </section>

      {/* Platform Modules */}
      <div>
        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">
          Platform Modules
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <Link
            href="/ops/subscriptions"
            className="block p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-300 transition-colors group"
          >
            <CreditCard className="h-5 w-5 text-emerald-500 mb-2" />
            <div className="font-medium text-gray-700 group-hover:text-emerald-700">
              Subscriptions
            </div>
            <div className="text-xs text-gray-500">SaaS Revenue</div>
          </Link>

          <Link
            href="/ops/industries"
            className="block p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 transition-colors group"
          >
            <Globe className="h-5 w-5 text-blue-500 mb-2" />
            <div className="font-medium text-gray-700 group-hover:text-blue-700">
              Industries
            </div>
            <div className="text-xs text-gray-500">Breakdown</div>
          </Link>

          <Link
            href="/ops/payouts"
            className="block p-4 bg-white border border-gray-200 rounded-xl hover:border-green-300 transition-colors group"
          >
            <DollarSign className="h-5 w-5 text-green-500 mb-2" />
            <div className="font-medium text-gray-700 group-hover:text-green-700">
              Payouts
            </div>
            <div className="text-xs text-gray-500">Withdrawals</div>
          </Link>

          <Link
            href="/ops/users"
            className="block p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 transition-colors group"
          >
            <Users className="h-5 w-5 text-purple-500 mb-2" />
            <div className="font-medium text-gray-700 group-hover:text-purple-700">
              Ops Team
            </div>
            <div className="text-xs text-gray-500">Admin Access</div>
          </Link>

          <Link
            href="/ops/security"
            className="block p-4 bg-white border border-gray-200 rounded-xl hover:border-red-300 transition-colors group"
          >
            <AlertTriangle className="h-5 w-5 text-red-500 mb-2" />
            <div className="font-medium text-gray-700 group-hover:text-red-700">
              Security
            </div>
            <div className="text-xs text-gray-500">Risk & Fraud</div>
          </Link>
        </div>
      </div>
    </OpsPageShell>
  );
}
