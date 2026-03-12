"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlass as Search, Funnel as Filter, ArrowCounterClockwise as RefreshCw, Truck, Package, CheckCircle, XCircle, Clock, MapPin, Warning as AlertTriangle } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { OpsPagination } from "@/components/shared/OpsPagination";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { AdvancedSearchInput } from "@/components/ops/AdvancedSearchInput";
import { buildSearchParams, type SearchQuery } from "@/lib/search/queryParser";
import { toast } from "sonner";
import { logger } from "@vayva/shared";

interface Shipment {
  id: string;
  orderNumber: string;
  status: string;
  provider: string;
  trackingCode: string | null;
  recipientName: string | null;
  createdAt: string;
  cost: number | null;
  deliveryFee: number | null;
  storeName: string;
  storeId: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function DeliveriesPage(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
  const provider = searchParams.get("provider") || "";

  const [searchInput, setSearchInput] = useState(search);
  const [advancedSearch, setAdvancedSearch] = useState(search);
  const [data, setData] = useState<Shipment[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    pending: 0,
    failed: 0,
    slaRate: 0,
  });

  useEffect(() => {
    fetchDeliveries();
    fetchStats();
  }, [page, search, status, provider]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/ops/logistics/stats");
      if (res.ok) {
        const s = await res.json();
        setStats(s);
      }
    } catch (e) {
      logger.error("[DELIVERIES_STATS_FETCH_ERROR]", { error: e });
    }
  };

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { q: search }),
        ...(status && { status }),
        ...(provider && { provider }),
      });

      const resGet = await fetch(`/api/ops/deliveries?${query}`);

      if (resGet.status === 401) {
        window.location.href = "/ops/login";
        return;
      }
      if (!resGet.ok) throw new Error("Failed to fetch deliveries");

      const result = await resGet.json();
      setData(result.data || []);
      setMeta(result.meta || null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
      logger.error("[DELIVERIES_FETCH_ERROR]", { error });
    } finally {
      setLoading(false);
    }
  };

  const handleForceStatus = async (id: string, newStatus: string) => {
    if (
      !confirm(
        `Are you sure you want to FORCE status to ${newStatus}? This ignores provider updates.`,
      )
    )
      return;

    try {
      const res = await fetch("/api/ops/logistics/shipments", {
        method: "PATCH",
        body: JSON.stringify({
          shipmentId: id,
          status: newStatus,
          note: "Admin Override",
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Shipment Updated");
      fetchDeliveries();
    } catch {
      toast.error("Failed to update status");
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

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (["DELIVERED", "COMPLETED"].includes(s)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="h-3 w-3" /> {status}
        </span>
      );
    }
    if (["FAILED", "CANCELLED", "RETURNED"].includes(s)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
          <XCircle className="h-3 w-3" /> {status}
        </span>
      );
    }
    if (["IN_TRANSIT", "PICKED_UP", "ACCEPTED"].includes(s)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
          <Truck className="h-3 w-3" /> {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
        <Clock className="h-3 w-3" /> {status}
      </span>
    );
  };

  return (
    <OpsPageShell
      title="Deliveries"
      description={`Track platform-wide shipments • ${stats.slaRate}% On-Time Delivery`}
      headerActions={
        <div className="text-sm text-gray-500">
          {meta && `${meta.total} total shipments`}
        </div>
      }
    >

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-xs font-medium uppercase mb-1">
            Total Shipped
          </div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-green-600 text-xs font-medium uppercase mb-1">
            Delivered
          </div>
          <div className="text-2xl font-bold">{stats.delivered}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-blue-600 text-xs font-medium uppercase mb-1">
            Pending
          </div>
          <div className="text-2xl font-bold">{stats.pending}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-red-600 text-xs font-medium uppercase mb-1">
            Failed
          </div>
          <div className="text-2xl font-bold">{stats.failed}</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4 mb-6">
        <AdvancedSearchInput
          value={advancedSearch}
          onChange={setAdvancedSearch}
          onSearch={handleAdvancedSearch}
          placeholder="Search deliveries (try: status:DELIVERED provider:KWIK)"
        />
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 h-auto ${
              showFilters || status || provider
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                : ""
            }`}
            aria-label={showFilters ? "Hide filters" : "Show filters"}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {(status || provider) && (
              <span className="ml-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {[status, provider].filter(Boolean).length}
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={fetchDeliveries}
            className="flex items-center gap-2 h-auto"
            aria-label="Refresh deliveries list"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Delivery Status
              </label>
              <select
                title="Filter by status"
                aria-label="Filter by delivery status"
                value={status}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleFilterChange(
                    "status",
                    e.target.value,
                  )
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="REQUESTED">Requested</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="DELIVERED">Delivered</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Provider
              </label>
              <select
                title="Filter by provider"
                aria-label="Filter by delivery provider"
                value={provider}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleFilterChange(
                    "provider",
                    e.target.value,
                  )
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Providers</option>
                <option value="KWIK">Kwik</option>
                <option value="CUSTOM">Custom</option>
                <option value="GIG">GIG Logistics</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-3">Order #</th>
                <th className="px-6 py-3">Provider</th>
                <th className="px-6 py-3">Tracking</th>
                <th className="px-6 py-3">Recipient</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Store</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <div className="h-4 w-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
                      Loading deliveries...
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No deliveries found
                  </td>
                </tr>
              ) : (
                data.map((shipment: Shipment) => (
                  <tr
                    key={shipment.id}
                    className="hover:bg-white/60 group transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-indigo-600">
                      <Link
                        href={`/ops/orders/${shipment.orderNumber}`}
                        className="hover:underline"
                      >
                        #{shipment.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs font-bold uppercase">
                        {shipment.provider}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-500 text-xs text-indigo-600">
                      {shipment.trackingCode ? (
                        <Link
                          href={`/ops/deliveries/${shipment.id}`}
                          className="hover:underline text-indigo-600 font-medium"
                        >
                          {shipment.trackingCode}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {shipment.recipientName || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(shipment.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="max-w-[150px] truncate"
                        title={shipment.storeName}
                      >
                        {shipment.storeName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            handleForceStatus(shipment.id, "DELIVERED")
                          }
                          className="h-7 px-2 text-[10px] bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                          title="Force Mark Delivered"
                          aria-label={`Mark shipment ${shipment.id} as delivered`}
                        >
                          Done
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleForceStatus(shipment.id, "FAILED")
                          }
                          className="h-7 px-2 text-[10px] bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 shadow-none"
                          title="Force Mark Failed"
                          aria-label={`Mark shipment ${shipment.id} as failed`}
                        >
                          Fail
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleForceStatus(shipment.id, "CANCELED")
                          }
                          className="h-7 px-2 text-[10px] bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                          title="Force Cancel"
                          aria-label={`Mark shipment ${shipment.id} as canceled`}
                        >
                          Cancel
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI - Shared */}
        {meta && (
          <OpsPagination
            currentPage={meta.page}
            totalItems={meta.total}
            limit={meta.limit}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </OpsPageShell>
  );
}
