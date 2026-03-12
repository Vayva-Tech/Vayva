"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlass as Search, Funnel as Filter, ArrowCounterClockwise as RefreshCw, ShoppingBag, CreditCard, Truck, CheckCircle, XCircle, Clock, WarningCircle as AlertCircle, Download, Trash, FileX, Check } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { OpsPagination } from "@/components/shared/OpsPagination";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { AdvancedSearchInput } from "@/components/ops/AdvancedSearchInput";
import { buildSearchParams, type SearchQuery } from "@/lib/search/queryParser";
import { logger } from "@vayva/shared";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ops/ConfirmDialog";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  total: number;
  currency: string;
  customerEmail: string | null;
  createdAt: string;
  storeName: string;
  storeId: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function OrdersPage(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
  const paymentStatus = searchParams.get("paymentStatus") || "";

  const [searchInput, setSearchInput] = useState(search);
  const [advancedSearch, setAdvancedSearch] = useState(search);
  const [data, setData] = useState<Order[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionDetails, setActionDetails] = useState<{ type: string; target: string; impact?: string } | undefined>(undefined);

  useEffect(() => {
    fetchOrders();
  }, [page, search, status, paymentStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { q: search }),
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
      });

      const res = await fetch(`/api/ops/orders?${query}`);
      if (res.status === 401) {
        window.location.href = "/ops/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch orders");

      const result = await res.json();
      setData(result.data || []);
      setMeta(result.meta || null);
    } catch (error: unknown) {
      logger.error("[ORDERS_FETCH_ERROR]", { error });
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

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  // Bulk Selection Handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((o) => o.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // CSV Export
  const handleExportCSV = async () => {
    try {
      const query = new URLSearchParams({
        format: "csv",
        ...(search && { q: search }),
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
      });
      
      const res = await fetch(`/api/ops/orders/export?${query}`);
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      const url = window.URL?.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL?.revokeObjectURL(url);
      
      toast.success("Orders exported successfully");
    } catch {
      toast.error("Failed to export orders");
    }
  };

  // Bulk Actions
  const handleBulkAction = (action: string) => {
    setPendingAction(action);
    const actionConfig: Record<string, { type: string; target: string; impact?: string }> = {
      mark_completed: { type: "Status Update", target: `${selectedIds.size} order(s)`, impact: "Orders will be marked as completed" },
      mark_cancelled: { type: "Status Update", target: `${selectedIds.size} order(s)`, impact: "Orders will be cancelled and inventory restored" },
      refund: { type: "Financial Action", target: `${selectedIds.size} order(s)`, impact: "Refunds will be initiated for selected orders" },
    };
    setActionDetails(actionConfig[action]);
    setConfirmDialogOpen(true);
  };

  const executeBatchAction = async (reason: string) => {
    if (!pendingAction) return;

    setProcessingAction(pendingAction);
    setConfirmDialogOpen(false);

    try {
      const res = await fetch("/api/ops/orders/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: Array.from(selectedIds),
          action: pendingAction,
          reason,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      toast.success(`Action Complete: ${json.count} orders updated`);
      setSelectedIds(new Set());
      setPendingAction(null);
      fetchOrders();
    } catch (e) {
      const error = e as Error;
      toast.error(error.message);
    } finally {
      setProcessingAction(null);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (
    status: string,
    _type: "status" | "payment" | "fulfillment",
  ) => {
    const statusLower = status.toLowerCase();

    let colorClass = "bg-gray-100 text-gray-700";
    let Icon = Clock;

    if (["paid", "completed", "fulfilled", "delivered"].includes(statusLower)) {
      colorClass = "bg-green-100 text-green-700";
      Icon = CheckCircle;
    } else if (
      ["failed", "cancelled", "rejected", "refunded"].includes(statusLower)
    ) {
      colorClass = "bg-red-100 text-red-700";
      Icon = XCircle;
    } else if (["processing", "initiated", "pending"].includes(statusLower)) {
      colorClass = "bg-blue-100 text-blue-700";
      Icon = RefreshCw; // Or Clock
    } else if (
      ["partially_fulfilled", "partially_paid"].includes(statusLower)
    ) {
      colorClass = "bg-yellow-100 text-yellow-700";
      Icon = AlertCircle;
    }

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}
      >
        <Icon className="h-3 w-3" /> {status}
      </span>
    );
  };

  return (
    <OpsPageShell
      title="Orders"
      description="Manage platform-wide orders"
      headerActions={
        <div className="text-sm text-gray-500">
          {meta && `${meta.total} total orders`}
        </div>
      }
    >
      {/* Search & Filter Bar */}
      <section className="mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
        <AdvancedSearchInput
          value={advancedSearch}
          onChange={setAdvancedSearch}
          onSearch={handleAdvancedSearch}
          placeholder="Search orders (try: status:completed total>1000 customer:john)"
        />
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 h-auto ${
              showFilters || status || paymentStatus
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                : ""
            }`}
            aria-label={showFilters ? "Hide filters" : "Show filters"}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {(status || paymentStatus) && (
              <span className="ml-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {[status, paymentStatus].filter(Boolean).length}
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={fetchOrders}
            className="flex items-center gap-2 h-auto"
            aria-label="Refresh orders list"
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
                Order Status
              </label>
              <select
                value={status}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleFilterChange(
                    "status",
                    e.target.value,
                  )
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Filter by order status"
              >
                <option value="">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="PROCESSING">Processing</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleFilterChange(
                    "paymentStatus",
                    e.target.value,
                  )
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Filter by payment status"
              >
                <option value="">All Payments</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </div>
        )}
      </div>
      </section>

      {/* Table */}
      <section className="mb-8">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === data.length && data.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    aria-label="Select all orders"
                  />
                </th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Store</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <div className="h-4 w-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
                      Loading orders...
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                data.map((order: Order) => (
                  <tr
                    key={order.id}
                    className={`hover:bg-white/60 group transition-colors ${selectedIds.has(order.id) ? "bg-indigo-50" : ""}`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(order.id)}
                        onChange={() => toggleSelectOne(order.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        aria-label={`Select order ${order.orderNumber}`}
                      />
                    </td>
                    <td className="px-4 py-4 font-mono font-medium text-indigo-600">
                      <Link
                        href={`/ops/orders/${order.id}`}
                        className="hover:underline"
                      >
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {order.customerEmail || "Guest"}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/ops/merchants/${order.storeId}`}
                        className="hover:text-indigo-600"
                      >
                        {order.storeName}
                      </Link>
                    </td>
                    <td className="px-4 py-4 font-medium">
                      {order.currency} {Number(order.total).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(order.status, "status")}
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(order.paymentStatus, "payment")}
                    </td>
                    <td className="px-4 py-4 text-gray-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI - Same as Webhooks */}
        {/* Pagination UI - Standardized */}
        {meta && (
          <OpsPagination
            currentPage={meta.page}
            totalItems={meta.total}
            limit={meta.limit}
            onPageChange={handlePageChange}
          />
        )}
      </div>
      </section>
      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3 pr-6 border-r border-gray-700">
            <div className="bg-gray-800 p-2 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
            </div>
            <span className="font-medium">
              {selectedIds.size} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleBulkAction("mark_completed")}
              disabled={!!processingAction}
              className="bg-green-600 hover:bg-green-700 text-white border-none h-auto"
              aria-label={`Mark ${selectedIds.size} orders as completed`}
            >
              <Check className="h-4 w-4 mr-1" />
              Complete
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBulkAction("mark_cancelled")}
              disabled={!!processingAction}
              className="bg-red-500 hover:bg-red-600 text-white border-none h-auto"
              aria-label={`Cancel ${selectedIds.size} orders`}
            >
              <FileX className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleBulkAction("refund")}
              disabled={!!processingAction}
              className="bg-amber-500 hover:bg-amber-600 text-black border-none h-auto"
              aria-label={`Refund ${selectedIds.size} orders`}
            >
              <CreditCard className="h-4 w-4 mr-1" />
              Refund
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="text-gray-400 hover:text-gray-900 hover:bg-white/80 h-auto"
              aria-label="Cancel selection"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => {
          setConfirmDialogOpen(false);
          setPendingAction(null);
        }}
        onConfirm={executeBatchAction}
        title={pendingAction === "mark_completed" ? "Mark Orders Complete" : pendingAction === "mark_cancelled" ? "Cancel Orders" : "Process Refunds"}
        description={pendingAction === "mark_completed"
          ? `You are about to mark ${selectedIds.size} order(s) as completed. This will update their status to completed.`
          : pendingAction === "mark_cancelled"
            ? `You are about to cancel ${selectedIds.size} order(s). This will restore inventory and issue refunds for paid orders.`
            : `You are about to process refunds for ${selectedIds.size} order(s). This is a financial action that cannot be undone.`}
        confirmLabel={pendingAction === "mark_completed" ? "Mark Complete" : pendingAction === "mark_cancelled" ? "Cancel Orders" : "Process Refunds"}
        riskLevel={pendingAction === "refund" ? "critical" : "high"}
        actionDetails={actionDetails}
        placeholder={pendingAction === "refund"
          ? "Provide detailed reason for refunds (minimum 20 characters)..."
          : "Provide a reason for this action (minimum 10 characters)..."}
      />
    </OpsPageShell>
  );
}
