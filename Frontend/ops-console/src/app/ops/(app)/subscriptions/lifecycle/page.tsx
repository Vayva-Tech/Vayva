"use client";
import { Button } from "@vayva/ui";

import React from "react";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import {
  ArrowsClockwise,
  TrendUp,
  TrendDown,
  Users,
  Clock,
  Warning,
  CheckCircle,
  XCircle,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Lightning,
  Calendar,
} from "@phosphor-icons/react/ssr";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import Link from "next/link";

interface SubscriptionLifecycle {
  trialConversion: {
    totalTrials: number;
    converted: number;
    conversionRate: number;
    avgConversionDays: number;
    expiringSoon: {
      storeId: string;
      storeName: string;
      trialEndsAt: string;
      daysLeft: number;
      activityScore: number;
      conversionLikelihood: "high" | "medium" | "low";
    }[];
  };
  churnAnalysis: {
    totalChurned30d: number;
    churnRate: number;
    avgLifetimeValue: number;
    avgTenureDays: number;
    topChurnReasons: { reason: string; count: number }[];
    atRiskMerchants: {
      storeId: string;
      storeName: string;
      riskScore: number;
      riskFactors: string[];
      mrr: number;
    }[];
  };
  planChanges: {
    upgrades30d: number;
    downgrades30d: number;
    netRevenueImpact: number;
    recentChanges: {
      storeId: string;
      storeName: string;
      fromPlan: string;
      toPlan: string;
      changeType: "upgrade" | "downgrade";
      mrrImpact: number;
      changedAt: string;
    }[];
  };
  failedPayments: {
    totalFailed30d: number;
    recoveryRate: number;
    dunningActive: number;
    recoveredAmount: number;
    failedPaymentMerchants: {
      storeId: string;
      storeName: string;
      failedCount: number;
      lastFailedAt: string;
      amountDue: number;
      recoveryStatus: string;
    }[];
  };
}

