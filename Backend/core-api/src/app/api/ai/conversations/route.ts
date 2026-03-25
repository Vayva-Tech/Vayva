import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

/**
 * GET /api/ai/conversations
 * Get recent AI conversations with analytics
 */
export const GET = withVayvaAPI(
  PERMISSIONS.AI_ASSISTANT_USE,
  async (_req: NextRequest, { storeId }) => {
    try {
      // This endpoint previously depended on models that are not part of the
      // current Prisma schema. Return a safe empty shape so the UI can render
      // without breaking deployments.
      return NextResponse.json({
        storeId,
        items: [],
      });
    } catch (error) {
      console.error('[AI_CONVERSATIONS] Error:', error);
      return NextResponse.json(
        { error: "Failed to fetch conversations" },
        { status: 500 }
      );
    }
  }
);