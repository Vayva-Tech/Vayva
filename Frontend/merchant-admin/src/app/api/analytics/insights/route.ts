import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { AnalyticsService } from "@/services/AnalyticsService";
export const GET = withVayvaAPI(PERMISSIONS.METRICS_VIEW, async (request: NextRequest, { storeId }: APIContext) => {
    try {
        const insights = await AnalyticsService.getInsights(storeId);
        return NextResponse.json({ insights }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
    }
});
