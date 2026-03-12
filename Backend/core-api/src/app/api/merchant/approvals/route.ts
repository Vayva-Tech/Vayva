import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { EventBus } from "@/lib/events/eventBus";
import { Prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getStatusFilter(value: unknown): Prisma.ApprovalWhereInput["status"] {
  const normalized = typeof value === "string" ? value.toUpperCase() : "";
  if (
    normalized === "PENDING" ||
    normalized === "APPROVED" ||
    normalized === "REJECTED"
  ) {
    return normalized;
  }
  return undefined;
}

export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req, { storeId, user, correlationId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const actionType = getString(body.actionType);
      const entityType = getString(body.entityType);
      const entityId = getString(body.entityId);
      const reason = getString(body.reason);
      const payload = isRecord(body.payload) ? body.payload : {};
      if (!actionType || !entityType || !entityId) {
        return NextResponse.json(
          { error: "actionType, entityType and entityId are required" },
          { status: 400 },
        );
      }
      const approval = await prisma.approval.create({
        data: {
          merchantId: storeId,
          requestedByUserId: user.id,
          requestedByLabel:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.email,
          actionType,
          entityType,
          entityId,
          payload: payload as Prisma.InputJsonValue,
          reason,
          correlationId,
        },
      });
      // Audit & Notify
      await EventBus.publish({
        merchantId: storeId,
        type: "approvals.requested",
        payload: {
          approvalId: approval.id,
          actionType,
          requestedBy: approval.requestedByLabel,
        },
        ctx: {
          actorId: user.id,
          actorType: "user",
          actorLabel: approval.requestedByLabel || "Unknown User",
          correlationId,
        },
      });
      return NextResponse.json({ ok: true, id: approval.id });
    } catch (error: unknown) {
      logger.error("[MERCHANT_APPROVALS_POST]", error, {
        storeId,
        correlationId,
      });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
      const limit = parseInt(searchParams.get("limit") || "20");
      const where: Prisma.ApprovalWhereInput = { merchantId: storeId };
      if (status && status !== "all") {
        const statusFilter = getStatusFilter(status);
        if (statusFilter) {
          where.status = statusFilter;
        }
      }
      const items = await prisma.approval.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return NextResponse.json(
        { items },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[MERCHANT_APPROVALS_GET]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
