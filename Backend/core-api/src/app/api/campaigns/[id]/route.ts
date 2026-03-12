import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, Prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function _getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  return typeof value === "string" ? value : String(value);
}

function getOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * GET /api/campaigns/[id]
 */
export const GET = withVayvaAPI(
  PERMISSIONS.MARKETING_VIEW,
  async (_req, { storeId, params }) => {
    const { id } = await params;
    try {
      if (!id) {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 },
        );
      }
      const campaign = await prisma.product.findFirst({
        where: {
          id,
          storeId,
          productType: "CAMPAIGN",
        },
        include: {
          productImages: { orderBy: { position: "asc" } },
        },
      });

      if (!campaign) {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { campaign },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[CAMPAIGNS_GET_BY_ID]", error, { storeId, campaignId: id });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

/**
 * PATCH /api/campaigns/[id]
 */
export const PATCH = withVayvaAPI(
  PERMISSIONS.MARKETING_MANAGE,
  async (req, { storeId, params, user }) => {
    const { id } = await params;
    try {
      if (!id)
        return NextResponse.json({ error: "ID required" }, { status: 400 });

      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};

      const title = getOptionalString(body.title);
      const description =
        body.description === undefined
          ? undefined
          : getOptionalString(body.description);
      const goalAmount = getOptionalNumber(body.goalAmount);
      const status = getOptionalString(body.status);
      const cause = body.cause;
      const endDate = body.endDate;
      const tiers = body.tiers;

      const existing = await prisma.product.findFirst({
        where: {
          id,
          storeId,
          productType: "CAMPAIGN",
        },
        select: { metadata: true },
      });

      if (!existing) {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 },
        );
      }

      const existingMeta = isRecord(existing.metadata) ? existing.metadata : {};

      const newMetadata: Record<string, unknown> = { ...existingMeta };
      if (cause !== undefined) newMetadata.cause = cause;
      if (endDate !== undefined) newMetadata.endDate = endDate;
      if (tiers !== undefined) newMetadata.tiers = tiers;

      const updateRes = await prisma.product.update({
        where: {
          id,
          storeId,
          productType: "CAMPAIGN",
        },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(goalAmount !== undefined && { price: goalAmount }),
          ...(status && { status: status as "DRAFT" | "PENDING" | "ACTIVE" }),
          metadata: newMetadata as unknown as Prisma.InputJsonValue,
        },
      });

      if (!updateRes) {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 },
        );
      }

      const campaign = await prisma.product.findFirst({
        where: { id, storeId, productType: "CAMPAIGN" },
        include: { productImages: true },
      });

      return NextResponse.json({ campaign });
    } catch (error: unknown) {
      logger.error("[CAMPAIGNS_PATCH_BY_ID]", error, {
        storeId,
        campaignId: id,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

/**
 * DELETE /api/campaigns/[id]
 */
export const DELETE = withVayvaAPI(
  PERMISSIONS.MARKETING_MANAGE,
  async (_req, { storeId, params, user }) => {
    const { id } = await params;
    try {
      if (!id) {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 },
        );
      }
      const deleted = await prisma.product.deleteMany({
        where: {
          id,
          storeId,
          productType: "CAMPAIGN",
        },
      });

      if (deleted.count === 0) {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("[CAMPAIGNS_DELETE_BY_ID]", error, {
        storeId,
        campaignId: id,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
