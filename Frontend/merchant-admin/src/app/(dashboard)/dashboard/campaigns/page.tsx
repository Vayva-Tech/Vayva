"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Megaphone, Plus, Spinner as Loader2, PencilSimple as Edit, Trash, Play, Pause } from "@phosphor-icons/react/ssr";
import { logger } from "@vayva/shared";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { Button, Input, Badge } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { apiJson } from "@/lib/api-client-shared";

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: "draft" | "active" | "paused" | "ended";
  type: "email" | "social" | "sms" | "push";
  startDate?: string;
  endDate?: string;
  targetAudience: string;
  budget?: number;
  spent?: number;
  conversions: number;
  clicks: number;
  createdAt: string;
}

export default function CampaignsPage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "draft" as "draft" | "active" | "paused" | "ended",
    type: "email" as "email" | "social" | "sms" | "push",
    targetAudience: "",
    budget: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => { void fetchCampaigns(); }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const data = await apiJson<Campaign[]>("/api/marketing/campaigns");
      setCampaigns(data || []);
    } catch (error) {
      logger.error("[FETCH_CAMPAIGNS_ERROR]", { error: error instanceof Error ? error.message : String(error), app: "merchant" });
      toast.error("Could not load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name) return toast.error("Campaign name is required");
    setIsSubmitting(true);
    try {
      const payload = { ...formData, budget: formData.budget ? Number(formData.budget) : undefined };
      if (editingCampaign) {
        await apiJson(`/api/marketing/campaigns/${editingCampaign.id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast.success("Campaign updated");
      } else {
        await apiJson("/api/marketing/campaigns", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Campaign created");
      }
      setIsOpen(false);
      setEditingCampaign(null);
      resetForm();
      void fetchCampaigns();
    } catch (error) {
      toast.error("Failed to save campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiJson(`/api/marketing/campaigns/${id}`, { method: "DELETE" });
      toast.success("Campaign deleted");
      setDeleteConfirm(null);
      void fetchCampaigns();
    } catch (error) {
      toast.error("Failed to delete campaign");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    try {
      await apiJson(`/api/marketing/campaigns/${id}/status`, { method: "POST", body: JSON.stringify({ status: newStatus }) });
      toast.success(`Campaign ${newStatus}`);
      void fetchCampaigns();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const openEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description || "",
      status: campaign.status,
      type: campaign.type,
      targetAudience: campaign.targetAudience || "",
      budget: campaign.budget ? String(campaign.budget) : "",
      startDate: campaign.startDate ? campaign.startDate.slice(0, 10) : "",
      endDate: campaign.endDate ? campaign.endDate.slice(0, 10) : "",
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", status: "draft", type: "email", targetAudience: "", budget: "", startDate: "", endDate: "" });
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-600">Active</Badge>;
      case "paused": return <Badge variant="outline">Paused</Badge>;
      case "draft": return <Badge variant="default">Draft</Badge>;
      case "ended": return <Badge variant="outline">Ended</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Marketing Campaigns" description="Create and manage marketing campaigns" primaryAction={{
        label: "New Campaign",
        icon: "Plus",
        onClick: () => { setEditingCampaign(null); resetForm(); setIsOpen(true); }
      }} />

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]"><Input placeholder="Search campaigns..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 rounded-lg border bg-background">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="draft">Draft</option>
          <option value="ended">Ended</option>
        </select>
      </div>

      <div className="bg-background/70 backdrop-blur-xl rounded-xl border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold">No campaigns yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Create your first marketing campaign.</p>
            <Button onClick={() => setIsOpen(true)} className="mt-4"><Plus className="mr-2 h-4 w-4" /> New Campaign</Button>
          </div>
        ) : (
          <div className="divide-y">
            {filteredCampaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 flex items-start gap-4 hover:bg-muted/50">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Megaphone className="h-5 w-5 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{campaign.name}</h3>
                    {getStatusBadge(campaign.status)}
                    <Badge variant="outline">{campaign.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{campaign.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{campaign.conversions} conversions</span>
                    <span>•</span>
                    <span>{campaign.clicks} clicks</span>
                    {campaign.budget && <><span>•</span><span>Budget: ₦{campaign.budget.toLocaleString()}</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {(campaign.status === "active" || campaign.status === "paused") && (
                    <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(campaign.id, campaign.status)}>
                      {campaign.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => openEdit(campaign)}><Edit className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteConfirm({ id: campaign.id, name: campaign.name })}><Trash className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? "Edit Campaign" : "New Campaign"}</DialogTitle>
            <DialogDescription>{editingCampaign ? "Update campaign details" : "Create a new marketing campaign"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Campaign Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Summer Sale 2024" /></div>
            <div className="space-y-2"><Label>Description</Label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Campaign description..." className="w-full px-3 py-2 rounded-lg border bg-background" rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Type</Label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border bg-background"><option value="email">Email</option><option value="social">Social Media</option><option value="sms">SMS</option><option value="push">Push Notification</option></select></div>
              <div className="space-y-2"><Label>Status</Label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border bg-background"><option value="draft">Draft</option><option value="active">Active</option><option value="paused">Paused</option></select></div>
            </div>
            <div className="space-y-2"><Label>Target Audience</Label><Input value={formData.targetAudience} onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })} placeholder="e.g., All customers, VIP members" /></div>
            <div className="space-y-2"><Label>Budget (₦)</Label><Input type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} placeholder="0.00" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>End Date</Label><Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? "Saving..." : editingCampaign ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Campaign" message={`Delete "${deleteConfirm?.name}"?`} confirmText="Delete" onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)} />
    </div>
  );
}

