"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@vayva/shared";
import { ArrowUpRight, ArrowDownRight, TrendUp as TrendingUp, CurrencyDollar as DollarSign, Package, CreditCard } from "@phosphor-icons/react/ssr";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface RevenueSummary {
  summary: {
    mrr: number;
    arr: number;
    deliveryRevenue: number;
    withdrawalFees: number;
    totalRevenue: number;
    growth: {
      subscriptions: number;
    };
  };
  subscriptions: {
    activeCount: number;
    planDistribution: Record<string, number>;
    totalStores: number;
  };
  delivery: {
    totalDeliveries: number;
    totalRevenue: number;
    avgFee: number;
  };
  withdrawals: {
    totalVolume: number;
    feeRevenue: number;
    avgWithdrawal: number;
    count: number;
  };
}

interface HistoricalRevenue {
  month: string;
  subscriptions: number;
  delivery: number;
  withdrawal: number;
}

export default function RevenueDashboardPage(): React.JSX.Element {
  const [data, setData] = useState<RevenueSummary | null>(null);
  const [chartData, setChartData] = useState<HistoricalRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/revenue/summary").then((res) => res.json()),
      fetch("/api/revenue/historical").then((res) => res.json()),
    ])
      .then(([summaryData, historicalData]) => {
        setData(summaryData);
        setChartData(historicalData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!data) {
    return <div>Failed to load revenue data</div>;
  }

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const metrics = [
    {
      title: "MRR",
      value: formatCurrency(data.summary?.mrr),
      change: formatPercent(data.summary?.growth.subscriptions),
      positive: data.summary?.growth.subscriptions > 0,
      icon: TrendingUp,
      description: "Monthly Recurring Revenue",
    },
    {
      title: "Delivery Revenue",
      value: formatCurrency(data.summary?.deliveryRevenue),
      change: `${data?.delivery?.totalDeliveries} deliveries`,
      positive: true,
      icon: Package,
      description: "This month",
    },
    {
      title: "Withdrawal Fees",
      value: formatCurrency(data.summary?.withdrawalFees),
      change: `${data?.withdrawals?.count} withdrawals`,
      positive: true,
      icon: CreditCard,
      description: "1.5% platform fee",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(data.summary?.totalRevenue),
      change: "This month",
      positive: true,
      icon: DollarSign,
      description: "All revenue streams",
    },
  ];

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Revenue</h1>
        <p className="text-muted-foreground">
          Track subscription, delivery, and withdrawal fee revenue.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric: any) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  {metric.positive ? (
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                  )}
                  <span>{metric.change}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>Monthly revenue by source</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number | undefined) =>
                  value ? formatCurrency(value) : "₦0"
                }
                contentStyle={{ background: "#fff", border: "1px solid #ccc" }}
              />
              <Area
                type="monotone"
                dataKey="subscriptions"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
                name="Subscriptions"
              />
              <Area
                type="monotone"
                dataKey="delivery"
                stackId="1"
                stroke="#82ca9d"
                fill="#82ca9d"
                name="Delivery"
              />
              <Area
                type="monotone"
                dataKey="withdrawal"
                stackId="1"
                stroke="#ffc658"
                fill="#ffc658"
                name="Withdrawal Fees"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Subscription Health */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Active Merchants</span>
              <span className="font-semibold">
                {data?.subscriptions?.activeCount}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Free Users</span>
              <span className="font-semibold">
                {data?.subscriptions?.planDistribution.FREE || 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Starter Plan</span>
              <span className="font-semibold">
                {data?.subscriptions?.planDistribution.STARTER || 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pro Plan</span>
              <span className="font-semibold">
                {data?.subscriptions?.planDistribution.PRO || 0}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-muted-foreground">ARR</span>
              <span className="font-bold">
                {formatCurrency(data.summary?.arr)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Economics */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Economics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Deliveries</span>
              <span className="font-semibold">
                {data?.delivery?.totalDeliveries}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avg Fee</span>
              <span className="font-semibold">
                {formatCurrency(data.delivery?.avgFee)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-muted-foreground">Total Revenue</span>
              <span className="font-bold">
                {formatCurrency(data.delivery?.totalRevenue)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Pulse as Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Pulse as Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Volume</span>
              <span className="font-semibold">
                {formatCurrency(data.withdrawals?.totalVolume)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avg Withdrawal</span>
              <span className="font-semibold">
                {formatCurrency(data.withdrawals?.avgWithdrawal)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-muted-foreground">Platform Fee (1.5%)</span>
              <span className="font-bold">
                {formatCurrency(data.withdrawals?.feeRevenue)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
