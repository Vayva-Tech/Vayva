import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@vayva/db";
import { prisma } from "@/lib/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
import crypto from "crypto";

const createApiKeySchema = z.object({
  tenantId: z.string(),
  name: z.string().min(1),
  scopes: z.array(z.string()).min(1),
  rateLimitPerMinute: z.number().int().min(1).optional(),
  rateLimitPerHour: z.number().int().min(1).optional(),
  expiresAt: z.string().datetime().optional(),
  allowedIps: z.array(z.string()).optional(),
});

function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = `vayva_${crypto.randomBytes(32).toString("hex")}`;
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  const prefix = key.slice(0, 12);
  return { key, hash, prefix };
}

export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request: NextRequest, { storeId }: APIContext) => {
    try {
      const { searchParams } = new URL(request.url);
      const tenantId = searchParams.get("tenantId");
      const status = searchParams.get("status") || "active";

      const where: Record<string, unknown> = { storeId, status };
      if (tenantId) where.tenantId = tenantId;

      const apiKeys = await prisma.saaSApiKey.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          tenant: { select: { id: true, name: true, tenantCode: true } },
        },
      });

      // Remove sensitive hash from response
      const sanitizedKeys = apiKeys.map((key) => ({
        ...key,
        keyHash: undefined,
      }));

      return NextResponse.json(
        { apiKeys: sanitizedKeys },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      logger.error("[SAAS_API_KEYS_GET]", error, { storeId });
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

      // Verify tenant exists
      const tenant = await prisma.saaSTenant.findFirst({
        where: { id: data.tenantId, storeId },
      });

      if (!tenant) {
        return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
      }

      const { key, hash, prefix } = generateApiKey();

      const apiKey = await prisma.saaSApiKey.create({
        data: {
          storeId,
          tenantId: data.tenantId,
          name: data.name,
          keyHash: hash,
          keyPrefix: prefix,
          scopes: JSON.stringify(data.scopes),
          rateLimitPerMinute: data.rateLimitPerMinute,
          rateLimitPerHour: data.rateLimitPerHour,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
          allowedIps: data.allowedIps ? JSON.stringify(data.allowedIps) : Prisma.JsonNull,
          createdBy: user?.id,
        },
      });

      // Return the full key only once (on creation)
      return NextResponse.json(
        { apiKey, key },
        { status: 201, headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      logger.error("[SAAS_API_KEYS_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to create API key" },
        { status: 500 }
      );
    }
  }
);
