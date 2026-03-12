import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { DashboardService } from "@/services/dashboard.server";

export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (_req, { storeId, db }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: {
          isLive: true,
          onboardingCompleted: true,
          plan: true,
        },
      });

      const data = await DashboardService.getTodosAlerts(db, store);

      return NextResponse.json(
        {
          success: true,
          data,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[DASHBOARD_TODOS_ALERTS]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch todos and alerts" },
        { status: 500 },
      );
    }
  },
);
