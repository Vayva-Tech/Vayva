/**
 * Marketing Pages API
 * 
 * Provides per-page performance metrics for marketing site pages.
 */

import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

// ============================================================================
// Types
// ============================================================================

interface PageMetrics {
  path: string;
  title: string;
  pageViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  exitRate: number;
  conversions: number;
  conversionRate: number;
}

interface IndustryPageMetrics extends PageMetrics {
  industry: string;
  ctaClicks: number;
  ctaClickRate: number;
}

interface PagesData {
  period: string;
  topPages: PageMetrics[];
  industryPages: IndustryPageMetrics[];
  landingPages: PageMetrics[];
}

// ============================================================================
// Mock Data
// ============================================================================

const INDUSTRIES = [
  "retail", "fashion", "food", "beauty", "services",
  "automotive", "real-estate", "events", "education", "nightlife",
  "fitness", "healthcare", "professional", "creative", "digital",
  "b2b", "nonprofit", "rentals", "wholesale"
];

function generateMockPagesData(period: string): PagesData {
  const multiplier = period === "24h" ? 0.05 : period === "7d" ? 0.3 : period === "30d" ? 1 : 3;

  // Top pages
  const topPages: PageMetrics[] = [
    {
      path: "/",
      title: "Home - Vayva",
      pageViews: Math.floor(8000 * multiplier),
      uniqueVisitors: Math.floor(6000 * multiplier),
      avgTimeOnPage: 145,
      bounceRate: 35,
      exitRate: 25,
      conversions: Math.floor(480 * multiplier),
      conversionRate: 8.0,
    },
    {
      path: "/pricing",
      title: "Pricing Plans",
      pageViews: Math.floor(4500 * multiplier),
      uniqueVisitors: Math.floor(3800 * multiplier),
      avgTimeOnPage: 210,
      bounceRate: 28,
      exitRate: 42,
      conversions: Math.floor(380 * multiplier),
      conversionRate: 10.0,
    },
    {
      path: "/features",
      title: "Features",
      pageViews: Math.floor(3200 * multiplier),
      uniqueVisitors: Math.floor(2800 * multiplier),
      avgTimeOnPage: 185,
      bounceRate: 38,
      exitRate: 35,
      conversions: Math.floor(168 * multiplier),
      conversionRate: 6.0,
    },
    {
      path: "/autopilot",
      title: "AI Autopilot",
      pageViews: Math.floor(2100 * multiplier),
      uniqueVisitors: Math.floor(1800 * multiplier),
      avgTimeOnPage: 240,
      bounceRate: 32,
      exitRate: 38,
      conversions: Math.floor(144 * multiplier),
      conversionRate: 8.0,
    },
    {
      path: "/ai-agent",
      title: "AI Agent",
      pageViews: Math.floor(1800 * multiplier),
      uniqueVisitors: Math.floor(1500 * multiplier),
      avgTimeOnPage: 195,
      bounceRate: 36,
      exitRate: 40,
      conversions: Math.floor(105 * multiplier),
      conversionRate: 7.0,
    },
    {
      path: "/about",
      title: "About Us",
      pageViews: Math.floor(1200 * multiplier),
      uniqueVisitors: Math.floor(1000 * multiplier),
      avgTimeOnPage: 120,
      bounceRate: 55,
      exitRate: 45,
      conversions: Math.floor(30 * multiplier),
      conversionRate: 3.0,
    },
    {
      path: "/blog",
      title: "Blog",
      pageViews: Math.floor(1500 * multiplier),
      uniqueVisitors: Math.floor(1200 * multiplier),
      avgTimeOnPage: 280,
      bounceRate: 45,
      exitRate: 50,
      conversions: Math.floor(36 * multiplier),
      conversionRate: 3.0,
    },
    {
      path: "/help",
      title: "Help Center",
      pageViews: Math.floor(900 * multiplier),
      uniqueVisitors: Math.floor(750 * multiplier),
      avgTimeOnPage: 320,
      bounceRate: 40,
      exitRate: 55,
      conversions: Math.floor(15 * multiplier),
      conversionRate: 2.0,
    },
  ];

  // Industry pages
  const industryPages: IndustryPageMetrics[] = INDUSTRIES.map((industry, index) => {
    const baseViews = 400 - index * 15;
    const pageViews = Math.floor(baseViews * multiplier * (0.8 + Math.random() * 0.4));
    const uniqueVisitors = Math.floor(pageViews * 0.75);
    const conversions = Math.floor(uniqueVisitors * (0.04 + Math.random() * 0.04));

    return {
      path: `/industries/${industry}`,
      title: `${industry.charAt(0).toUpperCase() + industry.slice(1)} - Vayva`,
      industry,
      pageViews,
      uniqueVisitors,
      avgTimeOnPage: 150 + Math.random() * 100,
      bounceRate: 35 + Math.random() * 20,
      exitRate: 40 + Math.random() * 15,
      conversions,
      conversionRate: Math.round((conversions / uniqueVisitors) * 1000) / 10,
      ctaClicks: Math.floor(pageViews * (0.08 + Math.random() * 0.08)),
      ctaClickRate: Math.round((0.08 + Math.random() * 0.08) * 1000) / 10,
    };
  }).sort((a, b) => b.pageViews - a.pageViews);

  // Landing pages (subset for campaigns)
  const landingPages: PageMetrics[] = [
    {
      path: "/lp/whatsapp-commerce",
      title: "WhatsApp Commerce",
      pageViews: Math.floor(2500 * multiplier),
      uniqueVisitors: Math.floor(2200 * multiplier),
      avgTimeOnPage: 165,
      bounceRate: 42,
      exitRate: 38,
      conversions: Math.floor(198 * multiplier),
      conversionRate: 9.0,
    },
    {
      path: "/lp/paystack-store",
      title: "Paystack Store Builder",
      pageViews: Math.floor(1800 * multiplier),
      uniqueVisitors: Math.floor(1600 * multiplier),
      avgTimeOnPage: 175,
      bounceRate: 40,
      exitRate: 36,
      conversions: Math.floor(144 * multiplier),
      conversionRate: 9.0,
    },
    {
      path: "/lp/free-trial",
      title: "Free Trial",
      pageViews: Math.floor(3200 * multiplier),
      uniqueVisitors: Math.floor(2800 * multiplier),
      avgTimeOnPage: 120,
      bounceRate: 25,
      exitRate: 30,
      conversions: Math.floor(420 * multiplier),
      conversionRate: 15.0,
    },
  ];

  return {
    period,
    topPages,
    industryPages,
    landingPages,
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

    const data = generateMockPagesData(period);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("[MARKETING_PAGES_ERROR]", { error });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
