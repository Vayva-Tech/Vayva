"use client";

import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ShieldCheck, MagnifyingGlass as Search, Warning as AlertTriangle, User, LockKey as Lock, ArrowCounterClockwise as RefreshCw, Terminal, Eye } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { logger } from "@vayva/shared";

interface AuditEvent {
  id: string;
  eventType: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  opsUser: {
    name: string;
    email: string;
    role: string;
  } | null;
}

interface SecurityStats {
  failedLogins: number;
  activeSessions: number;
  adminActions: number;
  uniqueActiveUsers: number;
}

export default function SecurityPage(): React.JSX.Element {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");

  const { data: statsData, refetch: refetchStats } = useOpsQuery<{ stats: SecurityStats }>(
    ["security-stats"],
    () => fetch("/api/ops/security/stats").then((res) => res.json()),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const stats = statsData?.stats;

  useEffect(() => {
    fetchLogs();
  }, [filterType]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const query = filterType ? `?type=${filterType}` : "";
      const res = await fetch(`/api/ops/security/logs${query}`);
      const json = await res.json();
      if (res.ok) {
        setEvents(json.data || []);
      }
    } catch (e) {
      logger.error("[SECURITY_LOGS_FETCH_ERROR]", { error: e });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchLogs();
    refetchStats();
  };

  const getIcon = (type: string) => {
    if (type.includes("LOGIN"))
      return <Lock className="w-4 h-4 text-blue-500" />;
    if (type.includes("FAIL"))
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (type.includes("BATCH"))
      return <Terminal className="w-4 h-4 text-purple-500" />;
    return <ShieldCheck className="w-4 h-4 text-gray-500" />;
  };

  return (
    <OpsPageShell
      title="Security Operations"
      description="Monitor platform access and sensitive actions"
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          className="rounded-full h-8 w-8"
          aria-label="Refresh security logs"
        >
          <RefreshCw
            className={`w-5 h-5 text-gray-400 ${loading ? "animate-spin" : ""}`}
          />
        </Button>
      }
    >

      {/* Stats Cards - Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Failed Logins (24h)</div>
          <div className="text-2xl font-bold text-gray-900">
            {stats?.failedLogins ?? "—"}
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Active Sessions</div>
          <div className="text-2xl font-bold text-gray-900">
            {stats?.activeSessions ?? "—"}
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Active Users</div>
          <div className="text-2xl font-bold text-gray-900">
            {stats?.uniqueActiveUsers ?? "—"}
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Admin Actions (24h)</div>
          <div className="text-2xl font-bold text-gray-900">
            {stats?.adminActions ?? events.length}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 mb-6">
        {["", "OPS_LOGIN_SUCCESS", "OPS_LOGIN_FAILED", "OPS_BATCH_ACTION"].map(
          (type) => (
            <Button
              key={type}
              variant={filterType === type ? "primary" : "outline"}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors h-auto ${
                filterType === type
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
              aria-label={`Filter by ${type || "all"} events`}
            >
              {type || "All Events"}
            </Button>
          ),
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-3">Event</th>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Details</th>
              <th className="px-6 py-3 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-400">
                  Loading logs...
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-400">
                  No security events found.
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        {getIcon(e.eventType)}
                      </div>
                      <span className="font-mono text-xs font-bold text-gray-700">
                        {e.eventType}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {e.opsUser ? (
                      <div>
                        <div className="font-medium text-gray-900">
                          {e?.opsUser?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {e?.opsUser?.role}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 italic">
                        System / Unknown
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                      {JSON.stringify(e.metadata).slice(0, 60)}
                      {JSON.stringify(e.metadata).length > 60 && "..."}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500 text-xs">
                    {formatDistanceToNow(new Date(e.createdAt), {
                      addSuffix: true,
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </OpsPageShell>
  );
}
