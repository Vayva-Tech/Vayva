import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

interface AgentConfig {
  name: string;
  avatarUrl: string;
  tone: string;
  signature: string;
}

// GET /api/ai-agent/profile - Load agent profile
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/ai-agent/profile`,
        {
          headers: {
            "x-store-id": storeId,
            "x-user-id": user.id,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse
          .json()
          .catch(() => ({ error: "Failed to load agent profile" }));

        return NextResponse.json(
          { success: false, error: error.error || "Failed to load agent profile" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("[AI_AGENT_GET_ERROR] Failed to load agent profile", { error: errorMessage, storeId });
      return NextResponse.json(
        { success: false, error: "Failed to load agent profile" },
        { status: 500 },
      );
    }
  },
);

// PUT /api/ai-agent/profile - Save agent config as draft
export const PUT = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const body = (await req.json()) as AgentConfig;
      const { name, avatarUrl, tone, signature } = body;

      // Validate required fields
      if (!name || typeof name !== "string") {
        return NextResponse.json(
          { success: false, error: "Agent name is required" },
          { status: 400 },
        );
      }

      if (!tone || typeof tone !== "string") {
        return NextResponse.json(
          { success: false, error: "Agent tone is required" },
          { status: 400 },
        );
      }

      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/ai-agent/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
            "x-user-id": user.id,
          },
          body: JSON.stringify({ name, avatarUrl, tone, signature }),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse
          .json()
          .catch(() => ({ error: "Failed to save agent profile" }));

        return NextResponse.json(
          { success: false, error: error.error || "Failed to save agent profile" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();

      logger.info("[AI_AGENT_DRAFT_SAVED] Agent profile draft saved", {
        storeId,
        userId: user.id,
      });

      return NextResponse.json(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("[AI_AGENT_PUT_ERROR] Failed to save agent profile", { error: errorMessage, storeId });
      return NextResponse.json(
        { success: false, error: "Failed to save agent profile" },
        { status: 500 },
      );
    }
  },
);
