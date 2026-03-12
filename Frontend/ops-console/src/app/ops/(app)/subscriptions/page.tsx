"use client";

import React, { useState } from "react";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { CreditCard, TrendUp as TrendingUp, Users, CurrencyDollar as DollarSign, Clock, CheckCircle, XCircle, Warning as AlertTriangle, MagnifyingGlass as Search, ArrowCounterClockwise as RefreshCw, ArrowUpRight, Calendar } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import Link from "next/link";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  trendUp,
  color = "bg-white",
}: any) {
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
            <ArrowUpRight size={12} />
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

function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    FREE: "bg-gray-100 text-gray-700",
    STARTER: "bg-blue-100 text-blue-700",
    GROWTH: "bg-green-100 text-green-700",
    PRO: "bg-purple-100 text-purple-700",
    ENTERPRISE: "bg-amber-100 text-amber-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-bold ${colors[plan?.toUpperCase()] || "bg-gray-100 text-gray-700"}`}
    >
      {plan?.toUpperCase() || "FREE"}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; icon: React.ReactNode }> = {
    active: {
      bg: "bg-green-100 text-green-700",
      icon: <CheckCircle size={12} />,
    },
    trial: { bg: "bg-blue-100 text-blue-700", icon: <Clock size={12} /> },
    cancelled: { bg: "bg-red-100 text-red-700", icon: <XCircle size={12} /> },
    pending: { bg: "bg-yellow-100 text-yellow-700", icon: <Clock size={12} /> },
  };

  const style = styles[status?.toLowerCase()] || styles.pending;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${style.bg}`}
    >
      {style.icon}
      {status}
    </span>
  );
}

export default function SubscriptionsPage(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, refetch } = useOpsQuery<SubscriptionStats>(
    ["subscriptions-stats"],
    () => fetch("/api/ops/subscriptions").then((res) => res.json()),
  );

  const stats = data || {
    totalActive: 0,
    totalTrial: 0,
    totalCancelled: 0,
    mrr: 0,
    mrrGrowth: 0,
    planBreakdown: [],
    recentSubscriptions: [],
    expiringTrials: [],
  };

  const filteredRecent = searchQuery
    ? stats.recentSubscriptions?.filter((s: Subscription) =>
        s.storeName?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : stats.recentSubscriptions;

  return (
    <OpsPageShell
      title="Subscription Management"
      description="Monitor SaaS revenue and merchant subscriptions"
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          className="rounded-full"
          aria-label="Refresh"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      }
    >
      {/* Stats Overview */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Monthly Recurring Revenue"
            value={`₦${stats?.mrr?.toLocaleString()}`}
            icon={DollarSign}
            trend={stats.mrrGrowth > 0 ? `+${stats.mrrGrowth}%` : undefined}
            trendUp={stats.mrrGrowth > 0}
            color="bg-gradient-to-br from-green-50 to-emerald-50"
          />
          <StatCard
            title="Active Subscriptions"
            value={stats.totalActive}
            icon={CheckCircle}
            color="bg-gradient-to-br from-blue-50 to-indigo-50"
          />
          <StatCard
            title="Trial Users"
            value={stats.totalTrial}
            subValue={`${stats?.expiringTrials?.length} expiring soon`}
            icon={Clock}
            color="bg-gradient-to-br from-yellow-50 to-orange-50"
          />
          <StatCard
            title="Churned (30d)"
            value={stats.totalCancelled}
            icon={XCircle}
          />
        </div>
      </section>

      {/* Plan Breakdown */}
      <section className="mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            Revenue by Plan
          </h3>
          <div className="grid grid-cols-5 gap-4">
            {stats?.planBreakdown?.map(
              (plan: { plan: string; count: number; revenue: number }) => (
                <div
                  key={plan.plan}
                  className="text-center p-4 bg-gray-50 rounded-xl"
                >
                  <PlanBadge plan={plan.plan} />
                  <div className="text-2xl font-black text-gray-900 mt-3">
                    {plan.count}
                  </div>
                  <div className="text-xs text-gray-500">merchants</div>
                  <div className="text-sm font-bold text-green-600 mt-2">
                    ₦{plan?.revenue?.toLocaleString()}/mo
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Two Column Layout */}
      <section>
        <div className="grid md:grid-cols-2 gap-8">
        {/* Expiring Trials Alert */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Trials Expiring Soon
          </h3>
          {stats?.expiringTrials?.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No trials expiring soon
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {stats?.expiringTrials?.map((sub: Subscription) => {
                const now = new Date();
                const daysLeft = sub.trialExpiresAt
                  ? Math.ceil(
                      (new Date(sub.trialExpiresAt).getTime() - now.getTime()) /
                        (1000 * 60 * 60 * 24),
                    )
                  : 0;

                return (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100"
                  >
                    <div>
                      <Link
                        href={`/ops/merchants/${sub.storeId}`}
                        className="font-medium text-gray-900 hover:text-indigo-600"
                      >
                        {sub.storeName}
                      </Link>
                      <div className="text-xs text-gray-500">
                        {sub.storeSlug}
                      </div>
                    </div>
                    <div
                      className={`text-xs font-bold px-2 py-1 rounded ${daysLeft <= 2 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}
                    >
                      {daysLeft <= 0 ? "Expired" : `${daysLeft}d left`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Subscriptions */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            Recent Subscriptions
          </h3>
          <div className="mb-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search merchants..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target?.value)}
              />
            </div>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {filteredRecent.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No subscriptions found
              </div>
            ) : (
              filteredRecent.map((sub: Subscription) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <Link
                        href={`/ops/merchants/${sub.storeId}`}
                        className="font-medium text-gray-900 hover:text-indigo-600"
                      >
                        {sub.storeName}
                      </Link>
                      <div className="text-xs text-gray-500">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </div>
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
      </div>
      </section>
    </OpsPageShell>
  );
}
