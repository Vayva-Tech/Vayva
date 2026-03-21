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
  Layers,
  Plus,
  Search,
  MoreHorizontal,
  Star,
  Users,
  HardDrive,
  Zap,
  Archive,
  CheckCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

interface Plan {
  id: string;
  name: string;
  planCode: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  trialDays: number;
  isPublic: boolean;
  isDefault: boolean;
  status: "active" | "archived" | "draft";
  maxUsers: number | null;
  maxProjects: number | null;
  maxStorageGB: number | null;
  maxApiCalls: number | null;
  badge: string | null;
  _count: {
    subscriptions: number;
  };
}

export default function PlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("status", statusFilter);
      params.set("includeArchived", statusFilter === "" ? "true" : "false");

      const response = await fetch(`/api/saas/plans?${params}`);
      const data = await response.json();

      // Filter by search locally
      let filtered = data.plans || [];
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
          (plan: Plan) =>
            plan.name.toLowerCase().includes(searchLower) ||
            plan.planCode.toLowerCase().includes(searchLower) ||
            plan.description?.toLowerCase().includes(searchLower)
        );
      }

      setPlans(filtered);
    } catch (error) {
      logger.error("[Plans] Failed to load:", { error });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [search, statusFilter]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      archived: "bg-gray-100 text-gray-800",
      draft: "bg-yellow-100 text-yellow-800",
    };
    return (
      <Badge className={variants[status] || variants.active}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plans"
        description="Manage subscription plans and pricing tiers"
        primaryAction={{
          label: "Add Plan",
          icon: "Plus",
          onClick: () => router.push("/dashboard/plans/new"),
        }}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search plans..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
            >
              <option value="active">Active</option>
              <option value="">All Plans</option>
              <option value="archived">Archived</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Limits</TableHead>
                  <TableHead>Trial</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading plans...
                    </TableCell>
                  </TableRow>
                ) : plans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No plans found. Create your first plan to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{plan.name}</span>
                          {plan.isDefault && (
                            <Badge variant="outline" className="gap-1">
                              <Star className="h-3 w-3" />
                              Default
                            </Badge>
                          )}
                          {plan.badge && (
                            <Badge className="bg-green-500/10 text-green-600">
                              {plan.badge}
                            </Badge>
                          )}
                        </div>
                        {plan.description && (
                          <p className="text-sm text-gray-500 truncate max-w-[200px]">
                            {plan.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {plan.planCode}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatCurrency(plan.priceMonthly, plan.currency)}/mo</p>
                          <p className="text-gray-500">
                            {formatCurrency(plan.priceYearly, plan.currency)}/yr
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs">
                          {plan.maxUsers !== null && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {plan.maxUsers} users
                            </span>
                          )}
                          {plan.maxStorageGB !== null && (
                            <span className="flex items-center gap-1">
                              <HardDrive className="h-3 w-3" />
                              {plan.maxStorageGB} GB
                            </span>
                          )}
                          {plan.maxApiCalls !== null && (
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {plan.maxApiCalls.toLocaleString()} calls
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {plan.trialDays > 0 ? (
                          <span>{plan.trialDays} days</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(plan.status)}</TableCell>
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
                                router.push(`/dashboard/plans/${plan.id}`)
                              }
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/dashboard/plans/${plan.id}/edit`)
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
        </CardContent>
      </Card>
    </div>
  );
}
