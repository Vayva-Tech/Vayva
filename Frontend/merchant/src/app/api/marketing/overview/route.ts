import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { getRedisClient } from "@/lib/redis";

type MarketingOverview = {
  kpis: { label: string; value: string }[];
  campaignPerformance: { name: string; impressions: number; conversions: number }[];
  activeCampaigns: {
    id: string;
    name: string;
    status: string;
    reach: string;
    conversions: number;
    spend: string;
  }[];
  socialStats: { platform: string; value: string; change: string }[];
};

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * GET /api/marketing/overview
 * Dashboard overview for the Marketing hub.
 *
 * This is intentionally separate from `/api/campaigns` (ad-campaign CRUD).
 */
export async function GET(request: NextRequest) {
  const auth = await buildBackendAuthHeaders(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const redis = await getRedisClient();
  const cacheKey = `marketing:overview:${auth.user.storeId}`;

  const cached = safeJsonParse<MarketingOverview>(await redis.get(cacheKey));
  if (cached) return NextResponse.json(cached);

  // Lightweight demo data; can be replaced with real attribution/ads insights.
  const overview: MarketingOverview = {
    kpis: [
      { label: "Campaigns Active", value: "0" },
      { label: "Email Subscribers", value: "0" },
      { label: "Conversion Rate", value: "0%" },
      { label: "Revenue from Campaigns", value: "₦0" },
    ],
    campaignPerformance: [
      { name: "Launch", impressions: 0, conversions: 0 },
      { name: "Promo", impressions: 0, conversions: 0 },
      { name: "Retarget", impressions: 0, conversions: 0 },
      { name: "Seasonal", impressions: 0, conversions: 0 },
      { name: "Test", impressions: 0, conversions: 0 },
    ],
    activeCampaigns: [],
    socialStats: [
      { platform: "Instagram Followers", value: "0", change: "+0%" },
      { platform: "WhatsApp Reach", value: "0", change: "+0%" },
      { platform: "Engagement Rate", value: "0%", change: "+0%" },
    ],
  };

  await redis.set(cacheKey, JSON.stringify(overview), "EX", 30);
  return NextResponse.json(overview);
}

