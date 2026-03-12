import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export const PATCH = withVayvaAPI(
  PERMISSIONS.MARKETING_MANAGE,
  async (req: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      // Validate ownership
      const existing = await prisma.flashSale.findFirst({
        where: { id, storeId },
      });
      if (!existing) {
        return NextResponse.json(
          { error: "Flash sale not found" },
          { status: 404 },
        );
      }
      const updated = await prisma.flashSale.updateMany({
        where: { id, storeId },
        data: {
          name: typeof body.name === "string" ? body.name : undefined,
          discount:
            typeof body.discount === "number" ? body.discount : undefined,
          startTime:
            typeof body.startTime === "string"
              ? new Date(body.startTime)
              : undefined,
          endTime:
            typeof body.endTime === "string"
              ? new Date(body.endTime)
              : undefined,
          isActive:
            typeof body.isActive === "boolean" ? body.isActive : undefined,
          targetType:
            typeof body.targetType === "string" ? body.targetType : undefined,
          targetId:
            typeof body.targetId === "string" ? body.targetId : undefined,
        },
      });
      if (updated.count === 0) {
        return NextResponse.json(
          { error: "Flash sale not found" },
          { status: 404 },
        );
      }

      const refreshed = await prisma.flashSale.findFirst({
        where: { id, storeId },
      });
      return NextResponse.json({ success: true, data: refreshed });
    } catch (error) {
      logger.error("[FLASH_SALES_PATCH]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to update flash sale" },
        { status: 500 },
      );
    }
  },
);
export const DELETE = withVayvaAPI(
  PERMISSIONS.MARKETING_MANAGE,
  async (req: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      // Validate ownership
      const deleted = await prisma.flashSale.deleteMany({
        where: { id, storeId },
      });
      if (deleted.count === 0) {
        return NextResponse.json(
          { error: "Flash sale not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true });
    } catch (error) {
      logger.error("[FLASH_SALES_DELETE]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to delete flash sale" },
        { status: 500 },
      );
    }
  },
);
