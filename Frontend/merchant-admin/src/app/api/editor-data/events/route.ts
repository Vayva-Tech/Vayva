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

      const events = (await prisma.event?.findMany({
        where: {
          storeId,
          ...(query && {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { category: { contains: query, mode: "insensitive" } },
              { venue: { contains: query, mode: "insensitive" } },
            ],
          }),
        },
        select: {
          id: true,
          title: true,
          category: true,
          startDate: true,
          endDate: true,
          status: true,
          bannerImage: true,
          venue: true,
        },
        orderBy: { startDate: "asc" },
        take: limit,
      })) || [];

      const formatted = events.map((e) => ({
        id: e.id,
        name: e.title,
        category: e.category,
        startDate: e.startDate,
        endDate: e.endDate,
        status: e.status,
        image: e.bannerImage || null,
        venue: e.venue || null,
      }));

      return NextResponse.json(
        { success: true, data: formatted },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (error) {
      logger.error("[EDITOR_DATA_EVENTS_GET] Failed to fetch events", { storeId, error });
      return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
  },
);
