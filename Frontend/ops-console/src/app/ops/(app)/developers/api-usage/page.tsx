"use client";

import React, { useState } from "react";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import {
  Code,
  TrendUp,
  Warning,
  CheckCircle,
  XCircle,
  Clock,
  ArrowsClockwise,
  MagnifyingGlass,
  Lightning,
  Globe,
  Pulse,
  ChartBar,
  Key,
  ArrowUpRight,
  ArrowDownRight,
  WebhooksLogo,
  WarningOctagon,
} from "@phosphor-icons/react/ssr";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import Link from "next/link";

interface ApiUsageAnalytics {
  overview: {
    totalApiCalls24h: number;
    totalApiCalls30d: number;
    avgResponseTime: number;
    errorRate: number;
    activeApiKeys: number;
  };
  topEndpoints: {
    endpoint: string;
    method: string;
    calls: number;
    avgResponseTime: number;
    errorRate: number;
  }[];
  merchantUsage: {
    storeId: string;
    storeName: string;
    apiKeyId: string;
    calls24h: number;
    calls30d: number;
    errorRate: number;
    lastUsed: string;
    status: string;
  }[];
  webhookStats: {
    totalWebhooks: number;
    successRate: number;
    avgDeliveryTime: number;
    pendingRetries: number;
    failedWebhooks: {
      id: string;
      storeName: string;
      endpoint: string;
      failedAt: string;
      error: string;
    }[];
  };
  rateLimitHits: {
    storeId: string;
    storeName: string;
    endpoint: string;
    hits: number;
    lastHit: string;
  }[];
  apiTrend: {
    hour: string;
    calls: number;
    errors: number;
  }[];
}

