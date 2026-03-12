"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lifebuoy as LifeBuoy, MagnifyingGlass as Search, Funnel as Filter, Chat as MessageSquare, Clock, CheckCircle } from "@phosphor-icons/react/ssr";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { toast } from "sonner";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

interface Ticket {
  id: string;
  subject: string;
  storeName: string;
  status: "OPEN" | "RESOLVED" | string;
  createdAt: string;
}

interface SupportStats {
  total: number;
  open: number;
  resolved: number;
}

export default function SupportPage(): React.JSX.Element {
  const router = useRouter();
  const [filter, setFilter] = React.useState<string>("OPEN");

  const { data: stats } = useOpsQuery<SupportStats>(
    ["support-stats"],
    () =>
      fetch("/api/ops/support/stats").then((res: Response) => res.json()),
    { refetchInterval: 30000 },
  );

  const { data: tickets, isLoading } = useOpsQuery<Ticket[]>(
    ["support-tickets", filter],
    () =>
      fetch(`/api/ops/support/tickets?status=${filter}`).then((res: Response) =>
        res.json().then((j: { data: Ticket[] }) => j.data),
      ),
    { refetchInterval: 30000 },
  );

  const getStatusBadge = (status: Ticket["status"]) => {
    const s = status.toUpperCase();
    switch (s) {
      case "OPEN":
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">
            Open
          </span>
        );
      case "RESOLVED":
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">
            Resolved
          </span>
        );
      case "CLOSED":
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600">
            Closed
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600">
            {status}
          </span>
        );
    }
  };

  return (
    <OpsPageShell
      title="Support Knowledge Hub"
      description="Manage inbound merchant requests and tickets"
      headerActions={
        <Button
          variant="primary"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors h-auto"
          aria-label="Create new support ticket"
        >
          Create Ticket
        </Button>
      }
    >

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-xs font-medium uppercase mb-1">
            Total Tickets
          </div>
          <div className="text-2xl font-bold">{stats?.total || 0}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-blue-600 text-xs font-medium uppercase mb-1">
            Open
          </div>
          <div className="text-2xl font-bold">{stats?.open || 0}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-green-600 text-xs font-medium uppercase mb-1">
            Resolved
          </div>
          <div className="text-2xl font-bold">{stats?.resolved || 0}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 border-b border-gray-200 pb-1">
        {["OPEN", "RESOLVED", "ALL"].map((s: string) => (
          <Button
            key={s}
            variant="ghost"
            onClick={() => setFilter(s)}
            className={`px-4 py-3 text-sm font-medium border-b-2 rounded-none transition-colors -mb-1.5 h-auto hover:bg-transparent ${filter === s ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            aria-label={`Filter by ${s} status`}
          >
            {s} Tickets
          </Button>
        ))}
      </div>

      {/* Ticket List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3 font-medium">Ticket ID</th>
              <th className="px-6 py-3 font-medium">Subject</th>
              <th className="px-6 py-3 font-medium">Merchant</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400">
                  Loading tickets...
                </td>
              </tr>
            ) : !tickets?.length ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400">
                  No tickets found.
                </td>
              </tr>
            ) : (
              tickets.map((t: Ticket) => (
                <tr
                  key={t.id}
                  onClick={() => router.push(`/ops/support/${t.id}`)}
                  className="hover:bg-white/60 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">
                    #{t?.id?.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {t.subject}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-[10px] flex items-center justify-center font-bold">
                        {t.storeName?.[0] || "?"}
                      </div>
                      <span className="text-gray-700">
                        {t.storeName || "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(t.status)}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(t.createdAt).toLocaleDateString()}
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
