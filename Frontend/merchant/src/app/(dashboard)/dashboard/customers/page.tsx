"use client";
import { Button } from "@vayva/ui";

import { useState, useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageWithInsights } from "@/components/layout/PageWithInsights";
import { fetcher } from "@/lib/utils";
import {
  Users,
  UserPlus,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Heart,
  DollarSign,
  Crown,
  Star,
  AlertTriangle,
  Sparkles,
  Phone,
  Mail,
  RefreshCw,
  AlertCircle,
  Plus,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Segment = "VIP" | "Regular" | "New" | "At-risk";
type SegmentFilter = "All" | Segment;

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  lastOrder: string;
  segment: Segment;
}

interface CustomersData {
  customers: Customer[];
  summary: {
    total: number;
    totalTrend: string;
    newThisMonth: number;
    newTrend: string;
    returningPct: string;
    returningTrend: string;
    avgLtv: string;
    ltvTrend: string;
  };
}

/* ------------------------------------------------------------------ */
/*  Skeleton Components                                                */
/* ------------------------------------------------------------------ */

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-gray-100 rounded-xl" />
        <div className="w-16 h-6 bg-gray-100 rounded-lg" />
      </div>
      <div className="w-20 h-7 bg-gray-100 rounded mb-1" />
      <div className="w-24 h-4 bg-gray-100 rounded" />
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-50">
      <td className="py-3.5 px-6">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 bg-gray-100 rounded-full" />
          <div className="w-28 h-4 bg-gray-100 rounded" />
        </div>
      </td>
      <td className="py-3.5 px-4">
        <div className="w-32 h-4 bg-gray-100 rounded animate-pulse" />
      </td>
      <td className="py-3.5 px-4">
        <div className="w-28 h-4 bg-gray-100 rounded animate-pulse" />
      </td>
      <td className="py-3.5 px-4 text-center">
        <div className="w-8 h-4 bg-gray-100 rounded mx-auto animate-pulse" />
      </td>
      <td className="py-3.5 px-4 text-right">
        <div className="w-20 h-4 bg-gray-100 rounded ml-auto animate-pulse" />
      </td>
      <td className="py-3.5 px-4">
        <div className="w-24 h-4 bg-gray-100 rounded animate-pulse" />
      </td>
      <td className="py-3.5 px-6 text-center">
        <div className="w-16 h-6 bg-gray-100 rounded-full mx-auto animate-pulse" />
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-green-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-amber-500",
    "bg-cyan-500",
    "bg-rose-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  const idx =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return colors[idx];
}

function segmentBadge(segment: Segment) {
  const config = {
    VIP: {
      bg: "bg-amber-50 border-amber-200 text-amber-700",
      icon: <Crown size={11} />,
    },
    Regular: {
      bg: "bg-gray-50 border-gray-200 text-gray-600",
      icon: <Star size={11} />,
    },
    New: {
      bg: "bg-blue-50 border-blue-200 text-blue-700",
      icon: <Sparkles size={11} />,
    },
    "At-risk": {
      bg: "bg-red-50 border-red-200 text-red-700",
      icon: <AlertTriangle size={11} />,
    },
  };
  const c = config[segment];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg}`}
    >
      {c.icon}
      {segment}
    </span>
  );
}

function formatNaira(value: number): string {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(0)}K`;
  return `₦${value.toLocaleString()}`;
}

