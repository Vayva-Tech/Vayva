"use client";
import { useState, useEffect } from "react";
import { PencilSimple as Edit, Trash, Plus, Package, Tag, TrendUp, Users, Spinner as Loader2 } from "@phosphor-icons/react";
import { toast } from "sonner";
import { logger, formatCurrency } from "@vayva/shared";
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

  // Calculate metrics
  const totalBundles = bundles.length;
  const activeBundles = bundles.filter(b => !b.endsAt || new Date(b.endsAt) > new Date()).length;
  const expiredBundles = bundles.filter(b => b.endsAt && new Date(b.endsAt) <= new Date()).length;
  const avgDiscount = totalBundles > 0 ? Math.round(bundles.reduce((sum, b) => sum + (b.valuePercent || 0), 0) / totalBundles) : 0;

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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bundles</h1>
          <p className="text-sm text-gray-500 mt-1">Group products together with special pricing</p>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold"
        >
          <Plus size={18} className="mr-2" />
          Create Bundle
        </Button>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <SummaryWidget
          icon={<Package size={18} />}
          label="Total Bundles"
          value={String(totalBundles)}
          trend="created"
          positive
        />
        <SummaryWidget
          icon={<TrendUp size={18} />}
          label="Active Now"
          value={String(activeBundles)}
          trend="live"
          positive={activeBundles > 0}
        />
        <SummaryWidget
          icon={<Tag size={18} />}
          label="Expired"
          value={String(expiredBundles)}
          trend="ended"
          positive
        />
        <SummaryWidget
          icon={<Users size={18} />}
          label="Products in Bundles"
          value={String(bundles.reduce((sum, b) => sum + (b.productIds?.length || 0), 0))}
          trend="total"
          positive
        />
        <SummaryWidget
          icon={<TrendUp size={18} />}
          label="Avg Discount"
          value={`${avgDiscount}%`}
          trend="average"
          positive
        />
      </div>

      {/* Bundles Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bundles.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Package size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No bundles yet</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Create your first bundle to increase average order value.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Bundle Name</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Contents</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bundles.map((bundle) => {
                  const isActive = !bundle.endsAt || new Date(bundle.endsAt) > new Date();
                  return (
                    <tr key={bundle.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{bundle.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 font-semibold text-xs">
                          <Tag size={12} />
                          {bundle.valuePercent ? `${bundle.valuePercent}% OFF` : bundle.valueAmount ? `-${formatCurrency(Number(bundle.valueAmount))}` : 'Custom'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{bundle.productIds?.length || 0} Products</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isActive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
                        }`}>
                          {isActive ? 'Active' : 'Expired'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleEdit(bundle)}
                            variant="outline"
                            className="border-gray-200 text-gray-600 hover:bg-gray-50 h-9 rounded-xl font-semibold"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            onClick={() => handleDeleteClick(bundle.id, bundle.name)}
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 h-9 rounded-xl font-semibold"
                          >
                            <Trash size={16} />
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
