import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.PORTFOLIO_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const query = searchParams.get("query") || "";
      const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

      const projects = (await prisma.portfolioProject?.findMany({
        where: {
          storeId,
          ...(query && {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { slug: { contains: query, mode: "insensitive" } },
            ],
          }),
        },
        select: {
          id: true,
          title: true,
          slug: true,
          images: true,
          description: true,
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
      })) || [];

      // images is JSON, but often contains [{url,...}]. Keep as-is for editor usage.
      return NextResponse.json(
        { success: true, data: projects },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (error) {
      logger.error("[EDITOR_DATA_PROJECTS_GET] Failed to fetch projects", { storeId, error });
      return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }
  },
);
