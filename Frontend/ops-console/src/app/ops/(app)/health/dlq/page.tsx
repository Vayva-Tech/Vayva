"use client";

import React, { useState, useEffect } from "react";
import { WarningCircle as AlertCircle, ArrowCounterClockwise as RefreshCw, Play, Trash as Trash2, Warning as ShieldAlert } from "@phosphor-icons/react/ssr";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { toast } from "sonner";
import { cn, Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

interface DlqEntry {
  id: string;
  jobType: string;
  lastError: string;
  failedAt: string;
  status: string;
}

export default function DLQPage(): React.JSX.Element {
  const [filter, setFilter] = useState("DEAD");

  const {
    data: entries,
    isLoading,
    refetch,
  } = useOpsQuery<DlqEntry[]>(["dlq-entries", filter], () =>
    fetch(`/api/ops/health/dlq?status=${filter}`).then((res: Response) =>
      res.json().then((j: { data: DlqEntry[] }) => j.data),
    ),
  );

  const handleReplay = async (id: string) => {
    try {
      const res = await fetch(`/api/ops/health/dlq/${id}/replay`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Job replay initiated");
        refetch();
      } else {
        toast.error("Failed to initiate replay");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  return (
    <OpsPageShell
      title="Dead Letter Queue"
      description="Manage and replay failed background jobs"
      headerActions={
        <Button
          onClick={() => refetch()}
          variant="ghost"
          size="icon"
          className="w-10 h-10 hover:bg-gray-100 rounded-full"
          aria-label="Refresh Dead Letter Queue"
        >
          <RefreshCw
            className={cn("w-5 h-5 text-gray-500", isLoading && "animate-spin")}
          />
        </Button>
      }
    >

      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {["DEAD", "REPLAYING", "REPLAYED", "ALL"].map((s: string) => (
          <Button
            key={s}
            onClick={() => setFilter(s)}
            variant="ghost"
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-2 rounded-none hover:bg-transparent h-auto",
              filter === s
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700",
            )}
          >
            {s}
          </Button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium">Job Type</th>
              <th className="px-6 py-3 font-medium">Error</th>
              <th className="px-6 py-3 font-medium">Time Failed</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400">
                  Loading DLQ...
                </td>
              </tr>
            ) : !entries?.length ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400">
                  Queue is empty.
                </td>
              </tr>
            ) : (
              entries.map((entry: DlqEntry) => (
                <tr key={entry.id} className="hover:bg-white/60">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {entry.jobType}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      #{entry.id.slice(0, 8)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="text-red-600 max-w-xs truncate"
                      title={entry.lastError}
                    >
                      {entry.lastError}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(entry.failedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold",
                        entry.status === "DEAD"
                          ? "bg-red-100 text-red-700"
                          : entry.status === "REPLAYING"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700",
                      )}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {entry.status === "DEAD" && (
                      <Button
                        onClick={() => handleReplay(entry.id)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-indigo-600 hover:bg-indigo-50 rounded"
                        title="Replay Job"
                      >
                        <Play size={16} fill="currentColor" />
                      </Button>
                    )}
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
