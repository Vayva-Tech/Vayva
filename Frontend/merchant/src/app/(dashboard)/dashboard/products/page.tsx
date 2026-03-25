"use client";
import { Button } from "@vayva/ui";

import { useState, useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageWithInsights } from "@/components/layout/PageWithInsights";
import {
  Search,
  Plus,
  Upload,
  Download,
  Package,
  CheckCircle,
  FileText,
  AlertTriangle,
  LayoutGrid,
  List,
  Filter,
  ArrowUpDown,
  Pencil,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type ProductStatus = "active" | "draft" | "archived";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: ProductStatus;
  category: string;
  color: string;
  sku: string;
  dateAdded: string;
}

// ── SWR Fetcher ──────────────────────────────────────────────────────────────

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

// ── Color helpers ────────────────────────────────────────────────────────────

const PRODUCT_COLORS = [
  "bg-orange-400", "bg-purple-500", "bg-indigo-400", "bg-red-400",
  "bg-emerald-500", "bg-amber-500", "bg-teal-400", "bg-sky-400",
  "bg-pink-400", "bg-cyan-500", "bg-rose-400", "bg-violet-500",
];

function getProductColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PRODUCT_COLORS[Math.abs(hash) % PRODUCT_COLORS.length];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ProductStatus, { label: string; bg: string; text: string; dot: string }> = {
  active:   { label: "Active",   bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  draft:    { label: "Draft",    bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400" },
  archived: { label: "Archived", bg: "bg-gray-100",   text: "text-gray-600",    dot: "bg-gray-400" },
};

function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);
}

