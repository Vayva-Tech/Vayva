"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Money,
  Plus,
  Calendar,
  Spinner as Loader2,
  PencilSimple as Edit,
  Trash,
  Building,
  CheckCircle,
  Clock,
  XCircle,
  Target,
  AlertCircle,
  Funnel,
  ChevronLeft,
  ChevronRight,
} from "@phosphor-icons/react/ssr";
import { logger, formatCurrency, formatDate } from "@vayva/shared";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { Button, Input } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { apiJson } from "@/lib/api-client-shared";

interface NonprofitGrant {
  id: string;
  title: string;
  funder: string;
  description: string;
  requestedAmount: number;
  duration: number;
  deadline: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  eligibilityRequirements?: string[];
  requiredDocuments?: string[];
  evaluationCriteria?: string[];
  notes?: string;
  status: string;
  applications?: any[];
  createdAt: string;
  updatedAt: string;
  applicationCount?: number;
  awardedApplications?: number;
  totalAwarded?: number;
  successRate?: number;
  daysUntilDeadline?: number;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  submitted: "bg-blue-500",
  under_review: "bg-yellow-500",
  funded: "bg-green-500",
  rejected: "bg-red-500",
  closed: "bg-purple-500",
};

export default function GrantsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [grants, setGrants] = useState<NonprofitGrant[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [editingGrant, setEditingGrant] = useState<NonprofitGrant | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: "",
    funder: "",
    minAmount: "",
    maxAmount: "",
    deadlineFrom: "",
    deadlineTo: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    funder: "",
    description: "",
    requestedAmount: "",
    duration: "",
    deadline: "",
    website: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    status: "draft",
    notes: "",
  });

  useEffect(() => {
    void fetchGrants();
  }, [filters.page, filters.status]);

  const fetchGrants = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append("page", filters.page.toString());
      queryParams.append("limit", filters.limit.toString());
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.funder) queryParams.append("funder", filters.funder);
      if (filters.minAmount) queryParams.append("minAmount", filters.minAmount.toString());
      if (filters.maxAmount) queryParams.append("maxAmount", filters.maxAmount.toString());
      if (filters.deadlineFrom) queryParams.append("deadlineFrom", filters.deadlineFrom);
      if (filters.deadlineTo) queryParams.append("deadlineTo", filters.deadlineTo);

      const data = await apiJson<{ data: NonprofitGrant[]; meta: PaginationMeta }>("/nonprofit/grants?" + queryParams.toString());
      setGrants(data.data || []);
      setMeta(data.meta || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_GRANTS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Could not load grants");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const requestedAmount = Number(formData.requestedAmount);
    const duration = Number(formData.duration);
    if (!formData.title || !formData.funder || !formData.deadline || isNaN(requestedAmount)) {
      return toast.error("Please fill all required fields");
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        funder: formData.funder,
        description: formData.description,
        requestedAmount,
        duration: duration || 12,
        deadline: formData.deadline,
        website: formData.website,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        status: formData.status,
        notes: formData.notes,
      };

      if (editingGrant) {
        await apiJson(`/api/nonprofit/grants/${editingGrant.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Grant updated successfully");
      } else {
        await apiJson("/nonprofit/grants", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Grant added successfully");
      }

      setIsOpen(false);
      setEditingGrant(null);
      setFormData({
        title: "",
        funder: "",
        description: "",
        requestedAmount: "",
        duration: "",
        deadline: "",
        website: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        status: "draft",
        notes: "",
      });
      void fetchGrants();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SAVE_GRANT_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error(_errMsg || "Failed to save grant");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiJson(`/api/nonprofit/grants/${id}`, { method: "DELETE" });
      toast.success("Grant deleted successfully");
      setDeleteConfirm(null);
      void fetchGrants();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[DELETE_GRANT_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error(_errMsg || "Failed to delete grant");
    }
  };

  const openEdit = (grant: NonprofitGrant) => {
    setEditingGrant(grant);
    setFormData({
      title: grant.title,
      funder: grant.funder,
      description: grant.description || "",
      requestedAmount: String(grant.requestedAmount),
      duration: String(grant.duration),
      deadline: grant.deadline.split("T")[0],
      website: grant.website || "",
      contactName: grant.contactName || "",
      contactEmail: grant.contactEmail || "",
      contactPhone: grant.contactPhone || "",
      status: grant.status,
      notes: grant.notes || "",
    });
    setIsOpen(true);
  };

  const totalGrants = meta.total;
  const totalAmount = grants.reduce((sum, g) => sum + g.requestedAmount, 0);
  const activeGrants = grants.filter((g) => g.status === "funded").length;
  const submittedGrants = grants.filter((g) => g.status === "submitted" || g.status === "under_review").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grant Opportunities"
        description="Track and manage grant opportunities and applications"
        primaryAction={{
          label: "Add Grant",
          icon: "Plus",
          onClick: () => {
            setEditingGrant(null);
            setFormData({
              title: "",
              funder: "",
              description: "",
              requestedAmount: "",
              duration: "",
              deadline: "",
              website: "",
              contactName: "",
              contactEmail: "",
              contactPhone: "",
              status: "draft",
              notes: "",
            });
            setIsOpen(true);
          }
        }}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Total Grants</p>
            <p className="text-2xl font-bold">{totalGrants}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Pipeline Value</p>
            <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Funded</p>
            <p className="text-2xl font-bold">{activeGrants}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="text-2xl font-bold">{submittedGrants}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Funnel className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold">Filters</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Hide" : "Show"}
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                  className="w-full h-10 px-3 rounded-md border bg-white"
                >
                  <option value="">All</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="funded">Funded</option>
                  <option value="rejected">Rejected</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Funder</Label>
                <Input
                  placeholder="Search funders..."
                  value={filters.funder}
                  onChange={(e) => setFilters({ ...filters, funder: e.target.value, page: 1 })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Min Amount</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minAmount}
                    onChange={(e) => setFilters({ ...filters, minAmount: e.target.value, page: 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Amount</Label>
                  <Input
                    type="number"
                    placeholder="100000"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value, page: 1 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Deadline From</Label>
                  <Input
                    type="date"
                    value={filters.deadlineFrom}
                    onChange={(e) => setFilters({ ...filters, deadlineFrom: e.target.value, page: 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deadline To</Label>
                  <Input
                    type="date"
                    value={filters.deadlineTo}
                    onChange={(e) => setFilters({ ...filters, deadlineTo: e.target.value, page: 1 })}
                  />
                </div>
              </div>

              <div className="md:col-span-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      page: 1,
                      limit: 20,
                      status: "",
                      funder: "",
                      minAmount: "",
                      maxAmount: "",
                      deadlineFrom: "",
                      deadlineTo: "",
                    });
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grants List */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : grants.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Money className="h-12 w-12 text-gray-500 mb-4" />
            <h3 className="font-semibold">No grants yet</h3>
            <p className="text-sm text-gray-500 mt-1">
              Add your first grant to start tracking funding opportunities.
            </p>
            <Button onClick={() => setIsOpen(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Grant
            </Button>
          </div>
        ) : (
          <>
            <div className="divide-y">
              {grants.map((grant) => {
                const daysUntilDeadline = grant.daysUntilDeadline ?? Math.ceil(
                  (new Date(grant.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                
                return (
                  <div
                    key={grant.id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/nonprofit/grants/${grant.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <Building className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{grant.title}</h3>
                            <Badge className={statusColors[grant.status]}>
                              {grant.status.replace("_", " ")}
                            </Badge>
                            {daysUntilDeadline !== null && (
                              <Badge
                                className={
                                  daysUntilDeadline < 7
                                    ? "bg-red-500"
                                    : daysUntilDeadline < 30
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }
                              >
                                {daysUntilDeadline > 0 ? `${daysUntilDeadline}d left` : "Past deadline"}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{grant.funder}</p>
                          {grant.description && (
                            <p className="text-sm text-gray-500 line-clamp-2 mb-2">{grant.description}</p>
                          )}
                          <div className="flex items-center gap-6 text-xs text-gray-500">
                            <span className="flex items-center gap-1 font-medium">
                              <Money className="h-3 w-3" />
                              {formatCurrency(grant.requestedAmount)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Deadline: {formatDate(grant.deadline)}
                            </span>
                            {grant.applications && (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                {grant.applications.length} application{grant.applications.length !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(grant);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm({ id: grant.id, title: grant.title });
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t bg-gray-50">
                <div className="text-sm text-gray-600">
                  Showing {(meta.page - 1) * meta.limit + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} grants
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page === 1}
                    onClick={() => setFilters({ ...filters, page: meta.page - 1 })}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                      let pageNum;
                      if (meta.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (meta.page <= 3) {
                        pageNum = i + 1;
                      } else if (meta.page >= meta.totalPages - 2) {
                        pageNum = meta.totalPages - 4 + i;
                      } else {
                        pageNum = meta.page - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={meta.page === pageNum ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setFilters({ ...filters, page: pageNum })}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page === meta.totalPages}
                    onClick={() => setFilters({ ...filters, page: meta.page + 1 })}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGrant ? "Edit Grant Opportunity" : "Add Grant Opportunity"}</DialogTitle>
            <DialogDescription>
              {editingGrant ? "Update grant details" : "Enter details for a new grant opportunity"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Grant Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., STEM Education Initiative"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="funder">Funder/Organization *</Label>
                <Input
                  id="funder"
                  value={formData.funder}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, funder: e.target.value })}
                  placeholder="e.g., Gates Foundation"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the grant opportunity..."
                rows={3}
                className="w-full min-h-[80px] px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requestedAmount">Requested Amount (USD) *</Label>
                <Input
                  id="requestedAmount"
                  type="number"
                  value={formData.requestedAmount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, requestedAmount: e.target.value })}
                  placeholder="50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (months)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="12"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="funded">Funded</option>
                  <option value="rejected">Rejected</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-3 text-sm text-gray-600">Contact Information (Optional)</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="Dr. Jane Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.org"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="contact@example.org"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional internal notes..."
                rows={2}
                className="w-full min-h-[60px] px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingGrant ? "Update Grant" : "Add Grant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
        title="Delete Grant"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
