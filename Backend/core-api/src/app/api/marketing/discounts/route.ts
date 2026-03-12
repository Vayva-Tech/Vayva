import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { DiscountService } from "@/services/discount.service";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Internal Error";
}

export const GET = withVayvaAPI(
  PERMISSIONS.MARKETING_VIEW,
  async (request: NextRequest, { storeId }: APIContext) => {
    try {
      const discounts = await DiscountService.listDiscounts(storeId);
      return NextResponse.json(discounts, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[DISCOUNTS_LIST_GET]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.MARKETING_MANAGE,
  async (request: NextRequest, { storeId, user }: APIContext) => {
    try {
      const parsedBody: unknown = await request.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};

      // Basic validation and transformation
      const startsAtStr = getString(body.startsAt);
      const endsAtStr = getString(body.endsAt);
      const valueAmountRaw = body.valueAmount;
      const valuePercentRaw = body.valuePercent;
      const minOrderAmountRaw = body.minOrderAmount;

      const payload: Record<string, unknown> = {
        ...body,
        startsAt: startsAtStr ? new Date(startsAtStr) : new Date(),
        endsAt: endsAtStr ? new Date(endsAtStr) : undefined,
        valueAmount: valueAmountRaw
          ? parseFloat(String(valueAmountRaw))
          : undefined,
        valuePercent: valuePercentRaw
          ? parseFloat(String(valuePercentRaw))
          : undefined,
        minOrderAmount: minOrderAmountRaw
          ? parseFloat(String(minOrderAmountRaw))
          : undefined,
      };

      const result = await DiscountService.createDiscount(storeId, payload);
      return NextResponse.json({ success: true, result });
    } catch (error: unknown) {
      logger.error("[DISCOUNT_CREATE_POST]", error, {
        storeId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: getErrorMessage(error) },
        { status: 400 },
      );
    }
  },
);
