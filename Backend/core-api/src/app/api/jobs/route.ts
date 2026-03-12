import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, Prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.OPS_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const query = searchParams.get("q") || "";

      const where: Prisma.JobRunWhereInput = { storeId };
      if (query) {
        where.OR = [
          { jobName: { contains: query, mode: "insensitive" } },
          { errorType: { contains: query, mode: "insensitive" } },
        ];
      }
      const jobs = await prisma.jobRun.findMany({
        where,
        orderBy: { startedAt: "desc" },
        take: 20,
      });
      return NextResponse.json(
        { jobs },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[JOBS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
