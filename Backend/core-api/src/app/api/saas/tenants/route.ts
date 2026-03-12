import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@vayva/db";
import { prisma } from "@/lib/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

const createTenantSchema = z.object({
  name: z.string().min(1),
  tenantCode: z.string().min(1),
  description: z.string().optional(),
  billingEmail: z.string().email(),
  billingName: z.string().optional(),
  billingAddress: z.record(z.any()).optional(),
  taxId: z.string().optional(),
  customDomain: z.string().optional(),
  settings: z.record(z.any()).optional(),
  timezone: z.string().default("UTC"),
  locale: z.string().default("en"),
  metadata: z.record(z.any()).optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request: NextRequest, { storeId }: APIContext) => {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status");
      const search = searchParams.get("search");
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");

      const where: Record<string, unknown> = { storeId };
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { tenantCode: { contains: search, mode: "insensitive" } },
          { billingEmail: { contains: search, mode: "insensitive" } },
        ];
      }

      const [tenants, total] = await Promise.all([
        prisma.saaSTenant.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
          include: {
            subscriptions: {
              where: { status: { in: ["active", "trialing"] } },
              include: { plan: { select: { name: true } } },
            },
            _count: { select: { apiKeys: true } },
          },
        }),
        prisma.saaSTenant.count({ where }),
      ]);

      return NextResponse.json(
        { tenants, total },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      logger.error("[SAAS_TENANTS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch tenants" },
        { status: 500 }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (request: NextRequest, { storeId }: APIContext) => {
    try {
      const body = await request.json();
      const data = createTenantSchema.parse(body);

      const existing = await prisma.saaSTenant.findFirst({
        where: { tenantCode: data.tenantCode, storeId },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Tenant code already exists" },
          { status: 400 }
        );
      }

      const tenant = await prisma.saaSTenant.create({
        data: {
          storeId,
          ...data,
          settings: data.settings ? JSON.stringify(data.settings) : Prisma.JsonNull,
          metadata: data.metadata ? JSON.stringify(data.metadata) : Prisma.JsonNull,
        },
      });

      return NextResponse.json(
        { tenant },
        { status: 201, headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      logger.error("[SAAS_TENANTS_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to create tenant" },
        { status: 500 }
      );
    }
  }
);
