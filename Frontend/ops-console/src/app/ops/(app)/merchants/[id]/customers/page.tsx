"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { Button } from "@vayva/ui";
import { MagnifyingGlass, Users, Eye, ShoppingBag } from "@phosphor-icons/react/ssr";

interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { orders: number };
  totalSpent: number;
  lastOrder: { total: number } | null;
}

interface Store {
  id: string;
  name: string;
  slug: string;
}

export default function MerchantCustomersPage(): React.JSX.Element {
  const params = useParams();
  const id = params.id as string;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useOpsQuery(
    ["merchant-customers", id, search, String(page)],
    async () => {
      const params = new URLSearchParams();
      if (search) params.append("q", search);
      params.append("page", String(page));
      params.append("limit", "20");

      const res = await fetch(`/api/ops/merchants/${id}/customers?${params}`);
      return res.json();
    }
  );

  const store: Store = data?.store;
  const customers: Customer[] = data?.customers || [];
  const pagination = data?.pagination;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <OpsPageShell
      title={store ? `${store.name} - Customers` : "Merchant Customers"}
      description="View and manage merchant customers"
    >
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Orders</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Total Spent</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Loading customers...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium">
                        {getInitials(customer.name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {customer.name || "Anonymous"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Customer since {new Date(customer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {customer.email && (
                        <p className="text-sm text-gray-600">{customer.email}</p>
                      )}
                      {customer.phone && (
                        <p className="text-sm text-gray-600">{customer.phone}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {customer._count.orders} orders
                      </span>
                    </div>
                    {customer.lastOrder && (
                      <p className="text-xs text-gray-400 mt-1">
                        Last: {formatPrice(customer.lastOrder.total)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {formatPrice(customer.totalSpent)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/ops/merchants/${id}/customers/${customer.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </a>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === pagination.pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </OpsPageShell>
  );
}
