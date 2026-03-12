/**
 * Marketing Conversions API
 * 
 * Tracks signup and conversion funnel metrics.
 */

import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

// ============================================================================
// Types
// ============================================================================

interface ConversionFunnel {
  step: string;
  visitors: number;
  conversions: number;
  dropOff: number;
  conversionRate: number;
}

interface ConversionMetrics {
  period: string;
  totalSignups: number;
  trialStarts: number;
  paidConversions: number;
  overallConversionRate: number;
  funnel: ConversionFunnel[];
  bySource: Record<string, { signups: number; conversionRate: number }>;
  byIndustry: Record<string, { signups: number; conversionRate: number }>;
}

// ============================================================================
// Mock Data
// ============================================================================

function generateMockConversions(period: string): ConversionMetrics {
  const multiplier = period === "24h" ? 0.05 : period === "7d" ? 0.3 : period === "30d" ? 1 : 3;

  const baseVisitors = Math.floor(15000 * multiplier);
  const signups = Math.floor(baseVisitors * 0.08);
  const trialStarts = Math.floor(signups * 0.75);
  const paidConversions = Math.floor(trialStarts * 0.25);

  return {
    period,
    totalSignups: signups,
    trialStarts,
    paidConversions,
    overallConversionRate: Math.round((paidConversions / baseVisitors) * 1000) / 10,
    funnel: [
      {
        step: "Landing Page",
        visitors: baseVisitors,
        conversions: Math.floor(baseVisitors * 0.4),
        dropOff: Math.floor(baseVisitors * 0.6),
        conversionRate: 40,
      },
      {
        step: "Pricing View",
        visitors: Math.floor(baseVisitors * 0.4),
        conversions: Math.floor(baseVisitors * 0.25),
        dropOff: Math.floor(baseVisitors * 0.15),
        conversionRate: 62.5,
      },
      {
        step: "Signup Started",
        visitors: Math.floor(baseVisitors * 0.25),
        conversions: signups,
        dropOff: Math.floor(baseVisitors * 0.25) - signups,
        conversionRate: Math.round((signups / (baseVisitors * 0.25)) * 100),
      },
      {
        step: "Trial Started",
        visitors: signups,
        conversions: trialStarts,
        dropOff: signups - trialStarts,
        conversionRate: 75,
      },
      {
        step: "Paid Conversion",
        visitors: trialStarts,
        conversions: paidConversions,
        dropOff: trialStarts - paidConversions,
        conversionRate: 25,
      },
    ],
    bySource: {
      organic: { signups: Math.floor(signups * 0.35), conversionRate: 4.2 },
      paid: { signups: Math.floor(signups * 0.25), conversionRate: 6.8 },
      social: { signups: Math.floor(signups * 0.20), conversionRate: 3.5 },
      referral: { signups: Math.floor(signups * 0.15), conversionRate: 8.1 },
      direct: { signups: Math.floor(signups * 0.05), conversionRate: 5.5 },
    },
    byIndustry: {
      retail: { signups: Math.floor(signups * 0.30), conversionRate: 4.5 },
      fashion: { signups: Math.floor(signups * 0.20), conversionRate: 5.2 },
      food: { signups: Math.floor(signups * 0.15), conversionRate: 3.8 },
      services: { signups: Math.floor(signups * 0.15), conversionRate: 6.1 },
      beauty: { signups: Math.floor(signups * 0.10), conversionRate: 4.9 },
      other: { signups: Math.floor(signups * 0.10), conversionRate: 3.2 },
    },
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

    const data = generateMockConversions(period);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("[MARKETING_CONVERSIONS_ERROR]", { error });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
