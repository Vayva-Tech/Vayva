"use client";

import React, { useState } from "react";
import { Terminal, HardDrives as Server, CheckCircle, ShieldCheck, ArrowCounterClockwise as RefreshCw, Database, Cloud, Clock, Pulse as Activity, Plugs, WifiHigh as Wifi } from "@phosphor-icons/react/ssr";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { toast } from "sonner";

interface SystemInfo {
  env: string;
  region: string;
  timezone: string;
  version: string;
  nodeVersion: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percent: number;
  };
  bootstrapEnabled: boolean;
  cookiesSecure: boolean;
  safeEnv: Record<string, string>;
}

interface DbStats {
  connected: boolean;
  migrations: number;
  pendingMigrations: number;
  queryTime: number;
  poolSize: number;
  activeConnections: number;
}

interface CacheStats {
  connected: boolean;
  keys: number;
  hitRate: number;
  memoryUsage: string;
}

export default function SystemPage(): React.JSX.Element {
  const [isClearingCache, setIsClearingCache] = useState(false);

  const {
    data: system,
    isLoading,
    refetch,
  } = useOpsQuery<SystemInfo>(["system-env"], () =>
    fetch("/api/ops/admin/system").then((res) =>
      res.json().then((j) => j.data),
    ),
  );

  const { data: dbStats } = useOpsQuery<DbStats>(["db-stats"], () =>
    fetch("/api/ops/admin/database").then((res) =>
      res.ok ? res.json().then((j) => j.data) : null,
    ),
  );

  const { data: cacheStats } = useOpsQuery<CacheStats>(["cache-stats"], () =>
    fetch("/api/ops/admin/cache").then((res) =>
      res.ok ? res.json().then((j) => j.data) : null,
    ),
  );

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      const res = await fetch("/api/ops/admin/cache", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear cache");
      toast.success("Cache cleared successfully");
    } catch {
      toast.error("Failed to clear cache");
    } finally {
      setIsClearingCache(false);
    }
  };

  return (
    <OpsPageShell
      title="System Environment"
      description="Runtime configuration and health metrics"
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          className="rounded-full h-8 w-8"
          aria-label="Refresh system environment details"
        >
          <RefreshCw
            className={`w-5 h-5 text-gray-500 ${isLoading ? "animate-spin" : ""}`}
          />
        </Button>
      }
    >

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Server size={20} className="text-gray-500" /> Application Details
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600">Node Environment</span>
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                {system?.env || "loading..."}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600">Region</span>
              <span className="font-mono text-sm text-gray-800">
                {system?.region || "Unknown"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600">Timezone</span>
              <span className="font-mono text-sm text-gray-800">
                {system?.timezone}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-600">Uptime</span>
              <span className="text-green-600 font-bold flex items-center gap-1">
                <CheckCircle size={14} /> Operational
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <ShieldCheck size={20} className="text-gray-500" /> Security
            Features
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600">Auth Service</span>
              <span className="text-green-600 font-bold text-xs uppercase">
                Active
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600">Bootstrap Mode</span>
              <span
                className={`font-bold text-xs uppercase px-2 py-0.5 rounded ${system?.bootstrapEnabled ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}
              >
                {system?.bootstrapEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600">Secure Cookies</span>
              <span
                className={`font-bold text-xs uppercase px-2 py-0.5 rounded ${system?.cookiesSecure ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {system?.cookiesSecure ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>

        {/* Database Stats Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Database size={20} className="text-purple-500" /> Database
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600">Connection Status</span>
              <span
                className={`font-bold text-xs uppercase px-2 py-0.5 rounded ${dbStats?.connected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {dbStats?.connected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600">Active Connections</span>
              <span className="font-mono text-sm text-gray-800">
                {dbStats?.activeConnections ?? "-"} / {dbStats?.poolSize ?? "-"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600">Query Time</span>
              <span className="font-mono text-sm text-gray-800">
                {dbStats?.queryTime ? `${dbStats.queryTime}ms` : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-600">Migrations</span>
              <span className="font-mono text-sm text-gray-800">
                {dbStats?.migrations ?? 0} applied
              </span>
            </div>
          </div>
        </div>

        {/* Cache/Redis Stats Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Cloud size={20} className="text-blue-500" /> Cache (Redis)
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600">Connection Status</span>
              <span
                className={`font-bold text-xs uppercase px-2 py-0.5 rounded ${cacheStats?.connected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {cacheStats?.connected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600">Keys Stored</span>
              <span className="font-mono text-sm text-gray-800">
                {cacheStats?.keys?.toLocaleString() ?? "-"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600">Hit Rate</span>
              <span className="font-mono text-sm text-gray-800">
                {cacheStats?.hitRate ? `${cacheStats.hitRate}%` : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCache}
                disabled={isClearingCache || !cacheStats?.connected}
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2 h-auto"
              >
                {isClearingCache ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Cloud className="h-4 w-4" />}
                Clear All Cache
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl p-6 text-gray-300 font-mono text-xs overflow-x-auto shadow-inner">
        <h3 className="text-white font-bold mb-4">
          Safe Environment Variables
        </h3>
        <pre>{JSON.stringify(system?.safeEnv, null, 2)}</pre>
      </div>
    </OpsPageShell>
  );
}
