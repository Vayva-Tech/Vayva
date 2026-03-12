"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Button, cn, Input, Checkbox } from "@vayva/ui";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Download, CaretLeft as ChevronLeft, CaretRight as ChevronRight, Funnel as Filter, XCircle, CheckCircle, ArrowsClockwise as RefreshCw } from "@phosphor-icons/react/ssr";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { OpsStatusBadge } from "@/components/ops/OpsStatusBadge";
import { EmptyState } from "@/components/ops/EmptyState";
import { PageSkeleton } from "@/components/ops/Skeleton";
import { AdvancedSearchInput } from "@/components/ops/AdvancedSearchInput";
import { buildSearchParams, type SearchQuery } from "@/lib/search/queryParser";

type KycStatus = "PENDING" | "VERIFIED" | "REJECTED" | "UNDER_REVIEW";
type IdentityStatus = "VERIFIED" | "REJECTED" | "PENDING" | "NOT_SUBMITTED";

interface KycRecord {
  id: string;
  storeId: string;
  status: KycStatus;
  ninStatus?: IdentityStatus;
  bvnStatus?: IdentityStatus;
  cacStatus?: IdentityStatus;
  ninLast4?: string;
  bvnLast4?: string;
  cacNumberEncrypted?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
  notes?: string | null;
  reviewerId?: string | null;
  store?: {
    id: string;
    name: string;
    slug: string;
    industrySlug?: string | null;
    onboardingStatus?: string;
    onboardingLastStep?: string | null;
    owner?: {
      email: string;
      name?: string;
    };
  };
  bank?: {
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
  } | null;
}

interface KycFilters {
  status: KycStatus | "ALL";
  industry: string;
  search: string;
  reviewerId: string;
}

const INDUSTRIES = [
  { value: "all", label: "All Industries" },
  { value: "fashion", label: "Fashion" },
  { value: "electronics", label: "Electronics" },
  { value: "food", label: "Food & Restaurants" },
  { value: "beauty", label: "Beauty & Skincare" },
  { value: "services", label: "Services" },
  { value: "real-estate", label: "Real Estate" },
  { value: "nightlife", label: "Nightlife" },
  { value: "other", label: "Other" },
];

const STATUSES = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "VERIFIED", label: "Verified" },
  { value: "REJECTED", label: "Rejected" },
];

const PAGE_SIZE = 10;

