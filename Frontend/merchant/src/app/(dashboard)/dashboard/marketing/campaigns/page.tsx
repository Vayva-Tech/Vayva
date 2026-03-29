"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@vayva/ui";
import { Plus, Target } from "@phosphor-icons/react";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { CampaignHub } from "@/components/campaigns/CampaignHub";
import { CampaignList } from "@/components/campaigns/CampaignList";
import { CampaignCreateForm } from "@/components/campaigns/CampaignCreateForm";
import type { AdPlatform, ConnectedAccount, Campaign, CampaignCreateInput } from "@/types/ad-platforms";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CampaignsPage() {
  const [view, setView] = useState<"hub" | "create">("hub");
  const [selectedPlatform, setSelectedPlatform] = useState<AdPlatform | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchParams = useSearchParams();

  const connectedPlatformFromCallback = useMemo(() => {
    const value = searchParams?.get("connectedPlatform");
    if (value === "meta" || value === "google" || value === "tiktok") return value;
    return null;
  }, [searchParams]);

  useEffect(() => {
    // Load persisted accounts for this store (written by OAuth callbacks).
    fetch("/ad-platforms/accounts")
      .then((r) => (r.ok ? r.json() : null))
      .then((json: any) => {
        const accounts = Array.isArray(json?.accounts) ? (json.accounts as ConnectedAccount[]) : [];
        if (accounts.length) setConnectedAccounts(accounts);
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (!connectedPlatformFromCallback) return;

    setConnectedAccounts((prev) => {
      if (prev.some((a) => a.platform === connectedPlatformFromCallback)) return prev;
      const now = new Date();
      const newAccount: ConnectedAccount = {
        id: `${connectedPlatformFromCallback}_${now.getTime()}`,
        platform: connectedPlatformFromCallback,
        accountName: `${connectedPlatformFromCallback.toUpperCase()} Account`,
        accountId: `pending_${connectedPlatformFromCallback}`,
        accessToken: "pending",
        connectedAt: now,
        status: "active",
      };
      return [...prev, newAccount];
    });

    toast.success(`${connectedPlatformFromCallback} connected`);
  }, [connectedPlatformFromCallback]);

  const handleConnect = async (platform: AdPlatform) => {
    try {
      const authUrls: Record<AdPlatform, string> = {
        meta: `/api/auth/meta?callback=/dashboard/marketing/campaigns`,
        google: `/api/auth/google?callback=/dashboard/marketing/campaigns`,
        tiktok: `/api/auth/tiktok?callback=/dashboard/marketing/campaigns`,
      };
      const res = await fetch(authUrls[platform], { method: "GET" });
      if (!res.ok) throw new Error("Failed to start connection");
      const json = await res.json();
      const oauthUrl = (json?.oauthUrl ?? json?.redirectUrl) as string | undefined;
      if (!oauthUrl) throw new Error("Missing OAuth URL");
      window.location.href = oauthUrl;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to connect account";
      toast.error(message);
    }
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
      const response = await fetch("/campaigns", {
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
      await fetch(`/api/campaigns/${campaignId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pause", platform }),
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
      await fetch(`/api/campaigns/${campaignId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resume", platform }),
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
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Connect your ad accounts (merchant setup)</h2>
              <p className="mt-1 text-sm text-gray-600">
                You’re connecting <span className="font-semibold">your own</span> Meta / Google / TikTok ad accounts to your store. Vayva never asks you to share passwords.
              </p>
            </div>
            <Link
              href="/docs/merchant/ad-platforms"
              className="text-sm font-semibold text-green-700 hover:text-green-800"
            >
              Full guide →
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-900">Meta Ads (Facebook/Instagram)</h3>
              <ol className="mt-2 space-y-1 text-sm text-gray-600 list-decimal list-inside">
                <li>Make sure you can access the Business Manager that owns the ad account.</li>
                <li>Ensure you have permission to manage ads (admin/advertiser) on that ad account.</li>
                <li>Click <span className="font-semibold">Connect Account</span> under Meta and approve the permissions prompt.</li>
              </ol>
              <p className="mt-2 text-xs text-gray-500">
                If it fails: disable ad blockers, allow popups, and confirm you’re logged into the correct Facebook profile.
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-900">Google Ads</h3>
              <ol className="mt-2 space-y-1 text-sm text-gray-600 list-decimal list-inside">
                <li>Sign in with the Google account that has access to your Google Ads account.</li>
                <li>Click <span className="font-semibold">Connect Account</span> under Google and approve access.</li>
                <li>If you use a manager (MCC) account, select the correct client account after connecting (in the full guide).</li>
              </ol>
              <p className="mt-2 text-xs text-gray-500">
                If you connect but can’t create campaigns, your Google Ads account may require additional access/approval.
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-900">TikTok Ads</h3>
              <ol className="mt-2 space-y-1 text-sm text-gray-600 list-decimal list-inside">
                <li>Make sure you have access to a TikTok Business Center + advertiser account.</li>
                <li>Click <span className="font-semibold">Connect Account</span> under TikTok and approve access.</li>
                <li>We’ll automatically link your first available advertiser account; you can change it in the full guide.</li>
              </ol>
              <p className="mt-2 text-xs text-gray-500">
                If it fails: confirm you’re using a Business account (not personal-only) and that your advertiser is active.
              </p>
            </div>
          </div>
        </div>

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
