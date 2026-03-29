"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  ShieldWarning,
  CheckCircle,
  XCircle,
  Warning,
  Clock,
  ChartLine as TrendLine,
  Funnel,
  ArrowsClockwise as RefreshCw,
} from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { BackButton } from "@/components/ui/BackButton";
import { apiJson } from "@/lib/api-client-shared";
import { useStore } from "@/hooks/useStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageWithInsights } from "@/components/layout/PageWithInsights";

interface FraudStats {
  totalChecks: number;
  approved: number;
  declined: number;
  review: number;
  byRiskLevel: Record<string, number>;
  falsePositiveRate: number;
  avgProcessingTime: number;
  trends: {
    daily: Array<{ date: string; fraudRate: number }>;
  };
}

interface FraudCheckRecord {
  id: string;
  orderId: string;
  email: string;
  amount: number;
  riskScore: number;
  riskLevel: string;
  status: string;
  checkedAt: string;
  rulesTriggered: Array<{ name: string }>;
}

const RISK_COLORS: Record<string, string> = {
  low: "text-green-600 bg-green-50",
  medium: "text-yellow-600 bg-yellow-50",
  high: "text-orange-600 bg-orange-50",
  critical: "text-red-600 bg-red-50",
};

const STATUS_COLORS: Record<string, string> = {
  approved: "text-green-700 bg-green-50",
  declined: "text-red-700 bg-red-50",
  review: "text-orange-700 bg-orange-50",
  pending: "text-gray-600 bg-gray-50",
};

