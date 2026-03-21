/**
 * Ad Platforms Hub Service
 * Manages connections to advertising platforms (Google Ads, Meta, TikTok)
 */
export interface CampaignPlatform {
  id: string;
  name: string;
  connected: boolean;
}

export const PLATFORM_CONFIGS: Record<string, { id: string; name: string; icon: string; color: string; description: string }> = {
  google: { id: "google", name: "Google Ads", icon: "/icons/google.svg", color: "#4285F4", description: "Search and display advertising" },
  meta: { id: "meta", name: "Meta Ads", icon: "/icons/meta.svg", color: "#1877F2", description: "Facebook and Instagram advertising" },
  tiktok: { id: "tiktok", name: "TikTok Ads", icon: "/icons/tiktok.svg", color: "#000000", description: "TikTok video advertising" },
};

export class AdPlatformHub {
  /**
   * List connected advertising platforms for a store
   */
  static async listConnected(storeId: string): Promise<CampaignPlatform[]> {
    const res = await fetch(`/api/campaigns/platforms?storeId=${storeId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch connected platforms: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Connect an advertising platform
   */
  static async connect(storeId: string, platform: string): Promise<{ success: boolean }> {
    const res = await fetch("/api/campaigns/platforms/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId, platform }),
    });
    if (!res.ok) {
      throw new Error(`Failed to connect platform: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Disconnect an advertising platform
   */
  static async disconnect(storeId: string, platform: string): Promise<{ success: boolean }> {
    const res = await fetch("/api/campaigns/platforms/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId, platform }),
    });
    if (!res.ok) {
      throw new Error(`Failed to disconnect platform: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Pause a running campaign
   */
  static async pauseCampaign(platform: string, accountId: string, campaignId: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/campaigns/${campaignId}/pause`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, accountId }),
    });
    if (!res.ok) {
      throw new Error(`Failed to pause campaign: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Resume a paused campaign
   */
  static async resumeCampaign(platform: string, accountId: string, campaignId: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/campaigns/${campaignId}/resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, accountId }),
    });
    if (!res.ok) {
      throw new Error(`Failed to resume campaign: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Delete a campaign
   */
  static async deleteCampaign(platform: string, accountId: string, campaignId: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/campaigns/${campaignId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, accountId }),
    });
    if (!res.ok) {
      throw new Error(`Failed to delete campaign: ${res.statusText}`);
    }
    return res.json();
  }
}

// Alias for backward compatibility
export const campaignHub = AdPlatformHub;
