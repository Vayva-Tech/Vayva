"use client";
import { Button } from "@vayva/ui";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageWithInsights } from "@/components/layout/PageWithInsights";
import {
  Package,
  PackageCheck,
  AlertTriangle,
  PackageX,
  Plus,
  FileBarChart,
  Search,
  ChevronDown,
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  status: string;
  lastRestocked: string;
}

interface InventoryData {
  summary: {
    totalItems: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
  items: InventoryItem[];
  stockMovement: { day: string; stockIn: number; stockOut: number }[];
  categories: string[];
}

/* ------------------------------------------------------------------ */
/*  SWR Fetcher                                                        */
/* ------------------------------------------------------------------ */

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
});

/* ------------------------------------------------------------------ */
/*  Skeleton Components                                                */
/* ------------------------------------------------------------------ */

function SummaryCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-gray-100 rounded-xl" />
      </div>
      <div className="w-24 h-4 bg-gray-100 rounded mb-2" />
      <div className="w-12 h-7 bg-gray-100 rounded" />
    </div>
  );
}

function InventoryTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <th key={i} className="px-4 py-3.5"><div className="w-16 h-3 bg-gray-100 rounded" /></th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                <td className="px-6 py-4"><div className="w-32 h-4 bg-gray-100 rounded" /></td>
                <td className="px-4 py-4"><div className="w-20 h-4 bg-gray-100 rounded" /></td>
                <td className="px-4 py-4"><div className="w-24 h-4 bg-gray-100 rounded" /></td>
                <td className="px-4 py-4"><div className="w-8 h-4 bg-gray-100 rounded ml-auto" /></td>
                <td className="px-4 py-4"><div className="w-8 h-4 bg-gray-100 rounded ml-auto" /></td>
                <td className="px-4 py-4"><div className="w-16 h-5 bg-gray-100 rounded-full" /></td>
                <td className="px-4 py-4"><div className="w-20 h-4 bg-gray-100 rounded" /></td>
                <td className="px-4 py-4"><div className="w-16 h-4 bg-gray-100 rounded ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const defaultCategories = [
  "All Categories",
  "Traditional Wear",
  "Dresses",
  "Accessories",
  "Streetwear",
  "Casual Wear",
];

const stockStatuses = ["All Status", "In Stock", "Low Stock", "Out of Stock"];

