"use client";

import { useState, useEffect } from "react";
import { PencilSimple as Edit, Trash, Plus, Package, Tag, Spinner as Loader2 } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { logger, formatCurrency } from "@vayva/shared";
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
import { ProductPicker } from "@/components/bundles/ProductPicker";

interface DiscountRule {
  id: string;
  name: string;
  type: string;
  valueAmount: number | null;
  valuePercent: number | null;
  appliesTo: string;
  startsAt: string;
  endsAt: string | null;
  productIds: string[];
}

export default function BundlesPage() {
  const [loading, setLoading] = useState(true);
  const [bundles, setBundles] = useState<DiscountRule[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    discount: "10",
    productIds: [] as string[],
    startsAt: "",
    endsAt: "",
  });

  useEffect(() => {
    void fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      setLoading(true);
      const data = await apiJson<DiscountRule[]>("/api/marketing/discounts");
      // Client-side filter: Treat discounts applied to specific products/collections as "Bundles"
      const bundleItems = (data || []).filter(
        (d: DiscountRule) => d.appliesTo === "PRODUCTS" || d.appliesTo === "COLLECTIONS",
      );
      setBundles(bundleItems);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_BUNDLES_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Could not load bundles");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const discountNum = Number(formData.discount);
    if (!formData.name || isNaN(discountNum))
      return toast.error("Please fill all fields");
    if (formData.productIds?.length === 0)
      return toast.error("Please select at least one product");

    setIsSubmitting(true);
    try {
      const isEdit = !!formData.id;
      await apiJson<{ success: boolean }>(
        isEdit
          ? `/api/marketing/discounts/${formData.id}`
          : "/api/marketing/discounts",
        {
          method: isEdit ? "PATCH" : "POST",
          body: JSON.stringify({
            name: formData.name,
            type: "PERCENT",
            valuePercent: discountNum,
            appliesTo: "PRODUCTS",
            startsAt: formData.startsAt
              ? new Date(formData.startsAt).toISOString()
              : new Date().toISOString(),
            endsAt: formData.endsAt
              ? new Date(formData.endsAt).toISOString()
              : null,
            productIds: formData.productIds,
          }),
        },
      );

      toast.success(`Bundle ${isEdit ? "updated" : "created"} successfully`);
      setIsOpen(false);
      setFormData({
        id: "",
        name: "",
        discount: "10",
        productIds: [],
        startsAt: "",
        endsAt: "",
      });
      void fetchBundles();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SAVE_BUNDLE_ERROR]", {
        error: _errMsg,
        id: formData.id,
        app: "merchant",
      });
      toast.error("Failed to save bundle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    try {
      await apiJson<{ success: boolean }>(`/api/marketing/discounts/${id}`, {
        method: "DELETE",
      });
      toast.success("Bundle deleted");
      void fetchBundles();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[DELETE_BUNDLE_ERROR]", {
        error: _errMsg,
        bundleId: id,
        app: "merchant",
      });
      toast.error("Failed to delete bundle");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleEdit = (bundle: DiscountRule) => {
    setFormData({
      id: bundle.id,
      name: bundle.name,
      discount: (bundle.valuePercent || bundle.valueAmount || 0).toString(),
      productIds: bundle.productIds,
      startsAt: bundle.startsAt
        ? new Date(bundle.startsAt).toISOString().slice(0, 16)
        : "",
      endsAt: bundle.endsAt
        ? new Date(bundle.endsAt).toISOString().slice(0, 16)
        : "",
    });
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Bundles
          </h1>
          <p className="text-slate-500">
            Group products together with special pricing.
          </p>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="gap-2 bg-vayva-green text-white hover:bg-vayva-green/90 font-bold shadow-lg shadow-green-500/20"
        >
          <Plus className="h-4 w-4" />
          Create Bundle
        </Button>
      </div>

      <div className="bg-background/70 backdrop-blur-xl rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : bundles.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              No bundles yet
            </h3>
            <p className="text-slate-500 max-w-sm mb-6">
              Bundles help increase average order value by grouping products.
            </p>
            <Button
              onClick={() => setIsOpen(true)}
              className="gap-2 bg-vayva-green text-white hover:bg-vayva-green/90 font-bold"
            >
              <Plus className="h-4 w-4" />
              Create your first bundle
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-background/40 backdrop-blur-sm text-slate-600 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Bundle Name</th>
                  <th className="px-6 py-3">Discount</th>
                  <th className="px-6 py-3">Contents</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bundles.map((bundle) => {
                  const isActive =
                    !bundle.endsAt || new Date(bundle.endsAt) > new Date();
                  return (
                    <tr key={bundle.id} className="hover:bg-white/60 group">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {bundle.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 text-slate-700 font-medium text-xs">
                          <Tag className="h-3 w-3" />
                          {bundle.valuePercent
                            ? `${bundle.valuePercent}% OFF`
                            : bundle.valueAmount
                              ? `-${formatCurrency(Number(bundle.valueAmount))}`
                              : "Custom"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {bundle.productIds?.length || 0} Products
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {isActive ? "Active" : "Expired"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-slate-400">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(bundle)}
                            className="hover:text-indigo-600 hover:bg-slate-100 rounded-lg h-8 w-8"
                            title="Edit Bundle"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteClick(bundle.id, bundle.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Bundle"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formData.id ? "Edit Bundle Offer" : "Create Bundle Offer"}
            </DialogTitle>
            <DialogDescription>
              Create a discounted price for a group of products.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Bundle Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, name: e.target?.value })
                }
                placeholder="e.g. Summer Essentials"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="discount">Discount Percentage</Label>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startsAt">Start Date</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, startsAt: e.target?.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endsAt">End Date (Optional)</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={formData.endsAt || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, endsAt: e.target?.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Products in Bundle</Label>
              <ProductPicker
                selectedIds={formData.productIds}
                onSelectionChange={(ids: string[]) =>
                  setFormData({ ...formData, productIds: ids })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {formData.id ? "Update Bundle" : "Create Bundle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Bundle"
        message={deleteConfirm ? `Delete "${deleteConfirm.name}"? This cannot be undone.` : ""}
      />
    </div>
  );
}
