import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { ProductCoreService } from "@/services/product-core.service";
import { logger } from "@/lib/logger";
const ALLOWED_TYPES = [
    "service",
    "campaign",
    "listing",
    "course",
    "post",
    "stay",
    "event",
    "digital_asset",
    "menu_item",
    "project",
    "vehicle",
    "lead",
];
export const POST = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const body = await req.json();
        const { primaryObject, data } = body;
        if (!primaryObject || !ALLOWED_TYPES.includes(primaryObject)) {
            return NextResponse.json({ error: "Invalid resource type" }, { status: 400 });
        }
        // Map Generic Resource Payload to Product Service Payload
        // We pass 'primaryObject' as 'productType'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload: any = {
            ...data,
            productType: primaryObject,
            // Defaulting title/name mapping if needed, but Service checks for title/name
        };
        const product = await ProductCoreService.createProduct(storeId, payload);
        return NextResponse.json({ success: true, id: product.id });
    }
    catch (error) {
        logger.error("[RESOURCE_CREATE] Failed to create resource", { storeId, error });
        const isLimitError = (error as Error).message?.includes("limit");
        return NextResponse.json({ error: isLimitError ? "Resource limit reached" : "Failed to create resource" }, { status: isLimitError ? 403 : 400 });
    }
});
