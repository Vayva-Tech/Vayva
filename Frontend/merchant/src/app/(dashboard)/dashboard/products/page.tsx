// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { Package, TrendingUp, AlertTriangle, Tag } from "@phosphor-icons/react";
import Link from "next/link";

import { Button, Icon } from "@vayva/ui";
import { PageError } from "@/components/ui/page-error";
import { logger, ErrorCategory } from "@/lib/logger";
import { apiJson } from "@/lib/api-client-shared";
import { formatCurrency } from "@vayva/shared";

import { BulkProductTable } from "@/components/products/BulkProductTable";
import { ProductsFilterBar } from "@/components/products/ProductsFilterBar";
import { ProductsTable } from "@/components/products/ProductsTable";
import { CSVImportModal } from "@/components/products/CSVImportModal";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  published: boolean;
  price: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl: string | null;
  inventory: { available: number; reserved: number } | null;
  variantsCount?: number;
}

interface ProductsResponse {
  items: Product[];
  nextCursor: string | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [filters, setFilters] = useState<any>({
    status: "ALL",
    category: "ALL",
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local search state for debouncing
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || "",
  );
  const debouncedSearch = useDebounce(searchValue, 500);
  const limit = parseInt(searchParams.get("limit") || "20");

  const queryString = useMemo(() => {
    const query = new URLSearchParams();
    query.set("limit", String(limit));
    if (debouncedSearch) query.set("q", debouncedSearch);
    if ((filters as any).status && (filters as any).status !== "ALL") {
      const status = String((filters as any).status).toLowerCase();
      if (status === "active" || status === "published")
        query.set("status", "published");
      if (status === "draft") query.set("status", "draft");
    }
    return query.toString();
  }, [debouncedSearch, (filters as any).status, limit]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiJson<ProductsResponse>(
          `/api/products?${queryString}`,
          {
            signal: controller.signal,
          },
        );

        setProducts(Array.isArray(data?.items) ? data.items : []);
        setNextCursor(data?.nextCursor || null);
      } catch (e: any) {
        const _errMsg = e instanceof Error ? e.message : String(e);
        if (
          controller.signal?.aborted ||
          (e instanceof DOMException && e.name === "AbortError")
        ) {
          return;
        }
        logger.warn("Failed to load products", ErrorCategory.API, {
          error: e,
          app: "merchant",
        });
        setError(_errMsg || "Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    void fetchProducts();
    return () => controller.abort();
  }, [queryString, router]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`/dashboard/products?${params.toString()}`, { scroll: false });
  };

  // Reset pagination when filters change to avoid empty pages or jumps
  const handleFilterChange = (next: any) => {
    setFilters(next);
  };

