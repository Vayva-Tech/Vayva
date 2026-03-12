import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { EventBus } from "@/lib/events/eventBus";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req, { storeId, user, params }) => {
    try {
      const { id } = await params;
      const request = await prisma.approval.findUnique({ where: { id } });
      if (!request)
        return NextResponse.json({ error: "Not Found" }, { status: 404 });
      if (request.merchantId !== storeId)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      if (request.status !== "PENDING")
        return NextResponse.json(
          { error: "Request not pending" },
          { status: 400 },
        );
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const reason = getString(body.decisionReason);
      await prisma.approval.update({
        where: { id },
        data: {
          status: "REJECTED",
          decidedByUserId: user.id,
          decidedByLabel:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.email,
          decidedAt: new Date(),
          decisionReason: reason,
        },
      });
      await EventBus.publish({
        merchantId: storeId,
        type: "approvals.rejected",
        payload: { approvalId: id, reason },
        ctx: {
          actorId: user.id,
          actorType: "user",
          actorLabel:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.email,
          correlationId: request.correlationId || `req_${id}`,
        },
      });
      return NextResponse.json({ ok: true, status: "rejected" });
    } catch (error: unknown) {
      logger.error("[MERCHANT_APPROVAL_REJECT_POST]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
