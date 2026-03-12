"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlass as Search, Funnel as Filter, ArrowCounterClockwise as RefreshCw, Warning as ShieldAlert, User, Pulse as Activity, Calendar, Eye, X, Copy, Check } from "@phosphor-icons/react/ssr";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { AdvancedSearchInput } from "@/components/ops/AdvancedSearchInput";
import { buildSearchParams, type SearchQuery } from "@/lib/search/queryParser";
import { logger } from "@vayva/shared";

interface AuditEvent {
  id: string;
  eventType: string;
  metadata: unknown;
  createdAt: string;
  actor: {
    name: string;
    email: string;
    role: string;
  };
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AuditLogsPage(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1");
  const eventType = searchParams.get("eventType") || "";
  const actor = searchParams.get("actor") || "";

  const [searchInput, setSearchInput] = useState(actor);
  const [advancedSearch, setAdvancedSearch] = useState(actor);
  const [data, setData] = useState<AuditEvent[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [page, eventType, actor]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(eventType && { eventType }),
        ...(actor && { actor }),
      });

      const res = await fetch(`/api/ops/audit?${query}`);
      if (res.status === 401) {
        window.location.href = "/ops/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch logs");

      const result = await res.json();
      setData(result.data || []);
      setMeta(result.meta || null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
      logger.error("[AUDIT_LOGS_FETCH_ERROR]", { error });
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedSearch = (query: SearchQuery) => {
    const params = buildSearchParams(query);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    (e as React.FormEvent).preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput) {
      params.set("actor", searchInput);
    } else {
      params.delete("actor");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  // Helper to extract target info from metadata
  const getTargetInfo = (metadata: Record<string, unknown> | null) => {
    if (!metadata) return "—";

    // Common patterns
    if (metadata.targetType && metadata.storeName) {
      return `${metadata.targetType}: ${metadata.storeName}`;
    }
    if (metadata.targetType && metadata.targetId) {
      const targetIdStr = String(metadata.targetId);
      return `${metadata.targetType}: ${targetIdStr.substring(0, 8)}...`;
    }
    if (metadata.fileName) return `File: ${metadata.fileName}`;
    if (metadata.reportType) return `Report: ${metadata.reportType}`;

    return "—";
  };

  return (
    <OpsPageShell
      title="Audit Log"
      description={`System-wide governance trail • ${meta?.total || 0} events logged`}
    >

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4 shadow-sm mb-6">
        <AdvancedSearchInput
          value={advancedSearch}
          onChange={setAdvancedSearch}
          onSearch={handleAdvancedSearch}
          placeholder="Search audit logs (try: actor:john eventType:LOGIN)"
        />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 h-auto ${
              showFilters || eventType
                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
            aria-label={showFilters ? "Hide filters" : "Show filters"}
          >
            <Filter className="h-4 w-4" />
            Filters
            {eventType && (
              <span className="bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                1
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={fetchLogs}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-white/60 transition-colors flex items-center gap-2 h-auto"
            aria-label="Refresh audit trail"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {showFilters && (
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Event Type
            </label>
            <select
              value={eventType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleFilterChange("eventType", e.target.value)
              }
              className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Filter by event type"
            >
              <option value="">All Events</option>
              <option value="LOGIN">Login</option>
              <option value="DISABLE_PAYOUTS">Disable Payouts</option>
              <option value="ENABLE_PAYOUTS">Enable Payouts</option>
              <option value="FORCE_KYC_REVIEW">Force KYC Review</option>
              <option value="SUSPEND_ACCOUNT">Suspend Account</option>
              <option value="WEBHOOK_REPLAY">WebhookLogo as Webhook Replay</option>
              <option value="TICKET_UPDATE">Ticket Update</option>
              <option value="DATA_EXPORT">Data Export</option>
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3">Timestamp</th>
              <th className="px-6 py-3">Actor</th>
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3">Target / Context</th>
              <th className="px-6 py-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <div className="h-4 w-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
                    Loading audit trail...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  No audit events found
                </td>
              </tr>
            ) : (
              data.map((event: AuditEvent) => (
                <tr
                  key={event.id}
                  className="hover:bg-white/60 group transition-colors"
                >
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      {new Date(event.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                        {event?.actor?.name[0]}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {event?.actor?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {event?.actor?.role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      <Activity size={12} />
                      {event.eventType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {getTargetInfo(event.metadata as Record<string, unknown> | null)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedEvent(event)}
                      className="text-gray-400 hover:text-indigo-600 transition-colors h-8 w-8"
                      aria-label={`View details for event ${event.eventType}`}
                    >
                      <Eye size={18} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination - Shared */}
        {meta && (
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Page {meta.page} of {meta.totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={meta.page <= 1}
                onClick={() => handlePageChange(meta.page - 1)}
                className="px-3 py-1 bg-white border rounded text-xs disabled:opacity-50 h-auto"
                aria-label="Go to previous page"
              >
                Prev
              </Button>
              <Button
                variant="outline"
                disabled={meta.page >= meta.totalPages}
                onClick={() => handlePageChange(meta.page + 1)}
                className="px-3 py-1 bg-white border rounded text-xs disabled:opacity-50 h-auto"
                aria-label="Go to next page"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* JSON Inspector Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  Event Details
                  <span className="text-sm font-normal text-gray-500 font-mono">
                    {selectedEvent.id}
                  </span>
                </h3>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(selectedEvent.createdAt).toLocaleString()} •{" "}
                  {selectedEvent.eventType}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedEvent(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors h-8 w-8"
                aria-label="Close event details modal"
              >
                <X size={20} />
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-0">
              <div className="bg-gray-900 p-6 min-h-full">
                <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">
                  {JSON.stringify(
                    {
                      ...selectedEvent,
                      metadata: selectedEvent.metadata, // Ensure consistent order if needed
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 h-auto"
                aria-label="Close event details modal"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </OpsPageShell>
  );
}
