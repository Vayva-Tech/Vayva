"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlass as Search, Funnel as Filter, ArrowCounterClockwise as RefreshCw, Chat as MessageSquare, Clock, CheckCircle, WarningCircle as AlertCircle, DotsThree as MoreHorizontal, ChatCircle as MessageCircle, Heart } from "@phosphor-icons/react/ssr";
import { formatDistanceToNow } from "date-fns";
import { MerchantHappinessWidget } from "@/components/analytics/csat-widget";
import { cn } from "@/lib/utils";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { AdvancedSearchInput } from "@/components/ops/AdvancedSearchInput";
import { buildSearchParams, type SearchQuery } from "@/lib/search/queryParser";
import { logger } from "@vayva/shared";

interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  storeName: string;
  storeId: string;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function SupportInboxPage(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("q") || "";
  const status = searchParams.get("status") || "open";
  const priority = searchParams.get("priority") || "";

  const [searchInput, setSearchInput] = useState(search);
  const [advancedSearch, setAdvancedSearch] = useState(search);
  const [data, setData] = useState<SupportTicket[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [page, search, status, priority]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        status: status,
        ...(search && { q: search }),
        ...(priority && { priority }),
      });

      const res = await fetch(`/api/ops/support?${query}`);
      if (res.status === 401) {
        const loc = typeof window !== "undefined" ? window.location : null;
        if (loc) loc.href = "/ops/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch tickets");

      const result = await res.json();
      setData(result.data || []);
      setMeta(result.meta || null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
      logger.error("[INBOX_TICKETS_FETCH_ERROR]", { error });
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedSearch = (query: SearchQuery) => {
    const params = buildSearchParams(query);
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

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
      case "urgent":
        return (
          <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded">
            High
          </span>
        );
      case "medium":
        return (
          <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">
            Medium
          </span>
        );
      default:
        return (
          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
            Low
          </span>
        );
    }
  };

  return (
    <OpsPageShell
      title="Support Inbox"
      description="Manage and resolve merchant support requests"
      headerActions={
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">
              {meta?.total || 0}
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Total Tickets
            </span>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-green-600">
              {data.filter((t) => t.status === "open").length}
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Active Now
            </span>
          </div>
        </div>
      }
    >

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4 mb-6">
        <AdvancedSearchInput
          value={advancedSearch}
          onChange={setAdvancedSearch}
          onSearch={handleAdvancedSearch}
          placeholder="Search tickets (try: status:open priority:high store:acme)"
        />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 h-auto ${
              showFilters || status !== "open" || priority
                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
            aria-label={showFilters ? "Hide filters" : "Show filters"}
          >
            <Filter className="h-4 w-4" />
            Filters
            {(status !== "open" || priority) && (
              <span className="bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {Number(status !== "open") + Number(!!priority)}
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={fetchTickets}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-white/60 transition-colors flex items-center gap-2 h-auto"
            aria-label="Refresh support tickets"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e: any) =>
                  handleFilterChange(
                    "status",
                    (e as React.ChangeEvent<HTMLInputElement>).target.value,
                  )
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Filter by ticket status"
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="all">All Tickets</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e: any) =>
                  handleFilterChange(
                    "priority",
                    (e as React.ChangeEvent<HTMLInputElement>).target.value,
                  )
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Filter by ticket priority"
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Ticket List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
            <div className="h-6 w-6 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
            Loading tickets...
          </div>
        ) : data.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900">
              No tickets found
            </h3>
            <p className="mt-1 text-sm">Or great job clearing the inbox! 🎉</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.map((ticket: any) => (
              <Link
                href={`/ops/inbox/${ticket.id}`}
                key={ticket.id}
                className="block p-4 hover:bg-white/60 transition-colors group"
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-indigo-600 text-sm">
                      {ticket.storeName}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500">
                      {ticket.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={14} />
                    {formatDistanceToNow(new Date(ticket.lastMessageAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <h3
                    className={`text-base font-semibold group-hover:text-indigo-600 transition-colors ${ticket.status === "open" ? "text-gray-900" : "text-gray-500"}`}
                  >
                    {ticket.subject}
                  </h3>
                  <div className="flex items-center gap-3">
                    {getPriorityBadge(ticket.priority)}
                    {ticket.status === "open" ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <AlertCircle size={12} /> Open
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                        <CheckCircle size={12} /> Closed
                      </span>
                    )}
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MessageSquare size={12} /> {ticket.messageCount}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination - Reuse or simplify */}
        {meta && meta.totalPages > 1 && (
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Page {meta.page} of {meta.totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={meta.page <= 1}
                onClick={() => router.push(`?page=${meta.page - 1}`)}
                className="px-3 py-1 bg-white border rounded text-xs disabled:opacity-50 h-auto"
                aria-label="Go to previous page"
              >
                Prev
              </Button>
              <Button
                variant="outline"
                disabled={meta.page >= meta.totalPages}
                onClick={() => router.push(`?page=${meta.page + 1}`)}
                className="px-3 py-1 bg-white border rounded text-xs disabled:opacity-50 h-auto"
                aria-label="Go to next page"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </OpsPageShell>
  );
}
