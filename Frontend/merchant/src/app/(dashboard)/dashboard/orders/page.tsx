// @ts-nocheck
"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Search,
  Package,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  ShoppingCart,
  Loader2,
  Truck,
  DollarSign,
  ArrowUpDown,
  Calendar,
  Trash2,
  Download,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
type PaymentStatus = "paid" | "pending";
type TabKey = "all" | OrderStatus;

interface Order {
  id: string;
  customer: string;
  initials: string;
  avatarBg: string;
  itemCount: number;
  total: number;
  status: OrderStatus;
  payment: PaymentStatus;
  date: string;
}

// ── SWR Fetcher ──────────────────────────────────────────────────────────────

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string; dot: string }> = {
  pending:    { label: "Pending",    bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400" },
  processing: { label: "Processing", bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-400" },
  shipped:    { label: "Shipped",    bg: "bg-purple-50",  text: "text-purple-700",  dot: "bg-purple-400" },
  delivered:  { label: "Delivered",  bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  cancelled:  { label: "Cancelled", bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-400" },
};

const PAYMENT_CONFIG: Record<PaymentStatus, { label: string; bg: string; text: string }> = {
  paid:    { label: "Paid",    bg: "bg-green-50",  text: "text-green-700" },
  pending: { label: "Pending", bg: "bg-amber-50",  text: "text-amber-700" },
};

function formatNaira(amount: number): string {
  if (amount >= 1000) {
    return "₦" + amount.toLocaleString("en-NG");
  }
  return "₦" + amount;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

// ── Avatar color helpers ─────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-rose-100 text-rose-600",
  "bg-blue-100 text-blue-600",
  "bg-amber-100 text-amber-600",
  "bg-purple-100 text-purple-600",
  "bg-teal-100 text-teal-600",
  "bg-indigo-100 text-indigo-600",
  "bg-pink-100 text-pink-600",
  "bg-emerald-100 text-emerald-600",
  "bg-orange-100 text-orange-600",
  "bg-cyan-100 text-cyan-600",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarBg(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── Page Component ───────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TabKey>("all");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const pageSize = 10;

  // ── SWR Data Fetching ──────────────────────────────────────────────────────
  const effectiveStatus = activeTab !== "all" ? activeTab : statusFilter !== "all" ? statusFilter : null;
  const ordersUrl = effectiveStatus
    ? `/api/orders?status=${effectiveStatus}`
    : "/api/orders";

  const { data: ordersData, error: ordersError, isLoading: ordersLoading, mutate: mutateOrders } = useSWR(
    ordersUrl,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  const { data: kpiData, error: kpiError, isLoading: kpiLoading, mutate: mutateKpis } = useSWR(
    "/api/dashboard/kpis",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  const orders: Order[] = useMemo(() => {
    if (!ordersData?.orders && !ordersData?.items && !Array.isArray(ordersData)) return [];
    const raw = ordersData?.orders || ordersData?.items || ordersData || [];
    return raw.map((o: any) => ({
      id: o.id || o._id,
      customer: o.customer || o.customerName || "Unknown",
      initials: o.initials || getInitials(o.customer || o.customerName || "U"),
      avatarBg: o.avatarBg || getAvatarBg(o.customer || o.customerName || "U"),
      itemCount: o.itemCount || o.items?.length || 1,
      total: o.total || o.amount || 0,
      status: o.status || "pending",
      payment: o.payment || o.paymentStatus || "pending",
      date: o.date || o.createdAt || o.created_at || new Date().toISOString(),
    }));
  }, [ordersData]);

  // Summary derived from KPI data or orders
  const summary = useMemo(() => {
    const kpi = kpiData?.kpis || kpiData || {};
    const totalOrders = kpi.totalOrders ?? orders.length;
    const pending = kpi.pending ?? orders.filter((o) => o.status === "pending").length;
    const processing = kpi.processing ?? orders.filter((o) => o.status === "processing").length;
    const revenueToday = kpi.revenueToday || (orders.length > 0
      ? formatNaira(orders.reduce((sum, o) => sum + o.total, 0))
      : "₦0");
    return { totalOrders, pending, processing, revenueToday };
  }, [kpiData, orders]);

  // Tab counts derived from orders
  const tabs: { key: TabKey; label: string; count: number }[] = useMemo(() => {
    const counts = { all: orders.length, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach((o) => { if (counts[o.status] !== undefined) counts[o.status]++; });
    // Use KPI totals if available (they may reflect full dataset, not just current page)
    const kpi = kpiData?.kpis || kpiData || {};
    return [
      { key: "all" as TabKey,        label: "All Orders", count: kpi.totalOrders ?? counts.all },
      { key: "pending" as TabKey,    label: "Pending",    count: kpi.pending ?? counts.pending },
      { key: "processing" as TabKey, label: "Processing", count: kpi.processing ?? counts.processing },
      { key: "shipped" as TabKey,    label: "Shipped",    count: kpi.shipped ?? counts.shipped },
      { key: "delivered" as TabKey,  label: "Delivered",  count: kpi.delivered ?? counts.delivered },
      { key: "cancelled" as TabKey,  label: "Cancelled",  count: kpi.cancelled ?? counts.cancelled },
    ];
  }, [orders, kpiData]);

  // Filtered orders (client-side search on top of server-filtered data)
  const filtered = useMemo(() => {
    let result = orders;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q)
      );
    }

    return result;
  }, [searchQuery, orders]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (s: TabKey) => {
    setStatusFilter(s);
    setActiveTab("all");
    setCurrentPage(1);
  };

  const handleSearchChange = (v: string) => {
    setSearchQuery(v);
    setCurrentPage(1);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === paginated.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(paginated.map((o) => o.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = paginated.length > 0 && selectedOrders.size === paginated.length;

  // ── Loading State ──────────────────────────────────────────────────────
  if (ordersLoading) {
    return (
      <div className="min-h-screen space-y-6 pb-10">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders</h1>
        </div>
        {/* Summary skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-gray-200 p-5 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                  <div className="h-7 w-16 bg-gray-200 rounded" />
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
        {/* Table skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-4 w-10"><div className="w-4 h-4 bg-gray-200 rounded" /></th>
                  <th className="px-4 py-4"><div className="h-3 w-16 bg-gray-200 rounded" /></th>
                  <th className="px-4 py-4"><div className="h-3 w-20 bg-gray-200 rounded" /></th>
                  <th className="px-4 py-4"><div className="h-3 w-12 bg-gray-200 rounded" /></th>
                  <th className="px-4 py-4"><div className="h-3 w-14 bg-gray-200 rounded" /></th>
                  <th className="px-4 py-4"><div className="h-3 w-16 bg-gray-200 rounded" /></th>
                  <th className="px-4 py-4"><div className="h-3 w-16 bg-gray-200 rounded" /></th>
                  <th className="px-4 py-4"><div className="h-3 w-16 bg-gray-200 rounded" /></th>
                  <th className="px-4 py-4"><div className="h-3 w-10 bg-gray-200 rounded ml-auto" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="w-4 h-4 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full" />
                        <div className="h-4 w-28 bg-gray-200 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-4"><div className="h-4 w-12 bg-gray-100 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-6 w-20 bg-gray-100 rounded-full" /></td>
                    <td className="px-4 py-4"><div className="h-6 w-14 bg-gray-100 rounded-full" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 bg-gray-100 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-6 bg-gray-100 rounded ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────
  if (ordersError) {
    return (
      <div className="min-h-screen space-y-6 pb-10">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle size={28} className="text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Failed to load orders</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Something went wrong while fetching your orders. Please try again.
            </p>
            <button
              onClick={() => { mutateOrders(); mutateKpis(); }}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 shadow-sm transition-colors"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── True Empty State (no orders at all) ────────────────────────────────
  if (orders.length === 0 && !searchQuery.trim() && activeTab === "all" && statusFilter === "all") {
    return (
      <div className="min-h-screen space-y-6 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders</h1>
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 shadow-sm transition-colors self-start sm:self-auto">
            <Plus size={16} />
            New Order
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="w-20 h-20 rounded-2xl bg-green-50 flex items-center justify-center mb-5">
              <ShoppingCart size={36} className="text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">No orders yet</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-md">
              Share your store to start receiving orders. Make sure you have products listed for customers to purchase.
            </p>
            <Link
              href="/dashboard/products"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 shadow-sm transition-colors"
            >
              <Package size={16} />
              View Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 pb-10">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders</h1>
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
            {summary.totalOrders}
          </span>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 shadow-sm transition-colors self-start sm:self-auto">
          <Plus size={16} />
          New Order
        </button>
      </div>

      {/* ── Summary Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<ShoppingCart size={20} />}
          iconBg="bg-green-100 text-green-600"
          label="Total Orders"
          value={summary.totalOrders.toLocaleString()}
          accent="border-l-green-500"
        />
        <SummaryCard
          icon={<Clock size={20} />}
          iconBg="bg-amber-100 text-amber-600"
          label="Pending"
          value={summary.pending.toString()}
          accent="border-l-amber-500"
        />
        <SummaryCard
          icon={<Package size={20} />}
          iconBg="bg-blue-100 text-blue-600"
          label="Processing"
          value={summary.processing.toString()}
          accent="border-l-blue-500"
        />
        <SummaryCard
          icon={<DollarSign size={20} />}
          iconBg="bg-emerald-100 text-emerald-600"
          label="Revenue Today"
          value={typeof summary.revenueToday === 'string' ? summary.revenueToday : formatNaira(summary.revenueToday)}
          accent="border-l-emerald-500"
        />
      </div>

      {/* ── Filter / Search Bar ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value as TabKey)}
              className="appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 cursor-pointer transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 cursor-pointer transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-2 py-1.5">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "bg-green-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              <span
                className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold ${
                  activeTab === tab.key
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Bulk Actions Bar ──────────────────────────────────────────────── */}
      {selectedOrders.size > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-3 flex items-center justify-between">
          <p className="text-sm font-medium text-green-800">
            {selectedOrders.size} order{selectedOrders.size > 1 ? "s" : ""} selected
          </p>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-green-200 text-sm text-green-700 font-medium hover:bg-green-50 transition-colors">
              <CheckCircle2 size={14} />
              Mark Delivered
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-green-200 text-sm text-green-700 font-medium hover:bg-green-50 transition-colors">
              <Download size={14} />
              Export
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-red-200 text-sm text-red-600 font-medium hover:bg-red-50 transition-colors">
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* ── Orders Table ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Package size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">No orders found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Try adjusting your search or filters to find what you are looking for.
            </p>
          </div>
        )}

        {/* Table */}
        {filtered.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-4 w-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        aria-label="Select all orders on this page"
                        className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500/20 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((order) => {
                    const sc = STATUS_CONFIG[order.status];
                    const pc = PAYMENT_CONFIG[order.payment];
                    const isSelected = selectedOrders.has(order.id);

                    return (
                      <tr
                        key={order.id}
                        className={`group transition-colors cursor-pointer ${
                          isSelected ? "bg-green-50/50" : "hover:bg-gray-50/80"
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-5 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(order.id)}
                            aria-label={`Select order ${order.id}`}
                            className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500/20 cursor-pointer"
                          />
                        </td>

                        {/* Order ID */}
                        <td className="px-4 py-4">
                          <span className="text-sm font-semibold text-gray-900">{order.id}</span>
                        </td>

                        {/* Customer with avatar initials */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${order.avatarBg}`}
                            >
                              {order.initials}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{order.customer}</span>
                          </div>
                        </td>

                        {/* Items count */}
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600">
                            {order.itemCount} item{order.itemCount > 1 ? "s" : ""}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="px-4 py-4">
                          <span className="text-sm font-semibold text-gray-900">{formatNaira(order.total)}</span>
                        </td>

                        {/* Status badge */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {sc.label}
                          </span>
                        </td>

                        {/* Payment */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${pc.bg} ${pc.text}`}
                          >
                            {pc.label}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-500">{formatDate(order.date)}</span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-right">
                          <button
                            className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors opacity-0 group-hover:opacity-100"
                            title="View order"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/40">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium text-gray-700">
                  {(currentPage - 1) * pageSize + 1}
                </span>
                {"-"}
                <span className="font-medium text-gray-700">
                  {Math.min(currentPage * pageSize, filtered.length)}
                </span>
                {" "}of{" "}
                <span className="font-medium text-gray-700">{filtered.length}</span>
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p, idx, arr) => {
                    const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                    return (
                      <span key={p} className="contents">
                        {showEllipsis && (
                          <span className="px-1.5 text-gray-400 text-sm select-none">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(p)}
                          className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === p
                              ? "bg-green-500 text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {p}
                        </button>
                      </span>
                    );
                  })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Summary Card Component ───────────────────────────────────────────────────

function SummaryCard({
  icon,
  iconBg,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${accent} p-5 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
      </div>
    </div>
  );
}
