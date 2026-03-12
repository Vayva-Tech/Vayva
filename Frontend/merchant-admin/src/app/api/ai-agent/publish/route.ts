import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// POST /api/ai-agent/publish - Publish agent profile changes live
export const POST = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/ai-agent/publish`,
        {
          method: "POST",
          headers: {
            "x-store-id": storeId,
            "x-user-id": user.id,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse
          .json()
          .catch(() => ({ error: "Failed to publish agent profile" }));

        return NextResponse.json(
          { success: false, error: error.error || "Failed to publish agent profile" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();

      logger.info("[AI_AGENT_PUBLISHED] Agent profile published", {
        storeId,
        userId: user.id,
      });

      return NextResponse.json(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("[AI_AGENT_PUBLISH_ERROR] Failed to publish agent profile", { error: errorMessage, storeId });
      return NextResponse.json(
        { success: false, error: "Failed to publish agent profile" },
        { status: 500 },
      );
    }
  },
);
