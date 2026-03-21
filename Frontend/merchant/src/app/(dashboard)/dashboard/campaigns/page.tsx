// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Megaphone, Plus, PencilSimple as Edit, Trash, Play, Pause, ChartBar, Envelope, ShareNetwork, ChatCircleDots, Bell } from "@phosphor-icons/react";
import { logger } from "@vayva/shared";
import { Button } from "@vayva/ui";
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

  // Calculate metrics
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === "active").length;
  const pausedCampaigns = campaigns.filter(c => c.status === "paused").length;
  const draftCampaigns = campaigns.filter(c => c.status === "draft").length;
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const avgConversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Marketing Campaigns</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage marketing campaigns across channels</p>
        </div>
        <Button onClick={() => { setEditingCampaign(null); resetForm(); setIsOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white">
          <Plus size={18} className="mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Summary Widgets */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <SummaryWidget
            icon={<Megaphone size={18} />}
            label="Total Campaigns"
            value={String(totalCampaigns)}
            trend={`${draftCampaigns} drafts`}
            positive
          />
          <SummaryWidget
            icon={<Play size={18} />}
            label="Active"
            value={String(activeCampaigns)}
            trend="running now"
            positive
          />
          <SummaryWidget
            icon={<Pause size={18} />}
            label="Paused"
            value={String(pausedCampaigns)}
            trend="on hold"
            positive
          />
          <SummaryWidget
            icon={<ChartBar size={18} />}
            label="Conversions"
            value={String(totalConversions)}
            trend={`${avgConversionRate}% rate`}
            positive={parseFloat(avgConversionRate) > 2}
          />
          <SummaryWidget
            icon={<ShareNetwork size={18} />}
            label="Clicks"
            value={String(totalClicks)}
            trend="total clicks"
            positive
          />
          <SummaryWidget
            icon={<Bell size={18} />}
            label="Engagement"
            value={totalClicks > 0 ? `${totalConversions}` : "0"}
            trend="conversions"
            positive={totalConversions > 0}
          />
        </div>
      )}

      {/* Filters */}
      {campaigns.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-white border-gray-200"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
              <option value="ended">Ended</option>
            </select>
          </div>
        </div>
      )}

      {/* Campaigns Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Megaphone size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No campaigns found</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Create your first marketing campaign to reach customers.
            </p>
            <Button onClick={() => { resetForm(); setIsOpen(true); }} className="mt-4 bg-green-600 hover:bg-green-700 text-white">
              <Plus size={18} className="mr-2" />
              Create Campaign
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Audience</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{campaign.name}</div>
                        <div className="text-xs text-gray-500">{campaign.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 capitalize">
                        {campaign.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          campaign.status === "active"
                            ? "bg-green-50 text-green-600"
                            : campaign.status === "paused"
                            ? "bg-orange-50 text-orange-600"
                            : campaign.status === "draft"
                            ? "bg-gray-50 text-gray-600"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {campaign.targetAudience}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm text-gray-900 font-semibold">{campaign.conversions} conversions</div>
                      <div className="text-xs text-gray-500">{campaign.clicks} clicks</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(campaign.id, campaign.status)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            campaign.status === "active"
                              ? "text-orange-600 hover:bg-orange-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={campaign.status === "active" ? "Pause" : "Activate"}
                        >
                          {campaign.status === "active" ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                        <button
                          onClick={() => openEdit(campaign)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ id: campaign.id, name: campaign.name })}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            <div className="space-y-2"><Label>Description</Label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Campaign description..." className="w-full px-3 py-2 rounded-lg border bg-white" rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Type</Label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border bg-white"><option value="email">Email</option><option value="social">Social Media</option><option value="sms">SMS</option><option value="push">Push Notification</option></select></div>
              <div className="space-y-2"><Label>Status</Label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border bg-white"><option value="draft">Draft</option><option value="active">Active</option><option value="paused">Paused</option></select></div>
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
