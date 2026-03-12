import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { DashboardService } from "@/services/dashboard.server";
import { logger } from "@/lib/logger";

type RangeKey = "today" | "week" | "month";

function clampRangeKey(raw: string | null): RangeKey {
  if (raw === "today" || raw === "week" || raw === "month") return raw;
  return "month";
}

function rangeToDays(key: RangeKey): number {
  if (key === "today") return 1;
  if (key === "week") return 7;
  return 30;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (request, { storeId, db }) => {
    try {
      const url = new URL(request.url);
      const rangeKey = clampRangeKey(url.searchParams.get("range"));
      const days = rangeToDays(rangeKey);

      const end = new Date();
      const start = startOfDay(
        new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000),
      );

      const data = await DashboardService.getCustomerInsights(db, start, end);

      return NextResponse.json(
        {
          success: true,
          data: {
            range: {
              key: rangeKey,
              start: start.toISOString(),
              end: end.toISOString(),
            },
            ...data,
          },
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[DASHBOARD_CUSTOMER_INSIGHTS]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch customer insights" },
        { status: 500 },
      );
    }
  },
);