  const handleImport = async (data: Record<string, string>[]) => {
    setImportLoading(true);
    try {
      const result = await apiJson<{
        success: boolean;
        imported: number;
        failed: number;
        errors: { row: number; error: string }[];
      }>("/api/products/import", {
        method: "POST",
        body: JSON.stringify({ products: data }),
      });

      if (result.success) {
        logger.info(`Imported ${result.imported} products`, { app: "merchant" });
        router.refresh();
      } else {
        logger.error("Import failed", { app: "merchant" });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[IMPORT_ERROR]", { error: errMsg, app: "merchant" });
    } finally {
      setImportLoading(false);
      setIsImportModalOpen(false);
    }
  };

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const data = await apiJson<ProductsResponse>(
        `/api/products?${queryString}&cursor=${encodeURIComponent(nextCursor)}`,
      );
      const more = Array.isArray(data?.items) ? data.items : [];
      setProducts((prev) => [...prev, ...more]);
      setNextCursor(data?.nextCursor || null);
    } catch (e: any) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      logger.error("[LOAD_MORE_PRODUCTS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      setError(_errMsg || "Failed to load more products");
    } finally {
      setLoadingMore(false);
    }
  };

  // Calculate summary metrics from products
  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.published).length;
  const draftProducts = products.filter((p) => !p.published).length;
  const lowStockProducts = products.filter((p) => (p.inventory?.available || 0) <= 5).length;
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + Number(p.price || 0) * Number(p.inventory?.available || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your store catalog</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
            className="rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium"
          >
            <Icon name="Upload" size={16} className="mr-2 text-gray-400" />
            Import CSV
          </Button>
          <Link href="/dashboard/products/new">
            <Button className="rounded-xl gap-2 bg-green-500 hover:bg-green-600 px-5 font-medium">
              <Icon name="Plus" size={16} />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <PageError
          title="Failed to load products"
          message={error}
          onRetry={() => router.refresh()}
        />
      )}

      {/* Summary Widgets - Following spec Section 5.3 */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SummaryWidget
            icon={<Package size={18} />}
            label="Total Products"
            value={String(totalProducts)}
            trend="+12%"
            positive
          />
          <SummaryWidget
            icon={<Tag size={18} />}
            label="Published"
            value={String(publishedProducts)}
            subValue={`${draftProducts} drafts`}
            trend="+8%"
            positive
          />
          <SummaryWidget
            icon={<AlertTriangle size={18} />}
            label="Low Stock"
            value={String(lowStockProducts)}
            trend="-3%"
            positive={false}
          />
          <SummaryWidget
            icon={<TrendingUp size={18} />}
            label="Inventory Value"
            value={formatCurrency(totalInventoryValue, "NGN")}
            trend="+15%"
            positive
          />
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="bg-gray-100 rounded-2xl h-96 animate-pulse" />
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <>
          {/* Tab Navigation */}
          {products.length > 0 && (
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-6">
                <button className="text-sm font-medium border-b-2 border-green-500 text-green-600 pb-3 -mb-3.5 transition-colors">
                  All Products
                </button>
                <button className="text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 pb-3 -mb-3.5 transition-colors">
                  Published
                </button>
                <button className="text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 pb-3 -mb-3.5 transition-colors">
                  Draft
                </button>
                <button className="text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 pb-3 -mb-3.5 transition-colors">
                  Archived
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  <Icon name="Filter" size={14} />
                  Filter
                </button>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          {isBulkMode ? (
            <BulkProductTable initialProducts={products} />
          ) : (
            <>
              <ProductsFilterBar
                search={searchValue}
                onSearch={handleSearch}
                filters={filters}
                onFilterChange={handleFilterChange}
                onRefresh={() => router.refresh()}
              />

              {/* Empty State */}
              {products.length === 0 ? (
                <div className="max-w-3xl mx-auto py-16">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Package size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      No products added
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      You haven&apos;t added any products to your store yet.
                    </p>
                    <Link href="/dashboard/products/new">
                      <Button className="rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium px-6">
                        <Icon name="Plus" size={16} className="mr-2" />
                        Add Your First Product
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Products Count */}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-500 font-medium">
                      Showing {products.length} product{products.length !== 1 ? "s" : ""}
                      {nextCursor ? "+" : ""}
                    </p>
                  </div>

                  {/* Products Table */}
                  <ProductsTable
                    products={products}
                    nextCursor={nextCursor}
                    isLoadingMore={loadingMore}
                    onLoadMore={handleLoadMore}
                  />
                </>
              )}
            </>
          )}

          {/* Mobile FAB */}
          {!isBulkMode && products.length > 0 && (
            <div className="fixed bottom-28 right-6 md:hidden flex flex-col gap-3">
              <Button
                size="icon"
                variant="secondary"
                className="h-14 w-14 rounded-full shadow-lg bg-white border border-gray-200"
                onClick={() => setIsImportModalOpen(true)}
              >
                <Icon name="Upload" className="w-6 h-6 text-gray-600" />
              </Button>
              <Link href="/dashboard/products/new">
                <Button
                  size="icon"
                  variant="primary"
                  className="h-14 w-14 rounded-full shadow-lg bg-green-500 hover:bg-green-600"
                >
                  <Icon name="Plus" className="w-6 h-6 text-white" />
                </Button>
              </Link>
            </div>
          )}
        </>
      )}

      {/* Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}

// Summary Widget Component
function SummaryWidget({
  icon,
  label,
  value,
  subValue,
  trend,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  trend: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
            {value}
          </p>
          {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
      <div className={`flex items-center text-sm font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
        <span>{trend}</span>
        <span className="ml-1">{positive ? '↗' : '↘'}</span>
      </div>
    </div>
  );
}
