"use client";
import React from "react";

import { useOpsQuery } from "@/hooks/useOpsQuery";
import { formatCurrency } from "@vayva/shared";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { Brain, Cpu, Coins, Image, Chat as MessageSquare, TrendUp as TrendingUp, Storefront as Store } from "@phosphor-icons/react/ssr";

export default function AiDashboardPage(): React.JSX.Element {
  const { data: stats, isLoading: loading } = useOpsQuery(["ai-stats"], () =>
    fetch("/api/ops/ai/stats").then((res) => res.json()),
  );

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i: any) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const { totals, topConsumers } = stats || {};

  return (
    <OpsPageShell
      title="AI Intelligence Center"
      description="Monitor token consumption, costs, and agent performance"
    >

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Tokens Consumed"
          value={totals?.tokens?.toLocaleString() || "0"}
          icon={Cpu}
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          label="Estimated Cost (All Time)"
          value={formatCurrency((totals?.costKobo || 0) / 100)}
          icon={Coins}
          color="bg-green-50 text-green-700"
        />
        <StatCard
          label="Total Requests"
          value={totals?.requests?.toLocaleString() || "0"}
          icon={MessageSquare}
          color="bg-indigo-50 text-indigo-700"
        />
        <StatCard
          label="Images Generated"
          value={totals?.images?.toLocaleString() || "0"}
          icon={Image}
          color="bg-pink-50 text-pink-700"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Consumers Table */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Store className="h-4 w-4 text-gray-500" />
              Top Token Consumers
            </h3>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              All Time
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <th className="px-6 py-3 font-medium">Merchant</th>
                  <th className="px-6 py-3 font-medium">Requests</th>
                  <th className="px-6 py-3 font-medium">Tokens</th>
                  <th className="px-6 py-3 font-medium text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(!topConsumers || topConsumers.length === 0) && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No usage data recorded yet.
                    </td>
                  </tr>
                )}
                {topConsumers?.map((merchant: any) => (
                  <tr
                    key={merchant.storeId}
                    className="hover:bg-white/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                          {merchant.logoUrl ? (
                            <img
                              src={merchant.logoUrl}
                              className="h-full w-full object-cover rounded"
                              aria-label={`${merchant.name} logo`}
                            />
                          ) : (
                            merchant.name?.[0] || "?"
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {merchant.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {merchant.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {merchant.totalRequests?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-blue-600 bg-blue-50 rounded px-2 w-fit">
                      {merchant.totalTokens?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-right text-gray-900">
                      {formatCurrency((merchant.totalCostKobo || 0) / 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insight / Info Panel */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
          <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            AI Cost Insights
          </h3>
          <p className="text-sm text-purple-800 mb-4">
            Platform usage is billed based on token consumption (Input vs
            Output) and image generation counts.
          </p>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-purple-700">Cost per 1K Tokens</span>
              <span className="font-medium text-purple-900">₦25.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-700">Image Generation</span>
              <span className="font-medium text-purple-900">₦45.00 / img</span>
            </div>
            <div className="h-px bg-purple-200 my-2"></div>
            <div className="text-xs text-purple-600 mt-2">
              * Pricing is estimated based on provider rates (OpenAI/Anthropic)
              plus margin.
            </div>
          </div>
        </div>
      </div>
    </OpsPageShell>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StatCard({ label, value, icon: Icon, color }: any): React.JSX.Element {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500 font-medium">{label}</div>
      </div>
    </div>
  );
}
