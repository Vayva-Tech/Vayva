"use client";

import { useState, useEffect } from "react";
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
} from "@phosphor-icons/react/ssr";
import { logger, formatCurrency, formatDate } from "@vayva/shared";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { Button, Input } from "@vayva/ui";
import { Label } from "@/components/ui/label";
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

interface Grant {
  id: string;
  name: string;
  funder: string;
  amount: number;
  status: "draft" | "applied" | "approved" | "rejected" | "active" | "completed" | "reporting";
  appliedDate: string | null;
  awardDate: string | null;
  endDate: string | null;
  purpose: string;
  notes: string;
}

const statusColors: Record<Grant["status"], string> = {
  draft: "bg-gray-500",
  applied: "bg-yellow-500",
  approved: "bg-blue-500",
  rejected: "bg-red-500",
  active: "bg-green-500",
  completed: "bg-purple-500",
  reporting: "bg-orange-500",
};

const statusIcons: Record<Grant["status"], React.ReactNode> = {
  draft: <Clock className="h-4 w-4" />,
  applied: <Clock className="h-4 w-4" />,
  approved: <CheckCircle className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
  active: <Target className="h-4 w-4" />,
  completed: <CheckCircle className="h-4 w-4" />,
  reporting: <Clock className="h-4 w-4" />,
};

export default function GrantsPage() {
  const [loading, setLoading] = useState(true);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [editingGrant, setEditingGrant] = useState<Grant | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    funder: "",
    amount: "",
    purpose: "",
    status: "draft" as Grant["status"],
    notes: "",
  });

  useEffect(() => {
    void fetchGrants();
  }, []);

  const fetchGrants = async () => {
    try {
      setLoading(true);
      const data = await apiJson<Grant[]>("/api/nonprofit/grants");
      setGrants(data || []);
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
    const amountNum = Number(formData.amount);
    if (!formData.name || !formData.funder || isNaN(amountNum)) {
      return toast.error("Please fill all required fields");
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        amount: amountNum,
      };

      if (editingGrant) {
        await apiJson(`/api/nonprofit/grants/${editingGrant.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Grant updated successfully");
      } else {
        await apiJson("/api/nonprofit/grants", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Grant added successfully");
      }

      setIsOpen(false);
      setEditingGrant(null);
      setFormData({ name: "", funder: "", amount: "", purpose: "", status: "draft", notes: "" });
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

  const openEdit = (grant: Grant) => {
    setEditingGrant(grant);
    setFormData({
      name: grant.name,
      funder: grant.funder,
      amount: String(grant.amount),
      purpose: grant.purpose || "",
      status: grant.status,
      notes: grant.notes || "",
    });
    setIsOpen(true);
  };

  const totalGrants = grants.length;
  const totalAmount = grants.reduce((sum, g) => sum + g.amount, 0);
  const activeGrants = grants.filter((g) => g.status === "active").length;
  const approvedGrants = grants.filter((g) => g.status === "approved" || g.status === "active").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grant Management"
        description="Track and manage grants and funding opportunities"
        primaryAction={{
          label: "Add Grant",
          icon: "Plus",
          onClick: () => {
            setEditingGrant(null);
            setFormData({ name: "", funder: "", amount: "", purpose: "", status: "draft", notes: "" });
            setIsOpen(true);
          }
        }}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-background/70 backdrop-blur-xl p-4 rounded-xl border">
          <p className="text-sm text-muted-foreground">Total Grants</p>
          <p className="text-2xl font-bold">{totalGrants}</p>
        </div>
        <div className="bg-background/70 backdrop-blur-xl p-4 rounded-xl border">
          <p className="text-sm text-muted-foreground">Total Amount</p>
          <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-background/70 backdrop-blur-xl p-4 rounded-xl border">
          <p className="text-sm text-muted-foreground">Active Grants</p>
          <p className="text-2xl font-bold">{activeGrants}</p>
        </div>
        <div className="bg-background/70 backdrop-blur-xl p-4 rounded-xl border">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="text-2xl font-bold">{approvedGrants}</p>
        </div>
      </div>

      {/* Grants List */}
      <div className="bg-background/70 backdrop-blur-xl rounded-xl border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : grants.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Money className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold">No grants yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first grant to start tracking funding opportunities.
            </p>
            <Button onClick={() => setIsOpen(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Grant
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {grants.map((grant) => (
              <div key={grant.id} className="p-4 hover:bg-background/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{grant.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs text-white flex items-center gap-1 ${statusColors[grant.status]}`}>
                          {statusIcons[grant.status]}
                          {grant.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{grant.funder}</p>
                      {grant.purpose && (
                        <p className="text-sm text-muted-foreground mt-1">{grant.purpose}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Money className="h-3 w-3" />
                          {formatCurrency(grant.amount)}
                        </span>
                        {grant.appliedDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Applied {formatDate(grant.appliedDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(grant)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => setDeleteConfirm({ id: grant.id, name: grant.name })}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingGrant ? "Edit Grant" : "Add Grant"}</DialogTitle>
            <DialogDescription>
              {editingGrant ? "Update grant details" : "Enter details for a new grant opportunity"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Grant Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Community Development Fund"
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Grant["status"] })}
                  className="w-full h-10 px-3 rounded-md border bg-background"
                >
                  <option value="draft">Draft</option>
                  <option value="applied">Applied</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="reporting">Reporting</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                value={formData.purpose}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="Brief description of grant purpose"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingGrant ? "Update" : "Add Grant"}
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
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
