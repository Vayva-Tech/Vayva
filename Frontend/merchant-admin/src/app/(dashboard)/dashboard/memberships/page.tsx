"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Crown, Plus, PencilSimple as Edit, Trash, Check, X, Spinner as Loader2 } from "@phosphor-icons/react/ssr";
import { logger } from "@vayva/shared";
import { PageHeader } from "@/components/wix-style/PageHeader";
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
    try { setLoading(true); const data = await apiJson<Membership[]>("/api/memberships"); setMemberships(data || []); } catch (error) { logger.error("[FETCH_MEMBERSHIPS_ERROR]", { error: error instanceof Error ? error.message : String(error), app: "merchant" }); toast.error("Could not load memberships"); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!formData.name) return toast.error("Name is required");
    setIsSubmitting(true);
    try {
      const payload = { ...formData, price: formData.price ? Number(formData.price) : 0, trialDays: formData.trialDays ? Number(formData.trialDays) : 0, features: formData.features.split("\n").map(f => f.trim()).filter(Boolean) };
      if (editingMembership) { await apiJson(`/api/memberships/${editingMembership.id}`, { method: "PUT", body: JSON.stringify(payload) }); toast.success("Membership updated"); }
      else { await apiJson("/api/memberships", { method: "POST", body: JSON.stringify(payload) }); toast.success("Membership created"); }
      setIsOpen(false); setEditingMembership(null); resetForm(); void fetchMemberships();
    } catch { toast.error("Failed to save"); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => { try { await apiJson(`/api/memberships/${id}`, { method: "DELETE" }); toast.success("Deleted"); setDeleteConfirm(null); void fetchMemberships(); } catch { toast.error("Failed to delete"); } };
  const handleToggleActive = async (id: string, isActive: boolean) => { try { await apiJson(`/api/memberships/${id}/toggle`, { method: "POST", body: JSON.stringify({ isActive: !isActive }) }); toast.success(isActive ? "Deactivated" : "Activated"); void fetchMemberships(); } catch { toast.error("Failed to toggle"); } };

  const openEdit = (m: Membership) => { setEditingMembership(m); setFormData({ name: m.name, description: m.description || "", price: String(m.price), billingCycle: m.billingCycle, features: m.features?.join("\n") || "", tier: m.tier, trialDays: String(m.trialDays || 0), isActive: m.isActive }); setIsOpen(true); };
  const resetForm = () => setFormData({ name: "", description: "", price: "", billingCycle: "monthly", features: "", tier: "basic", trialDays: "", isActive: true });

  const filteredMemberships = memberships.filter((m) => { const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()); const matchesTier = tierFilter === "all" || m.tier === tierFilter; return matchesSearch && matchesTier; });

  const getTierBadge = (tier: string) => { switch (tier) { case "vip": return <Badge className="bg-purple-600">VIP</Badge>; case "premium": return <Badge className="bg-gold-500 text-black">Premium</Badge>; case "standard": return <Badge className="bg-blue-600">Standard</Badge>; case "basic": return <Badge variant="default">Basic</Badge>; default: return <Badge variant="default">{tier}</Badge>; } };

  return (
    <div className="space-y-6">
      <PageHeader title="Membership Plans" description="Manage subscription tiers and benefits" primaryAction={{ label: "New Plan", icon: "Plus", onClick: () => { setEditingMembership(null); resetForm(); setIsOpen(true); } }} />
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]"><Input placeholder="Search plans..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
        <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} className="px-4 py-2 rounded-lg border bg-background"><option value="all">All Tiers</option><option value="basic">Basic</option><option value="standard">Standard</option><option value="premium">Premium</option><option value="vip">VIP</option></select>
      </div>
      <div className="bg-background/70 backdrop-blur-xl rounded-xl border overflow-hidden">
        {loading ? (<div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>) : filteredMemberships.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center"><Crown className="h-12 w-12 text-muted-foreground mb-4" /><h3 className="font-semibold">No memberships yet</h3><p className="text-sm text-muted-foreground mt-1">Create your first membership plan.</p><Button onClick={() => setIsOpen(true)} className="mt-4"><Plus className="mr-2 h-4 w-4" /> New</Button></div>
        ) : (<div className="divide-y">{filteredMemberships.map((m) => (<div key={m.id} className="p-4 flex items-start gap-4 hover:bg-muted/50"><div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Crown className="h-5 w-5 text-primary" /></div><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><h3 className="font-semibold truncate">{m.name}</h3>{getTierBadge(m.tier)}{!m.isActive && <Badge variant="outline">Inactive</Badge>}</div><p className="text-sm text-muted-foreground">{m.description}</p><div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground"><span className="font-medium">₦{m.price.toLocaleString()}/{m.billingCycle}</span><span>•</span><span>{m.memberCount} members</span>{m.trialDays > 0 && <><span>•</span><span>{m.trialDays} day trial</span></>}</div></div><div className="flex items-center gap-1"><Button size="sm" variant="ghost" onClick={() => handleToggleActive(m.id, m.isActive)}>{m.isActive ? <X className="h-4 w-4 text-orange-600" /> : <Check className="h-4 w-4 text-green-600" />}</Button><Button size="sm" variant="ghost" onClick={() => openEdit(m)}><Edit className="h-4 w-4" /></Button><Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteConfirm({ id: m.id, name: m.name })}><Trash className="h-4 w-4" /></Button></div></div>))}</div>)}
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingMembership ? "Edit" : "New"} Plan</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Gold Member" /></div><div className="space-y-2"><Label>Description</Label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background" rows={2} /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Price (₦)</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0" /></div><div className="space-y-2"><Label>Billing Cycle</Label><select value={formData.billingCycle} onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border bg-background"><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option><option value="lifetime">Lifetime</option></select></div></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Tier</Label><select value={formData.tier} onChange={(e) => setFormData({ ...formData, tier: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border bg-background"><option value="basic">Basic</option><option value="standard">Standard</option><option value="premium">Premium</option><option value="vip">VIP</option></select></div><div className="space-y-2"><Label>Trial Days</Label><Input type="number" value={formData.trialDays} onChange={(e) => setFormData({ ...formData, trialDays: e.target.value })} placeholder="0" /></div></div><div className="space-y-2"><Label>Features (one per line)</Label><textarea value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} placeholder="- Unlimited access&#10;- Priority support&#10;- Exclusive content" className="w-full px-3 py-2 rounded-lg border bg-background" rows={3} /></div></div><DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? "Saving..." : editingMembership ? "Update" : "Create"}</Button></DialogFooter></DialogContent></Dialog>
      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Plan" message={`Delete "${deleteConfirm?.name}"?`} confirmText="Delete" onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)} />
    </div>
  );
}
