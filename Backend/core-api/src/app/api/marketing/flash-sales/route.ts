import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export const POST = withVayvaAPI(
  PERMISSIONS.MARKETING_MANAGE,
  async (req: NextRequest, { storeId }: APIContext) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const name = typeof body.name === "string" ? body.name : undefined;
      const discount =
        typeof body.discount === "number" ? body.discount : undefined;
      const startTime =
        typeof body.startTime === "string" ? body.startTime : undefined;
      const endTime =
        typeof body.endTime === "string" ? body.endTime : undefined;
      const targetType =
        typeof body.targetType === "string" ? body.targetType : undefined;
      const targetId =
        typeof body.targetId === "string" ? body.targetId : undefined;
      if (!name || !discount || !startTime || !endTime) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 },
        );
      }
      const flashSale = await prisma.flashSale.create({
        data: {
          storeId,
          name,
          discount: Number(discount),
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          targetType: targetType || "ALL",
          targetId: targetId || null,
          isActive: true,
        },
      });
      return NextResponse.json({ success: true, data: flashSale });
    } catch (error) {
      logger.error("[FLASH_SALES_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
export const GET = withVayvaAPI(
  PERMISSIONS.MARKETING_VIEW,
  async (req: NextRequest, { storeId }: APIContext) => {
    try {
      const sales = await prisma.flashSale.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return NextResponse.json(
        { success: true, data: sales },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error) {
      logger.error("[FLASH_SALES_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
