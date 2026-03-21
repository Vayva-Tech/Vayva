// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";
import { Spinner as Loader, Package, TrendingUp, DollarSign, Clock } from "@phosphor-icons/react";
import { UnifiedOrder, OrderType, UnifiedOrderStatus } from "@vayva/shared";

import { Button, Icon } from "@vayva/ui";
import { PageError } from "@/components/ui/page-error";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { formatCurrency } from "@vayva/shared";

import { FilterBar } from "@/components/orders/FilterBar";
import { RetailOrdersView } from "@/components/orders/RetailOrdersView";
import { FoodOrdersKanban } from "@/components/orders/FoodOrdersKanban";
import { ServiceBookingsView } from "@/components/orders/ServiceBookingsView";
import { OrderDetailsDrawer } from "@/components/orders/OrderDetailsDrawer";
import { ZeroOrdersState } from "@/components/orders/ZeroOrdersState";
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

  // Calculate summary metrics from orders
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const processingOrders = orders.filter((o) => o.status === "processing" || o.status === "confirmed").length;
  const completedOrders = orders.filter((o) => o.status === "completed" || o.status === "delivered").length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track all your orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium">
            <Icon name="Settings" size={16} className="mr-2 text-gray-400" />
            Manage
          </Button>
          <Link href="/dashboard/orders/new">
            <Button className="rounded-xl gap-2 bg-green-500 hover:bg-green-600 px-5 font-medium">
              <Icon name="Plus" size={16} />
              Create Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <PageError
          title="Failed to load orders"
          message={error.message || "An error occurred while fetching orders."}
          onRetry={() => void fetchFirstPage()}
        />
      )}

      {/* Summary Widgets - Following spec Section 5.2 */}
      {!isLoading && orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SummaryWidget
            icon={<Package size={18} />}
            label="Total Orders"
            value={String(totalOrders)}
            trend="+12%"
            positive
          />
          <SummaryWidget
            icon={<Clock size={18} />}
            label="Pending"
            value={String(pendingOrders)}
            trend="+3%"
            positive={false}
          />
          <SummaryWidget
            icon={<TrendingUp size={18} />}
            label="Processing"
            value={String(processingOrders)}
            trend="+8%"
            positive
          />
          <SummaryWidget
            icon={<DollarSign size={18} />}
            label="Total Revenue"
            value={formatCurrency(totalRevenue, store?.currency || "NGN")}
            trend="+15%"
            positive
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="bg-gray-100 rounded-2xl h-96 animate-pulse" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && orders.length === 0 && !isFiltered && (
        <div className="max-w-3xl mx-auto py-16">
          <ZeroOrdersState />
          <div className="mt-8 flex justify-center">
            <Link href="/dashboard/orders/new">
              <Button className="rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium px-6">
                <Icon name="Plus" size={16} className="mr-2" />
                Create Your First Order
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Industry Specific View */}
      {!isLoading && orders.length > 0 && (
        <>
          {/* Tab Navigation */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-6">
              <button className="text-sm font-medium border-b-2 border-green-500 text-green-600 pb-3 -mb-3.5 transition-colors">
                All Orders
              </button>
              <button className="text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 pb-3 -mb-3.5 transition-colors">
                Pending
              </button>
              <button className="text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 pb-3 -mb-3.5 transition-colors">
                Processing
              </button>
              <button className="text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 pb-3 -mb-3.5 transition-colors">
                Completed
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                <Icon name="Filter" size={14} />
                Filter
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <FilterBar
            onFilterChange={handleFilterChange}
            onSearch={handleSearchChange}
            onRefresh={handleRefresh}
          />

          {/* Main Content */}
          <div className="min-h-[400px]">
            {industrySlug === "food" ? (
              <FoodOrdersKanban orders={orders as any} onSelect={handleSelectOrder} />
            ) : industrySlug === "services" ||
              industrySlug === "travel_hospitality" ||
              industrySlug === "creative_portfolio" ? (
              <ServiceBookingsView orders={orders as any} onSelect={handleSelectOrder} />
            ) : (
              <RetailOrdersView orders={orders as any} onSelect={handleSelectOrder} />
            )}
          </div>
        </>
      )}

      {/* Cursor Pagination */}
      {!isLoading && nextCursor && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => void fetchMore()}
            variant="outline"
            className="rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium"
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin text-gray-400" />
                Loading...
              </>
            ) : (
              <>
                Load More Orders
                <Icon name="ArrowRight" size={14} className="ml-2" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* Order Details Drawer */}
      {selectedOrder && (
        <OrderDetailsDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

// Summary Widget Component
function SummaryWidget({
  icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
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
