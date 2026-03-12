"use client";

import React, { useState, useEffect } from "react";
import { Pulse as Activity, ArrowCounterClockwise as RefreshCw, Funnel as Filter, WarningCircle as AlertCircle, CheckCircle, Clock } from "@phosphor-icons/react/ssr";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

interface WebhookLog {
  id: string;
  status: string;
  eventType: string;
  responseCode: number;
  storeId: string;
  createdAt: string;
}

export default function WebhookInspectorPage(): React.JSX.Element {
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Auto-refresh every 10 seconds for live monitoring
  const {
    data: logs,
    isLoading,
    refetch,
  } = useOpsQuery<WebhookLog[]>(
    ["webhook-logs", statusFilter],
    () =>
      fetch(`/api/ops/webhooks/logs?status=${statusFilter}`).then((res: Response) =>
        res.json().then((j: { data: WebhookLog[] }) => j.data),
      ),
    { refetchInterval: 10000 },
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle size={14} className="text-green-500" />;
      case "FAILED":
        return <AlertCircle size={14} className="text-red-500" />;
      case "PENDING":
        return <Clock size={14} className="text-yellow-500" />;
      default:
        return <Activity size={14} className="text-gray-400" />;
    }
  };

  return (
    <OpsPageShell
      title="Global Webhook Inspector"
      description="Real-time log of all system webhook delivery attempts"
      headerActions={
        <div className="flex gap-2 items-center">
          <span className="text-xs text-gray-400 font-mono animate-pulse">
            LIVE MONITORING
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            className="rounded-full h-8 w-8"
            aria-label="Refresh webhook logs"
          >
            <RefreshCw
              className={`w-5 h-5 text-gray-500 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      }
    >

      <div className="flex gap-2 mb-6">
        {["ALL", "FAILED", "SUCCESS", "PENDING"].map((s: string) => (
          <Button
            key={s}
            variant={statusFilter === s ? "secondary" : "ghost"}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors h-auto ${statusFilter === s ? "bg-indigo-100 text-indigo-700" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            aria-label={`Filter by ${s} status`}
          >
            {s}
          </Button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium">Event</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Timestamp</th>
              <th className="px-6 py-3 font-medium">Payload</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading && !logs ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-600">
                  Connecting to event stream...
                </td>
              </tr>
            ) : logs?.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-600">
                  No events found in this window.
                </td>
              </tr>
            ) : (
              logs?.map((log: WebhookLog) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">{log.eventType}</td>
                  <td className="px-6 py-3 flex items-center gap-2">
                    {getStatusIcon(log.status)}
                    <span
                      className={log.status === "FAILED"
                          ? "text-red-400"
                          : log.status === "SUCCESS"
                            ? "text-green-400"
                            : "text-gray-400"
                      }
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-3">{log.storeId}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </OpsPageShell>
  );
}
