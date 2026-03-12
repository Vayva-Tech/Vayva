import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { DiscountService } from "@/services/discount.service";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const GET = withVayvaAPI(
  PERMISSIONS.MARKETING_VIEW,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    const { id } = await params;
    try {
      if (!id)
        return NextResponse.json({ error: "ID required" }, { status: 400 });
      const discount = await DiscountService.getDiscount(storeId, id);
      if (!discount)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(discount, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[DISCOUNT_GET_BY_ID]", error, { storeId, discountId: id });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);

export const PATCH = withVayvaAPI(
  PERMISSIONS.MARKETING_MANAGE,
  async (request: NextRequest, { storeId, params, user }: APIContext) => {
    const { id } = await params;
    try {
      if (!id)
        return NextResponse.json({ error: "ID required" }, { status: 400 });
      const parsedBody: unknown = await request.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};

      const startsAtStr = getString(body.startsAt);
      const endsAtStr = getString(body.endsAt);

      const updated = await DiscountService.updateDiscount(storeId, id, {
        ...body,
        startsAt: startsAtStr ? new Date(startsAtStr) : undefined,
        endsAt: endsAtStr ? new Date(endsAtStr) : undefined,
      });
      return NextResponse.json(updated);
    } catch (error: unknown) {
      logger.error("[DISCOUNT_UPDATE_PATCH]", error, {
        storeId,
        discountId: id,
        userId: user.id,
      });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);

export const DELETE = withVayvaAPI(
  PERMISSIONS.MARKETING_MANAGE,
  async (request: NextRequest, { storeId, params, user }: APIContext) => {
    const { id } = await params;
    try {
      if (!id)
        return NextResponse.json({ error: "ID required" }, { status: 400 });
      await DiscountService.deleteDiscount(storeId, id);
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("[DISCOUNT_DELETE_BY_ID]", error, {
        storeId,
        discountId: id,
        userId: user.id,
      });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