export default function ApiUsagePage(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: apiUsage, isLoading, refetch } = useOpsQuery<ApiUsageAnalytics>(
    ["api-usage"],
    () =>
      fetch("/api/ops/developers/api-usage").then((res) =>
        res.json().then((j) => j.data),
      ),
    { refetchInterval: 60000 },
  );

  const filteredMerchants = apiUsage?.merchantUsage.filter((m) =>
    m.storeName.toLowerCase().includes(searchQuery.toLowerCase()),
  ) || [];

  if (isLoading) {
    return (
      <OpsPageShell
        title="API Usage Monitoring"
        description="Developer API metrics, webhooks, and rate limits"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      </OpsPageShell>
    );
  }

  return (
    <OpsPageShell
      title="API Usage Monitoring"
      description="Developer API metrics, webhooks, and rate limits"
      headerActions={
        <button
          onClick={() => refetch()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowsClockwise className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      }
    >
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">API Calls (24h)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(apiUsage?.overview.totalApiCalls24h || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {(apiUsage?.overview.totalApiCalls30d || 0).toLocaleString()} (30d)
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {apiUsage?.overview.avgResponseTime || 0}ms
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">Error Rate</p>
              <p className={`text-2xl font-bold mt-1 ${
                (apiUsage?.overview.errorRate || 0) > 5 ? "text-red-600" : "text-gray-900"
              }`}>
                {apiUsage?.overview.errorRate.toFixed(1) || 0}%
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Warning className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">Active API Keys</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {apiUsage?.overview.activeApiKeys || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">Webhook Success</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {apiUsage?.webhookStats.successRate.toFixed(1) || 0}%
              </p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <WebhooksLogo className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {apiUsage?.webhookStats.pendingRetries || 0} pending retries
          </p>
        </div>
      </div>

      {/* API Trend Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Pulse className="w-5 h-5 text-indigo-600" />
          API Traffic (Last 24 Hours)
        </h3>
        <div className="h-48 flex items-end gap-1">
          {apiUsage?.apiTrend.map((hour, idx) => {
            const maxCalls = Math.max(...apiUsage.apiTrend.map((h) => h.calls), 1);
            const height = (hour.calls / maxCalls) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-gray-100 rounded-t relative h-32">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-t transition-all"
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${hour.calls} calls, ${hour.errors} errors`}
                  />
                </div>
                {idx % 4 === 0 && (
                  <span className="text-xs text-gray-500">
                    {hour.hour.split("T")[1]?.slice(0, 2)}:00
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Endpoints */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ChartBar className="w-5 h-5 text-indigo-600" />
            Top Endpoints (24h)
          </h3>
          <div className="space-y-3">
            {apiUsage?.topEndpoints.map((endpoint) => (
              <div key={`${endpoint.method}-${endpoint.endpoint}`} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      endpoint.method === "GET" ? "bg-green-100 text-green-700" :
                      endpoint.method === "POST" ? "bg-blue-100 text-blue-700" :
                      endpoint.method === "PUT" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {endpoint.method}
                    </span>
                    <span className="font-medium text-gray-900 text-sm truncate max-w-[200px]">
                      {endpoint.endpoint}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{endpoint.calls.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Avg: {endpoint.avgResponseTime}ms</span>
                  <span className={endpoint.errorRate > 5 ? "text-red-600" : ""}>
                    {endpoint.errorRate}% errors
                  </span>
                </div>
              </div>
            ))}
            {(!apiUsage?.topEndpoints || apiUsage.topEndpoints.length === 0) && (
              <div className="text-center text-gray-500 py-4">No endpoint data available</div>
            )}
          </div>
        </div>

        {/* Rate Limit Hits */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <WarningOctagon className="w-5 h-5 text-red-600" />
            Rate Limit Hits (24h)
          </h3>
          <div className="space-y-3">
            {apiUsage?.rateLimitHits.map((hit) => (
              <div key={`${hit.storeId}-${hit.endpoint}`} className="p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{hit.storeName}</span>
                  <span className="text-lg font-bold text-red-600">{hit.hits}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {hit.endpoint} · Last hit: {new Date(hit.lastHit).toLocaleTimeString()}
                </div>
              </div>
            ))}
            {(!apiUsage?.rateLimitHits || apiUsage.rateLimitHits.length === 0) && (
              <div className="text-center text-gray-500 py-4">No rate limit hits in the last 24 hours</div>
            )}
          </div>
        </div>
      </div>

      {/* Merchant Usage */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            Merchant API Usage
          </h3>
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
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="px-4 py-3">Merchant</th>
                <th className="px-4 py-3">Calls (24h)</th>
                <th className="px-4 py-3">Calls (30d)</th>
                <th className="px-4 py-3">Error Rate</th>
                <th className="px-4 py-3">Last Used</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMerchants.map((merchant) => (
                <tr key={merchant.storeId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/ops/merchants/${merchant.storeId}`}
                      className="font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {merchant.storeName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{merchant.calls24h.toLocaleString()}</td>
                  <td className="px-4 py-3">{merchant.calls30d.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={merchant.errorRate > 5 ? "text-red-600 font-medium" : "text-gray-600"}>
                      {merchant.errorRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(merchant.lastUsed).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      merchant.status === "High Usage" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                    }`}>
                      {merchant.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredMerchants.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No merchants found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Failed Webhooks */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-600" />
          Failed Webhooks (24h)
        </h3>
        <div className="space-y-3">
          {apiUsage?.webhookStats.failedWebhooks.map((webhook) => (
            <div key={webhook.id} className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-gray-900">{webhook.storeName}</div>
                  <div className="text-xs text-gray-500 mt-1">{webhook.endpoint}</div>
                  <div className="text-xs text-red-600 mt-2">{webhook.error}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    {new Date(webhook.failedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {(!apiUsage?.webhookStats.failedWebhooks || apiUsage.webhookStats.failedWebhooks.length === 0) && (
            <div className="text-center text-gray-500 py-4">No failed webhooks in the last 24 hours</div>
          )}
        </div>
      </div>
    </OpsPageShell>
  );
}