function formatNairaFull(value: number): string {
  return `₦${value.toLocaleString()}`;
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({
  icon,
  iconBg,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  trend: string;
}) {
  const isPositive = !String(trend || "").startsWith("-");
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
        <div
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${isPositive ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"}`}
        >
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
      <p className="text-xs font-medium text-gray-500 mt-1">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const { data, error, isLoading, mutate } = useSWR<CustomersData>(
    "/customers",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 },
  );

  const customers: Customer[] = data?.customers || [];
  const summary = data?.summary;

  const filtered = useMemo(() => {
    let list = [...customers];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q),
      );
    }

    if (segmentFilter !== "All") {
      list = list.filter((c) => c.segment === segmentFilter);
    }

    return list;
  }, [customers, searchQuery, segmentFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  const segments: SegmentFilter[] = ["All", "VIP", "Regular", "New", "At-risk"];

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-red-100 p-8 text-center max-w-md">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Failed to load customers
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            There was a problem fetching your customer data. Please try again.
          </p>
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
      <div className="min-h-screen space-y-6">
        <div className="flex items-center justify-between">
          <div className="animate-pulse">
            <div className="w-40 h-7 bg-gray-100 rounded mb-2" />
            <div className="w-64 h-4 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse">
          <div className="w-full h-10 bg-gray-100 rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead scope="col">
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3.5 px-6" scope="col">
                  <div className="w-20 h-3 bg-gray-100 rounded animate-pulse" />
                </th>
                <th className="text-left py-3.5 px-4" scope="col">
                  <div className="w-12 h-3 bg-gray-100 rounded animate-pulse" />
                </th>
                <th className="text-left py-3.5 px-4" scope="col">
                  <div className="w-12 h-3 bg-gray-100 rounded animate-pulse" />
                </th>
                <th className="text-center py-3.5 px-4" scope="col">
                  <div className="w-12 h-3 bg-gray-100 rounded mx-auto animate-pulse" />
                </th>
                <th className="text-right py-3.5 px-4" scope="col">
                  <div className="w-16 h-3 bg-gray-100 rounded ml-auto animate-pulse" />
                </th>
                <th className="text-left py-3.5 px-4" scope="col">
                  <div className="w-16 h-3 bg-gray-100 rounded animate-pulse" />
                </th>
                <th className="text-center py-3.5 px-6" scope="col">
                  <div className="w-16 h-3 bg-gray-100 rounded mx-auto animate-pulse" />
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Empty state
  if (customers.length === 0) {
    return (
      <div className="min-h-screen space-y-6">
        <PageHeader
          title="Customers"
          subtitle="Manage and grow your customer relationships"
        />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Users className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No customers yet
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mb-4">
            Your customers will appear as orders come in
          </p>
          <Button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Customer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6">
      <PageWithInsights
        insights={
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick actions
              </div>
              <div className="mt-3 grid gap-2">
                <Link
                  href="/dashboard/orders"
                  className="inline-flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  <span>View orders</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  href="/dashboard/analytics"
                  className="inline-flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  <span>Analytics</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  href="/dashboard/customers/insights"
                  className="inline-flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  <span>Smart insights</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                KPI snapshot
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                  <div className="text-xs text-gray-500">Total</div>
                  <div className="text-lg font-bold text-gray-900 mt-0.5">
                    {summary?.total?.toLocaleString() ?? customers.length}
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                  <div className="text-xs text-gray-500">Returning</div>
                  <div className="text-lg font-bold text-gray-900 mt-0.5">
                    {summary?.returningPct ?? "--"}
                  </div>
                </div>
              </div>
            </div>
          </>
        }
      >
        <PageHeader
          title={
            <span className="inline-flex items-center gap-3">
              <span>Customers</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                {summary?.total?.toLocaleString() ?? customers.length}
              </span>
            </span>
          }
          subtitle="Manage and grow your customer relationships"
          actions={
            <>
              <Button
                onClick={() => mutate()}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                <RefreshCw size={16} />
                Refresh
              </Button>
              <Button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors shadow-sm">
                <UserPlus size={16} />
                Add Customer
              </Button>
            </>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Users size={20} />}
            iconBg="bg-green-100 text-green-600"
            label="Total Customers"
            value={summary?.total?.toLocaleString() ?? String(customers.length)}
            trend={summary?.totalTrend ?? "--"}
          />
          <StatCard
            icon={<UserPlus size={20} />}
            iconBg="bg-blue-100 text-blue-600"
            label="New This Month"
            value={summary?.newThisMonth?.toLocaleString() ?? "--"}
            trend={summary?.newTrend ?? "--"}
          />
          <StatCard
            icon={<Heart size={20} />}
            iconBg="bg-purple-100 text-purple-600"
            label="Returning"
            value={summary?.returningPct ?? "--"}
            trend={summary?.returningTrend ?? "--"}
          />
          <StatCard
            icon={<DollarSign size={20} />}
            iconBg="bg-amber-100 text-amber-600"
            label="Average LTV"
            value={summary?.avgLtv ?? "--"}
            trend={summary?.ltvTrend ?? "--"}
          />
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 w-full lg:max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all"
              />
            </div>

            {/* Segment Filter */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
              {segments.map((seg) => (
                <Button
                  key={seg}
                  onClick={() => {
                    setSegmentFilter(seg);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    segmentFilter === seg
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {seg}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead scope="col">
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th
                    className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    scope="col"
                  >
                    Customer
                  </th>
                  <th
                    className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    scope="col"
                  >
                    Email
                  </th>
                  <th
                    className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    scope="col"
                  >
                    Phone
                  </th>
                  <th
                    className="text-center py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    scope="col"
                  >
                    Orders
                  </th>
                  <th
                    className="text-right py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    scope="col"
                  >
                    Total Spent
                  </th>
                  <th
                    className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    scope="col"
                  >
                    Last Order
                  </th>
                  <th
                    className="text-center py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    scope="col"
                  >
                    Segment
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                          <Search size={24} className="text-gray-400" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          No customers found
                        </p>
                        <p className="text-sm text-gray-500">
                          Try adjusting your search or filter
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-green-50/30 transition-colors"
                    >
                      {/* Name with avatar */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full ${getAvatarColor(customer.name)} flex items-center justify-center shadow-sm`}
                          >
                            <span className="text-sm font-bold text-white">
                              {getInitials(customer.name)}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {customer.name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Mail size={13} className="text-gray-400" />
                          {customer.email}
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Phone size={13} className="text-gray-400" />
                          {customer.phone}
                        </div>
                      </td>

                      {/* Orders */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-sm font-semibold text-gray-900">
                          {customer.orders}
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatNairaFull(customer.totalSpent)}
                        </span>
                      </td>

                      {/* Last Order */}
                      <td className="py-3.5 px-4">
                        <span className="text-sm text-gray-500">
                          {customer.lastOrder}
                        </span>
                      </td>

                      {/* Segment */}
                      <td className="py-3.5 px-6 text-center">
                        {segmentBadge(customer.segment)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {(currentPage - 1) * perPage + 1}–
                {Math.min(currentPage * perPage, filtered.length)} of{" "}
                {filtered.length} customers
              </p>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === page
                          ? "bg-green-500 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </Button>
                  ),
                )}
                <Button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </PageWithInsights>
    </div>
  );
}
