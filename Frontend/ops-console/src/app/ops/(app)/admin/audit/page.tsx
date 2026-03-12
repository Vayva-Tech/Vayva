"use client";

import React, { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { AdvancedSearchInput } from "@/components/ops/AdvancedSearchInput";
import { buildSearchParams, type SearchQuery } from "@/lib/search/queryParser";
import { Button } from "@vayva/ui";
import { logger } from "@vayva/shared";
import { 
  Download, 
  Filter, 
  Search,
  RefreshCw,
  FileJson,
  FileSpreadsheet,
  Calendar,
  User,
  Activity,
  History
} from "lucide-react";
import { format } from "date-fns";

interface AuditLog {
  id: string;
  eventType: string;
  eventLabel: string;
  user: {
    id: string;
    email: string;
    role: string;
  } | null;
  metadata: Record<string, unknown>;
  rescueIncidentId: string | null;
  createdAt: string;
  relativeTime: string;
}

const EVENT_TYPES = [
  { value: "", label: "All Events" },
  { value: "MERCHANT_CREATED", label: "Merchant Created" },
  { value: "MERCHANT_SUSPENDED", label: "Merchant Suspended" },
  { value: "MERCHANT_ACTIVATED", label: "Merchant Activated" },
  { value: "ORDER_CREATED", label: "Order Created" },
  { value: "PAYMENT_PROCESSED", label: "Payment Processed" },
  { value: "REFUND_ISSUED", label: "Refund Issued" },
  { value: "KYC_APPROVED", label: "KYC Approved" },
  { value: "KYC_REJECTED", label: "KYC Rejected" },
  { value: "SUPPORT_TICKET_CREATED", label: "Ticket Created" },
  { value: "SUPPORT_TICKET_RESOLVED", label: "Ticket Resolved" },
  { value: "USER_LOGIN", label: "User Login" },
  { value: "USER_LOGOUT", label: "User Logout" },
  { value: "SETTINGS_CHANGED", label: "Settings Changed" },
  { value: "BULK_ACTION", label: "Bulk Action" },
];

export default function AuditPage(): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    eventType: searchParams.get("eventType") || "",
    userId: searchParams.get("userId") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    search: searchParams.get("search") || "",
  });
  const [advancedSearch, setAdvancedSearch] = useState(filters.search);
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleAdvancedSearch = (query: SearchQuery) => {
    const params = buildSearchParams(query);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.eventType) params.set("eventType", filters.eventType);
    if (filters.userId) params.set("userId", filters.userId);
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    if (filters.search) params.set("search", filters.search);
    params.set("page", page.toString());
    return params.toString();
  }, [filters, page]);

  const { data, isLoading, error, refetch } = useOpsQuery(
    ["audit-logs", buildQueryString()],
    async () => {
      const res = await fetch(`/api/ops/audit-logs?${buildQueryString()}`);
      if (!res.ok) throw new Error("Failed to fetch audit logs");
      return res.json();
    }
  );

  const logs: AuditLog[] = data?.data || [];
  const meta = data?.meta;

  const handleExport = async (formatType: "csv" | "json") => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/ops/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filters,
          format: formatType,
        }),
      });

      if (formatType === "csv") {
        const blob = await res.blob();
        const url = window.URL?.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
        a.click();
        window.URL?.revokeObjectURL(url);
      } else {
        const json = await res.json();
        const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: "application/json" });
        const url = window.URL?.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.json`;
        a.click();
        window.URL?.revokeObjectURL(url);
      }
    } catch (err) {
      logger.error("[AUDIT_EXPORT_ERROR]", { error: err });
    } finally {
      setIsExporting(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      eventType: "",
      userId: "",
      startDate: "",
      endDate: "",
      search: "",
    });
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <OpsPageShell
      title="Audit Logs"
      description="Comprehensive activity tracking for compliance and security"
      headerActions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-gray-100" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                !
              </span>
            )}
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("csv")}
              disabled={isExporting || logs.length === 0}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("json")}
              disabled={isExporting || logs.length === 0}
            >
              <FileJson className="h-4 w-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>
      }
    >
      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
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
              showFilters || filters.eventType
                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
            aria-label={showFilters ? "Hide filters" : "Show filters"}
          >
            <Filter className="h-4 w-4" />
            Filters
            {filters.eventType && (
              <span className="bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                1
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => void refetch()}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-white/60 transition-colors flex items-center gap-2 h-auto"
            aria-label="Refresh audit trail"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type
              </label>
              <select
                value={filters.eventType}
                onChange={(e) => setFilters({ ...filters, eventType: e.target?.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <input
                type="text"
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target?.value })}
                placeholder="Filter by user ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target?.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target?.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target?.value })}
                  placeholder="Search in metadata..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-6">
                Clear All
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Results Summary */}
      {meta && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {logs.length} of {meta.total} records
          {meta.totalPages > 1 && ` (Page ${page} of ${meta.totalPages})`}
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium">Event</th>
              <th className="px-6 py-3 font-medium">Actor</th>
              <th className="px-6 py-3 font-medium">Details</th>
              <th className="px-6 py-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-400">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading audit logs...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-red-500">
                  Failed to load audit logs. <Button variant="ghost" size="sm" onClick={() => refetch()}>Retry</Button>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-400">
                  <History className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="font-medium">No audit logs found</p>
                  <p className="text-sm">
                    {hasActiveFilters
                      ? "Try adjusting your filters to see more results"
                      : "Audit logs will appear here once activity is recorded"}
                  </p>
                </td>
              </tr>
            ) : (
              logs.map((log: AuditLog) => (
                <tr key={log.id} className="hover:bg-white/60">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-indigo-500" />
                      <span className="font-medium">{log.eventLabel || log.eventType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      {log.user ? (
                        <div>
                          <div className="text-sm font-medium">{log?.user?.email}</div>
                          <div className="text-xs text-gray-500">{log?.user?.role}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">System</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      {log.rescueIncidentId && (
                        <span className="text-amber-600 text-xs mr-2">Rescue: {log.rescueIncidentId}</span>
                      )}
                      {log.metadata && Object.keys(log.metadata).length > 0 ? (
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded block truncate">
                          {JSON.stringify(log.metadata).slice(0, 50)}...
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm">{format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}</div>
                        <div className="text-xs text-gray-500">{log.relativeTime}</div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={!meta.hasPrevPage}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={!meta.hasNextPage}
          >
            Next
          </Button>
        </div>
      )}
    </OpsPageShell>
  );
}
