import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

const updateTenantSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  billingEmail: z.string().email().optional(),
  billingName: z.string().optional(),
  billingAddress: z.record(z.any()).optional(),
  taxId: z.string().optional(),
  customDomain: z.string().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  status: z.enum(["active", "suspended", "cancelled", "pending"]).optional(),
  statusReason: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      const tenant = await prisma.saaSTenant.findFirst({
        where: { id, storeId },
        include: {
          subscriptions: {
            include: { plan: true },
            orderBy: { createdAt: "desc" },
          },
          apiKeys: {
            where: { status: "active" },
            select: {
              id: true,
              name: true,
              keyPrefix: true,
              scopes: true,
              lastUsedAt: true,
              usageCount: true,
              expiresAt: true,
              createdAt: true,
            },
          },
          usageMetrics: {
            where: {
              periodStart: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
            orderBy: { periodStart: "desc" },
          },
        },
      });

      if (!tenant) {
        return NextResponse.json(
          { error: "Tenant not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { tenant },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      logger.error("[SAAS_TENANT_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch tenant" },
        { status: 500 }
      );
    }
  }
);

export const PUT = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const data = updateTenantSchema.parse(body);

      // Check if custom domain already exists (if being updated)
      if (data.customDomain) {
        const existingDomain = await prisma.saaSTenant.findFirst({
          where: {
            customDomain: data.customDomain,
            id: { not: id },
          },
        });
        if (existingDomain) {
          return NextResponse.json(
            { error: "Custom domain already in use" },
            { status: 400 }
          );
        }
      }

      const tenant = await prisma.saaSTenant.update({
        where: { id, storeId },
        data,
      });

      return NextResponse.json(
        { tenant },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      logger.error("[SAAS_TENANT_PUT]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to update tenant" },
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

      // Soft delete by setting status to cancelled
      const tenant = await prisma.saaSTenant.update({
        where: { id, storeId },
        data: { status: "cancelled", statusReason: "Deleted by admin" },
      });

      // Cancel all active subscriptions
      await prisma.saaSSubscription.updateMany({
        where: { tenantId: id, status: { in: ["active", "trialing"] } },
        data: { status: "cancelled", cancelledAt: new Date() },
      });

      // Revoke all API keys
      await prisma.saaSApiKey.updateMany({
        where: { tenantId: id, status: "active" },
        data: { status: "revoked", revokedAt: new Date() },
      });

      return NextResponse.json(
        { tenant },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      logger.error("[SAAS_TENANT_DELETE]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to delete tenant" },
        { status: 500 }
      );
    }
  }
);
