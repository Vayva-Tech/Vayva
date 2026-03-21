// @ts-nocheck
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Customer, CustomerStatus, logger, formatCurrency } from "@vayva/shared";
import { apiJson } from "@/lib/api-client-shared";
import { Button, Icon } from "@vayva/ui";
import { Users, TrendUp, UserPlus, ShoppingBag, Crown, Star } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useStore } from "@/context/StoreContext";

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

  // Calculate additional metrics for widgets
  const newThisMonth = customers.filter((c) => {
    const joinedDate = new Date(c.joinedAt);
    const now = new Date();
    return joinedDate.getMonth() === now.getMonth() && joinedDate.getFullYear() === now.getFullYear();
  }).length;

  const repeatRate = customers.length > 0
    ? Math.round(((metrics.returning + metrics.vip) / customers.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your customer relationships</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchCustomers}
            variant="outline"
            className="rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium"
          >
            <Icon name="Refresh" size={16} className="mr-2 text-gray-400" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Icon name="Warning" size={32} className="text-red-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Failed to load customers</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchCustomers} className="rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium px-6">
            Try Again
          </Button>
        </div>
      )}

      {/* Summary Widgets - Following spec Section 5.8 */}
      {!isLoading && customers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SummaryWidget
            icon={<Users size={18} />}
            label="Total Customers"
            value={String(metrics.total)}
            subValue={`${newThisMonth} new this month`}
            trend="+12%"
            positive
          />
          <SummaryWidget
            icon={<Star size={18} />}
            label="Repeat Rate"
            value={`${repeatRate}%`}
            trend="+8%"
            positive
          />
          <SummaryWidget
            icon={<Crown size={18} />}
            label="VIP Customers"
            value={String(metrics.vip)}
            subValue={`${metrics.returning} returning`}
            trend="+5%"
            positive
          />
          <SummaryWidget
            icon={<ShoppingBag size={18} />}
            label="Total Revenue"
            value={formatCurrency(metrics.totalSpend, currency)}
            trend="+18%"
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

      {/* Main Content */}
      {!isLoading && (
        <>
          {/* Tab Navigation */}
          {customers.length > 0 && (
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-6">
                <button className="text-sm font-medium border-b-2 border-green-500 text-green-600 pb-3 -mb-3.5 transition-colors">
                  All Customers
                </button>
                <button className="text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 pb-3 -mb-3.5 transition-colors">
                  New
                </button>
                <button className="text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 pb-3 -mb-3.5 transition-colors">
                  Returning
                </button>
                <button className="text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 pb-3 -mb-3.5 transition-colors">
                  VIP
                </button>
                <button className="text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 pb-3 -mb-3.5 transition-colors">
                  At Risk
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

          {/* Customer List Card */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Search Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Customer List</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? "s" : ""} found
                </p>
              </div>
              <div className="relative">
                <Icon name="MagnifyingGlass" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 w-64"
                />
              </div>
            </div>

            {/* Customer Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Order
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        {searchQuery ? (
                          <div>
                            <Icon name="MagnifyingGlass" size={32} className="mx-auto mb-2 text-gray-400" />
                            <p className="text-sm font-medium text-gray-900 mb-1">No customers found</p>
                            <p className="text-sm text-gray-500">
                              No customers matching &quot;{searchQuery}&quot;
                            </p>
                          </div>
                        ) : (
                          <div>
                            <Icon name="UserPlus" size={32} className="mx-auto mb-2 text-gray-400" />
                            <p className="text-sm font-medium text-gray-900 mb-1">No customers yet</p>
                            <p className="text-sm text-gray-500">
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
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-semibold text-gray-700">
                                {customer.name?.charAt(0) || "?"}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {customer.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {customer.email || customer.phone || "No contact"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              customer.status === CustomerStatus.VIP
                                ? "bg-orange-50 text-orange-600"
                                : customer.status === CustomerStatus.RETURNING
                                ? "bg-green-50 text-green-600"
                                : "bg-gray-50 text-gray-600"
                            }`}
                          >
                            {customer.status === CustomerStatus.VIP && (
                              <Crown size={12} />
                            )}
                            {customer.status === CustomerStatus.RETURNING && (
                              <TrendUp size={12} />
                            )}
                            {customer.status === CustomerStatus.NEW && (
                              <UserPlus size={12} />
                            )}
                            {customer.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-gray-900 font-medium">
                            <ShoppingBag size={16} className="text-gray-400" />
                            {customer.totalOrders}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-gray-900">
                          {formatCurrency(customer.totalSpend || 0, currency)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {customer.lastSeenAt
                            ? new Date(customer.lastSeenAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button className="px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
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