export default function KycQueuePage(): React.JSX.Element {
  const { toast } = useToast();
  const [records, setRecords] = useState<KycRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  // Pagination
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [filters, setFilters] = useState<KycFilters>({
    status: "ALL",
    industry: "all",
    search: "",
    reviewerId: "all",
  });
  const [advancedSearch, setAdvancedSearch] = useState(filters.search);

  const handleAdvancedSearch = (query: SearchQuery) => {
    const params = buildSearchParams(query);
    setFilters({ ...filters, search: params.toString() });
    setPage(1);
  };

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<"approve" | "reject" | null>(null);
  const [bulkRejectReason, setBulkRejectReason] = useState("");
  const [bulkNote, setBulkNote] = useState("");

  // Export loading
  const [exportLoading, setExportLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.status !== "ALL") params.append("status", filters.status);
      if (filters.industry !== "all") params.append("industry", filters.industry);
      if (filters.search) params.append("search", filters.search);
      if (filters.reviewerId !== "all") params.append("reviewerId", filters.reviewerId);

      params.append("page", String(page));
      params.append("pageSize", String(PAGE_SIZE));

      const res = await fetch(`/api/ops/kyc?${params}`);
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setRecords(data.data || []);
      setTotalCount(data.totalCount || 0);
    } catch (e: any) {
      setError(e instanceof Error ? e.message : "Failed to load KYC queue");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/ops/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          action,
          notes: note[id],
          rejectionReason: rejectReason[id],
        }),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      await load();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to update",
        variant: "destructive",
      });
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;

    setActionLoading("bulk");
    try {
      const res = await fetch("/api/ops/kyc/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          action: bulkAction,
          notes: bulkNote,
          rejectionReason: bulkRejectReason,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const result = await res.json();
      toast({
        title: "Bulk Action Complete",
        description: `${result.successCount} records ${bulkAction}ed${result.errorCount > 0 ? `, ${result.errorCount} failed` : ""}`,
      });

      setSelectedIds(new Set());
      setShowBulkModal(false);
      setBulkAction(null);
      setBulkNote("");
      setBulkRejectReason("");
      await load();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Bulk action failed",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const exportToCSV = async () => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status !== "ALL") params.append("status", filters.status);
      if (filters.industry !== "all") params.append("industry", filters.industry);
      if (filters.search) params.append("search", filters.search);
      params.append("export", "true");

      const res = await fetch(`/api/ops/kyc?${params}`);
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      const allRecords: KycRecord[] = data.data || [];

      const headers = ["ID", "Store Name", "Slug", "Industry", "Status", "NIN Status", "BVN Status", "CAC Status", "Submitted At", "Bank Name", "Account Name", "Account Number", "Notes"];
      const rows = allRecords.map((rec) => [
        rec.id, rec.store?.name || "N/A", rec.store?.slug || "N/A", rec.store?.industrySlug || "N/A",
        rec.status, rec.ninStatus || "N/A", rec.bvnStatus || "N/A", rec.cacStatus || "N/A", rec.submittedAt,
        rec.bank?.bankName || "N/A", rec.bank?.accountName || "N/A", rec.bank?.accountNumber || "N/A", rec.notes || "",
      ]);

      const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${String(cell || "").replace(/"/g, "\"\"")}"`).join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `kyc-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body?.appendChild(link);
      link.click();
      document.body?.removeChild(link);

      toast({ title: "Export Complete", description: `${allRecords.length} records exported` });
    } catch (e: any) {
      toast({ title: "Export Failed", description: e instanceof Error ? e.message : "Failed to export", variant: "destructive" });
    } finally {
      setExportLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === records.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(records.map((r: any) => r.id)));
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasSelected = selectedIds.size > 0;

  if (loading) {
    return (
      <OpsPageShell title="KYC Review Queue" description="Loading...">
        <div className="space-y-3">
          {[1, 2, 3].map((i: any) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </OpsPageShell>
    );
  }

  if (error) {
    return (
      <OpsPageShell title="KYC Review Queue" description="Error loading data">
        <div className="space-y-4">
          <div className="text-red-600 font-semibold">Error: {error}</div>
          <Button onClick={load} aria-label="Retry loading KYC queue">
            Retry
          </Button>
        </div>
      </OpsPageShell>
    );
  }

  return (
    <OpsPageShell
      title="KYC Review Queue"
      description={`${totalCount} records • ${selectedIds.size} selected`}
      headerActions={
        <div className="flex items-center gap-2">
          {hasSelected && (
            <>
              <Button
                variant="outline"
                onClick={() => { setBulkAction("approve"); setShowBulkModal(true); }}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve {selectedIds.size}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setBulkAction("reject"); setShowBulkModal(true); }}
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject {selectedIds.size}
              </Button>
            </>
          )}
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={exportLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            {exportLoading ? "Exporting..." : "Export CSV"}
          </Button>
          <Button
            variant="outline"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      }
    >

      {/* Filters */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter className="w-4 h-4" />
          Filters
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <AdvancedSearchInput
            value={advancedSearch}
            onChange={setAdvancedSearch}
            onSearch={handleAdvancedSearch}
            placeholder="Search store name, email, NIN/BVN..."
            className="lg:col-span-2"
          />
          <Select
            value={filters.status}
            onValueChange={(value: string) => { setFilters({ ...filters, status: value as KycStatus | "ALL" }); setPage(1); }}
          >
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="z-50">
              {STATUSES.map((s: any) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select
            value={filters.industry}
            onValueChange={(value: string) => { setFilters({ ...filters, industry: value }); setPage(1); }}
          >
            <SelectTrigger><SelectValue placeholder="Industry" /></SelectTrigger>
            <SelectContent className="z-50">
              {INDUSTRIES.map((i: any) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            onClick={() => { setFilters({ status: "ALL", industry: "all", search: "", reviewerId: "all" }); setAdvancedSearch(""); setPage(1); }}
            className="text-gray-500"
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Select All */}
      {records.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
          <Checkbox
            checked={selectedIds.size === records.length && records.length > 0}
            onCheckedChange={toggleSelectAll}
          />
          <span className="text-sm font-medium">Select All ({records.length} visible)</span>
        </div>
      )}

      {records.length === 0 ? (
        <div className="p-6 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 shadow-sm">
          No pending KYC records.
        </div>
      ) : (
        <div className="space-y-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {records.map((rec: KycRecord) => (
            <div
              key={rec.id}
              className={cn(
                "rounded-2xl border p-5 shadow-sm flex flex-col gap-3 transition-colors",
                selectedIds.has(rec.id)
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 bg-white"
              )}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedIds.has(rec.id)}
                  onCheckedChange={() => toggleSelect(rec.id)}
                />
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                    {rec.store?.industrySlug || "unknown"}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {rec.store?.name || "Unknown Store"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Slug: {rec.store?.slug}
                  </p>
                </div>
                <div className="text-right text-xs text-gray-500">
                  Submitted: {new Date(rec.submittedAt).toLocaleString()}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-3 text-sm text-gray-800">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="font-semibold text-gray-700">
                    Identity Checks
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">NIN</span>
                    <span
                      className={cn(
                        "text-xs font-bold px-1.5 py-0.5 rounded-full",
                        rec.ninStatus === "VERIFIED"
                          ? "bg-green-100 text-green-700"
                          : rec.ninStatus === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : rec.ninStatus === "PENDING"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-500",
                      )}
                    >
                      {rec.ninStatus || "N/A"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    {rec.ninLast4 ? `***${rec.ninLast4}` : ""}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">BVN</span>
                    <span
                      className={cn(
                        "text-xs font-bold px-1.5 py-0.5 rounded-full",
                        rec.bvnStatus === "VERIFIED"
                          ? "bg-green-100 text-green-700"
                          : rec.bvnStatus === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : rec.bvnStatus === "PENDING"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-500",
                      )}
                    >
                      {rec.bvnStatus || "N/A"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    {rec.bvnLast4 ? `***${rec.bvnLast4}` : ""}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">CAC</span>
                    <span
                      className={cn(
                        "text-xs font-bold px-1.5 py-0.5 rounded-full",
                        rec.cacStatus === "VERIFIED"
                          ? "bg-green-100 text-green-700"
                          : rec.cacStatus === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : rec.cacStatus === "PENDING"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-500",
                      )}
                    >
                      {rec.cacNumberEncrypted
                        ? rec.cacStatus || "PENDING"
                        : "N/A"}
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="font-semibold text-gray-700">Bank</div>
                  <div className="text-xs text-gray-500">Account Name</div>
                  <div className="font-mono">
                    {rec.bank?.accountName || "N/A"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Account</div>
                  <div className="font-mono">
                    {rec.bank?.bankName} • {rec.bank?.accountNumber}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="font-semibold text-gray-700">Onboarding</div>
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="font-medium">
                    {rec.store?.onboardingStatus || "N/A"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Last step</div>
                  <div className="font-mono">
                    {rec.store?.onboardingLastStep || "N/A"}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Notes
                  </label>
                  <textarea
                    className="w-full rounded-xl border border-gray-200 p-2 text-sm"
                    rows={2}
                    value={note[rec.id] || ""}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e: any) =>
                      setNote((prev) => ({
                        ...prev,
                        [rec.id]: (e as React.ChangeEvent<HTMLInputElement>)
                          .target.value,
                      }))
                    }
                    placeholder="Internal notes"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Rejection reason (if rejecting)
                  </label>
                  <textarea
                    className="w-full rounded-xl border border-gray-200 p-2 text-sm"
                    rows={2}
                    value={rejectReason[rec.id] || ""}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e: any) =>
                      setRejectReason((prev) => ({
                        ...prev,
                        [rec.id]: (e as React.ChangeEvent<HTMLInputElement>)
                          .target.value,
                      }))
                    }
                    placeholder="Why rejecting?"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
                <Button
                  variant="ghost"
                  className={cn(
                    "border border-red-200 text-red-700 hover:bg-red-50 h-auto",
                  )}
                  disabled={actionLoading === rec.id}
                  onClick={() => act(rec.id, "reject")}
                  aria-label={`Reject KYC for ${rec.store?.name}`}
                >
                  Reject
                </Button>
                <Button
                  className="bg-black text-white h-auto"
                  disabled={actionLoading === rec.id}
                  onClick={() => act(rec.id, "approve")}
                  aria-label={`Approve KYC for ${rec.store?.name}`}
                >
                  {actionLoading === rec.id ? "Saving..." : "Approve"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p: any) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p: any) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Action Modal */}
      <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {bulkAction === "approve" ? "Approve" : "Reject"} {selectedIds.size} Records
            </DialogTitle>
            <DialogDescription>
              This action will apply to all selected KYC records. Are you sure?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Notes (applied to all)</label>
              <textarea
                className="w-full rounded-xl border border-gray-200 p-2 text-sm"
                rows={3}
                value={bulkNote}
                onChange={(e: any) => setBulkNote(e.target?.value)}
                placeholder="Internal notes for all records..."
              />
            </div>

            {bulkAction === "reject" && (
              <div>
                <label className="text-sm font-medium mb-2 block">Rejection Reason *</label>
                <textarea
                  className="w-full rounded-xl border border-gray-200 p-2 text-sm"
                  rows={3}
                  value={bulkRejectReason}
                  onChange={(e: any) => setBulkRejectReason(e.target?.value)}
                  placeholder="Reason for rejection..."
                  required
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkAction}
              disabled={actionLoading === "bulk" || (bulkAction === "reject" && !bulkRejectReason)}
              className={bulkAction === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {actionLoading === "bulk" ? "Processing..." : `Confirm ${bulkAction}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OpsPageShell>
  );
}
