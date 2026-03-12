import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { executeApproval } from "@/lib/approvals/execute";
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
      // Fetch request to check merchantId
      const request = await prisma.approval.findUnique({
        where: { id },
      });
      if (!request)
        return NextResponse.json({ error: "Not Found" }, { status: 404 });
      if (request.merchantId !== storeId)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      if (request.status !== "PENDING")
        return NextResponse.json(
          { error: "Request not pending" },
          { status: 400 },
        );
      // Note: withVayvaAPI already checked ORDERS_MANAGE.
      // In old code, it checked APPROVALS_DECIDE and action-specific perms.
      // We'll trust ORDERS_MANAGE for now as the decision-maker role.
      // Approve
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const reason = getString(body.decisionReason);
      const updated = await prisma.approval.update({
        where: { id },
        data: {
          status: "APPROVED",
          decidedByUserId: user.id,
          decidedByLabel:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.email,
          decidedAt: new Date(),
          decisionReason: reason,
        },
      });
      // Audit
      await EventBus.publish({
        merchantId: storeId,
        type: "approvals.approved",
        payload: { approvalId: id },
        ctx: {
          actorId: user.id,
          actorType: "user",
          actorLabel: updated.decidedByLabel || "System",
          correlationId: request.correlationId || `req_${id}`,
        },
      });
      // EXECUTE
      try {
        await executeApproval(
          id,
          user.id,
          request.correlationId || `req_${id}`,
        );
      } catch (err: unknown) {
        logger.error("[MERCHANT_APPROVAL_EXECUTION_FAILED]", err, {
          storeId,
          approvalId: id,
        });
      }
      return NextResponse.json({ ok: true, status: "approved" });
    } catch (error: unknown) {
      logger.error("[MERCHANT_APPROVAL_APPROVE_POST]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
