"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Lightning as Zap, Plus, Clock, Timer, PencilSimple as Edit, Trash as TrashIcon, TrendUp, Target, Users, Spinner as Loader2 } from "@phosphor-icons/react";
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
        "/marketing/flash-sales",
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

      await apiJson<{ success: boolean }>("/marketing/flash-sales", {
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

  // Calculate metrics
  const totalSales = sales.length;
  const activeSales = sales.filter(s => s.isActive && new Date(s.startTime) <= new Date() && new Date(s.endTime) > new Date()).length;
  const scheduledSales = sales.filter(s => new Date(s.startTime) > new Date()).length;
  const endedSales = sales.filter(s => !s.isActive || new Date(s.endTime) <= new Date()).length;
  const avgDiscount = totalSales > 0 ? Math.round(sales.reduce((sum, s) => sum + s.discount, 0) / totalSales) : 0;

  const handleDialogClose = () => {
    setIsOpen(false);
    setEditingSale(null);
    setFormData({ name: "", discount: "20", durationHours: "24" });
  };

  return (
    <div className="space-y-6">
      {/* Confirm Dialog */}
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

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Flash Sales</h1>
          <p className="text-sm text-gray-500 mt-1">Create urgency with time-limited offers</p>
        </div>
        <Button
          onClick={() => { setEditingSale(null); setIsOpen(true); }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold"
        >
          <Plus size={18} className="mr-2" />
          Create Flash Sale
        </Button>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <SummaryWidget
          icon={<Zap size={18} />}
          label="Total Sales"
          value={String(totalSales)}
          trend="created"
          positive
        />
        <SummaryWidget
          icon={<TrendUp size={18} />}
          label="Active Now"
          value={String(activeSales)}
          trend="live"
          positive={activeSales > 0}
        />
        <SummaryWidget
          icon={<Clock size={18} />}
          label="Scheduled"
          value={String(scheduledSales)}
          trend="upcoming"
          positive
        />
        <SummaryWidget
          icon={<Timer size={18} />}
          label="Ended"
          value={String(endedSales)}
          trend="completed"
          positive
        />
        <SummaryWidget
          icon={<Target size={18} />}
          label="Avg Discount"
          value={`${avgDiscount}%`}
          trend="average"
          positive
        />
      </div>

      {/* Flash Sales Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sales.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Zap size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No flash sales</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Create your first flash sale to generate urgency and boost sales.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {sales.map((sale) => {
              const now = new Date();
              const start = new Date(sale.startTime);
              const end = new Date(sale.endTime);
              const isActive = start <= now && end > now && sale.isActive;
              const isScheduled = start > now;

              return (
                <div key={sale.id} className="rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                      <Zap size={20} />
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isActive ? 'bg-green-50 text-green-600' : isScheduled ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'
                    }`}>
                      {isActive ? 'LIVE' : isScheduled ? 'SCHEDULED' : 'ENDED'}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1">{sale.name}</h3>
                  <p className="text-2xl font-bold text-green-600 mb-4">{sale.discount}% OFF</p>

                  <div className="space-y-2 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>{isActive ? `Ends: ${formatDate(sale.endTime)}` : `Starts: ${formatDate(sale.startTime)}`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer size={14} />
                      <span>Target: {sale.targetType}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!isActive ? (
                      <>
                        <Button
                          onClick={() => handleEdit(sale)}
                          variant="outline"
                          className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 h-9 rounded-xl font-semibold"
                        >
                          <Edit size={16} className="mr-1.5" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => setConfirmAction({ open: true, type: 'delete', id: sale.id })}
                          variant="outline"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 h-9 rounded-xl font-semibold"
                        >
                          <TrashIcon size={16} className="mr-1.5" />
                          Delete
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setConfirmAction({ open: true, type: 'end', id: sale.id })}
                        variant="outline"
                        className="w-full border-red-200 text-red-600 hover:bg-red-50 h-9 rounded-xl font-semibold"
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

// Summary Widget Component
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
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
            {value}
          </p>
          <p className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-orange-600'}`}>
            {trend}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
