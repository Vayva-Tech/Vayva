import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { getRedisClient } from "@/lib/redis";
import type { AdPlatform, Campaign, CampaignObjective } from "@/types/ad-platforms";
import crypto from "crypto";

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function nowIso() {
  return new Date().toISOString();
}

const createSchema = z.object({
  platform: z.enum(["meta", "google", "tiktok"]),
  name: z.string().min(1).max(200),
  objective: z.enum([
    "awareness",
    "traffic",
    "engagement",
    "leads",
    "sales",
    "app_installs",
    "video_views",
    "conversions",
  ]),
  budget: z.object({
    type: z.enum(["daily", "lifetime"]),
    amount: z.number().positive(),
    currency: z.string().optional(),
  }),
  schedule: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
  }),
  targeting: z.any().optional(),
  creatives: z.array(z.any()).default([]),
});

type RawConnectedAccount = {
  platform: AdPlatform;
  accountId: string;
  accountName: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string | Date;
  status: string;
};

function getTokenEncryptionKey(): Buffer | null {
  const key = process.env.ADS_TOKEN_ENCRYPTION_KEY || process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!key || key.length < 32) return null;
  return crypto.createHash("sha256").update(key).digest();
}

function decryptToken(value: string): string {
  if (!value.startsWith("enc:v1:")) return value;
  const key = getTokenEncryptionKey();
  if (!key) return value;
  const parts = value.split(":");
  const iv = Buffer.from(parts[2] || "", "base64");
  const tag = Buffer.from(parts[3] || "", "base64");
  const data = Buffer.from(parts[4] || "", "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString("utf8");
}

async function getRawConnectedAccount(storeId: string, platform: AdPlatform): Promise<RawConnectedAccount | null> {
  const redis = await getRedisClient();
  const key = `ads:accounts:${storeId}`;
  const accounts = safeJsonParse<RawConnectedAccount[]>(await redis.get(key)) || [];
  const account = accounts.find((a) => a.platform === platform) || null;
  if (!account) return null;
  const accessToken = decryptToken(account.accessToken || "");
  if (!accessToken || accessToken === "pending" || accessToken === "redacted") return null;
  return { ...account, accessToken, refreshToken: account.refreshToken ? decryptToken(account.refreshToken) : undefined };
}

function mapObjectiveToMeta(objective: CampaignObjective): string {
  switch (objective) {
    case "sales":
    case "conversions":
      return "OUTCOME_SALES";
    case "traffic":
      return "OUTCOME_TRAFFIC";
    case "engagement":
    case "video_views":
      return "OUTCOME_ENGAGEMENT";
    case "leads":
      return "OUTCOME_LEADS";
    case "awareness":
    case "app_installs":
    default:
      return "OUTCOME_AWARENESS";
  }
}

function mapObjectiveToTikTok(objective: CampaignObjective): string {
  switch (objective) {
    case "traffic":
      return "TRAFFIC";
    case "leads":
      return "LEAD_GENERATION";
    case "video_views":
      return "VIDEO_VIEWS";
    case "sales":
    case "conversions":
      return "CONVERSIONS";
    case "engagement":
      return "ENGAGEMENT";
    case "awareness":
    case "app_installs":
    default:
      return "REACH";
  }
}

function mapObjectiveToGoogleChannel(objective: CampaignObjective): "SEARCH" | "DISPLAY" | "VIDEO" | "APP" {
  switch (objective) {
    case "video_views":
      return "VIDEO";
    case "app_installs":
      return "APP";
    case "awareness":
      return "DISPLAY";
    case "traffic":
    case "leads":
    case "sales":
    case "conversions":
    case "engagement":
    default:
      return "SEARCH";
  }
}

function requireGoogleAdsHeaders(accessToken: string) {
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;
  if (!developerToken) {
    return { ok: false as const, error: "Missing GOOGLE_ADS_DEVELOPER_TOKEN" };
  }
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "developer-token": developerToken,
    "Content-Type": "application/json",
  };
  if (loginCustomerId) headers["login-customer-id"] = loginCustomerId;
  return { ok: true as const, headers };
}

/**
 * GET /api/campaigns
 * List ad campaigns for the current store.
 * If a platform is specified and is connected, fetch from provider.
 */
