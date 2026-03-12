"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MagnifyingGlass as Search, Funnel as Filter, Warning as AlertTriangle, TrendUp as TrendingUp, DotsThree as MoreHorizontal, Download, ArrowsClockwise as RefreshCw, ShieldWarning as ShieldAlert } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { OpsPagination } from "@/components/shared/OpsPagination";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ops/ConfirmDialog";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { OpsDataTable, type Column } from "@/components/ops/OpsDataTable";
import { OpsStatusBadge, RiskBadge } from "@/components/ops/OpsStatusBadge";
import { AdvancedSearchInput } from "@/components/ops/AdvancedSearchInput";
import { parseSearchQuery, buildSearchParams, type SearchQuery } from "@/lib/search/queryParser";
import { logger } from "@vayva/shared";

interface Merchant {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  status: string;
  plan: string;
  kycStatus: "PENDING" | "APPROVED" | "REJECTED" | "NOT_SUBMITTED";
  riskFlags: string[];
  gmv30d: number;
  lastActive: string;
  createdAt: string;
  location: string;
  trialEndsAt: string | null;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function MerchantsListPage(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL State
  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("q") || "";
  const plan = searchParams.get("plan") || "";
  const kyc = searchParams.get("kyc") || "";
  const risk = searchParams.get("risk") || "";

  const [searchInput, setSearchInput] = useState(search);
  const [advancedSearch, setAdvancedSearch] = useState(search);
  const [data, setData] = useState<Merchant[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionDetails, setActionDetails] = useState<{ type: string; target: string; impact?: string } | undefined>(undefined);

  const fetchMerchants = React.useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { q: search }),
        ...(plan && { plan }),
        ...(kyc && { kyc }),
        ...(risk && { risk }),
      });

      const res = await fetch(`/api/ops/merchants?${query}`);
      if (res.status === 401) {
        window.location.href = "/ops/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch merchants");

      const result = await res.json();
      setData(result.data || []);
      setMeta(result.meta || null);
    } catch (error: unknown) {
      logger.error("[MERCHANTS_FETCH_ERROR]", { error });
    } finally {
      setLoading(false);
    }
  }, [page, search, plan, kyc, risk]);

  useEffect(() => {
    fetchMerchants();
    setSelectedIds(new Set()); // Reset selection on fetch/filter change
  }, [page, search, plan, kyc, risk, fetchMerchants]);

  const handleAdvancedSearch = (query: SearchQuery) => {
    const params = buildSearchParams(query);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  // Bulk Selection Handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((m) => m.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleHighRiskAction = (action: string) => {
    setPendingAction(action);

    // Define risk levels and details for each action
    const actionConfig: Record<string, {
      riskLevel: "high" | "critical" | "ultra";
      title: string;
      description: string;
      confirmLabel: string;
      details: { type: string; target: string; impact?: string };
      requireTypedConfirmation?: boolean;
    }> = {
      SUSPEND: {
        riskLevel: "critical",
        title: "Suspend Merchant Accounts",
        description: `You are about to suspend ${selectedIds.size} merchant account(s). This will immediately disable their store, prevent all sales, and block payouts. This action requires a detailed justification.`,
        confirmLabel: "Suspend Accounts",
        details: {
          type: "Account Suspension",
          target: `${selectedIds.size} merchant(s)`,
          impact: "Immediate store shutdown, lost revenue, customer disruption",
        },
      },
      force_kyc: {
        riskLevel: "high",
        title: "Force KYC Verification",
        description: `Require KYC verification for ${selectedIds.size} merchant(s). They will be restricted from certain features until verification is complete.`,
        confirmLabel: "Force KYC",
        details: {
          type: "KYC Enforcement",
          target: `${selectedIds.size} merchant(s)`,
          impact: "Feature restrictions until verification",
        },
      },
      enable_payouts: {
        riskLevel: "high",
        title: "Enable Payouts",
        description: `Enable payout processing for ${selectedIds.size} merchant(s). This allows funds to flow to their accounts.`,
        confirmLabel: "Enable Payouts",
        details: {
          type: "Financial Enablement",
          target: `${selectedIds.size} merchant(s)`,
          impact: "Funds will be released to merchant accounts",
        },
      },
    };

    const config = actionConfig[action];
    if (config) {
      setActionDetails(config.details);
      setConfirmDialogOpen(true);
    }
  };

  // CSV Export
  const handleExportCSV = async () => {
    try {
      const filters = { status: "", plan, kyc, search };
      const query = new URLSearchParams({
        format: "csv",
        filters: JSON.stringify(filters),
      });
      
      const res = await fetch(`/api/ops/merchants/bulk?${query}`);
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      const url = window.URL?.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `merchants-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL?.revokeObjectURL(url);
      
      toast.success("CSV exported successfully");
    } catch (e: any) {
      toast.error("Failed to export CSV");
    }
  };

  const executeBatchAction = async (reason: string) => {
    if (!pendingAction) return;

    setProcessingAction(pendingAction);
    setConfirmDialogOpen(false);

    try {
      const res = await fetch("/api/ops/merchants/batch", {
        method: "POST",
        body: JSON.stringify({
          merchantIds: Array.from(selectedIds),
          action: pendingAction,
          reason,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      toast.success(`Action Complete: ${json.count} updated`);
      setSelectedIds(new Set());
      setPendingAction(null);
      fetchMerchants();
    } catch (e: any) {
      const error = e as Error;
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setProcessingAction(null);
    }
  };

  // Define table columns
  const columns: Column<Merchant>[] = [
    {
      key: "merchant",
      label: "Merchant",
      mobileLabel: "Store",
      priority: "high",
      render: (m: any) => (
        <Link href={`/ops/merchants/${m.id}`} className="block">
          <div className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
            {m.name}
          </div>
          <div className="text-xs text-gray-500">{m.slug}</div>
        </Link>
      ),
    },
    {
      key: "plan",
      label: "Plan",
      priority: "medium",
      render: (m: any) => <OpsStatusBadge status={m.plan} />,
    },
    {
      key: "kyc",
      label: "KYC",
      priority: "high",
      render: (m: any) => <OpsStatusBadge status={m.kycStatus} />,
    },
    {
      key: "gmv",
      label: "GMV (30d)",
      mobileLabel: "Revenue",
      priority: "medium",
      render: (m: any) => (
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span className="font-medium text-gray-900">
            ₦{m?.gmv30d?.toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: "trial",
      label: "Trial Status",
      mobileLabel: "Trial",
      priority: "low",
      render: (m: any) => {
        if (m.plan !== "FREE" || !m.trialEndsAt) {
          return <span className="text-gray-400 text-xs">—</span>;
        }
        const remaining = new Date(m.trialEndsAt).getTime() - Date.now();
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const isUrgent = remaining < 48 * 60 * 60 * 1000 && remaining > 0;
        const isExpired = remaining <= 0;

        if (isExpired) {
          return <OpsStatusBadge status="TRIAL_EXPIRED" />;
        }
        return (
          <div
            className={`text-xs font-medium px-2 py-0.5 rounded border ${
              isUrgent
                ? "bg-orange-50 text-orange-700 border-orange-200 animate-pulse"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            {days}d {hours}h left
          </div>
        );
      },
    },
    {
      key: "risk",
      label: "Risk",
      priority: "high",
      render: (m: any) =>
        m.riskFlags?.length > 0 ? (
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <RiskBadge risk="HIGH" />
          </div>
        ) : (
          <RiskBadge risk="CLEAN" />
        ),
    },
    {
      key: "lastActive",
      label: "Last Active",
      mobileLabel: "Active",
      priority: "medium",
      render: (m: any) => (
        <span className="text-gray-500 text-xs">
          {new Date(m.lastActive).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      priority: "low",
      className: "text-right",
      render: (m: any) => (
        <Link
          href={`/ops/merchants/${m.id}`}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 inline-block"
        >
          <MoreHorizontal size={16} />
        </Link>
      ),
    },
  ];

  return (
    <OpsPageShell
      title="Merchants"
      description="Manage all registered stores"
      headerActions={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMerchants}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          {meta && (
            <span className="text-sm text-gray-500">
              {meta.total} total merchants
            </span>
          )}
        </div>
      }
    >
      {/* Search & Filter Bar */}
      <section className="mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
        <AdvancedSearchInput
          value={advancedSearch}
          onChange={setAdvancedSearch}
          onSearch={handleAdvancedSearch}
          placeholder="Search merchants (try: plan:pro kyc:pending gmv>100000)"
        />
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 h-auto ${showFilters || plan || kyc || risk ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100" : ""}`}
            aria-label={showFilters ? "Hide filters" : "Show filters"}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {(plan || kyc || risk) && (
              <span className="ml-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {[plan, kyc, risk].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Plan
              </label>
              <select
                aria-label="Filter by Plan"
                title="Filter by Plan"
                value={plan}
                onChange={(e: any) =>
                  handleFilterChange(
                    "plan",
                    (e as React.ChangeEvent<HTMLInputElement>).target.value,
                  )
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Plans</option>
                <option value="FREE">Free</option>
                <option value="STARTER">Starter</option>
                <option value="PRO">Pro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                KYC Status
              </label>
              <select
                aria-label="Filter by KYC"
                title="Filter by KYC Status"
                value={kyc}
                onChange={(e: any) =>
                  handleFilterChange(
                    "kyc",
                    (e as React.ChangeEvent<HTMLInputElement>).target.value,
                  )
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
                <option value="NOT_SUBMITTED">Not Submitted</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Risk
              </label>
              <select
                aria-label="Filter by Risk"
                title="Filter by Risk"
                value={risk}
                onChange={(e: any) =>
                  handleFilterChange(
                    "risk",
                    (e as React.ChangeEvent<HTMLInputElement>).target.value,
                  )
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Merchants</option>
                <option value="flagged">Flagged Only</option>
                <option value="clean">Clean Only</option>
              </select>
            </div>
          </div>
        )}
      </div>
      </section>

      {/* Table */}
      <section className="mb-8">
        <OpsDataTable
        data={data}
        columns={columns}
        keyExtractor={(m: any) => m.id}
        loading={loading}
        emptyMessage="No merchants found"
        selectable
        selectedIds={selectedIds}
        onSelect={toggleSelectOne}
        onSelectAll={toggleSelectAll}
        onRowClick={(merchant: any) => router.push(`/ops/merchants/${merchant.id}`)}
      />
      </section>

      {/* Pagination */}
      <section>
        {meta && (
          <OpsPagination
            currentPage={meta.page}
            totalItems={meta.total}
            limit={meta.limit}
            onPageChange={handlePageChange}
          />
        )}
      </section>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3 pr-6 border-r border-gray-700">
            <div className="bg-gray-800 p-2 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <span className="font-medium">
              {selectedIds.size} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleHighRiskAction("SUSPEND")}
              disabled={!!processingAction}
              className="bg-red-500 hover:bg-red-600 text-white border-none h-auto"
              aria-label={`Suspend ${selectedIds.size} selected merchant accounts`}
            >
              Suspend Accounts
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleHighRiskAction("force_kyc")}
              disabled={!!processingAction}
              className="bg-yellow-500 hover:bg-yellow-600 text-black border-none h-auto"
              aria-label={`Force KYC for ${selectedIds.size} selected merchants`}
            >
              Force KYC
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleHighRiskAction("enable_payouts")}
              disabled={!!processingAction}
              className="bg-green-600 hover:bg-green-700 text-white border-none h-auto"
              aria-label={`Enable payouts for ${selectedIds.size} selected merchants`}
            >
              Enable Payouts
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="text-gray-400 hover:text-gray-900 hover:bg-white/80 h-auto"
              aria-label="Cancel bulk selection"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* High-Risk Action ConfirmDialog */}
      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => {
          setConfirmDialogOpen(false);
          setPendingAction(null);
        }}
        onConfirm={executeBatchAction}
        title={pendingAction === "SUSPEND" ? "Suspend Merchant Accounts" : pendingAction === "force_kyc" ? "Force KYC Verification" : "Enable Payouts"}
        description={pendingAction === "SUSPEND"
          ? `You are about to suspend ${selectedIds.size} merchant account(s). This will immediately disable their store, prevent all sales, and block payouts.`
          : pendingAction === "force_kyc"
            ? `Require KYC verification for ${selectedIds.size} merchant(s). They will be restricted from certain features until verification is complete.`
            : `Enable payout processing for ${selectedIds.size} merchant(s). This allows funds to flow to their accounts.`}
        confirmLabel={pendingAction === "SUSPEND" ? "Suspend Accounts" : pendingAction === "force_kyc" ? "Force KYC" : "Enable Payouts"}
        riskLevel={pendingAction === "SUSPEND" ? "critical" : "high"}
        actionDetails={actionDetails}
        placeholder={pendingAction === "SUSPEND"
          ? "Provide a detailed reason for suspension (minimum 20 characters)..."
          : "Provide a reason for this action (minimum 10 characters)..."}
      />
    </OpsPageShell>
  );
}