// ── Page Component ───────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ProductStatus>("all");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const pageSize = 6;

  // ── SWR Data Fetching ──────────────────────────────────────────────────
  const { data: productsData, error, isLoading, mutate } = useSWR(
    "/api/products",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  const products: Product[] = useMemo(() => {
    if (!productsData?.products && !productsData?.items && !Array.isArray(productsData)) return [];
    const raw = productsData?.products || productsData?.items || productsData || [];
    return raw.map((p: any) => ({
      id: p.id || p._id || "",
      name: p.name || p.title || "",
      price: p.price || 0,
      stock: p.stock ?? p.inventory ?? 0,
      status: p.status || "active",
      category: p.category || "Uncategorized",
      color: p.color || getProductColor(p.name || p.title || ""),
      sku: p.sku || p.id || "",
      dateAdded: p.dateAdded || p.createdAt || p.created_at || new Date().toISOString(),
    }));
  }, [productsData]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return ["all", ...cats];
  }, [products]);

  // Summary stats derived from data
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "active").length;
  const draftProducts = products.filter((p) => p.status === "draft").length;
  const outOfStockProducts = products.filter((p) => p.stock === 0).length;

  // Filter and sort
  const filtered = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return b.price - a.price;
        case "stock":
          return b.stock - a.stock;
        case "date":
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [searchQuery, categoryFilter, statusFilter, sortBy, products]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSearchChange = (v: string) => {
    setSearchQuery(v);
    setCurrentPage(1);
  };

  const handleStatusChange = (s: "all" | ProductStatus) => {
    setStatusFilter(s);
    setCurrentPage(1);
  };

  const handleCategoryChange = (c: string) => {
    setCategoryFilter(c);
    setCurrentPage(1);
  };

  // ── Loading State ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen space-y-6 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
            <p className="text-sm text-gray-500 mt-1">Loading your catalog...</p>
          </div>
        </div>
        {/* Summary skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                  <div className="h-7 w-12 bg-gray-200 rounded" />
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
        {/* Product card skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
              <div className="bg-gray-200 h-48 w-full" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-5 w-1/2 bg-gray-200 rounded" />
                <div className="flex items-center justify-between">
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                  <div className="h-5 w-20 bg-gray-100 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen space-y-6 pb-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle size={28} className="text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Failed to load products</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Something went wrong while fetching your products. Please try again.
            </p>
            <Button
              onClick={() => mutate()}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 shadow-sm transition-colors"
            >
              <RefreshCw size={16} />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── True Empty State (no products at all) ──────────────────────────────
  if (products.length === 0 && !searchQuery.trim() && categoryFilter === "all" && statusFilter === "all") {
    return (
      <div className="min-h-screen space-y-6 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
            <p className="text-sm text-gray-500 mt-1">0 products in your catalog</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="w-24 h-24 rounded-2xl bg-green-50 flex items-center justify-center mb-5">
              <Plus size={48} className="text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Add your first product</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-md">
              Get started by adding products to your catalog. You can add them one by one or import in bulk.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <Link
                href="/dashboard/products/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 shadow-sm transition-colors"
              >
                <Plus size={16} />
                Add Product
              </Link>
              <Button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition-colors">
                <Upload size={15} />
                Import
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 pb-10">
      <PageWithInsights
        insights={
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick actions
              </div>
              <div className="mt-3 grid gap-2">
                <Link
                  href="/dashboard/products/new"
                  className="inline-flex items-center justify-between rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
                >
                  <span>Add product</span>
                  <Plus size={16} />
                </Link>
                <Link
                  href="/dashboard/analytics"
                  className="inline-flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  <span>Catalog analytics</span>
                  <ArrowUpDown className="w-4 h-4 text-gray-400 rotate-90" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                KPI snapshot
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                  <div className="text-xs text-gray-500">Active</div>
                  <div className="text-lg font-bold text-gray-900 mt-0.5">
                    {activeProducts}
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                  <div className="text-xs text-gray-500">Out of stock</div>
                  <div className="text-lg font-bold text-gray-900 mt-0.5">
                    {outOfStockProducts}
                  </div>
                </div>
              </div>
            </div>
          </>
        }
      >
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <PageHeader
        title="Products"
        subtitle={`${totalProducts} product${totalProducts !== 1 ? "s" : ""} in your catalog`}
        actions={
          <>
            <Button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition-colors">
              <Upload size={15} />
              Import
            </Button>
            <Button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition-colors">
              <Download size={15} />
              Export
            </Button>
            <Link
              href="/dashboard/products/new"
              className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-600 transition-colors"
            >
              <Plus size={16} />
              Add Product
            </Link>
          </>
        }
      />

      {/* ── Summary Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Package size={20} />}
          iconBg="bg-green-100 text-green-600"
          label="Total Products"
          value={totalProducts.toString()}
          sub="All products"
        />
        <SummaryCard
          icon={<CheckCircle size={20} />}
          iconBg="bg-emerald-100 text-emerald-600"
          label="Active"
          value={activeProducts.toString()}
          sub="Live on store"
        />
        <SummaryCard
          icon={<FileText size={20} />}
          iconBg="bg-amber-100 text-amber-600"
          label="Draft"
          value={draftProducts.toString()}
          sub="Unpublished"
        />
        <SummaryCard
          icon={<AlertTriangle size={20} />}
          iconBg="bg-red-100 text-red-600"
          label="Out of Stock"
          value={outOfStockProducts.toString()}
          sub="Needs restock"
          highlight={outOfStockProducts > 0}
        />
      </div>

      {/* ── View Toggle ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <Button
            onClick={() => setViewMode("grid")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "grid"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LayoutGrid size={15} />
            Grid View
          </Button>
          <Button
            onClick={() => setViewMode("list")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "list"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <List size={15} />
            List View
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-700">{filtered.length}</span> products
        </p>
      </div>

      {/* ── Search and Filters ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, SKU, or category..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 cursor-pointer transition-all"
            >
              <option value="all">All Categories</option>
              {categories.filter((c) => c !== "all").map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value as any)}
              className="appearance-none px-4 pr-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 cursor-pointer transition-all"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 cursor-pointer transition-all"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
              <option value="date">Sort by Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Products Grid ───────────────────────────────────────────────── */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((product) => {
            const sc = STATUS_CONFIG[product.status];
            const isHovered = hoveredProduct === product.id;
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all relative group"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Product Image Placeholder */}
                <div className={`${product.color} h-48 w-full relative`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package size={40} className="text-white/40" />
                  </div>
                  {/* Quick Actions on Hover */}
                  <div
                    className={`absolute inset-0 bg-black/30 flex items-center justify-center gap-2 transition-opacity ${
                      isHovered ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <Button className="p-2 rounded-xl bg-white/90 text-gray-700 hover:bg-white transition-colors" title="Edit" aria-label={`Edit ${product.name}`}>
                      <Pencil size={16} />
                    </Button>
                    <Button className="p-2 rounded-xl bg-white/90 text-gray-700 hover:bg-white transition-colors" title="Duplicate" aria-label={`Duplicate ${product.name}`}>
                      <Copy size={16} />
                    </Button>
                    <Button className="p-2 rounded-xl bg-white/90 text-red-600 hover:bg-white transition-colors" title="Delete" aria-label={`Delete ${product.name}`}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 leading-snug">{product.name}</h3>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{formatNaira(product.price)}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${product.stock === 0 ? "text-red-500" : product.stock <= 5 ? "text-amber-500" : "text-gray-500"}`}>
                      {product.stock === 0 ? "Out of stock" : `${product.stock} in stock`}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                      {product.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Products List View ──────────────────────────────────────────── */}
      {viewMode === "list" && (
        <div className="max-md:bg-transparent max-md:border-0 max-md:shadow-none md:bg-white md:rounded-2xl md:shadow-sm md:border md:border-gray-100 md:overflow-hidden">
          <div className="md:hidden flex flex-col gap-3">
            {paginated.map((product) => {
              const sc = STATUS_CONFIG[product.status];
              return (
                <div
                  key={product.id}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl ${product.color} flex items-center justify-center shrink-0`}
                    >
                      <Package size={18} className="text-white/70" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 leading-snug">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        {product.sku}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                          {product.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-base font-bold text-gray-900">
                        {formatNaira(product.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Stock</p>
                      <p
                        className={`text-sm font-semibold ${product.stock === 0 ? "text-red-500" : product.stock <= 5 ? "text-amber-500" : "text-gray-800"}`}
                      >
                        {product.stock === 0 ? "Out" : product.stock}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        className="min-w-[44px] min-h-[44px] rounded-xl text-gray-500 hover:bg-gray-100 flex items-center justify-center"
                        title="Edit"
                        aria-label={`Edit ${product.name}`}
                      >
                        <Pencil size={18} />
                      </Button>
                      <Button
                        type="button"
                        className="min-w-[44px] min-h-[44px] rounded-xl text-gray-500 hover:bg-gray-100 flex items-center justify-center"
                        title="Duplicate"
                        aria-label={`Duplicate ${product.name}`}
                      >
                        <Copy size={18} />
                      </Button>
                      <Button
                        type="button"
                        className="min-w-[44px] min-h-[44px] rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center"
                        title="Delete"
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1.5 cursor-pointer hover:text-gray-700 transition-colors">
                      Price <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1.5 cursor-pointer hover:text-gray-700 transition-colors">
                      Stock <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((product) => {
                  const sc = STATUS_CONFIG[product.status];
                  return (
                    <tr key={product.id} className="group hover:bg-green-50/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${product.color} flex items-center justify-center flex-shrink-0`}>
                            <Package size={16} className="text-white/60" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 font-mono">{product.sku}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">{formatNaira(product.price)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${product.stock === 0 ? "text-red-500" : product.stock <= 5 ? "text-amber-500" : "text-gray-700"}`}>
                          {product.stock === 0 ? "Out of stock" : product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors" title="Edit">
                            <Pencil size={16} />
                          </Button>
                          <Button className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Duplicate">
                            <Copy size={16} />
                          </Button>
                          <Button className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                            <Trash2 size={16} />
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
      )}

      {/* ── Empty State ─────────────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Package size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">No products found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Try adjusting your search or filters to find what you are looking for.
            </p>
          </div>
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 bg-gray-50/40 rounded-2xl">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium text-gray-700">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-gray-700">
                {Math.min(currentPage * pageSize, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-700">{filtered.length}</span> products
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
                Prev
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => {
                  const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                  return (
                    <span key={p} className="contents">
                      {showEllipsis && (
                        <span className="px-1.5 text-gray-400 text-sm select-none">...</span>
                      )}
                      <Button
                        onClick={() => setCurrentPage(p)}
                        className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === p
                            ? "bg-green-500 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {p}
                      </Button>
                    </span>
                  );
                })}
              <Button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}
      </PageWithInsights>
    </div>
  );
}

// ── Summary Card ──────────────────────────────────────────────────────────────

function SummaryCard({
  icon,
  iconBg,
  label,
  value,
  sub,
  highlight = false,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition-shadow ${
        highlight ? "border-red-200" : "border-gray-100"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
          <p className="text-xs text-gray-400">{sub}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
      </div>
    </div>
  );
}

