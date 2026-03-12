import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { DiscountService } from "@/services/discount.service";
import { logger } from "@/lib/logger";
export const GET = withVayvaAPI(PERMISSIONS.MARKETING_VIEW, async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
        const { id } = await params;
        const discount = await DiscountService.getDiscount(storeId, id);
        if (!discount)
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(discount, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        const { id } = await params;
        logger.error("[MARKETING_DISCOUNT_GET] Failed to fetch discount", { storeId, id, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
export const PATCH = withVayvaAPI(PERMISSIONS.MARKETING_MANAGE, async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
        const { id } = await params;
        const body = await request.json();
        const updated = await DiscountService.updateDiscount(storeId, id, {
            ...body,
            startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
            endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
        });
        return NextResponse.json(updated);
    }
    catch (error) {
        const { id } = await params;
        logger.error("[MARKETING_DISCOUNT_PATCH] Failed to update discount", { storeId, id, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
export const DELETE = withVayvaAPI(PERMISSIONS.MARKETING_MANAGE, async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
        const { id } = await params;
        await DiscountService.deleteDiscount(storeId, id);
        return NextResponse.json({ success: true });
    }
    catch (error) {
        const { id } = await params;
        logger.error("[MARKETING_DISCOUNT_DELETE] Failed to delete discount", { storeId, id, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