export default function FraudDashboardPage() {
  const { store } = useStore();
  const [stats, setStats] = useState<FraudStats | null>(null);
  const [recentChecks, setRecentChecks] = useState<FraudCheckRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDays, setSelectedDays] = useState(30);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const loadData = useCallback(async () => {
    if (!store?.id) return;
    setRefreshing(true);
    try {
      const data = await apiJson<{ stats: FraudStats; recentHighRisk: FraudCheckRecord[] }>(
        `/api/security/fraud/check?days=${selectedDays}`,
        {
          headers: { "x-store-id": store.id },
        }
      );
      setStats(data.stats);
      setRecentChecks(data.recentHighRisk || []);
    } catch {
      toast.error("Failed to load fraud data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [store?.id, selectedDays]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReviewDecision = async (
    checkId: string,
    decision: "approved" | "declined"
  ) => {
    if (!store?.id) return;
    try {
      await apiJson(`/api/security/fraud/${checkId}`, {
        method: "PATCH",
        headers: { "x-store-id": store.id },
        body: JSON.stringify({ decision }),
      });
      toast.success(`Transaction ${decision}`);
      setRecentChecks((prev) => prev.filter((c) => c.id !== checkId));
    } catch {
      toast.error("Failed to update decision");
    }
  };

  const formatAmount = (kobo: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(kobo / 100);
  };

  const filteredChecks = filterStatus === "all"
    ? recentChecks
    : recentChecks.filter((c) => c.status === filterStatus);

  if (loading) {
    return (
      <div className="max-w-6xl py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-64" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageWithInsights
        insights={
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick actions
              </div>
              <div className="mt-3 grid gap-2">
                <Button
                  variant="outline"
                  onClick={loadData}
                  disabled={refreshing}
                  className="flex items-center justify-between gap-2"
                >
                  <span>Refresh data</span>
                  <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Time range
              </div>
              <div className="mt-3">
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                  value={selectedDays}
                  onChange={(e) => setSelectedDays(Number(e.target.value))}
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              </div>
            </div>
          </>
        }
      >
        <div className="flex items-center gap-4">
          <BackButton />
          <PageHeader
            title="Fraud Protection"
            subtitle="Real-time transaction risk monitoring"
          />
        </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<TrendLine size={20} className="text-blue-600" />}
            label="Total Checks"
            value={stats.totalChecks.toLocaleString()}
            bg="bg-blue-50"
          />
          <StatCard
            icon={<CheckCircle size={20} className="text-green-600" />}
            label="Approved"
            value={stats.approved.toLocaleString()}
            sub={`${stats.totalChecks > 0 ? Math.round((stats.approved / stats.totalChecks) * 100) : 0}%`}
            bg="bg-green-50"
          />
          <StatCard
            icon={<XCircle size={20} className="text-red-600" />}
            label="Blocked"
            value={stats.declined.toLocaleString()}
            sub={`${stats.totalChecks > 0 ? Math.round((stats.declined / stats.totalChecks) * 100) : 0}%`}
            bg="bg-red-50"
          />
          <StatCard
            icon={<Clock size={20} className="text-orange-600" />}
            label="In Review"
            value={stats.review.toLocaleString()}
            sub={`${Math.round(stats.avgProcessingTime)}ms avg`}
            bg="bg-orange-50"
          />
        </div>
      )}

      {/* Risk Level Breakdown */}
      {stats && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Risk Level Distribution</h3>
          <div className="grid grid-cols-4 gap-4">
            {["low", "medium", "high", "critical"].map((level) => {
              const count = stats.byRiskLevel[level] || 0;
              const pct = stats.totalChecks > 0 ? (count / stats.totalChecks) * 100 : 0;
              return (
                <div key={level} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${RISK_COLORS[level]}`}
                    >
                      {level}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        level === "low" ? "bg-green-400" :
                        level === "medium" ? "bg-yellow-400" :
                        level === "high" ? "bg-orange-400" : "bg-red-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">{pct.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>

          {stats.falsePositiveRate > 0 && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Warning size={16} className="text-amber-500" />
              <span className="text-orange-600">
                False positive rate: {(stats.falsePositiveRate * 100).toFixed(1)}%
              </span>
              <span className="text-gray-400">
                (target: &lt;2%)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Checks Requiring Review */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              {filterStatus === "all" ? "Recent High-Risk Checks" : `Checks: ${filterStatus}`}
            </h3>
            <p className="text-sm text-gray-500">Transactions flagged for review</p>
          </div>
          <div className="flex items-center gap-2">
            <Funnel size={16} className="text-gray-400" />
            <select
              className="border rounded-lg px-2 py-1 text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="review">Needs Review</option>
              <option value="declined">Blocked</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>

        {filteredChecks.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle size={40} className="mx-auto text-green-400 mb-3" weight="duotone" />
            <p className="text-gray-500 font-medium">No transactions require review</p>
            <p className="text-sm text-gray-400 mt-1">All transactions are looking clean</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50" scope="col">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500" scope="col">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500" scope="col">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500" scope="col">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500" scope="col">Risk Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500" scope="col">Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500" scope="col">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500" scope="col">Rules</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredChecks.map((check) => (
                  <tr key={check.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      #{check.orderId.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{check.email}</td>
                    <td className="px-4 py-3 font-medium">{formatAmount(check.amount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              check.riskScore < 30 ? "bg-green-400" :
                              check.riskScore < 50 ? "bg-yellow-400" :
                              check.riskScore < 75 ? "bg-orange-400" : "bg-red-500"
                            }`}
                            style={{ width: `${check.riskScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{check.riskScore}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${RISK_COLORS[check.riskLevel] || ""}`}>
                        {check.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[check.status] || ""}`}>
                        {check.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {(check.rulesTriggered || []).slice(0, 2).map((rule, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {rule.name}
                          </span>
                        ))}
                        {(check.rulesTriggered || []).length > 2 && (
                          <span className="text-xs text-gray-400">
                            +{check.rulesTriggered.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {check.status === "review" && (
                        <div className="flex gap-1">
                          <Button
                            onClick={() => handleReviewDecision(check.id, "approved")}
                            className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100"
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReviewDecision(check.id, "declined")}
                            className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100"
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </PageWithInsights>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  bg?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${bg || "bg-gray-50"}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
