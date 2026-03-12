import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, Prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.PLATFORM_AUDIT_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
      const cursor = searchParams.get("cursor"); // expects "id"
      // Filters
      const entityType = searchParams.get("entity_type");
      const entityId = searchParams.get("entity_id");
      const action = searchParams.get("action");
      const actorId = searchParams.get("actor_id");

      const where: Prisma.AuditLogWhereInput = { targetStoreId: storeId };
      if (entityType) where.targetType = entityType as Prisma.EnumAuditTargetTypeFilter<"AuditLog">;
      if (entityId) where.targetId = entityId;
      if (action) where.action = action;
      if (actorId) where.actorUserId = actorId;
      const logs = await prisma.auditLog.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });
      let nextCursor = null;
      if (logs.length > limit) {
        const nextItem = logs.pop();
        nextCursor = nextItem?.id;
      }
      return NextResponse.json({
        items: logs,
        next_cursor: nextCursor,
      });
    } catch (error: unknown) {
      logger.error("[AUDIT_LOG_GET]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
