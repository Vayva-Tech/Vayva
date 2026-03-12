"use client";

import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { Pulse as Activity, Database, HardDrives as Server, CheckCircle, Warning as AlertTriangle, ArrowCounterClockwise as RefreshCw } from "@phosphor-icons/react/ssr";
import { useState } from "react";
import { Button } from "@vayva/ui";

const StatusBadge = ({ status }: { status: string }): React.JSX.Element => {
  const isHealthy = status === "healthy";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
        isHealthy
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-red-50 text-red-700 border-red-200"
      }`}
    >
      {isHealthy ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
      {status?.toUpperCase() || "UNKNOWN"}
    </span>
  );
};

interface HealthData {
  status: string;
  timestamp: string;
  uptime: number;
  checks: {
    database: { status: string; latency: string };
    external_apis: {
      paystack: { status: string; latencyMs?: number; message?: string };
      resend: { status: string; latencyMs?: number; message?: string };
    };
  };
}

export default function HealthPage(): React.JSX.Element {
  const {
    data: rawData,
    isLoading: loading,
    error: _error,
    refetch: refresh,
  } = useOpsQuery(["system-health"], () =>
    fetch("/api/ops/tools/health").then((res) => res.json()),
  );
  const data = rawData as HealthData | undefined;
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <OpsPageShell
      title="Platform Status"
      description="Real-time monitoring of critical infrastructure"
      headerActions={
        <div className="flex items-center gap-4">
          {data && <StatusBadge status={data.status} />}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="text-gray-400 hover:text-indigo-600 hover:bg-white/60"
          >
              <RefreshCw
                size={18}
                className={refreshing || loading ? "animate-spin" : ""}
              />
            </Button>
          </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Database Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Database size={20} />
              </div>
              {data && <StatusBadge status={data.checks?.database?.status} />}
            </div>
            <h3 className="text-sm font-medium text-gray-900">
              Primary Database
            </h3>
            <p className="text-xs text-gray-500 mt-1">AWS RDS (Postgres)</p>

            <div className="mt-6 flex items-center justify-between text-sm">
              <span className="text-gray-500">Latency</span>
              <span className="font-mono font-medium text-gray-900">
                {data?.checks?.database?.latency || "--"}
              </span>
            </div>
          </div>

          {/* API Gateway Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <Server size={20} />
              </div>
              {data && (
                <StatusBadge
                  status={
                    data.checks?.external_apis?.paystack?.status === "unhealthy" ||
                    data.checks?.external_apis?.resend?.status === "unhealthy"
                      ? "unhealthy"
                      : "healthy"
                  }
                />
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-900">
              External Gateways
            </h3>
            <p className="text-xs text-gray-500 mt-1">Paystack, Resend</p>

            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Paystack</span>
                <span className="font-medium text-gray-900">
                  {data?.checks?.external_apis?.paystack?.status?.toUpperCase() || "UNKNOWN"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Resend</span>
                <span className="font-medium text-gray-900">
                  {data?.checks?.external_apis?.resend?.status?.toUpperCase() || "UNKNOWN"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Latency</span>
                <span>
                  {data?.checks?.external_apis?.paystack?.latencyMs
                    ? `${data?.checks?.external_apis.paystack.latencyMs}ms`
                    : "--"}
                  {" / "}
                  {data?.checks?.external_apis?.resend?.latencyMs
                    ? `${data?.checks?.external_apis.resend.latencyMs}ms`
                    : "--"}
                </span>
              </div>
              {(data?.checks?.external_apis?.paystack?.message ||
                data?.checks?.external_apis?.resend?.message) && (
                <div className="text-xs text-amber-600">
                  {data?.checks?.external_apis.paystack?.message ||
                    data.checks?.external_apis.resend?.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500 font-mono">
          <div className="flex justify-between">
            <span>Check Timestamp:</span>
            <span>{data?.timestamp || "Loading..."}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>System Uptime:</span>
            <span>
              {data?.uptime ? `${Math.floor(data.uptime / 60)} minutes` : "--"}
            </span>
          </div>
        </div>
      </div>
    </OpsPageShell>
  );
}
