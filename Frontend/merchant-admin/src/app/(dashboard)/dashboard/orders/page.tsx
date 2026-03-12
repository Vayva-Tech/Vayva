"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";
import { Spinner as Loader2 } from "@phosphor-icons/react";
import { UnifiedOrder, OrderType, UnifiedOrderStatus } from "@vayva/shared";

import { Button } from "@vayva/ui";
import { PageError } from "@/components/ui/page-error";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";

import { FilterBar } from "@/components/orders/FilterBar";
import { RetailOrdersView } from "@/components/orders/RetailOrdersView";
import { FoodOrdersKanban } from "@/components/orders/FoodOrdersKanban";
import { ServiceBookingsView } from "@/components/orders/ServiceBookingsView";
import { OrderDetailsDrawer } from "@/components/orders/OrderDetailsDrawer";
import { ZeroOrdersState } from "@/components/orders/ZeroOrdersState";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { PageSkeleton } from "@/components/ui/page-skeleton";

import { apiJson } from "@/lib/api-client-shared";

import { OrderRow, OrderFilters, OrdersApiResponse } from "@/types/orders";

export default function OrdersPage() {
  const { merchant } = useAuth();
  const { store } = useStore();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<OrderFilters>({});
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [selectedOrder, setSelectedOrder] = useState<UnifiedOrder | null>(null);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  const [items, setItems] = useState<OrderRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const queryString = useMemo(() => {
    const queryParams = new URLSearchParams();
    if ((filters as any).status && (filters as any).status !== "ALL")
      queryParams.append("status", (filters as any).status);
    if (filters.paymentStatus && filters.paymentStatus !== "ALL")
      queryParams.append("paymentStatus", filters.paymentStatus);
    if (debouncedSearch) queryParams.append("q", debouncedSearch);
    queryParams.append("limit", String(limit));
    return queryParams.toString();
  }, [debouncedSearch, filters.paymentStatus, (filters as any).status, limit]);

  const fetchFirstPage = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiJson<OrdersApiResponse>(
        `/api/orders?${queryString}`,
      );
      // standardized response uses data, legacy uses items
      setItems(res.data || res.items || []);
      // Note: API response includes cursor in meta object for pagination consistency
      setNextCursor(res.nextCursor || null); 
    } catch (e: any) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    setError(null);
    try {
      const res = await apiJson<OrdersApiResponse>(
        `/api/orders?${queryString}&cursor=${encodeURIComponent(nextCursor)}`,
      );
      setItems((prev) => [...prev, ...(res.data || res.items || [])]);
      setNextCursor(res.nextCursor || null);
    } catch (e: any) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    void fetchFirstPage();
      }, [queryString]);

  const industrySlug =
    store?.industrySlug || merchant?.industrySlug || "retail";
  const orders: OrderRow[] = items;

  const isFiltered = !!((filters as any).status && (filters as any).status !== "ALL") || !!search;

  if (error) {
    return (
      <DashboardPageShell title="Orders" description="Manage and track your orders">
        <PageError
          title="Failed to load orders"
          message={error.message || "An error occurred while fetching orders."}
          onRetry={() => void fetchFirstPage()}
        />
      </DashboardPageShell>
    );
  }

  const handleRefresh = () => {
    void fetchFirstPage();
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleFilterChange = (next: any) => {
    setFilters(next);
  };

  const handleSelectOrder = (order: any) => {
    // Map OrderRow to UnifiedOrder for the drawer
    const unified: UnifiedOrder = {
      id: order.id,
      merchantId: merchant?.merchantId || "",
      type:
        industrySlug === "food"
          ? OrderType.FOOD
          : industrySlug === "services"
            ? OrderType.SERVICE
            : OrderType.RETAIL,
      status: (order as any).status as UnifiedOrderStatus,
      paymentStatus: order.paymentStatus as "paid" | "pending" | "failed" | "cod",
      customer: {
        id: order.customer?.email || order.customer?.phone || order.id,
        name: order.customer?.name,
        phone: order.customer?.phone || "",
      },
      items: [], // We don't have items in the list view, drawer should handle empty or fetch
      totalAmount: order.total,
      currency: order.currency,
      source: "website",
      timestamps: {
        createdAt: order.createdAt,
        updatedAt: order.createdAt,
      },
    };
    setSelectedOrder(unified);
  };

  const renderIndustryView = () => {
  if (isLoading) {
    return (
      <DashboardPageShell title="Orders" description="Manage and track your orders">
        <PageSkeleton variant="table" rows={5} />
      </DashboardPageShell>
    );
  }

  if (orders.length === 0 && !isFiltered) {
    return (
      <DashboardPageShell 
        title="Orders" 
        description="Manage and track your orders"
        actions={
          <Link href="/dashboard/orders/new">
            <Button>Create Order</Button>
          </Link>
        }
      >
        <ZeroOrdersState />
      </DashboardPageShell>
    );
  }

    switch (industrySlug) {
      case "food":
        return (
          <FoodOrdersKanban orders={orders as any} onSelect={handleSelectOrder} />
        );
      case "services":
      case "travel_hospitality":
      case "creative_portfolio":
        return (
          <ServiceBookingsView orders={orders as any} onSelect={handleSelectOrder} />
        );
      default:
        return (
          <RetailOrdersView orders={orders as any} onSelect={handleSelectOrder} />
        );
    }
  };

  return (
    <DashboardPageShell 
      title="Orders" 
      description="Manage and track your orders"
      actions={
        <Link href="/dashboard/orders/new">
          <Button>Create Order</Button>
        </Link>
      }
    >
      {/* Live region for screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isLoading && <p>Loading orders...</p>}
        {isLoadingMore && <p>Loading more orders...</p>}
      </div>
      {/* Filter Bar */}
      <FilterBar
        onFilterChange={handleFilterChange}
        onSearch={handleSearchChange}
        onRefresh={handleRefresh}
      />

      {/* Industry Specific View */}
      <div aria-live="polite" aria-atomic="true" className="min-h-[400px]">{renderIndustryView()}</div>

      {/* Cursor pagination */}
      {nextCursor && (
        <div className="mt-4">
          <Button
            onClick={() => void fetchMore()}
            variant="outline"
            className="rounded-xl"
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}

      {/* Selection Drawer (Optional if navigation is preferred) */}
      {selectedOrder && (
        <OrderDetailsDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </DashboardPageShell>
  );
}
