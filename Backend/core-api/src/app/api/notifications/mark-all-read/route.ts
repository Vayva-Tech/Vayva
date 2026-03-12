import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

export const POST = withVayvaAPI(
  PERMISSIONS.NOTIFICATIONS_MANAGE,
  async (_req, { storeId }) => {
    const updated = await prisma.notification.updateMany({
      where: { storeId, readAt: null },
      data: { readAt: new Date(), isRead: true },
    });
    return NextResponse.json({ success: true, updated: updated.count });
  },
);
