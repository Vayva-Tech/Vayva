"use client";

import React, { useState, ChangeEvent } from "react";
import { Chat as MessageSquare, Envelope as Mail, DeviceMobile as Smartphone, ArrowCounterClockwise as RefreshCw, Storefront } from "@phosphor-icons/react/ssr";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { toast } from "sonner";

// Interface for communication log entries
interface CommLog {
  id: string;
  channel: string;
  type: string;
  status: string;
  createdAt: string;
  metadata: {
    to?: string;
    email?: string;
  } | null;
}

const statusFilters = ["ALL", "SUCCESS", "FAILED", "PENDING"] as const;
type StatusFilter = typeof statusFilters[number];

const statusButtonLabel: Record<StatusFilter, string> = {
  ALL: "All",
  SUCCESS: "Sent",
  FAILED: "Failed",
  PENDING: "Pending",
};

export default function CommunicationsPage(): React.JSX.Element {
  const [storeId, setStoreId] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const {
    data: logs,
    isLoading,
    refetch,
  } = useOpsQuery<CommLog[]>(
    ["comm-logs", storeId, filter],
    async () => {
      const params = new URLSearchParams({
        storeId: storeId.trim(),
        status: filter,
      });
      const res = await fetch(`/api/ops/communications/logs?${params}`);
      const j = (await res.json()) as { data?: CommLog[]; error?: string };
      if (!res.ok) {
        throw new Error(j.error || `Request failed (${res.status})`);
      }
      return j.data ?? [];
    },
    { enabled: false },
  );

  const loadLogs = () => {
    if (!storeId.trim()) {
      toast.error("Store required", {
        description: "Enter a store ID to load notification logs for that merchant only.",
      });
      return;
    }
    void refetch();
  };

  const getChannelIcon = (channel: string) => {
    if (channel === "EMAIL")
      return <Mail size={14} className="text-blue-500" />;
    if (channel === "SMS")
      return <Smartphone size={14} className="text-purple-500" />;
    return <MessageSquare size={14} />;
  };

  return (
    <OpsPageShell
      title="Communications Center"
      description="Audit trail of outbound notifications for one store (store-scoped)."
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => loadLogs()}
          className="rounded-full h-8 w-8"
          aria-label="Refresh communication logs"
        >
          <RefreshCw
            className={`w-5 h-5 text-gray-500 ${isLoading ? "animate-spin" : ""}`}
          />
        </Button>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-gray-200 pb-4">
        <div className="flex-1 max-w-md">
          <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-2">
            <Storefront size={14} /> Store ID
          </label>
          <input
            type="text"
            value={storeId}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setStoreId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500"
            placeholder="Store UUID from Merchants"
          />
        </div>
        <Button
          onClick={() => loadLogs()}
          className="bg-indigo-600 text-white h-auto py-2 px-4 text-sm font-semibold"
        >
          Load logs
        </Button>
      </div>
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {statusFilters.map((s: StatusFilter) => (
          <Button
            key={s}
            variant={filter === s ? "secondary" : "ghost"}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors h-auto ${filter === s ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" : "text-gray-600 hover:bg-white/60"}`}
            aria-label={`Filter logs by status: ${statusButtonLabel[s].toLowerCase()}`}
          >
            {statusButtonLabel[s]}
          </Button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium">Recipient</th>
              <th className="px-6 py-3 font-medium">Channel</th>
              <th className="px-6 py-3 font-medium">Template</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400">
                  Loading logs...
                </td>
              </tr>
            ) : !logs?.length ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400">
                  Enter a store ID and click Load logs, or no notifications match this filter.
                </td>
              </tr>
            ) : (
              logs.map((log: CommLog) => (
                <tr key={log.id} className="hover:bg-white/60">
                  <td className="px-6 py-4 font-mono text-xs text-gray-600">
                    {String(
                      log.metadata?.to ||
                        log.metadata?.email ||
                        "N/A",
                    )}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    {getChannelIcon(log.channel)}
                    <span className="text-xs font-medium">
                      {log.channel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {log.type}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.status === "SUCCESS"
                          ? "bg-green-100 text-green-700"
                          : log.status === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {log.status === "SUCCESS" ? "SENT" : log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(log.createdAt).toLocaleString()}
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
