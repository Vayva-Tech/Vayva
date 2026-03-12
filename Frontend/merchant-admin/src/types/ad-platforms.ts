/**
 * Ad Platform Integration Types
 * Meta (Facebook/Instagram), Google Ads, TikTok Ads
 */

export type AdPlatform = "meta" | "google" | "tiktok";

export interface AdPlatformConfig {
  id: AdPlatform;
  name: string;
  description: string;
  icon: string;
  color: string;
  oauthUrl: string;
  scopes: string[];
}

export interface ConnectedAccount {
  id: string;
  platform: AdPlatform;
  accountName: string;
  accountId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  connectedAt: Date;
  status: "active" | "expired" | "revoked";
}

export interface Campaign {
  id: string;
  platform: AdPlatform;
  name: string;
  status: "active" | "paused" | "completed" | "draft";
  objective: string;
  budget: {
    type: "daily" | "lifetime";
    amount: number;
    currency: string;
  };
  schedule: {
    startDate: Date;
    endDate?: Date;
  };
  targeting?: {
    audiences?: string[];
    demographics?: {
      ageMin?: number;
      ageMax?: number;
      gender?: "male" | "female" | "all";
    };
    locations?: string[];
    interests?: string[];
  };
  creatives?: AdCreative[];
  performance?: {
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
    ctr: number;
    cpc: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AdCreative {
  id: string;
  type: "image" | "video" | "carousel" | "collection";
  headline?: string;
  body?: string;
  callToAction: string;
  mediaUrls: string[];
  linkUrl?: string;
}

export interface CampaignCreateInput {
  platform: AdPlatform;
  name: string;
  objective: CampaignObjective;
  budget: {
    type: "daily" | "lifetime";
    amount: number;
    currency?: string;
  };
  schedule: {
    startDate: string;
    endDate?: string;
  };
  targeting: {
    audiences?: string[];
    ageMin?: number;
    ageMax?: number;
    gender?: "male" | "female" | "all";
    locations?: string[];
    interests?: string[];
  };
  creatives: Omit<AdCreative, "id">[];
}

export type CampaignObjective =
  | "awareness"
  | "traffic"
  | "engagement"
  | "leads"
  | "sales"
  | "app_installs"
  | "video_views"
  | "conversions";

export interface PlatformConnector {
  getAuthUrl(): string;
  exchangeCodeForToken(code: string): Promise<ConnectedAccount>;
  refreshToken(account: ConnectedAccount): Promise<ConnectedAccount>;
  getCampaigns(accountId: string): Promise<Campaign[]>;
  createCampaign(
    accountId: string,
    campaign: CampaignCreateInput,
  ): Promise<Campaign>;
  updateCampaign(
    accountId: string,
    campaignId: string,
    updates: Partial<CampaignCreateInput>,
  ): Promise<Campaign>;
  pauseCampaign(accountId: string, campaignId: string): Promise<void>;
  resumeCampaign(accountId: string, campaignId: string): Promise<void>;
  deleteCampaign(accountId: string, campaignId: string): Promise<void>;
  getInsights(
    accountId: string,
    campaignIds?: string[],
    dateRange?: { since: string; until: string },
  ): Promise<Campaign["performance"]>;
}

export interface AdPlatformState {
  accounts: ConnectedAccount[];
  campaigns: Campaign[];
  isLoading: boolean;
  error: string | null;
}
