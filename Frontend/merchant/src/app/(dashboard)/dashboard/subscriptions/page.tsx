"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CreditCard,
  Plus,
  MagnifyingGlass,
  DotsThree,
  CheckCircle,
  XCircle,
  PauseCircle,
  Clock,
  Warning,
  ArrowsClockwise,
  Users,
  CurrencyDollar,
  TrendUp,
} from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";

interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: "active" | "trialing" | "past_due" | "cancelled" | "paused";
  billingCycle: "monthly" | "yearly";
  price: number;
  currency: string;
  isTrial: boolean;
  trialEndsAt: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextPaymentAt: string | null;
  cancelledAt: string | null;
  tenant: {
    id: string;
    name: string;
    tenantCode: string;
  };
  plan: {
    id: string;
    name: string;
  };
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", page.toString());
      params.set("limit", "20");

      const response = await fetch(`/api/saas/subscriptions?${params}`);
      const data = await response.json();

      // Filter by search locally since API doesn't support tenant name search
      let filtered = data.subscriptions || [];
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
          (sub: Subscription) =>
            sub.tenant.name.toLowerCase().includes(searchLower) ||
            sub.plan.name.toLowerCase().includes(searchLower)
        );
      }

      setSubscriptions(filtered);
      setTotal(data.total || 0);
    } catch (error) {
      logger.error("[Subscriptions] Failed to fetch:", { error });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [search, statusFilter, page]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle size={16} weight="fill" className="text-green-600" />;
      case "trialing":
        return <Clock size={16} weight="fill" className="text-blue-600" />;
      case "past_due":
        return <Warning size={16} weight="fill" className="text-orange-600" />;
      case "cancelled":
        return <XCircle size={16} weight="fill" className="text-red-600" />;
      case "paused":
        return <PauseCircle size={16} weight="fill" className="text-yellow-600" />;
      default:
        return <Clock size={16} weight="fill" className="text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-green-50 text-green-700 border-green-200",
      trialing: "bg-blue-50 text-blue-700 border-blue-200",
      past_due: "bg-orange-50 text-orange-700 border-orange-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
      paused: "bg-yellow-50 text-yellow-700 border-yellow-200",
    };
    return (
      <Badge className={`border ${variants[status] || variants.active} font-semibold`}>
        <span className="flex items-center gap-1.5">
          {getStatusIcon(status)}
          <span className="capitalize">{status.replace('_', ' ')}</span>
        </span>
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  // Calculate metrics for SummaryWidgets
  const activeCount = subscriptions.filter(s => s.status === "active").length;
  const trialingCount = subscriptions.filter(s => s.status === "trialing").length;
  const totalMRR = subscriptions
    .filter(s => s.status === "active" && !s.isTrial)
    .reduce((sum, s) => sum + (s.billingCycle === "monthly" ? s.price : s.price / 12), 0);
  const growthRate = total > 0 ? ((activeCount - trialingCount) / total) * 100 : 0;

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Subscriptions
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage tenant subscriptions and billing •{" "}
              <span className="font-semibold text-gray-900">{subscriptions.length} total</span>
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/subscriptions/new")}
            className="rounded-xl bg-green-600 hover:bg-green-700 font-semibold"
          >
            <Plus size={18} weight="fill" className="mr-2" />
            Add Subscription
          </Button>
        </div>

        {/* Summary Widgets */}
        <div className="grid grid-cols-4 gap-4">
          <SummaryWidget
            icon={<CreditCard size={18} weight="fill" />}
            label="Active Subs"
            value={activeCount.toString()}
            trend={`${Math.round((activeCount / (subscriptions.length || 1)) * 100)}% of total`}
            positive={true}
          />
          <SummaryWidget
            icon={<Users size={18} />}
            label="Trialing"
            value={trialingCount.toString()}
            trend="Conversion opportunities"
            positive={true}
          />
          <SummaryWidget
            icon={<CurrencyDollar size={18} weight="fill" />}
            label="Monthly MRR"
            value={`$${Math.round(totalMRR).toLocaleString()}`}
            trend="Recurring revenue"
            positive={true}
          />
          <SummaryWidget
            icon={<TrendUp size={18} weight="fill" />}
            label="Growth Rate"
            value={`${growthRate >= 0 ? '+' : ''}${Math.round(growthRate)}%`}
            trend="Net growth"
            positive={growthRate >= 0}
          />
        </div>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl border border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by tenant or plan name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="past_due">Past Due</option>
              <option value="cancelled">Cancelled</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-100">
                  <TableHead className="font-bold text-gray-700">Tenant</TableHead>
                  <TableHead className="font-bold text-gray-700">Plan</TableHead>
                  <TableHead className="font-bold text-gray-700">Billing</TableHead>
                  <TableHead className="font-bold text-gray-700">Amount</TableHead>
                  <TableHead className="font-bold text-gray-700">Period</TableHead>
                  <TableHead className="font-bold text-gray-700">Status</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <ArrowsClockwise size={24} weight="fill" className="animate-spin" />
                        <span className="text-sm font-medium">Loading subscriptions...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <CreditCard size={48} weight="fill" className="text-gray-400" />
                        <p className="font-semibold text-gray-900">No subscriptions found</p>
                        <p className="text-sm text-gray-600">Add your first subscription to get started</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map((sub) => (
                    <TableRow key={sub.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <div>
                          <p className="font-semibold text-gray-900">{sub.tenant.name}</p>
                          <code className="text-xs text-gray-500">{sub.tenant.tenantCode}</code>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gray-50 text-gray-700 border border-gray-200 font-semibold">
                          {sub.plan.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="capitalize text-sm font-medium text-gray-700">{sub.billingCycle}</span>
                          {sub.isTrial && (
                            <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                              Trial
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold text-gray-900">
                            {formatCurrency(sub.price, sub.currency)}
                          </p>
                          <span className="text-xs text-gray-500">
                            /{sub.billingCycle === "monthly" ? "mo" : "yr"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{formatDate(sub.currentPeriodStart)}</p>
                          <p className="text-xs text-gray-500">to {formatDate(sub.currentPeriodEnd)}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="rounded-xl">
                              <DotsThree size={18} weight="bold" className="text-gray-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/dashboard/subscriptions/${sub.id}`)
                              }
                              className="cursor-pointer"
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/dashboard/subscriptions/${sub.id}/edit`
                                )
                              }
                              className="cursor-pointer"
                            >
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {total > 20 && (
            <div className="flex justify-center gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl font-semibold px-6"
              >
                Previous
              </Button>
              <span className="flex items-center px-4 font-medium text-gray-700">
                Page {page} of {Math.ceil(total / 20)}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / 20)}
                className="rounded-xl font-semibold px-6"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Summary Widget Component
// ============================================================
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
    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-0.5">
            {value}
          </p>
          <p className={`text-xs mt-1 ${positive ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}`}>
            {trend}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-50 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
