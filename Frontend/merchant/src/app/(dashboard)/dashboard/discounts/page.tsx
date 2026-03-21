// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Button, Input, Label, Select } from "@vayva/ui";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@vayva/shared";
import {
  Plus,
  Tag,
  Percent,
  Calendar,
  Trash,
  Copy,
} from "@phosphor-icons/react/ssr";
import { Search, MoreHorizontal, Edit } from "lucide-react";

interface Discount {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  appliesTo: "all" | "products" | "categories";
  productIds?: string[];
  categoryIds?: string[];
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const data = await apiJson<{ discounts: Discount[] }>("/api/discounts");
      setDiscounts(data.discounts || []);
    } catch (error) {
      logger.error("[DISCOUNTS_FETCH_ERROR]", { error });
      toast.error("Failed to load discounts");
    } finally {
      setLoading(false);
    }
  };

  const filteredDiscounts = discounts.filter((d) =>
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  const activeDiscounts = filteredDiscounts.filter((d) => d.isActive);
  const expiredDiscounts = filteredDiscounts.filter(
    (d) => !d.isActive || (d.endDate && new Date(d.endDate) < new Date())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg">
            <Tag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Discounts</h1>
            <p className="text-gray-500">Create coupons and promo codes</p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Discount
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white  rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Active Codes</p>
          <p className="text-3xl font-black text-gray-900 mt-2">
            {activeDiscounts.length}
          </p>
        </div>
        <div className="bg-white  rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Total Uses</p>
          <p className="text-3xl font-black text-gray-900 mt-2">
            {discounts.reduce((sum: number, d) => sum + d.usedCount, 0)}
          </p>
        </div>
        <div className="bg-white  rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Avg Discount</p>
          <p className="text-3xl font-black text-gray-900 mt-2">
            {discounts.length > 0
              ? Math.round(
                  discounts.reduce((sum: number, d) => sum + d.value, 0) / discounts.length
                )
              : 0}
            %
          </p>
        </div>
        <div className="bg-white  rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Expired</p>
          <p className="text-3xl font-black text-gray-500 mt-2">
            {expiredDiscounts.length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search discount codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Discounts List */}
      <div className="bg-white  rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : filteredDiscounts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              No discounts yet
            </h3>
            <p className="text-gray-700 mb-4">
              Create your first promo code to boost sales
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Discount
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredDiscounts.map((discount) => (
              <DiscountRow
                key={discount.id}
                discount={discount}
                onUpdate={fetchDiscounts}
                onEdit={(d) => {
                  setDiscountToEdit(d);
                  setShowEditModal(true);
                }}
                onDelete={async (d) => {
                  if (!confirm(`Are you sure you want to delete discount "${d.code}"?`)) {
                    return;
                  }
                  try {
                    await apiJson(`/api/discounts/${d.id}`, {
                      method: "DELETE",
                    });
                    toast.success("Discount deleted successfully");
                    fetchDiscounts();
                  } catch (error) {
                    toast.error("Failed to delete discount");
                    console.error(error);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateDiscountModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchDiscounts}
        />
      )}
    </div>
  );
}

function DiscountRow({
  discount,
  onUpdate,
  onEdit,
  onDelete,
}: {
  discount: Discount;
  onUpdate: () => void;
  onEdit: (discount: Discount) => void;
  onDelete: (discount: Discount) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleActive = async () => {
    try {
      await apiJson(`/api/discounts/${discount.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !discount.isActive }),
      });
      toast.success(discount.isActive ? "Discount paused" : "Discount activated");
      onUpdate();
    } catch {
      toast.error("Failed to update discount");
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(discount.code);
    toast.success("Code copied to clipboard");
  };

  const handleEdit = () => {
    onEdit(discount);
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete discount "${discount.code}"?`)) {
      return;
    }
    
    try {
      await apiJson(`/api/discounts/${discount.id}`, {
        method: "DELETE",
      });
      toast.success("Discount deleted successfully");
      onUpdate();
    } catch (error) {
      toast.error("Failed to delete discount");
      console.error(error);
    }
  };

  const isExpired = discount.endDate && new Date(discount.endDate) < new Date();

  return (
    <div className="p-4 flex items-center justify-between hover:bg-white transition">
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            discount.type === "percentage"
              ? "bg-green-50 text-green-600"
              : discount.type === "fixed"
              ? "bg-green-500/10 text-green-600"
              : "bg-green-50 text-green-600"
          }`}
        >
          {discount.type === "percentage" ? (
            <Percent className="w-5 h-5" />
          ) : discount.type === "fixed" ? (
            <Tag className="w-5 h-5" />
          ) : (
            <Calendar className="w-5 h-5" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-gray-900">{discount.code}</h4>
            {!discount.isActive && (
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">
                PAUSED
              </span>
            )}
            {isExpired && (
              <span className="text-[10px] bg-red-500 text-red-500 px-2 py-0.5 rounded-full font-bold">
                EXPIRED
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700">
            {discount.type === "percentage"
              ? `${discount.value}% off`
              : discount.type === "fixed"
              ? `₦${discount.value.toLocaleString()} off`
              : "Free shipping"}
            {discount.minOrderAmount && ` • Min order ₦${discount.minOrderAmount.toLocaleString()}`}
            {discount.maxUses && ` • ${discount.usedCount}/${discount.maxUses} uses`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleActive}
          className={discount.isActive ? "text-amber-600" : "text-green-600"}
        >
          {discount.isActive ? "Pause" : "Activate"}
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px] z-10">
              <button
                onClick={copyCode}
                className="w-full px-3 py-2 text-sm text-left hover:bg-white flex items-center gap-2"
              >
                <Copy className="w-4 h-4" /> Copy Code
              </button>
              <button
                onClick={() => {
                  onEdit(discount);
                  setMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-white flex items-center gap-2"
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => {
                  onDelete(discount);
                  setMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-white flex items-center gap-2 text-red-500"
              >
                <Trash className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateDiscountModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<{
    code: string;
    type: "percentage" | "fixed" | "free_shipping";
    value: string;
    minOrderAmount: string;
    maxUses: string;
    startDate: string;
    endDate: string;
    appliesTo: "all" | "products" | "categories";
  }>({
    code: "",
    type: "percentage",
    value: "",
    minOrderAmount: "",
    maxUses: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    appliesTo: "all",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiJson("/api/discounts", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          value: Number(form.value),
          minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
          maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        }),
      });
      toast.success("Discount created successfully");
      onCreated();
      onClose();
    } catch {
      toast.error("Failed to create discount");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Create Discount Code</h2>
          <p className="text-sm text-gray-700">
            Set up a new promo code for your customers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Code *</Label>
            <Input
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
              }
              placeholder="e.g., SUMMER2026"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={form.type}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, type: e.target.value as typeof form.type })}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="free_shipping">Free Shipping</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Value {(form.type as any) !== "free_shipping" && "*"}</Label>
              <Input
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder={(form.type as any) === "percentage" ? "20" : "5000"}
                disabled={(form.type as any) === "free_shipping"}
                required={(form.type as any) !== "free_shipping"}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Order Amount (₦)</Label>
              <Input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) =>
                  setForm({ ...form, minOrderAmount: e.target.value })
                }
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label>Max Uses</Label>
              <Input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                placeholder="Unlimited"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                placeholder="No expiry"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Applies To</Label>
            <Select
              value={form.appliesTo}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, appliesTo: e.target.value as typeof form.appliesTo })}
            >
              <option value="all">All Products</option>
              <option value="products">Specific Products</option>
              <option value="categories">Specific Categories</option>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create Discount"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
