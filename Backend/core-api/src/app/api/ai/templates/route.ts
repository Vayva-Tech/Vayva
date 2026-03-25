import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

/**
 * GET /api/ai/templates
 * Get AI conversation templates
 */
export const GET = withVayvaAPI(
  PERMISSIONS.AI_ASSISTANT_USE,
  async (_req: NextRequest, { storeId }) => {
    try {
      return NextResponse.json({
        storeId,
        items: [],
      });
    } catch (error) {
      console.error('[AI_TEMPLATES] Error:', error);
      return NextResponse.json(
        { error: "Failed to fetch templates" },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/ai/templates
 * Create new AI template
 */
export const POST = withVayvaAPI(
  PERMISSIONS.AI_ASSISTANT_USE,
  async (_req: NextRequest, { storeId }) => {
    try {
      return NextResponse.json(
        {
          error:
            "AI templates are not enabled on this deployment (schema not configured).",
          storeId,
        },
        { status: 501 },
      );
    } catch (error) {
      console.error('[AI_CREATE_TEMPLATE] Error:', error);
      return NextResponse.json(
        { error: "Failed to create template" },
        { status: 500 }
      );
    }
  }
);