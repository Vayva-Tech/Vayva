import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
        const cursor = searchParams.get("cursor"); // expects "id"
        // Filters
        const entityType = searchParams.get("entity_type");
        const entityId = searchParams.get("entity_id");
        const action = searchParams.get("action");
        const actorId = searchParams.get("actor_id");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: Record<string, any> = { storeId };
        if (entityType)
            where.entityType = entityType;
        if (entityId)
            where.entityId = entityId;
        if (action)
            where.action = action;
        if (actorId)
            where.actorId = actorId;
        const logs = await prisma.auditLog?.findMany({
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
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/merchant/audit", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
