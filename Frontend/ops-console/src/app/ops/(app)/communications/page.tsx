"use client";

import React, { useState } from "react";
import { Chat as MessageSquare, Envelope as Mail, DeviceMobile as Smartphone, ArrowCounterClockwise as RefreshCw } from "@phosphor-icons/react/ssr";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

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

const statusFilters = ["ALL", "SENT", "FAILED", "PENDING"] as const;
type StatusFilter = typeof statusFilters[number];

export default function CommunicationsPage(): React.JSX.Element {
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const {
    data: logs,
    isLoading,
    refetch,
  } = useOpsQuery<CommLog[]>(["comm-logs", filter], () =>
    fetch(`/api/ops/communications/logs?status=${filter}`).then((res: Response) =>
      res.json().then((j: { data: CommLog[] }) => j.data),
    ),
  );

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
      description="Audit trail of all outbound notifications"
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          className="rounded-full h-8 w-8"
          aria-label="Refresh communication logs"
        >
          <RefreshCw
            className={`w-5 h-5 text-gray-500 ${isLoading ? "animate-spin" : ""}`}
          />
        </Button>
      }
    >
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {statusFilters.map((s: StatusFilter) => (
          <Button
            key={s}
            variant={filter === s ? "secondary" : "ghost"}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors h-auto ${filter === s ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" : "text-gray-600 hover:bg-white/60"}`}
            aria-label={`Filter logs by status: ${s.toLowerCase()}`}
          >
            {s}
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
                  No logs found.
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
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.status === "SENT"
                          ? "bg-green-100 text-green-700"
                          : log.status === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {log.status}
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
