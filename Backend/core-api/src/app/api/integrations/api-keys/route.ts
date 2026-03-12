import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
import { apiKeyManager } from "@vayva/integrations/api-keys/manager";
import type { ApiKeyScope } from "@vayva/integrations/types";

const createApiKeySchema = z.object({
  name: z.string().min(1),
  scopes: z.array(z.string()).min(1),
  expiresAt: z.string().datetime().optional(),
  allowedIps: z.array(z.string()).optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request: NextRequest, { storeId }: APIContext) => {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status") as
        | "ACTIVE"
        | "REVOKED"
        | "EXPIRED"
        | undefined;

      const apiKeys = await apiKeyManager.getApiKeys(storeId, status);

      return NextResponse.json(
        { apiKeys },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      logger.error("[API_KEYS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch API keys" },
        { status: 500 }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (request: NextRequest, { storeId, user }: APIContext) => {
    try {
      const body = await request.json();
      const data = createApiKeySchema.parse(body);

      const result = await apiKeyManager.createApiKey({
        storeId,
        name: data.name,
        scopes: data.scopes as ApiKeyScope[],
        createdByUserId: user?.id || "system",
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        ipAllowlist: data.allowedIps,
      });

      logger.info("[API_KEYS_POST] Created API key", {
        keyId: result.apiKey.id,
        storeId,
        name: data.name,
        scopes: data.scopes,
      });

      return NextResponse.json(
        {
          id: result.apiKey.id,
          key: result.key,
          name: result.apiKey.name,
        },
        { status: 201, headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid input", details: error.errors },
          { status: 400 }
        );
      }
      logger.error("[API_KEYS_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to create API key" },
        { status: 500 }
      );
    }
  }
);
