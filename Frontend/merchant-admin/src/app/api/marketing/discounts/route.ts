import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { DiscountService } from "@/services/discount.service";
import { logger } from "@/lib/logger";
export const GET = withVayvaAPI(PERMISSIONS.MARKETING_VIEW, async (request: NextRequest, { storeId }: APIContext) => {
    try {
        const discounts = await DiscountService.listDiscounts(storeId);
        return NextResponse.json(discounts, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        logger.error("[MARKETING_DISCOUNTS_GET] Failed to list discounts", { storeId, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
export const POST = withVayvaAPI(PERMISSIONS.MARKETING_MANAGE, async (request: NextRequest, { storeId }: APIContext) => {
    try {
        const body = await request.json();
        // Basic validation could happen here or in service
        // Ensure dates are dates
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload: any = {
            ...body,
            startsAt: new Date(body.startsAt),
            endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
            valueAmount: body.valueAmount ? parseFloat(body.valueAmount) : undefined,
            valuePercent: body.valuePercent ? parseFloat(body.valuePercent) : undefined,
            minOrderAmount: body.minOrderAmount ? parseFloat(body.minOrderAmount) : undefined,
        };
        const result = await DiscountService.createDiscount(storeId, payload);
        return NextResponse.json({ success: true, result });
    }
    catch (error) {
        logger.error("[MARKETING_DISCOUNTS_POST] Failed to create discount", { storeId, error });
        return NextResponse.json({ error: (error as Error).message || "Internal Error" }, { status: 400 });
    }
});