export async function GET(request: NextRequest) {
  const auth = await buildBackendAuthHeaders(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform") as AdPlatform | null;

  // If requesting Meta campaigns and we have a real connection, fetch from Meta.
  if (platform === "meta") {
    const account = await getRawConnectedAccount(auth.user.storeId, "meta");
    if (!account) {
      return NextResponse.json(
        { error: "Meta not connected (missing valid access token)" },
        { status: 400 },
      );
    }

    const actId = account.accountId.startsWith("act_") ? account.accountId : `act_${account.accountId}`;
    const listUrl = new URL(`https://graph.facebook.com/v18.0/${actId}/campaigns`);
    listUrl.searchParams.set("fields", "id,name,status,objective,created_time,updated_time");
    listUrl.searchParams.set("limit", "50");
    listUrl.searchParams.set("access_token", account.accessToken);

    const res = await fetch(listUrl.toString(), { method: "GET" });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json({ error: "Failed to fetch Meta campaigns", details: text }, { status: 502 });
    }
    const json = (await res.json().catch(() => null)) as any;
    const data = Array.isArray(json?.data) ? json.data : [];
    const campaigns: Campaign[] = data.map((c: any) => ({
      id: String(c.id),
      platform: "meta",
      name: String(c.name || "Campaign"),
      status: String(c.status || "").toUpperCase() === "PAUSED" ? "paused" : "active",
      objective: "sales",
      budget: { type: "daily", amount: 0, currency: "NGN" },
      schedule: { startDate: new Date(), endDate: undefined },
      createdAt: new Date(c.created_time || Date.now()),
      updatedAt: new Date(c.updated_time || Date.now()),
    }));
    return NextResponse.json({ campaigns });
  }

  if (platform === "tiktok") {
    const account = await getRawConnectedAccount(auth.user.storeId, "tiktok");
    if (!account) {
      return NextResponse.json(
        { error: "TikTok not connected (missing valid access token)" },
        { status: 400 },
      );
    }

    const advertiserId = account.accountId;
    const res = await fetch("https://business-api.tiktok.com/open_api/v1.3/campaign/get/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": account.accessToken,
      },
      body: JSON.stringify({
        advertiser_id: advertiserId,
        fields: ["campaign_id", "campaign_name", "operation_status", "objective_type", "create_time", "modify_time"],
        page: 1,
        page_size: 50,
      }),
    });

    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok || json?.code) {
      return NextResponse.json(
        { error: "Failed to fetch TikTok campaigns", details: json },
        { status: 502 },
      );
    }

    const list = Array.isArray(json?.data?.list) ? json.data.list : [];
    const campaigns: Campaign[] = list.map((c: any) => ({
      id: String(c.campaign_id),
      platform: "tiktok",
      name: String(c.campaign_name || "Campaign"),
      status: String(c.operation_status || "").toUpperCase() === "DISABLE" ? "paused" : "active",
      objective: "sales",
      budget: { type: "daily", amount: 0, currency: "NGN" },
      schedule: { startDate: new Date(), endDate: undefined },
      createdAt: new Date((Number(c.create_time) || Date.now()) * 1000),
      updatedAt: new Date((Number(c.modify_time) || Date.now()) * 1000),
    }));

    return NextResponse.json({ campaigns });
  }

  if (platform === "google") {
    const account = await getRawConnectedAccount(auth.user.storeId, "google");
    if (!account) {
      return NextResponse.json(
        { error: "Google not connected (missing valid access token)" },
        { status: 400 },
      );
    }
    const googleHeaders = requireGoogleAdsHeaders(account.accessToken);
    if (!googleHeaders.ok) {
      return NextResponse.json(
        { error: "Google Ads not configured", details: googleHeaders.error },
        { status: 501 },
      );
    }
    // account.accountId should be a customer ID (digits) from listAccessibleCustomers.
    const customerId = account.accountId;
    const res = await fetch(
      `https://googleads.googleapis.com/v19/customers/${encodeURIComponent(customerId)}/googleAds:searchStream`,
      {
        method: "POST",
        headers: googleHeaders.headers,
        body: JSON.stringify({
          query: "SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type FROM campaign ORDER BY campaign.id DESC LIMIT 50",
        }),
      },
    );
    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Google campaigns", details: json },
        { status: 502 },
      );
    }
    const results: any[] = Array.isArray(json) ? json.flatMap((p: any) => p?.results || []) : [];
    const campaigns: Campaign[] = results.map((r: any) => {
      const c = r?.campaign || {};
      const status = String(c.status || "");
      return {
        id: String(c.id),
        platform: "google",
        name: String(c.name || "Campaign"),
        status: status === "PAUSED" ? "paused" : "active",
        objective: "sales",
        budget: { type: "daily", amount: 0, currency: "USD" },
        schedule: { startDate: new Date(), endDate: undefined },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });
    return NextResponse.json({ campaigns });
  }

  const redis = await getRedisClient();
  const key = `ads:campaigns:${auth.user.storeId}`;
  let campaigns = safeJsonParse<Campaign[]>(await redis.get(key)) || [];
  if (platform) campaigns = campaigns.filter((c) => c.platform === platform);
  return NextResponse.json({ campaigns });
}

