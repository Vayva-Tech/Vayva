"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Crown, Plus, PencilSimple, Trash, Check, X, Spinner } from "@phosphor-icons/react";
import { logger } from "@vayva/shared";
import { Button, Input, Badge } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { apiJson } from "@/lib/api-client-shared";

interface Membership {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: "monthly" | "quarterly" | "yearly" | "lifetime";
  features: string[];
  isActive: boolean;
  memberCount: number;
  tier: "basic" | "standard" | "premium" | "vip";
  trialDays: number;
  createdAt: string;
}

export default function MembershipsPage() {
  const [loading, setLoading] = useState(true);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    billingCycle: "monthly" as "monthly" | "quarterly" | "yearly" | "lifetime",
    features: "",
    tier: "basic" as "basic" | "standard" | "premium" | "vip",
    trialDays: "",
    isActive: true,
  });

  useEffect(() => { void fetchMemberships(); }, []);

  const fetchMemberships = async () => {
    try { setLoading(true); const data = await apiJson<Membership[]>("/memberships"); setMemberships(data || []); } catch (error) { logger.error("[FETCH_MEMBERSHIPS_ERROR]", { error: error instanceof Error ? error.message : String(error), app: "merchant" }); toast.error("Could not load memberships"); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!formData.name) return toast.error("Name is required");
    setIsSubmitting(true);
    try {
      const payload = { ...formData, price: formData.price ? Number(formData.price) : 0, trialDays: formData.trialDays ? Number(formData.trialDays) : 0, features: formData.features.split("\n").map(f => f.trim()).filter(Boolean) };
      if (editingMembership) { await apiJson(`/api/memberships/${editingMembership.id}`, { method: "PUT", body: JSON.stringify(payload) }); toast.success("Membership updated"); }
      else { await apiJson("/memberships", { method: "POST", body: JSON.stringify(payload) }); toast.success("Membership created"); }
      setIsOpen(false); setEditingMembership(null); resetForm(); void fetchMemberships();
    } catch { toast.error("Failed to save"); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => { try { await apiJson(`/api/memberships/${id}`, { method: "DELETE" }); toast.success("Deleted"); setDeleteConfirm(null); void fetchMemberships(); } catch { toast.error("Failed to delete"); } };
  const handleToggleActive = async (id: string, isActive: boolean) => { try { await apiJson(`/api/memberships/${id}/toggle`, { method: "POST", body: JSON.stringify({ isActive: !isActive }) }); toast.success(isActive ? "Deactivated" : "Activated"); void fetchMemberships(); } catch { toast.error("Failed to toggle"); } };

  const openEdit = (m: Membership) => { setEditingMembership(m); setFormData({ name: m.name, description: m.description || "", price: String(m.price), billingCycle: m.billingCycle, features: m.features?.join("\n") || "", tier: m.tier, trialDays: String(m.trialDays || 0), isActive: m.isActive }); setIsOpen(true); };
  const resetForm = () => setFormData({ name: "", description: "", price: "", billingCycle: "monthly", features: "", tier: "basic", trialDays: "", isActive: true });

  const filteredMemberships = memberships.filter((m) => { const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()); const matchesTier = tierFilter === "all" || m.tier === tierFilter; return matchesSearch && matchesTier; });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "vip": return "bg-purple-50 text-purple-700 border-purple-200";
      case "premium": return "bg-amber-50 text-amber-700 border-amber-200";
      case "standard": return "bg-blue-50 text-blue-700 border-blue-200";
      case "basic": return "bg-gray-50 text-gray-700 border-gray-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const totalMembers = memberships.reduce((sum, m) => sum + m.memberCount, 0);
  const activePlans = memberships.filter(m => m.isActive).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Membership Plans
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage subscription tiers and benefits •{" "}
              <span className="font-semibold text-gray-900">{memberships.length} plans</span>
            </p>
          </div>
          <Button 
            onClick={() => { setEditingMembership(null); resetForm(); setIsOpen(true); }}
            className="rounded-xl bg-green-600 hover:bg-green-700 font-semibold"
          >
            <Plus size={18} weight="fill" className="mr-2" />
            New Plan
          </Button>
        </div>

        {/* Summary Widgets */}
        <div className="grid grid-cols-4 gap-4">
          <SummaryWidget
            icon={<Crown size={18} weight="fill" />}
            label="Total Plans"
            value={memberships.length.toString()}
            trend={`${activePlans} active`}
            positive={true}
          />
          <SummaryWidget
            icon={<Crown size={18} />}
            label="Total Members"
            value={totalMembers.toLocaleString()}
            trend="Across all tiers"
            positive={true}
          />
          <SummaryWidget
            icon={<Check size={18} weight="fill" />}
            label="Active Plans"
            value={activePlans.toString()}
            trend="Live now"
            positive={true}
          />
          <SummaryWidget
            icon={<Crown size={18} />}
            label="Avg Price"
            value={`₦${Math.round(memberships.reduce((sum, m) => sum + m.price, 0) / (memberships.length || 1)).toLocaleString()}`}
            trend="Per month"
            positive={true}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1">
          <Input 
            placeholder="Search plans..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
          />
        </div>
        <select 
          value={tierFilter} 
          onChange={(e) => setTierFilter(e.target.value)} 
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <option value="all">All Tiers</option>
          <option value="basic">Basic</option>
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
          <option value="vip">VIP</option>
        </select>
      </div>

      {/* Membership Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center p-12">
            <Spinner size={32} weight="fill" className="animate-spin text-green-600" />
          </div>
        ) : filteredMemberships.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
            <Crown size={48} weight="fill" className="mb-4 text-gray-400" />
            <h3 className="font-bold text-gray-900 mb-1">No memberships yet</h3>
            <p className="text-sm text-gray-600 mb-4">Create your first membership plan</p>
            <Button 
              onClick={() => setIsOpen(true)}
              className="rounded-xl bg-green-600 hover:bg-green-700 font-semibold"
            >
              <Plus size={18} className="mr-2" />
              New Plan
            </Button>
          </div>
        ) : (
          filteredMemberships.map((m) => (
            <div 
              key={m.id} 
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center flex-shrink-0">
                  <Crown size={24} weight="fill" className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-sm truncate">{m.name}</h3>
                    <Badge className={`text-xs font-semibold ${getTierColor(m.tier)}`}>
                      {m.tier.toUpperCase()}
                    </Badge>
                  </div>
                  {!m.isActive && (
                    <Badge className="text-xs font-semibold bg-gray-50 text-gray-600">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {m.description}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-3 mb-4 text-xs text-gray-600">
                <span className="font-bold text-gray-900">
                  ₦{m.price.toLocaleString()}/{m.billingCycle}
                </span>
                <span>•</span>
                <span>{m.memberCount} members</span>
                {m.trialDays > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-green-600 font-semibold">{m.trialDays} day trial</span>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleToggleActive(m.id, m.isActive)}
                  className="flex-1 rounded-xl font-semibold"
                >
                  {m.isActive ? (
                    <X size={16} weight="fill" className="text-orange-600" />
                  ) : (
                    <Check size={16} weight="fill" className="text-green-600" />
                  )}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => openEdit(m)}
                  className="flex-1 rounded-xl font-semibold"
                >
                  <PencilSimple size={16} weight="fill" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="rounded-xl font-semibold text-red-600 hover:text-red-700"
                  onClick={() => setDeleteConfirm({ id: m.id, name: m.name })}
                >
                  <Trash size={16} weight="fill" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              {editingMembership ? "Edit" : "New"} Plan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Name *</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="e.g., Gold Member"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Description</Label>
              <textarea 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" 
                rows={2} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Price (₦)</Label>
                <Input 
                  type="number" 
                  value={formData.price} 
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                  placeholder="0"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Billing Cycle</Label>
                <select 
                  value={formData.billingCycle} 
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as any })} 
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Tier</Label>
                <select 
                  value={formData.tier} 
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value as any })} 
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold"
                >
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Trial Days</Label>
                <Input 
                  type="number" 
                  value={formData.trialDays} 
                  onChange={(e) => setFormData({ ...formData, trialDays: e.target.value })} 
                  placeholder="0"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Features (one per line)</Label>
              <textarea 
                value={formData.features} 
                onChange={(e) => setFormData({ ...formData, features: e.target.value })} 
                placeholder="- Unlimited access&#10;- Priority support&#10;- Exclusive content" 
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" 
                rows={3} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="rounded-xl font-semibold"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSubmitting}
              className="rounded-xl bg-green-600 hover:bg-green-700 font-semibold"
            >
              {isSubmitting ? "Saving..." : editingMembership ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog 
        isOpen={!!deleteConfirm} 
        onClose={() => setDeleteConfirm(null)} 
        title="Delete Plan" 
        message={`Delete "${deleteConfirm?.name}"?`} 
        confirmText="Delete" 
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)} 
      />
    </div>
  );
}

// ============================================================
// Summary Widget Component
// ============================================================
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
    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-0.5">
            {value}
          </p>
          <p className={`text-xs mt-1 ${positive ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}`}>
            {trend}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-50 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
