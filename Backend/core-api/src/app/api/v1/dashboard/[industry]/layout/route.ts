// ============================================================================
// Dashboard Layout API
// ============================================================================
// POST /api/v1/dashboard/:industry/layout - Update layout
// POST /api/v1/dashboard/:industry/layout/reset - Reset to default
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/session";

// Validation schema for layout update
const layoutUpdateSchema = z.object({
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
  storeId: z.string(),
});

interface RouteParams {
  params: Promise<{
    industry: string;
  }>;
}

/**
 * POST /api/v1/dashboard/:industry/layout
 * Update dashboard layout
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
    const validationResult = layoutUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { layout, storeId } = validationResult.data;

    // Update layout
    await prisma.industryDashboardConfig.update({
      where: {
        storeId_industry: {
          storeId,
          industry,
        },
      },
      data: {
        layout,
      },
    });

    return NextResponse.json({
      success: true,
      layout,
    });
  } catch (error) {
    console.error("Error updating dashboard layout:", error);
    return NextResponse.json(
      { error: "Failed to update layout" },
      { status: 500 }
    );
  }
}
