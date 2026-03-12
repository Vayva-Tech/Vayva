import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
import { apiKeyManager } from "@vayva/integrations/api-keys/manager";

export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      const apiKey = await apiKeyManager.getApiKey(storeId, id);

      if (!apiKey) {
        return NextResponse.json(
          { error: "API key not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { apiKey },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      logger.error("[API_KEY_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch API key" },
        { status: 500 }
      );
    }
  }
);

export const DELETE = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      const body = await request.json().catch(() => ({}));
      
      await apiKeyManager.revokeApiKey(storeId, id, body.reason);

      logger.info("[API_KEY_DELETE] Revoked API key", {
        keyId: id,
        storeId,
        reason: body.reason,
      });

      return NextResponse.json(
        { success: true },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      logger.error("[API_KEY_DELETE]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to revoke API key" },
        { status: 500 }
      );
    }
  }
);
