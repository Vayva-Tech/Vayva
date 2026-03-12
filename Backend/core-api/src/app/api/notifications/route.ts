import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, Prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.NOTIFICATIONS_VIEW,
  async (req, { storeId }) => {
    try {
      const url = new URL(req.url);
      const limit = Math.min(Number(url.searchParams.get("limit") || "20"), 50);
      const cursor = url.searchParams.get("cursor");
      const unread = url.searchParams.get("unread") === "true";

      const where: Prisma.NotificationWhereInput = {
        storeId,
        ...(unread ? { readAt: null } : {}),
      };

      const items = await prisma.notification.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        select: {
          id: true,
          type: true,
          title: true,
          body: true,
          actionUrl: true,
          severity: true,
          isRead: true,
          readAt: true,
          createdAt: true,
        },
      });

      const hasMore = items.length > limit;
      const sliced = hasMore ? items.slice(0, limit) : items;
      const nextCursor = hasMore ? sliced[sliced.length - 1]?.id : null;

      return NextResponse.json(
        {
          items: sliced.map((n) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.body,
            href: n.actionUrl,
            severity: n.severity,
            isRead: n.isRead || Boolean(n.readAt),
            readAt: n.readAt,
            createdAt: n.createdAt,
          })),
          nextCursor,
        },
        { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
      );
    } catch (error: unknown) {
      logger.error("[NOTIFICATIONS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: 500 },
      );
    }
  },
);
