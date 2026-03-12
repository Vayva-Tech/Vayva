import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
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
export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        if (!type || !ALLOWED_TYPES.includes(type)) {
            return NextResponse.json({ error: "Invalid or missing resource type" }, { status: 400 });
        }
        const resources = await prisma.product?.findMany({
            where: {
                storeId,
                productType: type
            },
            include: {
                productImages: {
                    orderBy: { position: 'asc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = resources.map((r: any) => ({
            id: r.id,
            name: r.title, // ResourceListPage expects 'name'
            title: r.title,
            price: Number(r.price),
            image: r.productImages?.[0]?.url || null,
            status: (r as any).status // DRAFT/ACTIVE
        }));
        return NextResponse.json(mapped, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        logger.error("[RESOURCE_LIST] Failed to fetch resources", { storeId, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
