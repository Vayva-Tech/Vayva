"use client";

import { useState } from "react";
import { Button } from "@vayva/ui";
import { Plus, Target } from "@phosphor-icons/react";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { CampaignHub } from "@/components/campaigns/CampaignHub";
import { CampaignList } from "@/components/campaigns/CampaignList";
import { CampaignCreateForm } from "@/components/campaigns/CampaignCreateForm";
import type { AdPlatform, ConnectedAccount, Campaign, CampaignCreateInput } from "@/types/ad-platforms";
import { toast } from "sonner";

export default function CampaignsPage() {
  const [view, setView] = useState<"hub" | "create">("hub");
  const [selectedPlatform, setSelectedPlatform] = useState<AdPlatform | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConnect = (platform: AdPlatform) => {
    const authUrls: Record<AdPlatform, string> = {
      meta: `/api/auth/meta?callback=/dashboard/marketing/campaigns`,
      google: `/api/auth/google?callback=/dashboard/marketing/campaigns`,
      tiktok: `/api/auth/tiktok?callback=/dashboard/marketing/campaigns`,
    };
    window.location.href = authUrls[platform];
  };

  const handleDisconnect = async (accountId: string) => {
    setConnectedAccounts((prev) => prev.filter((a) => a.id !== accountId));
    toast.success("Account disconnected");
  };

  const handleCreateCampaign = (platform: AdPlatform) => {
    // Check if platform is connected
    const isConnected = connectedAccounts.some((a) => a.platform === platform);
    if (!isConnected) {
      toast.error(`Please connect your ${platform} account first`);
      return;
    }
    setSelectedPlatform(platform);
    setView("create");
  };

  const handleSubmitCampaign = async (data: CampaignCreateInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create campaign");
      const campaign = (await response.json()) as Campaign;
      setCampaigns((prev) => [...prev, campaign]);
      setView("hub");
      setSelectedPlatform(null);
      toast.success("Campaign created successfully");
    } catch (error: unknown) {
      toast.error("Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePauseCampaign = async (platform: AdPlatform, campaignId: string) => {
    try {
      await fetch(`/api/campaigns/${campaignId}/pause`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignId ? { ...c, status: "paused" as const } : c))
      );
      toast.success("Campaign paused");
    } catch {
      toast.error("Failed to pause campaign");
    }
  };

  const handleResumeCampaign = async (platform: AdPlatform, campaignId: string) => {
    try {
      await fetch(`/api/campaigns/${campaignId}/resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignId ? { ...c, status: "active" as const } : c))
      );
      toast.success("Campaign resumed");
    } catch {
      toast.error("Failed to resume campaign");
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{ platform: AdPlatform; campaignId: string } | null>(null);

  const handleDeleteCampaign = async (platform: AdPlatform, campaignId: string) => {
    setDeleteConfirm({ platform, campaignId });
  };

  const confirmDeleteCampaign = async () => {
    if (!deleteConfirm) return;
    const { platform, campaignId } = deleteConfirm;
    try {
      await fetch(`/api/campaigns/${campaignId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
      toast.success("Campaign deleted");
    } catch {
      toast.error("Failed to delete campaign");
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (view === "create" && selectedPlatform) {
    return (
      <DashboardPageShell
        title="Create Campaign"
        description="Set up a new ad campaign"
        category="Marketing"
      >
        <CampaignCreateForm
          platform={selectedPlatform}
          onSubmit={handleSubmitCampaign}
          onCancel={() => {
            setView("hub");
            setSelectedPlatform(null);
          }}
          isSubmitting={isSubmitting}
        />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title="Campaigns"
      description="Manage ad campaigns across Meta, Google, and TikTok"
      category="Marketing"
      actions={
        <Button onClick={() => setView("create")}>
          <Plus className="mr-2 h-4 w-4" /> Create Campaign
        </Button>
      }
    >
      <div className="space-y-8">
        <CampaignHub
          connectedAccounts={connectedAccounts}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onCreateCampaign={handleCreateCampaign}
        />
        {campaigns.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              <h3 className="font-semibold">Your Campaigns</h3>
            </div>
            <CampaignList
              campaigns={campaigns}
              onPause={handlePauseCampaign}
              onResume={handleResumeCampaign}
              onDelete={handleDeleteCampaign}
              onViewDetails={(campaign: Campaign) => {}}
            />
          </div>
        )}
      </div>
    </DashboardPageShell>
  );
}
