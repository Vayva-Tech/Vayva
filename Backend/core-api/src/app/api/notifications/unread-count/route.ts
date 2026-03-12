import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";

export const GET = withVayvaAPI(
  PERMISSIONS.NOTIFICATIONS_VIEW,
  async (_req, { storeId }) => {
    const count = await prisma.notification.count({
      where: { storeId, readAt: null },
    });
    return NextResponse.json(
      { count },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
    );
  },
);
