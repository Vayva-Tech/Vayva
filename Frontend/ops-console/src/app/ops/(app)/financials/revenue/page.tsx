"use client";

import React from "react";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import {
  TrendUp,
  TrendDown,
  CurrencyDollar,
  Users,
  ChartPie,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Calendar,
  Crown,
  ArrowsClockwise,
} from "@phosphor-icons/react/ssr";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import Link from "next/link";

interface RevenueAnalytics {
  mrr: {
    current: number;
    previousMonth: number;
    growth: number;
    byPlan: { plan: string; mrr: number; merchants: number }[];
  };
  arr: {
    current: number;
    growth: number;
  };
  revenueChurn: {
    grossChurn: number;
    netChurn: number;
    churnedMrr: number;
    expansionMrr: number;
    contractionMrr: number;
  };
  revenueTrend: {
    month: string;
    mrr: number;
    newMrr: number;
    churnedMrr: number;
    expansionMrr: number;
  }[];
  topCustomers: {
    storeId: string;
    storeName: string;
    mrr: number;
    totalPaid: number;
    tenureMonths: number;
  }[];
  forecast: {
    nextMonthMrr: number;
    nextQuarterArr: number;
    growthRate: number;
  };
}

export default function RevenueAnalyticsPage(): React.JSX.Element {
  const { data: revenue, isLoading, refetch } = useOpsQuery<RevenueAnalytics>(
    ["revenue-analytics"],
    () =>
      fetch("/api/ops/financials/revenue").then((res) =>
        res.json().then((j) => j.data),
      ),
    { refetchInterval: 60000 },
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <OpsPageShell
        title="Revenue Analytics"
        description="MRR, ARR, and revenue forecasting"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      </OpsPageShell>
    );
  }

  return (
    <OpsPageShell
      title="Revenue Analytics"
      description="MRR, ARR, and revenue forecasting"
      headerActions={
        <button
          onClick={() => refetch()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowsClockwise className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      }
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <CurrencyDollar className="w-5 h-5" />
            </div>
            {revenue && revenue.mrr.growth !== 0 && (
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                revenue.mrr.growth > 0 ? "bg-green-400 text-green-900" : "bg-red-400 text-red-900"
              }`}>
                {revenue.mrr.growth > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(revenue.mrr.growth).toFixed(1)}%
              </div>
            )}
          </div>
          <div className="text-3xl font-bold mb-1">
            {formatCurrency(revenue?.mrr.current || 0)}
          </div>
          <div className="text-indigo-100 text-sm">Monthly Recurring Revenue</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(revenue?.arr.current || 0)}
          </div>
          <div className="text-gray-500 text-sm">Annual Recurring Revenue</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {revenue?.revenueChurn.grossChurn.toFixed(1) || 0}%
          </div>
          <div className="text-gray-500 text-sm">Gross Revenue Churn</div>
          <div className="text-xs text-gray-400 mt-1">
            Net: {revenue?.revenueChurn.netChurn.toFixed(1) || 0}%
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            {revenue && revenue.forecast.growthRate !== 0 && (
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                revenue.forecast.growthRate > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {revenue.forecast.growthRate > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(revenue.forecast.growthRate).toFixed(1)}%
              </div>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(revenue?.forecast.nextMonthMrr || 0)}
          </div>
          <div className="text-gray-500 text-sm">Forecasted MRR (Next Month)</div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TrendUp className="w-5 h-5 text-indigo-600" />
          MRR Trend (6 Months)
        </h3>
        <div className="h-64 flex items-end gap-4">
          {revenue?.revenueTrend.map((month, idx) => {
            const maxMrr = Math.max(...revenue.revenueTrend.map((m) => m.mrr), 1);
            const height = (month.mrr / maxMrr) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center gap-1">
                  <div className="text-xs text-gray-500">{formatCurrency(month.mrr)}</div>
                  <div className="w-full bg-gray-100 rounded-t-lg relative h-40">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-t-lg transition-all"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {month.month.split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MRR by Plan */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ChartPie className="w-5 h-5 text-indigo-600" />
            MRR by Plan
          </h3>
          <div className="space-y-4">
            {revenue?.mrr.byPlan.map((plan) => {
              const totalMrr = revenue.mrr.current || 1;
              const percentage = (plan.mrr / totalMrr) * 100;
              return (
                <div key={plan.plan}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-700">{plan.plan}</span>
                    <span className="text-sm text-gray-500">
                      {plan.merchants} merchants · {formatCurrency(plan.mrr)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{percentage.toFixed(1)}% of MRR</div>
                </div>
              );
            })}
            {(!revenue?.mrr.byPlan || revenue.mrr.byPlan.length === 0) && (
              <div className="text-center text-gray-500 py-4">No plan data available</div>
            )}
          </div>
        </div>

        {/* Revenue Movements */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CurrencyDollar className="w-5 h-5 text-indigo-600" />
            Revenue Movements (30d)
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Expansion MRR</div>
                  <div className="text-xs text-gray-500">Upgrades & add-ons</div>
                </div>
              </div>
              <div className="text-lg font-bold text-green-600">
                +{formatCurrency(revenue?.revenueChurn.expansionMrr || 0)}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Churned MRR</div>
                  <div className="text-xs text-gray-500">Cancellations</div>
                </div>
              </div>
              <div className="text-lg font-bold text-red-600">
                -{formatCurrency(revenue?.revenueChurn.churnedMrr || 0)}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendDown className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Contraction MRR</div>
                  <div className="text-xs text-gray-500">Downgrades</div>
                </div>
              </div>
              <div className="text-lg font-bold text-orange-600">
                -{formatCurrency(revenue?.revenueChurn.contractionMrr || 0)}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">Net MRR Change</span>
                <span className={`text-xl font-bold ${
                  (revenue?.revenueChurn.expansionMrr || 0) - 
                  (revenue?.revenueChurn.churnedMrr || 0) - 
                  (revenue?.revenueChurn.contractionMrr || 0) >= 0 
                    ? "text-green-600" : "text-red-600"
                }`}>
                  {(revenue?.revenueChurn.expansionMrr || 0) - 
                   (revenue?.revenueChurn.churnedMrr || 0) - 
                   (revenue?.revenueChurn.contractionMrr || 0) >= 0 ? "+" : ""}
                  {formatCurrency(
                    (revenue?.revenueChurn.expansionMrr || 0) - 
                    (revenue?.revenueChurn.churnedMrr || 0) - 
                    (revenue?.revenueChurn.contractionMrr || 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-600" />
          Top Customers by Lifetime Value
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="px-4 py-3">Merchant</th>
                <th className="px-4 py-3">MRR</th>
                <th className="px-4 py-3">Total Paid</th>
                <th className="px-4 py-3">Tenure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {revenue?.topCustomers.map((customer) => (
                <tr key={customer.storeId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/ops/merchants/${customer.storeId}`}
                      className="font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {customer.storeName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{formatCurrency(customer.mrr)}</td>
                  <td className="px-4 py-3 font-medium text-green-600">
                    {formatCurrency(customer.totalPaid)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {customer.tenureMonths} months
                  </td>
                </tr>
              ))}
              {(!revenue?.topCustomers || revenue.topCustomers.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No customer data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forecast */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-600" />
          Revenue Forecast
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Next Month MRR</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(revenue?.forecast.nextMonthMrr || 0)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Next Quarter ARR</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(revenue?.forecast.nextQuarterArr || 0)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Projected Growth</div>
            <div className={`text-2xl font-bold ${
              (revenue?.forecast.growthRate || 0) >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              {(revenue?.forecast.growthRate || 0) >= 0 ? "+" : ""}
              {revenue?.forecast.growthRate.toFixed(1) || 0}%
            </div>
          </div>
        </div>
      </div>
    </OpsPageShell>
  );
}