// ── Status badge styling ───────────────────────────────────
function getStatusStyle(status: string) {
  switch (status) {
    case "In Stock":
      return "bg-green-50 text-green-700";
    case "Low Stock":
      return "bg-yellow-50 text-yellow-700";
    case "Out of Stock":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

// ── Stock Movement Chart ───────────────────────────────────
function StockMovementChart({ stockMovement }: { stockMovement: { day: string; stockIn: number; stockOut: number }[] }) {
  if (!stockMovement || stockMovement.length === 0) return null;
  const maxVal = Math.max(
    ...stockMovement.map((d) => Math.max(d.stockIn, d.stockOut))
  );
  const chartWidth = 420;
  const chartHeight = 140;
  const groupWidth = chartWidth / stockMovement.length;
  const barWidth = 18;
  const gap = 4;

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`} className="w-full h-48">
      {stockMovement.map((day, i) => {
        const x = i * groupWidth + (groupWidth - barWidth * 2 - gap) / 2;
        const inHeight = (day.stockIn / maxVal) * chartHeight;
        const outHeight = (day.stockOut / maxVal) * chartHeight;

        return (
          <g key={day.day}>
            <rect
              x={x}
              y={chartHeight - inHeight}
              width={barWidth}
              height={inHeight}
              rx={3}
              fill="#22C55E"
            />
            <rect
              x={x + barWidth + gap}
              y={chartHeight - outHeight}
              width={barWidth}
              height={outHeight}
              rx={3}
              fill="#EF4444"
              opacity={0.6}
            />
            <text
              x={x + barWidth + gap / 2}
              y={chartHeight + 18}
              textAnchor="middle"
              className="fill-gray-500"
              fontSize="11"
            >
              {day.day}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Page Component ─────────────────────────────────────────
export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const { data, error, isLoading, mutate } = useSWR<InventoryData>(
    '/api/products?view=inventory',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  const inventoryItems: InventoryItem[] = data?.items || [];
  const stockMovement = data?.stockMovement || [];
  const categories = data?.categories || defaultCategories;
  const summary = data?.summary;

  const summaryCards = [
    { label: "Total Items", value: summary?.totalItems ?? 0, icon: Package, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "In Stock", value: summary?.inStock ?? 0, icon: PackageCheck, iconBg: "bg-green-50", iconColor: "text-green-600" },
    { label: "Low Stock", value: summary?.lowStock ?? 0, icon: AlertTriangle, iconBg: "bg-yellow-50", iconColor: "text-yellow-600" },
    { label: "Out of Stock", value: summary?.outOfStock ?? 0, icon: PackageX, iconBg: "bg-red-50", iconColor: "text-red-600" },
  ];

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "All Categories" || item.category === categoryFilter;
    const matchesStatus =
      statusFilter === "All Status" || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-red-100 p-8 text-center max-w-md">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Failed to load inventory</h3>
          <p className="text-sm text-gray-500 mb-4">There was a problem fetching your inventory data. Please try again.</p>
          <Button
            onClick={() => mutate()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="animate-pulse">
            <div className="w-32 h-7 bg-gray-100 rounded mb-2" />
            <div className="w-56 h-4 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SummaryCardSkeleton key={i} />)}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 animate-pulse">
          <div className="flex-1 h-10 bg-gray-100 rounded-2xl" />
          <div className="w-40 h-10 bg-gray-100 rounded-2xl" />
          <div className="w-32 h-10 bg-gray-100 rounded-2xl" />
        </div>
        <InventoryTableSkeleton />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
          <div className="w-36 h-5 bg-gray-100 rounded mb-2" />
          <div className="w-56 h-4 bg-gray-100 rounded mb-6" />
          <div className="w-full h-48 bg-gray-50 rounded-xl" />
        </div>
      </div>
    );
  }

  // Empty state
  if (inventoryItems.length === 0) {
    return (
      <div className="space-y-8 pb-12">
        <PageHeader
          title="Inventory"
          subtitle="Track and manage your stock levels"
        />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Package className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No inventory tracked yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mb-4">Add products to start managing inventory</p>
          <Button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Stock
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <PageWithInsights
        insights={
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick actions
              </div>
              <div className="mt-3 grid gap-2">
                <Link
                  href="/dashboard/products"
                  className="inline-flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  <span>Products</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  href="/dashboard/analytics"
                  className="inline-flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  <span>Analytics</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  href="/dashboard/inventory/locations"
                  className="inline-flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  <span>Locations</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                KPI snapshot
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                  <div className="text-xs text-gray-500">Low stock</div>
                  <div className="text-lg font-bold text-gray-900 mt-0.5">
                    {summary?.lowStock ?? 0}
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                  <div className="text-xs text-gray-500">Out of stock</div>
                  <div className="text-lg font-bold text-gray-900 mt-0.5">
                    {summary?.outOfStock ?? 0}
                  </div>
                </div>
              </div>
            </div>
          </>
        }
      >
        <PageHeader
          title="Inventory"
          subtitle="Track and manage your stock levels"
          actions={
            <>
              <Button
                onClick={() => mutate()}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={16} />
                Refresh
              </Button>
              <Button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
                <FileBarChart size={16} />
                Stock Report
              </Button>
              <Button className="inline-flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-600 transition-colors">
                <Plus size={16} />
                Add Stock
              </Button>
            </>
          }
        />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}
                >
                  <Icon size={18} className={card.iconColor} />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {card.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
          />
        </div>
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 rounded-2xl border border-gray-200 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 rounded-2xl border border-gray-200 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
          >
            {stockStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Current Stock
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Reorder Level
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Last Restocked
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item) => {
                const isLowStock = item.status === "Low Stock";
                const isOutOfStock = item.status === "Out of Stock";
                const rowBg = isLowStock ? "bg-yellow-50" : "";

                return (
                  <tr
                    key={item.id}
                    className={`${rowBg} hover:bg-gray-50/70 transition-colors`}
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="px-4 py-4 text-gray-500 font-mono text-xs">
                      {item.sku}
                    </td>
                    <td className="px-4 py-4 text-gray-600">{item.category}</td>
                    <td className="px-4 py-4 text-right font-semibold text-gray-900">
                      {item.currentStock}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-500">
                      {item.reorderLevel}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-500 text-xs">
                      {new Date(item.lastRestocked).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} className="text-gray-500" />
                        </Button>
                        <Button
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Restock"
                        >
                          <RefreshCw size={14} className="text-gray-500" />
                        </Button>
                        <Button
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Movement Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Stock Movement
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Stock in vs stock out over the last 7 days
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-green-500" />
              Stock In
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-red-500 opacity-60" />
              Stock Out
            </div>
          </div>
        </div>
        <StockMovementChart stockMovement={stockMovement} />
      </div>
      </PageWithInsights>
    </div>
  );
}

