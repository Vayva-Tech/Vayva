import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.MARKETING_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const query = searchParams.get("query") || "";
      const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

      const campaigns = (await prisma.campaign?.findMany({
        where: {
          storeId,
          ...(query && {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { messageBody: { contains: query, mode: "insensitive" } },
            ],
          }),
        },
        select: {
          id: true,
          name: true,
          status: true,
          channel: true,
          scheduledAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      })) || [];

      return NextResponse.json(
        { success: true, data: campaigns },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (error) {
      logger.error("[EDITOR_DATA_CAMPAIGNS_GET] Failed to fetch campaigns", { storeId, error });
      return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
    }
  },
);
