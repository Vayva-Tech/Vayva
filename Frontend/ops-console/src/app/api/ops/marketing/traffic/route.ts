/**
 * Marketing Traffic Sources API
 * 
 * Provides traffic source breakdown and attribution data.
 */

import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

// ============================================================================
// Types
// ============================================================================

interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
  newVisitors: number;
  avgSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
}

interface TrafficSourceData {
  period: string;
  totalVisitors: number;
  sources: TrafficSource[];
  campaigns: Array<{
    name: string;
    source: string;
    visitors: number;
    cost?: number;
    roas?: number;
  }>;
}

// ============================================================================
// Mock Data
// ============================================================================

function generateMockTrafficSources(period: string): TrafficSourceData {
  const multiplier = period === "24h" ? 0.05 : period === "7d" ? 0.3 : period === "30d" ? 1 : 3;
  const totalVisitors = Math.floor(15000 * multiplier);

  const sources: TrafficSource[] = [
    {
      source: "Organic Search",
      visitors: Math.floor(totalVisitors * 0.35),
      percentage: 35,
      newVisitors: 75,
      avgSessionDuration: 180,
      bounceRate: 42,
      conversionRate: 4.2,
    },
    {
      source: "Paid Ads",
      visitors: Math.floor(totalVisitors * 0.25),
      percentage: 25,
      newVisitors: 85,
      avgSessionDuration: 120,
      bounceRate: 55,
      conversionRate: 6.8,
    },
    {
      source: "Social Media",
      visitors: Math.floor(totalVisitors * 0.20),
      percentage: 20,
      newVisitors: 70,
      avgSessionDuration: 90,
      bounceRate: 65,
      conversionRate: 3.5,
    },
    {
      source: "Referral",
      visitors: Math.floor(totalVisitors * 0.15),
      percentage: 15,
      newVisitors: 60,
      avgSessionDuration: 240,
      bounceRate: 35,
      conversionRate: 8.1,
    },
    {
      source: "Direct",
      visitors: Math.floor(totalVisitors * 0.05),
      percentage: 5,
      newVisitors: 40,
      avgSessionDuration: 300,
      bounceRate: 30,
      conversionRate: 5.5,
    },
  ];

  return {
    period,
    totalVisitors,
    sources,
    campaigns: [
      { name: "Google Search - Brand", source: "Paid Ads", visitors: Math.floor(totalVisitors * 0.08), cost: 50000, roas: 3.2 },
      { name: "Google Search - Generic", source: "Paid Ads", visitors: Math.floor(totalVisitors * 0.06), cost: 75000, roas: 2.1 },
      { name: "Facebook Prospecting", source: "Social Media", visitors: Math.floor(totalVisitors * 0.10), cost: 100000, roas: 1.8 },
      { name: "Instagram Stories", source: "Social Media", visitors: Math.floor(totalVisitors * 0.05), cost: 40000, roas: 2.5 },
      { name: "Partner Referral", source: "Referral", visitors: Math.floor(totalVisitors * 0.08) },
    ],
  };
}

// ============================================================================
// API Handler
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "OPERATOR");

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "30d";

    const data = generateMockTrafficSources(period);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("[MARKETING_TRAFFIC_ERROR]", { error });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
