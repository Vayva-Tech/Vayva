// ============================================================================
// Dashboard Config API
// ============================================================================
// GET /api/v1/dashboard/:industry/config - Get dashboard configuration
// POST /api/v1/dashboard/:industry/config - Save dashboard configuration
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth/session";
import type { IndustrySlug } from "@vayva/industry-core";

// Validation schema for dashboard config
const dashboardConfigSchema = z.object({
  layout: z.object({
    id: z.string(),
    name: z.string(),
    breakpoints: z.record(z.array(z.object({
      i: z.string(),
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number(),
    }))),
  }),
  widgets: z.array(z.object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    dataSource: z.object({
      type: z.string(),
    }).passthrough(),
  })),
  settings: z.record(z.unknown()).optional(),
});

interface RouteParams {
  params: Promise<{
    industry: string;
  }>;
}

/**
 * GET /api/v1/dashboard/:industry/config
 * Get dashboard configuration for a specific industry
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { industry } = await params;
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }

    // Fetch dashboard config from database
    const config = await prisma.industryDashboardConfig.findUnique({
      where: {
        storeId_industry: {
          storeId,
          industry,
        },
      },
    });

    if (!config) {
      // Return default config if none exists
      return NextResponse.json({
        config: null,
        layout: getDefaultLayout(),
        isDefault: true,
      });
    }

    return NextResponse.json({
      config: {
        industry: config.industry as IndustrySlug,
        layout: config.layout,
        widgets: config.widgets,
        settings: config.settings,
      },
      layout: config.layout,
      isDefault: config.isDefault,
    });
  } catch (error) {
    console.error("Error fetching dashboard config:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard configuration" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/dashboard/:industry/config
 * Save dashboard configuration
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { industry } = await params;
    const body = await request.json();

    // Validate request body
    const validationResult = dashboardConfigSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { layout, widgets, settings } = validationResult.data;
    const storeId = body.storeId;

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }

    // Upsert dashboard config
    const config = await prisma.industryDashboardConfig.upsert({
      where: {
        storeId_industry: {
          storeId,
          industry,
        },
      },
      update: {
        layout,
        widgets,
        settings: settings || {},
        isDefault: false,
      },
      create: {
        storeId,
        industry,
        layout,
        widgets,
        settings: settings || {},
        isDefault: false,
      },
    });

    return NextResponse.json({
      success: true,
      config: {
        industry: config.industry as IndustrySlug,
        layout: config.layout,
        widgets: config.widgets,
        settings: config.settings,
      },
    });
  } catch (error) {
    console.error("Error saving dashboard config:", error);
    return NextResponse.json(
      { error: "Failed to save dashboard configuration" },
      { status: 500 }
    );
  }
}

/**
 * Get default layout configuration
 */
function getDefaultLayout() {
  return {
    id: "default",
    name: "Default Layout",
    breakpoints: {
      lg: [
        { i: "kpi-1", x: 0, y: 0, w: 3, h: 2 },
        { i: "kpi-2", x: 3, y: 0, w: 3, h: 2 },
        { i: "kpi-3", x: 6, y: 0, w: 3, h: 2 },
        { i: "kpi-4", x: 9, y: 0, w: 3, h: 2 },
        { i: "chart-1", x: 0, y: 2, w: 6, h: 4 },
        { i: "chart-2", x: 6, y: 2, w: 6, h: 4 },
      ],
      md: [
        { i: "kpi-1", x: 0, y: 0, w: 3, h: 2 },
        { i: "kpi-2", x: 3, y: 0, w: 3, h: 2 },
        { i: "kpi-3", x: 6, y: 0, w: 3, h: 2 },
        { i: "kpi-4", x: 9, y: 0, w: 3, h: 2 },
        { i: "chart-1", x: 0, y: 2, w: 6, h: 4 },
        { i: "chart-2", x: 6, y: 2, w: 6, h: 4 },
      ],
      sm: [
        { i: "kpi-1", x: 0, y: 0, w: 6, h: 2 },
        { i: "kpi-2", x: 6, y: 0, w: 6, h: 2 },
        { i: "kpi-3", x: 0, y: 2, w: 6, h: 2 },
        { i: "kpi-4", x: 6, y: 2, w: 6, h: 2 },
        { i: "chart-1", x: 0, y: 4, w: 12, h: 4 },
        { i: "chart-2", x: 0, y: 8, w: 12, h: 4 },
      ],
    },
  };
}
