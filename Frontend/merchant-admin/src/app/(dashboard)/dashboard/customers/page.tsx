"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Customer, CustomerStatus, logger, formatCurrency } from "@vayva/shared";
import { apiJson } from "@/lib/api-client-shared";
import { Button } from "@vayva/ui";
import {
  Users,
  MagnifyingGlass as Search,
  ArrowUpRight,
  TrendUp,
  UserPlus,
  ShoppingBag,
  Crown,
} from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { useStore } from "@/context/StoreContext";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardMetricCard,
  DashboardPageHeader,
  DashboardGrid,
} from "@/components/ui/DashboardCard";
import { cn } from "@/lib/utils";

interface CustomerApiItem {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  ordersCount?: number;
  totalSpend?: number;
  lastOrderAt?: string;
  createdAt?: string;
}

interface CustomersResponse {
  items: CustomerApiItem[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { store } = useStore();
  const currency = store?.currency || "NGN";

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const controller = new AbortController();

    try {
      const data = await apiJson<CustomersResponse>("/api/customers?limit=50", {
        signal: controller.signal,
      });
      const items = Array.isArray(data?.items) ? data.items : [];

      const mapped: Customer[] = items.map((c: CustomerApiItem) => {
        const totalOrders = Number(c.ordersCount || 0);
        const totalSpend = Number(c.totalSpend || 0);
        let status = CustomerStatus.NEW;
        if (totalOrders > 5) status = CustomerStatus.VIP;
        else if (totalOrders > 1) status = CustomerStatus.RETURNING;

        return {
          id: c.id,
          name: c.name || "Guest",
          email: c.email || "",
          phone: c.phone || "",
          totalOrders,
          totalSpend,
          status,
          lastSeenAt: c.lastOrderAt || c.createdAt || "",
          joinedAt: c.createdAt || "",
          merchantId: "",
          firstSeenAt: c.createdAt || "",
          avatarUrl: null,
        };
      });
      setCustomers(mapped);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const message =
        err instanceof Error ? err.message : "Failed to load customers";
      logger.error("[FETCH_CUSTOMERS_ERROR]", {
        error: message,
        app: "merchant",
      });
      setError(message);
      toast.error(message);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = customers.length;
    const vip = customers.filter((c) => c.status === CustomerStatus.VIP).length;
    const returning = customers.filter(
      (c) => c.status === CustomerStatus.RETURNING
    ).length;
    const newCustomers = customers.filter(
      (c) => c.status === CustomerStatus.NEW
    ).length;
    const totalSpend = customers.reduce((sum, c) => sum + (c.totalSpend || 0), 0);

    return {
      total,
      vip,
      returning,
      newCustomers,
      totalSpend,
    };
  }, [customers]);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    const query = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query)
    );
  }, [customers, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardPageHeader title="Customers" subtitle="Manage your customer base" />
        <DashboardGrid>
          <div className="col-span-3">
            <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          </div>
          <div className="col-span-3">
            <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          </div>
          <div className="col-span-3">
            <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          </div>
          <div className="col-span-3">
            <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          </div>
          <div className="col-span-12">
            <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
          </div>
        </DashboardGrid>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <DashboardPageHeader title="Customers" subtitle="Manage your customer base" />
        <DashboardCard className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Failed to load customers
          </h3>
          <p className="text-sm text-slate-500 mb-4">{error}</p>
          <Button onClick={fetchCustomers} className="rounded-xl bg-slate-900 hover:bg-slate-800">
            Try Again
          </Button>
        </DashboardCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Customers"
        subtitle="Manage your customer base"
        action={
          <Button
            onClick={fetchCustomers}
            variant="outline"
            className="rounded-xl gap-2"
          >
            <Users className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      {/* Metrics Grid */}
      <DashboardGrid>
        <div className="col-span-3">
          <DashboardMetricCard
            label="Total Customers"
            value={String(metrics.total)}
            trend="up"
            change="↗ +12%"
          />
        </div>
        <div className="col-span-3">
          <DashboardMetricCard
            label="VIP Customers"
            value={String(metrics.vip)}
            trend="up"
            change="↗ +5%"
          />
        </div>
        <div className="col-span-3">
          <DashboardMetricCard
            label="Returning"
            value={String(metrics.returning)}
            trend="neutral"
            change="↗ +8%"
          />
        </div>
        <div className="col-span-3">
          <DashboardMetricCard
            label="Total Revenue"
            value={formatCurrency(metrics.totalSpend, currency)}
            trend="up"
            change="↗ +18%"
          />
        </div>
      </DashboardGrid>

      {/* Search and Customer List */}
      <DashboardCard>
        <DashboardCardHeader
          title="Customer List"
          icon={Users}
          action={
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent w-64"
              />
            </div>
          }
        />

        {/* Customer Table */}
        <div className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Last Order
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    {searchQuery ? (
                      <div>
                        <Search className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                        <p>No customers found matching "{searchQuery}"</p>
                      </div>
                    ) : (
                      <div>
                        <UserPlus className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                        <p>No customers yet</p>
                        <p className="text-sm text-slate-400 mt-1">
                          Customers will appear here when they place orders
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-slate-600">
                            {customer.name?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {customer.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {customer.email || customer.phone || "No contact"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
                          customer.status === CustomerStatus.VIP &&
                            "bg-amber-100 text-amber-700",
                          customer.status === CustomerStatus.RETURNING &&
                            "bg-emerald-100 text-emerald-700",
                          customer.status === CustomerStatus.NEW &&
                            "bg-blue-100 text-blue-700"
                        )}
                      >
                        {customer.status === CustomerStatus.VIP && (
                          <Crown className="h-3 w-3" />
                        )}
                        {customer.status === CustomerStatus.RETURNING && (
                          <TrendUp className="h-3 w-3" />
                        )}
                        {customer.status === CustomerStatus.NEW && (
                          <UserPlus className="h-3 w-3" />
                        )}
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-slate-900">
                        <ShoppingBag className="h-4 w-4 text-slate-400" />
                        {customer.totalOrders}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-900">
                      {formatCurrency(customer.totalSpend || 0, currency)}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-500">
                      {customer.lastSeenAt
                        ? new Date(customer.lastSeenAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg text-slate-500 hover:text-slate-900"
                      >
                        View
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
}
