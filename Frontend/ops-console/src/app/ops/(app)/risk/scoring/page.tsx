"use client";
import { Button } from "@vayva/ui";

import React, { useState } from "react";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import {
  ShieldWarning,
  TrendUp,
  Warning,
  WarningCircle,
  CheckCircle,
  ArrowsClockwise,
  MagnifyingGlass,
  Faders,
  ArrowUpRight,
  ArrowDownRight,
  Pulse,
  Lightning,
  User,
  CreditCard,
  FileText,
  ChatText,
  Eye,
} from "@phosphor-icons/react/ssr";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import Link from "next/link";

interface RiskScore {
  storeId: string;
  storeName: string;
  overallScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  factors: {
    name: string;
    score: number;
    weight: number;
    description: string;
  }[];
  triggeredRules: string[];
  lastUpdated: string;
}

interface RiskAnalytics {
  overview: {
    totalMerchants: number;
    criticalRisk: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    avgRiskScore: number;
  };
  scores: RiskScore[];
  riskTrend: {
    date: string;
    avgScore: number;
    criticalCount: number;
  }[];
  topRiskFactors: {
    factor: string;
    occurrence: number;
    avgImpact: number;
  }[];
  automatedActions: {
    action: string;
    count: number;
    successRate: number;
  }[];
}

export default function RiskScoringPage(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [selectedMerchant, setSelectedMerchant] = useState<RiskScore | null>(null);

  const { data: risk, isLoading, refetch } = useOpsQuery<RiskAnalytics>(
    ["risk-scores"],
    () =>
      fetch("/api/ops/risk/scores").then((res) =>
        res.json().then((j) => j.data),
      ),
    { refetchInterval: 120000 },
  );

  const getRiskColor = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-100 text-red-700 border-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "LOW":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-red-600";
    if (score >= 60) return "text-orange-600";
    if (score >= 40) return "text-yellow-600";
    return "text-green-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-red-500";
    if (score >= 60) return "bg-orange-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  const filteredScores = risk?.scores.filter((score) => {
    const matchesSearch = score.storeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterLevel === "ALL" || score.riskLevel === filterLevel;
    return matchesSearch && matchesFilter;
  }) || [];

  if (isLoading) {
    return (
      <OpsPageShell
        title="Risk Scoring Engine"
        description="Automated risk assessment and merchant monitoring"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      </OpsPageShell>
    );
  }

  return (
    <OpsPageShell
      title="Risk Scoring Engine"
      description="Automated risk assessment and merchant monitoring"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-xs font-medium uppercase mb-1">Total Merchants</div>
          <div className="text-2xl font-bold text-gray-900">{risk?.overview.totalMerchants || 0}</div>
        </div>

        <div className="bg-red-50 p-5 rounded-xl border border-red-200">
          <div className="text-red-600 text-xs font-medium uppercase mb-1">Critical Risk</div>
          <div className="text-2xl font-bold text-red-700">{risk?.overview.criticalRisk || 0}</div>
        </div>

        <div className="bg-orange-50 p-5 rounded-xl border border-orange-200">
          <div className="text-orange-600 text-xs font-medium uppercase mb-1">High Risk</div>
          <div className="text-2xl font-bold text-orange-700">{risk?.overview.highRisk || 0}</div>
        </div>

        <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200">
          <div className="text-yellow-600 text-xs font-medium uppercase mb-1">Medium Risk</div>
          <div className="text-2xl font-bold text-yellow-700">{risk?.overview.mediumRisk || 0}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-xs font-medium uppercase mb-1">Avg Risk Score</div>
          <div className={`text-2xl font-bold ${getScoreColor(risk?.overview.avgRiskScore || 0)}`}>
            {risk?.overview.avgRiskScore || 0}
          </div>
        </div>
      </div>

      {/* Risk Trend Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Pulse className="w-5 h-5 text-indigo-600" />
          Risk Trend (14 Days)
        </h3>
        <div className="h-48 flex items-end gap-2">
          {risk?.riskTrend.map((day, idx) => {
            const maxCount = Math.max(...risk.riskTrend.map((d) => d.criticalCount), 1);
            const height = (day.criticalCount / maxCount) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-gray-100 rounded-t-lg relative h-32">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-red-500 rounded-t-lg transition-all"
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${day.criticalCount} critical alerts`}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Merchant Risk List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShieldWarning className="w-5 h-5 text-indigo-600" />
              Merchant Risk Scores
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search merchants..."
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
              >
                <option value="ALL">All Levels</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredScores.map((score) => (
              <div
                key={score.storeId}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedMerchant?.storeId === score.storeId
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedMerchant(score)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold ${getScoreBg(score.overallScore)}`}>
                      {score.overallScore}
                    </div>
                    <div>
                      <Link
                        href={`/ops/merchants/${score.storeId}`}
                        className="font-medium text-gray-900 hover:text-indigo-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {score.storeName}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${getRiskColor(score.riskLevel)}`}>
                          {score.riskLevel}
                        </span>
                        <span className="text-xs text-gray-500">
                          {score.triggeredRules.length} rule(s) triggered
                        </span>
                      </div>
                    </div>
                  </div>
                  <Eye className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
            {filteredScores.length === 0 && (
              <div className="text-center text-gray-500 py-8">No merchants match your criteria</div>
            )}
          </div>
        </div>

        {/* Risk Detail Panel */}
        <div className="space-y-6">
          {/* Selected Merchant Details */}
          {selectedMerchant ? (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {selectedMerchant.storeName}
              </h3>
              <div className="space-y-4">
                {selectedMerchant.factors.map((factor) => (
                  <div key={factor.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{factor.name}</span>
                      <span className={`text-sm font-bold ${getScoreColor(factor.score)}`}>
                        {factor.score}/100
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getScoreBg(factor.score)}`}
                        style={{ width: `${factor.score}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{factor.description}</div>
                  </div>
                ))}
              </div>

              {selectedMerchant.triggeredRules.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Triggered Rules</h4>
                  <div className="space-y-2">
                    {selectedMerchant.triggeredRules.map((rule, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-red-600">
                        <WarningCircle size={14} />
                        {rule}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center">
              <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Select a merchant to view detailed risk factors</p>
            </div>
          )}

          {/* Top Risk Factors */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Warning className="w-5 h-5 text-orange-600" />
              Top Risk Factors
            </h3>
            <div className="space-y-3">
              {risk?.topRiskFactors.map((factor) => (
                <div key={factor.factor} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{factor.factor}</div>
                    <div className="text-xs text-gray-500">
                      {factor.occurrence} merchants affected
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{factor.avgImpact}</div>
                    <div className="text-xs text-gray-500">avg impact</div>
                  </div>
                </div>
              ))}
              {(!risk?.topRiskFactors || risk.topRiskFactors.length === 0) && (
                <div className="text-center text-gray-500 py-4">No risk factor data</div>
              )}
            </div>
          </div>

          {/* Automated Actions */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lightning className="w-5 h-5 text-yellow-600" />
              Automated Actions (30d)
            </h3>
            <div className="space-y-3">
              {risk?.automatedActions.map((action) => (
                <div key={action.action} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 capitalize">{action.action}</div>
                    <div className="text-xs text-gray-500">{action.count} actions taken</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600">{action.successRate}%</div>
                    <div className="text-xs text-gray-500">success rate</div>
                  </div>
                </div>
              ))}
              {(!risk?.automatedActions || risk.automatedActions.length === 0) && (
                <div className="text-center text-gray-500 py-4">No automated actions recorded</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </OpsPageShell>
  );
}

