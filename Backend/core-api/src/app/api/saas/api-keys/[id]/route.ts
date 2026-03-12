import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

const updateApiKeySchema = z.object({
  name: z.string().min(1).optional(),
  scopes: z.array(z.string()).optional(),
  rateLimitPerMinute: z.number().int().min(1).optional(),
  rateLimitPerHour: z.number().int().min(1).optional(),
  allowedIps: z.array(z.string()).optional(),
});

const revokeApiKeySchema = z.object({
  reason: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      const apiKey = await prisma.saaSApiKey.findFirst({
        where: { id, storeId },
        include: {
          tenant: {
            select: { id: true, name: true, tenantCode: true },
          },
        },
      });

      if (!apiKey) {
        return NextResponse.json({ error: "API key not found" }, { status: 404 });
      }

      const { keyHash, ...sanitizedKey } = apiKey;

      return NextResponse.json({ apiKey: sanitizedKey }, { headers: { "Cache-Control": "no-store" } });
    } catch (error: unknown) {
      logger.error("[SAAS_API_KEY_GET]", error, { storeId });
      return NextResponse.json({ error: "Failed to fetch API key" }, { status: 500 });
    }
  }
);

export const PUT = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const data = updateApiKeySchema.parse(body);

      const updateData: Record<string, unknown> = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.rateLimitPerMinute !== undefined) updateData.rateLimitPerMinute = data.rateLimitPerMinute;
      if (data.rateLimitPerHour !== undefined) updateData.rateLimitPerHour = data.rateLimitPerHour;

      if (data.scopes !== undefined) {
        updateData.scopes = JSON.stringify(data.scopes);
      }

      if (data.allowedIps !== undefined) {
        updateData.allowedIps = JSON.stringify(data.allowedIps);
      }

      const apiKey = await prisma.saaSApiKey.update({
        where: { id, storeId },
        data: updateData,
      });

      const { keyHash, ...sanitizedKey } = apiKey;

      return NextResponse.json({ apiKey: sanitizedKey }, { headers: { "Cache-Control": "no-store" } });
    } catch (error: unknown) {
      logger.error("[SAAS_API_KEY_PUT]", error, { storeId });
      return NextResponse.json({ error: "Failed to update API key" }, { status: 500 });
    }
  }
);

export const DELETE = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      const body = await request.json().catch(() => ({}));
      const data = revokeApiKeySchema.parse(body);

      const apiKey = await prisma.saaSApiKey.update({
        where: { id, storeId },
        data: {
          status: "revoked",
          revokedAt: new Date(),
          revokeReason: data.reason || "Revoked by admin",
        },
      });

      const { keyHash, ...sanitizedKey } = apiKey;

      return NextResponse.json({ apiKey: sanitizedKey }, { headers: { "Cache-Control": "no-store" } });
    } catch (error: unknown) {
      logger.error("[SAAS_API_KEY_DELETE]", error, { storeId });
      return NextResponse.json({ error: "Failed to revoke API key" }, { status: 500 });
    }
  }
);
