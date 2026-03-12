import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.OPS_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: Record<string, any> = { storeId };
        if (query) {
            where.OR = [
                { jobName: { contains: query, mode: "insensitive" } },
                { errorType: { contains: query, mode: "insensitive" } },
            ];
        }
        const jobs = await prisma.jobRun?.findMany({
            where,
            orderBy: { startedAt: "desc" },
            take: 20,
        });
        return NextResponse.json({ jobs }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        logger.error("[JOBS_GET] Failed to fetch jobs", { storeId, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
