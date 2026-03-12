"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { PlusCircle } from "@phosphor-icons/react/ssr";
import Link from "next/link";

import { Button, Icon } from "@vayva/ui";
import { EmptyState } from "@/components/ui/empty-state";
import { PageError } from "@/components/ui/page-error";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { logger, ErrorCategory } from "@/lib/logger";
import { apiJson } from "@/lib/api-client-shared";

import { BulkProductTable } from "@/components/products/BulkProductTable";
import { ProductsHeader } from "@/components/products/ProductsHeader";
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

  if (error) {
    return (
      <DashboardPageShell title="Products" description="Manage your store products">
        <div className="p-6">
          <PageError
            title="Failed to load products"
            message={error}
            onRetry={() => router.refresh()}
          />
        </div>
      </DashboardPageShell>
    );
  }

  if (loading) {
    return (
      <DashboardPageShell title="Products" description="Manage your store products">
        <div className="p-6">
          <PageSkeleton variant="table" rows={5} />
        </div>
      </DashboardPageShell>
    );
  }

  if (products.length === 0 && !searchValue) {
    return (
      <DashboardPageShell 
        title="Products" 
        description="Manage your store products"
        actions={
          <Link href="/dashboard/products/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        }
      >
        <EmptyState
          title="No products added"
          description="You haven't added any products to your store yet."
          actionLabel="Add Product"
          actionHref="/dashboard/products/new"
          icon="Package"
        />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell 
      title="Products" 
      description="Manage your store products"
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
          >
            <Icon name="Upload" className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Link href="/dashboard/products/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      }
    >
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

          {products.length > 0 && (
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-text-tertiary font-medium">
                Showing {products.length} product
                {products.length !== 1 ? "s" : ""}
                {nextCursor ? "+" : ""}
              </p>
            </div>
          )}

          {products.length === 0 ? (
            <div className="bg-background/70 backdrop-blur-xl rounded-xl border border-dashed border-border/60 p-12 flex flex-col items-center justify-center text-center">
              <Icon
                name="SearchX"
                size={32}
                className="text-text-tertiary mb-3"
              />
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                No products found
              </h3>
              <p className="text-xs text-text-tertiary mb-4">
                Try a different search term or clear your filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => handleSearch("")}
              >
                <Icon name="X" className="mr-1.5 h-3.5 w-3.5" />
                Clear search
              </Button>
            </div>
          ) : (
            <ProductsTable
              products={products}
              nextCursor={nextCursor}
              isLoadingMore={loadingMore}
              onLoadMore={handleLoadMore}
            />
          )}

          {/* Mobile FAB */}
          <div className="fixed bottom-28 right-6 md:hidden flex flex-col gap-3">
            <Button
              size="icon"
              variant="secondary"
              className="h-14 w-14 rounded-full shadow-lg"
              onClick={() => setIsImportModalOpen(true)}
            >
              <Icon name="Upload" className="w-6 h-6" />
            </Button>
            <Link href="/dashboard/products/new">
              <Button
                size="icon"
                variant="primary"
                className="h-14 w-14 rounded-full shadow-lg"
              >
                <PlusCircle className="w-6 h-6" />
              </Button>
            </Link>
          </div>
        </>
      )}

      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />
    </DashboardPageShell>
  );
}
