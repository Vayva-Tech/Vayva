import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const query = searchParams.get("query") || "";
      const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

      const courses = (await prisma.course?.findMany({
        where: {
          storeId,
          ...(query && {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { category: { contains: query, mode: "insensitive" } },
            ],
          }),
        },
        select: {
          id: true,
          title: true,
          category: true,
          price: true,
          currency: true,
          thumbnailUrl: true,
          isPublished: true,
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
      })) || [];

      const formatted = courses.map((c) => ({
        id: c.id,
        name: c.title,
        category: c.category,
        price: Number(c.price) || 0,
        currency: c.currency,
        thumbnail: c.thumbnailUrl || null,
        isPublished: c.isPublished,
      }));

      return NextResponse.json(
        { success: true, data: formatted },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (error) {
      logger.error("[EDITOR_DATA_COURSES_GET] Failed to fetch courses", { storeId, error });
      return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
    }
  },
);
