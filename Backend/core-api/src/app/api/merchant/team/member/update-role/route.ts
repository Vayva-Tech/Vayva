import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { EventBus } from "@/lib/events/eventBus";
import { logAuditEvent, AuditEventType } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { AppRole } from "@vayva/db";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const POST = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (req, { storeId, user, correlationId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const targetUserId = getString(body.userId);
      const role = getString(body.role);
      if (!targetUserId || !role) {
        return NextResponse.json(
          { error: "userId and role are required" },
          { status: 400 },
        );
      }
      const targetMembership = await prisma.membership.findUnique({
        where: { userId_storeId: { userId: targetUserId, storeId } },
        select: { role_enum: true, id: true },
      });
      if (!targetMembership)
        return NextResponse.json(
          { error: "Member not found" },
          { status: 404 },
        );
      // Cannot change OWNER role
      if (targetMembership.role_enum === "OWNER") {
        return NextResponse.json(
          { error: "Cannot modify owner role" },
          { status: 400 },
        );
      }
      // Cannot assign OWNER role via this route (transfer ownership is separate flow)
      if (role.toUpperCase() === "OWNER") {
        return NextResponse.json(
          { error: "Cannot assign owner role directly" },
          { status: 400 },
        );
      }
      const isCustomRole =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          role,
        );
      await prisma.membership.update({
        where: { userId_storeId: { userId: targetUserId, storeId } },
        data: {
          role_enum: (isCustomRole ? "STAFF" : role.toUpperCase()) as AppRole,
          roleId: isCustomRole ? role : null,
        },
      });
      // Log audit event
      const actorLabel =
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        user.email ||
        "System";
      await logAuditEvent(storeId, user.id, AuditEventType.TEAM_ROLE_CHANGED, {
        targetType: "USER",
        targetId: targetUserId,
        meta: {
          oldRole: targetMembership.role_enum,
          newRole: role,
        },
        correlationId,
        actorType: "merchant_user",
        actorLabel,
      });
      await EventBus.publish({
        merchantId: storeId,
        type: "team.role_updated",
        payload: {
          targetUserId,
          oldRole: targetMembership.role_enum,
          newRole: role,
        },
        ctx: {
          actorId: user.id,
          actorType: "merchant_user",
          actorLabel,
          correlationId,
        },
      });
      return NextResponse.json({ ok: true });
    } catch (error: unknown) {
      logger.error("[MERCHANT_TEAM_MEMBER_UPDATE_ROLE_POST]", error, {
        storeId,
        correlationId,
      });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