export default function SubscriptionLifecyclePage(): React.JSX.Element {
  const { data: lifecycle, isLoading, refetch } = useOpsQuery<SubscriptionLifecycle>(
    ["subscription-lifecycle"],
    () =>
      fetch("/api/ops/subscriptions/lifecycle").then((res) =>
        res.json().then((j) => j.data),
      ),
    { refetchInterval: 60000 },
  );

  const getLikelihoodColor = (likelihood: string) => {
    switch (likelihood) {
      case "high":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return "bg-red-100 text-red-700";
    if (score >= 40) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  if (isLoading) {
    return (
      <OpsPageShell
        title="Subscription Lifecycle"
        description="Trial conversion, churn analysis, and revenue recovery"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      </OpsPageShell>
    );
  }

  return (
    <OpsPageShell
      title="Subscription Lifecycle"
      description="Trial conversion, churn analysis, and revenue recovery"
      headerActions={
        <Button
          onClick={() => refetch()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowsClockwise className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      }
    >
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">Trial Conversion</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {lifecycle?.trialConversion.conversionRate.toFixed(1) || 0}%
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {lifecycle?.trialConversion.converted || 0} of {lifecycle?.trialConversion.totalTrials || 0} trials
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">Churn Rate (30d)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {lifecycle?.churnAnalysis.churnRate.toFixed(1) || 0}%
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {lifecycle?.churnAnalysis.totalChurned30d || 0} cancellations
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">Net MRR Impact</p>
              <p className={`text-2xl font-bold mt-1 ${
                (lifecycle?.planChanges.netRevenueImpact || 0) >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {(lifecycle?.planChanges.netRevenueImpact || 0) >= 0 ? "+" : ""}
                ${Math.abs(lifecycle?.planChanges.netRevenueImpact || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {lifecycle?.planChanges.upgrades30d || 0} up · {lifecycle?.planChanges.downgrades30d || 0} down
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">Payment Recovery</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {lifecycle?.failedPayments.recoveryRate.toFixed(1) || 0}%
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Lightning className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ${(lifecycle?.failedPayments.recoveredAmount || 0).toLocaleString()} recovered
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trial Conversion Funnel */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Trial Conversion Funnel
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 text-right text-sm text-gray-500">Trials</div>
              <div className="flex-1 h-8 bg-blue-100 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500 rounded-lg" style={{ width: "100%" }} />
                <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                  {lifecycle?.trialConversion.totalTrials || 0}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 text-right text-sm text-gray-500">Active</div>
              <div className="flex-1 h-8 bg-green-100 rounded-lg relative overflow-hidden">
                <div
                  className="absolute inset-0 bg-green-500 rounded-lg"
                  style={{
                    width: `${lifecycle?.trialConversion.conversionRate || 0}%`,
                  }}
                />
                <span className="absolute inset-0 flex items-center px-3 text-sm font-bold text-gray-700">
                  {lifecycle?.trialConversion.converted || 0}
                </span>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                Average time to convert: <span className="font-bold">{lifecycle?.trialConversion.avgConversionDays || 0} days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Churn Analysis */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendDown className="w-5 h-5 text-red-600" />
            Churn Analysis
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Avg Lifetime Value</div>
              <div className="text-xl font-bold text-gray-900">
                ${lifecycle?.churnAnalysis.avgLifetimeValue.toLocaleString() || 0}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Avg Tenure</div>
              <div className="text-xl font-bold text-gray-900">
                {lifecycle?.churnAnalysis.avgTenureDays || 0} days
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-bold">{lifecycle?.churnAnalysis.totalChurned30d || 0}</span> merchants churned in the last 30 days
          </div>
        </div>
      </div>

      {/* Expiring Trials */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            Trials Expiring Soon
          </h3>
          <span className="text-sm text-gray-500">
            {lifecycle?.trialConversion.expiringSoon.length || 0} trials ending in next 7 days
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lifecycle?.trialConversion.expiringSoon.map((trial) => (
            <Link
              key={trial.storeId}
              href={`/ops/merchants/${trial.storeId}`}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium text-gray-900">{trial.storeName}</div>
                  <div className="text-xs text-gray-500">
                    Ends {new Date(trial.trialEndsAt).toLocaleDateString()}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  trial.daysLeft <= 2 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                }`}>
                  {trial.daysLeft}d left
                </span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-gray-500">
                  Activity: <span className="font-medium">{trial.activityScore}/100</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getLikelihoodColor(trial.conversionLikelihood)}`}>
                  {trial.conversionLikelihood} conversion
                </span>
              </div>
            </Link>
          ))}
          {(!lifecycle?.trialConversion.expiringSoon || lifecycle.trialConversion.expiringSoon.length === 0) && (
            <div className="col-span-full text-center text-gray-500 py-8">
              No trials expiring in the next 7 days
            </div>
          )}
        </div>
      </div>

      {/* At-Risk Merchants */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Warning className="w-5 h-5 text-red-600" />
            At-Risk Merchants
          </h3>
          <span className="text-sm text-gray-500">
            Predicted churn risk based on payment failures and engagement
          </span>
        </div>
        <div className="space-y-3">
          {lifecycle?.churnAnalysis.atRiskMerchants.map((merchant) => (
            <div
              key={merchant.storeId}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <Link href={`/ops/merchants/${merchant.storeId}`} className="font-medium text-gray-900 hover:text-indigo-600">
                  {merchant.storeName}
                </Link>
                <div className="flex gap-1">
                  {merchant.riskFactors.map((factor) => (
                    <span key={factor} className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  MRR: <span className="font-medium">${merchant.mrr}</span>
                </span>
                <span className={`px-3 py-1 rounded text-sm font-bold ${getRiskColor(merchant.riskScore)}`}>
                  {merchant.riskScore}% Risk
                </span>
              </div>
            </div>
          ))}
          {(!lifecycle?.churnAnalysis.atRiskMerchants || lifecycle.churnAnalysis.atRiskMerchants.length === 0) && (
            <div className="text-center text-gray-500 py-8">
              No merchants currently at high churn risk
            </div>
          )}
        </div>
      </div>

      {/* Two Column: Plan Changes & Failed Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Plan Changes */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendUp className="w-5 h-5 text-indigo-600" />
            Recent Plan Changes
          </h3>
          <div className="space-y-3">
            {lifecycle?.planChanges.recentChanges.map((change) => (
              <div key={`${change.storeId}-${change.changedAt}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Link href={`/ops/merchants/${change.storeId}`} className="font-medium text-gray-900 hover:text-indigo-600">
                    {change.storeName}
                  </Link>
                  <div className="text-xs text-gray-500">
                    {change.fromPlan} → {change.toPlan}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${change.mrrImpact >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {change.mrrImpact >= 0 ? "+" : ""}${change.mrrImpact}
                  </div>
                  <div className={`text-xs ${change.changeType === "upgrade" ? "text-green-600" : "text-red-600"}`}>
                    {change.changeType === "upgrade" ? (
                      <span className="flex items-center gap-1"><ArrowUpRight size={12} /> Upgrade</span>
                    ) : (
                      <span className="flex items-center gap-1"><ArrowDownRight size={12} /> Downgrade</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {(!lifecycle?.planChanges.recentChanges || lifecycle.planChanges.recentChanges.length === 0) && (
              <div className="text-center text-gray-500 py-4">No recent plan changes</div>
            )}
          </div>
        </div>

        {/* Failed Payment Recovery */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-red-600" />
              Failed Payment Recovery
            </h3>
            <span className="text-sm text-gray-500">
              {lifecycle?.failedPayments.dunningActive || 0} active dunning
            </span>
          </div>
          <div className="space-y-3">
            {lifecycle?.failedPayments.failedPaymentMerchants.map((merchant) => (
              <div key={merchant.storeId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Link href={`/ops/merchants/${merchant.storeId}`} className="font-medium text-gray-900 hover:text-indigo-600">
                    {merchant.storeName}
                  </Link>
                  <div className="text-xs text-gray-500">
                    {merchant.failedCount} failed attempts · ${merchant.amountDue} due
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  merchant.recoveryStatus === "Critical" ? "bg-red-100 text-red-700" :
                  merchant.recoveryStatus === "At Risk" ? "bg-orange-100 text-orange-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {merchant.recoveryStatus}
                </span>
              </div>
            ))}
            {(!lifecycle?.failedPayments.failedPaymentMerchants || lifecycle.failedPayments.failedPaymentMerchants.length === 0) && (
              <div className="text-center text-gray-500 py-4">No active payment failures</div>
            )}
          </div>
        </div>
      </div>
    </OpsPageShell>
  );
}

