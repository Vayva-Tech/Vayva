"use client";

import { useState, useEffect } from "react";
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
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  PauseCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/ui/page-header";
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
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "trialing":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "past_due":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "paused":
        return <PauseCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      trialing: "bg-blue-100 text-blue-800",
      past_due: "bg-orange-100 text-orange-800",
      cancelled: "bg-red-100 text-red-800",
      paused: "bg-yellow-100 text-yellow-800",
    };
    return (
      <Badge className={variants[status] || variants.active}>
        <span className="flex items-center gap-1">
          {getStatusIcon(status)}
          {status.charAt(0).toUpperCase() + status.slice(1)}
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions"
        description="Manage tenant subscriptions and billing"
        icon={<CreditCard className="h-6 w-6" />}
      >
        <Button
          onClick={() => router.push("/dashboard/subscriptions/new")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Subscription
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscriptions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="past_due">Past Due</option>
              <option value="cancelled">Cancelled</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading subscriptions...
                    </TableCell>
                  </TableRow>
                ) : subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No subscriptions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{sub.tenant.name}</p>
                          <code className="text-xs text-muted-foreground">
                            {sub.tenant.tenantCode}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{sub.plan.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{sub.billingCycle}</span>
                        {sub.isTrial && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Trial
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(sub.price, sub.currency)}
                        <span className="text-xs text-muted-foreground">
                          /{sub.billingCycle === "monthly" ? "mo" : "yr"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(sub.currentPeriodStart)}</p>
                          <p className="text-muted-foreground">
                            to {formatDate(sub.currentPeriodEnd)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/dashboard/subscriptions/${sub.id}`)
                              }
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/dashboard/subscriptions/${sub.id}/edit`
                                )
                              }
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
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {page} of {Math.ceil(total / 20)}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / 20)}
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