/**
 * POST /api/campaigns
 * Create an ad campaign (stored locally). This unblocks the UI until real ad APIs are wired.
 */
export async function POST(request: NextRequest) {
  const auth = await buildBackendAuthHeaders(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid campaign data", details: parsed.error.format() },
      { status: 400 },
    );
  }

  const input = parsed.data as z.infer<typeof createSchema>;

  // Real Meta campaign create (campaign object only; ad sets/ads are separate).
  if (input.platform === "meta") {
    const account = await getRawConnectedAccount(auth.user.storeId, "meta");
    if (!account) {
      return NextResponse.json(
        { error: "Meta not connected (missing valid access token)" },
        { status: 400 },
      );
    }

    const actId = account.accountId.startsWith("act_") ? account.accountId : `act_${account.accountId}`;
    const createUrl = new URL(`https://graph.facebook.com/v18.0/${actId}/campaigns`);
    const objective = mapObjectiveToMeta(input.objective);

    const res = await fetch(createUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        access_token: account.accessToken,
        name: input.name,
        objective,
        status: "PAUSED",
        special_ad_categories: "[]",
      }).toString(),
    });

    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok || !json?.id) {
      return NextResponse.json(
        { error: "Failed to create Meta campaign", details: json },
        { status: 502 },
      );
    }

    const created: Campaign = {
      id: String(json.id),
      platform: "meta",
      name: input.name,
      status: "paused",
      objective: input.objective,
      budget: { type: input.budget.type, amount: input.budget.amount, currency: input.budget.currency || "NGN" },
      schedule: { startDate: input.schedule.startDate, endDate: input.schedule.endDate },
      targeting: input.targeting,
      creatives: input.creatives as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(created, { status: 201 });
  }

  if (input.platform === "google") {
    const account = await getRawConnectedAccount(auth.user.storeId, "google");
    if (!account) {
      return NextResponse.json(
        { error: "Google not connected (missing valid access token)" },
        { status: 400 },
      );
    }
    const googleHeaders = requireGoogleAdsHeaders(account.accessToken);
    if (!googleHeaders.ok) {
      return NextResponse.json(
        { error: "Google Ads not configured", details: googleHeaders.error },
        { status: 501 },
      );
    }
    const customerId = account.accountId;
    const budgetMicros = Math.round(input.budget.amount * 1_000_000);

    // 1) Create a campaign budget
    const budgetRes = await fetch(
      `https://googleads.googleapis.com/v19/customers/${encodeURIComponent(customerId)}/campaignBudgets:mutate`,
      {
        method: "POST",
        headers: googleHeaders.headers,
        body: JSON.stringify({
          operations: [
            {
              create: {
                name: `${input.name} Budget (${Date.now()})`,
                amountMicros: String(budgetMicros),
                explicitlyShared: false,
              },
            },
          ],
        }),
      },
    );
    const budgetJson = (await budgetRes.json().catch(() => null)) as any;
    if (!budgetRes.ok) {
      return NextResponse.json({ error: "Failed to create Google budget", details: budgetJson }, { status: 502 });
    }
    const budgetResourceName =
      budgetJson?.results?.[0]?.resourceName || budgetJson?.results?.[0]?.resource_name;
    if (!budgetResourceName) {
      return NextResponse.json({ error: "Missing Google budget resourceName", details: budgetJson }, { status: 502 });
    }

    // 2) Create campaign (paused)
    const channel = mapObjectiveToGoogleChannel(input.objective);
    const campaignRes = await fetch(
      `https://googleads.googleapis.com/v19/customers/${encodeURIComponent(customerId)}/campaigns:mutate`,
      {
        method: "POST",
        headers: googleHeaders.headers,
        body: JSON.stringify({
          operations: [
            {
              create: {
                name: input.name,
                status: "PAUSED",
                advertisingChannelType: channel,
                campaignBudget: budgetResourceName,
                manualCpc: {},
                networkSettings: {
                  targetGoogleSearch: true,
                  targetSearchNetwork: true,
                  targetContentNetwork: channel === "DISPLAY",
                  targetPartnerSearchNetwork: false,
                },
              },
            },
          ],
        }),
      },
    );
    const campaignJson = (await campaignRes.json().catch(() => null)) as any;
    if (!campaignRes.ok) {
      return NextResponse.json({ error: "Failed to create Google campaign", details: campaignJson }, { status: 502 });
    }
    const campaignResourceName =
      campaignJson?.results?.[0]?.resourceName || campaignJson?.results?.[0]?.resource_name;
    const campaignId = typeof campaignResourceName === "string" ? campaignResourceName.split("/").pop() : null;
    if (!campaignId) {
      return NextResponse.json({ error: "Missing Google campaign id", details: campaignJson }, { status: 502 });
    }

    const created: Campaign = {
      id: String(campaignId),
      platform: "google",
      name: input.name,
      status: "paused",
      objective: input.objective,
      budget: { type: input.budget.type, amount: input.budget.amount, currency: "USD" },
      schedule: { startDate: input.schedule.startDate, endDate: input.schedule.endDate },
      targeting: input.targeting,
      creatives: input.creatives as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return NextResponse.json(created, { status: 201 });
  }

  if (input.platform === "tiktok") {
    const account = await getRawConnectedAccount(auth.user.storeId, "tiktok");
    if (!account) {
      return NextResponse.json(
        { error: "TikTok not connected (missing valid access token)" },
        { status: 400 },
      );
    }

    const advertiserId = account.accountId;
    const objectiveType = mapObjectiveToTikTok(input.objective);
    const budget = Math.round(input.budget.amount);

    const res = await fetch("https://business-api.tiktok.com/open_api/v1.3/campaign/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": account.accessToken,
      },
      body: JSON.stringify({
        advertiser_id: advertiserId,
        campaign_name: input.name,
        objective_type: objectiveType,
        budget_mode: input.budget.type === "lifetime" ? "BUDGET_MODE_TOTAL" : "BUDGET_MODE_DAY",
        budget,
      }),
    });
    const json = (await res.json().catch(() => null)) as any;
    const campaignId = json?.data?.campaign_id;
    if (!res.ok || !campaignId) {
      return NextResponse.json({ error: "Failed to create TikTok campaign", details: json }, { status: 502 });
    }

    const created: Campaign = {
      id: String(campaignId),
      platform: "tiktok",
      name: input.name,
      status: "active",
      objective: input.objective,
      budget: { type: input.budget.type, amount: input.budget.amount, currency: input.budget.currency || "NGN" },
      schedule: { startDate: input.schedule.startDate, endDate: input.schedule.endDate },
      targeting: input.targeting,
      creatives: input.creatives as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return NextResponse.json(created, { status: 201 });
  }

  const campaign: Campaign = {
    id: `cmp_${auth.user.storeId}_${Date.now()}`,
    platform: input.platform,
    name: input.name,
    status: "active",
    objective: input.objective,
    budget: {
      type: input.budget.type,
      amount: input.budget.amount,
      currency: input.budget.currency || "NGN",
    },
    schedule: {
      startDate: input.schedule.startDate,
      endDate: input.schedule.endDate,
    },
    targeting: input.targeting,
    creatives: input.creatives as any,
    performance: {
      impressions: 0,
      clicks: 0,
      spend: 0,
      conversions: 0,
      ctr: 0,
      cpc: 0,
    },
    createdAt: new Date(nowIso()),
    updatedAt: new Date(nowIso()),
  };

  const redis = await getRedisClient();
  const key = `ads:campaigns:${auth.user.storeId}`;
  const existing = safeJsonParse<Campaign[]>(await redis.get(key)) || [];
  await redis.set(key, JSON.stringify([campaign, ...existing]), "EX", 60 * 60 * 24 * 30);
  return NextResponse.json(campaign, { status: 201 });
}
