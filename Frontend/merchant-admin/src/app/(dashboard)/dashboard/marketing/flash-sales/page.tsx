"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Lightning as Zap,
  Plus,
  Clock,
  Timer,
  Spinner as Loader2,
  PencilSimple as Edit2,
  Trash as Trash2,
} from "@phosphor-icons/react/ssr";
import { formatDate, logger } from "@vayva/shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button, Input } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface FlashSale {
  id: string;
  name: string;
  discount: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  targetType: string;
  targetId: string | null;
}

import { apiJson } from "@/lib/api-client-shared";

interface FlashSalesResponse {
  data: FlashSale[];
}

export default function FlashSalesPage() {
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSale, setEditingSale] = useState<FlashSale | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    type: null | "end" | "delete";
    id: string | null;
  }>({ open: false, type: null, id: null });
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    discount: "20",
    durationHours: "24",
  });

  useEffect(() => {
    void fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const data = await apiJson<FlashSalesResponse>(
        "/api/marketing/flash-sales",
      );
      setSales(data?.data || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_FLASH_SALES_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Could not load flash sales");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.discount) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const startTime = new Date();
      const endTime = new Date(
        startTime.getTime() + Number(formData.durationHours) * 60 * 60 * 1000,
      );

      await apiJson<{ success: boolean }>("/api/marketing/flash-sales", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          discount: Number(formData.discount),
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          targetType: "ALL",
        }),
      });

      toast.success("Flash sale created successfully");
      setIsOpen(false);
      setFormData({ name: "", discount: "20", durationHours: "24" }); // Reset
      void fetchSales();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[CREATE_FLASH_SALE_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to create flash sale");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndNow = async (id: string) => {
    setActionLoading(true);
    try {
      await apiJson<{ success: boolean }>(`/api/marketing/flash-sales/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          isActive: false,
          endTime: new Date().toISOString(),
        }),
      });

      toast.success("Sale ended successfully");
      void fetchSales();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[END_FLASH_SALE_ERROR]", {
        error: _errMsg,
        saleId: id,
        app: "merchant",
      });
      toast.error("Failed to end sale early");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(true);
    try {
      await apiJson<{ success: boolean }>(`/api/marketing/flash-sales/${id}`, {
        method: "DELETE",
      });

      toast.success("Flash sale deleted successfully");
      void fetchSales();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[DELETE_FLASH_SALE_ERROR]", {
        error: _errMsg,
        saleId: id,
        app: "merchant",
      });
      toast.error("Could not delete sale");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (sale: FlashSale) => {
    setEditingSale(sale);
    const start = new Date(sale.startTime);
    const end = new Date(sale.endTime);
    const durationHours = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60),
    );

    setFormData({
      name: sale.name,
      discount: sale.discount?.toString(),
      durationHours: durationHours.toString(),
    });
    setIsOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingSale || !formData.name || !formData.discount) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const startTime = new Date();
      const endTime = new Date(
        startTime.getTime() + Number(formData.durationHours) * 60 * 60 * 1000,
      );

      await apiJson<{ success: boolean }>(
        `/api/marketing/flash-sales/${editingSale.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            name: formData.name,
            discount: Number(formData.discount),
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
          }),
        },
      );

      toast.success("Flash sale updated successfully");
      setIsOpen(false);
      setEditingSale(null);
      setFormData({ name: "", discount: "20", durationHours: "24" });
      void fetchSales();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[UPDATE_FLASH_SALE_ERROR]", {
        error: _errMsg,
        saleId: editingSale.id,
        app: "merchant",
      });
      toast.error("Failed to update flash sale");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setIsOpen(false);
    setEditingSale(null);
    setFormData({ name: "", discount: "20", durationHours: "24" });
  };

  return (
    <div className="space-y-6">
      <ConfirmDialog
        isOpen={confirmAction.open}
        onClose={() => setConfirmAction({ open: false, type: null, id: null })}
        onConfirm={() => {
          if (!confirmAction.type || !confirmAction.id) return;
          const { type, id } = confirmAction;
          setConfirmAction({ open: false, type: null, id: null });
          if (type === "end") void handleEndNow(id);
          if (type === "delete") void handleDelete(id);
        }}
        title={
          confirmAction.type === "end"
            ? "End sale now?"
            : confirmAction.type === "delete"
              ? "Delete flash sale?"
              : "Confirm"
        }
        message={
          confirmAction.type === "end"
            ? "This will stop the sale immediately."
            : "This action cannot be undone."
        }
        confirmText={confirmAction.type === "end" ? "End now" : "Delete"}
        cancelText="Cancel"
        variant={confirmAction.type === "end" ? "warning" : "danger"}
        loading={actionLoading}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Flash Sales
          </h1>
          <p className="text-slate-500">
            Create urgency with time-limited offers.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingSale(null);
            setIsOpen(true);
          }}
          className="gap-2 bg-vayva-green text-white hover:bg-vayva-green/90 font-bold shadow-lg shadow-green-500/20"
        >
          <Plus className="h-4 w-4" />
          Create Flash Sale
        </Button>
      </div>

      <div className="bg-background/70 backdrop-blur-xl rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : sales.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="h-12 w-12 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              No active flash sales
            </h3>
            <p className="text-slate-500 max-w-sm mb-6">
              Run a flash sale to clear inventory and boost revenue quickly.
            </p>
            <Button
              onClick={() => setIsOpen(true)}
              className="gap-2 bg-vayva-green text-white hover:bg-vayva-green/90 font-bold"
            >
              <Plus className="h-4 w-4" />
              Create Flash Sale
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {sales.map((sale) => {
              const now = new Date();
              const start = new Date(sale.startTime);
              const end = new Date(sale.endTime);
              const isActive = start <= now && end > now && sale.isActive;
              const isScheduled = start > now;

              return (
                <div
                  key={sale.id}
                  className="border border-slate-200 rounded-lg p-5 hover:bg-white/60 transition-colors group relative"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`p-2 rounded-lg ${isActive ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}
                    >
                      <Zap className="h-5 w-5" />
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : isScheduled
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isActive ? "LIVE" : isScheduled ? "SCHEDULED" : "ENDED"}
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-900 mb-1">
                    {sale.name}
                  </h3>
                  <p className="text-2xl font-bold text-indigo-600 mb-4">
                    {sale.discount}% OFF
                  </p>

                  <div className="space-y-2 text-sm text-slate-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {isActive
                          ? `Ends: ${formatDate(sale.endTime)}`
                          : `Starts: ${formatDate(sale.startTime)}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      <span>Target: {sale.targetType}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!isActive && (
                      <>
                        <Button
                          onClick={() => handleEdit(sale)}
                          variant="outline"
                          size="sm"
                          className="flex-1 opacity-0 group-hover:opacity-100 gap-1.5"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          onClick={() =>
                            setConfirmAction({
                              open: true,
                              type: "delete",
                              id: sale.id,
                            })
                          }
                          variant="outline"
                          size="sm"
                          className="flex-1 opacity-0 group-hover:opacity-100 gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </>
                    )}
                    {isActive && (
                      <Button
                        onClick={() =>
                          setConfirmAction({
                            open: true,
                            type: "end",
                            id: sale.id,
                          })
                        }
                        variant="outline"
                        size="sm"
                        className="w-full opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        End Sale Now
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSale ? "Edit Flash Sale" : "Create Flash Sale"}
            </DialogTitle>
            <DialogDescription>
              {editingSale
                ? "Update the flash sale details."
                : "Launch a time-limited discount for all customers."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Sale Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, name: e.target?.value })
                }
                placeholder="e.g. Midnight Madness"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, discount: e.target?.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (Hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.durationHours}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, durationHours: e.target?.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDialogClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={editingSale ? handleUpdate : handleCreate}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {editingSale ? "Update Sale" : "Launch Sale"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
