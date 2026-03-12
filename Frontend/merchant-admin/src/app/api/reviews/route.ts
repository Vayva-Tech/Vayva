import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const reviews = await prisma.review?.findMany({
            where: { storeId },
            orderBy: { createdAt: "desc" },
        });
        // Fetch basic product info manually since relation might not be established in schema
        const productIds = reviews
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((r: any) => r.productId)
            .filter((id: string | null) => id !== null);
        const products = await prisma.product?.findMany({
            where: { id: { in: productIds } },
            select: { id: true, title: true, handle: true },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const productMap = new Map((products as any[]).map((p) => [p.id, p]));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatted = reviews.map((review: any) => ({
            id: review.id,
            rating: review.rating,
            title: review.title,
            status: review.status,
            customerName: "Anonymous Customer",
            product: review.productId ? productMap.get(review.productId)?.title : "Unknown Product",
            createdAt: review.createdAt,
        }));
        return NextResponse.json({ success: true, data: formatted }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error: unknown) {
        logger.error("[REVIEWS_GET] Failed to fetch reviews", { storeId, error });
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
});
