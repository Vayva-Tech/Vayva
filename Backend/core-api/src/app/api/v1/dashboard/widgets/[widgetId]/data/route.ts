// ============================================================================
// Widget Data API
// ============================================================================
// GET /api/v1/dashboard/widgets/:widgetId/data - Get widget data
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma as _prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth/session";
import type { DataSourceConfig } from "@vayva/industry-core";

// Validation schema for data source
const dataSourceSchema = z.object({
  type: z.enum(["entity", "analytics", "realtime", "composite", "event", "geo", "static"]),
  entity: z.string().optional(),
  query: z.string().optional(),
  params: z.record(z.unknown()).optional(),
  channel: z.string().optional(),
  queries: z.array(z.string()).optional(),
  filter: z.record(z.unknown()).optional(),
  sort: z.object({
    field: z.string(),
    direction: z.enum(["asc", "desc"]),
  }).optional(),
  limit: z.number().optional(),
});

interface RouteParams {
  params: Promise<{
    widgetId: string;
  }>;
}

/**
 * POST /api/v1/dashboard/widgets/:widgetId/data
 * Get data for a specific widget
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

    const { widgetId } = await params;
    const body = await request.json();

    // Validate data source
    const validationResult = dataSourceSchema.safeParse(body.dataSource);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data source", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const dataSource: DataSourceConfig = validationResult.data;
    const storeId = body.storeId;

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }

    // Resolve data based on source type
    const data = await resolveWidgetData(dataSource, storeId);

    return NextResponse.json({
      widgetId,
      data,
      cachedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching widget data:", error);
    return NextResponse.json(
      { error: "Failed to fetch widget data" },
      { status: 500 }
    );
  }
}

/**
 * Resolve widget data based on data source configuration
 */
async function resolveWidgetData(
  dataSource: DataSourceConfig,
  storeId: string
): Promise<unknown> {
  switch (dataSource.type) {
    case "entity":
      return resolveEntityData(dataSource, storeId);
    case "analytics":
      return resolveAnalyticsData(dataSource, storeId);
    case "realtime":
      return resolveRealtimeData(dataSource, storeId);
    case "composite":
      return resolveCompositeData(dataSource, storeId);
    case "static":
      return dataSource.params || {};
    default:
      throw new Error(`Unsupported data source type: ${dataSource.type}`);
  }
}

/**
 * Resolve entity-based data
 */
async function resolveEntityData(
  dataSource: DataSourceConfig,
  storeId: string
): Promise<unknown> {
  // This would integrate with the actual entity queries
  // For now, return placeholder data
  return {
    entity: dataSource.entity,
    filter: dataSource.filter,
    storeId,
    items: [],
  };
}

/**
 * Resolve analytics data
 */
async function resolveAnalyticsData(
  dataSource: DataSourceConfig,
  storeId: string
): Promise<unknown> {
  // This would integrate with the analytics service
  // For now, return placeholder data
  return {
    query: dataSource.query,
    params: dataSource.params,
    storeId,
    results: [],
  };
}

/**
 * Resolve realtime data
 */
async function resolveRealtimeData(
  dataSource: DataSourceConfig,
  storeId: string
): Promise<unknown> {
  // This would integrate with the realtime service
  // For now, return placeholder data
  return {
    channel: dataSource.channel,
    storeId,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Resolve composite data from multiple sources
 */
async function resolveCompositeData(
  dataSource: DataSourceConfig,
  storeId: string
): Promise<unknown> {
  // This would combine multiple queries
  // For now, return placeholder data
  return {
    queries: dataSource.queries,
    storeId,
    combined: {},
  };
}
