import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, type Prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

type ReviewStatus = "PUBLISHED" | "ARCHIVED" | "PENDING" | "REJECTED";

const ALLOWED_STATUSES = new Set<ReviewStatus>(["PUBLISHED", "ARCHIVED", "PENDING", "REJECTED"]);

export const PATCH = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const { id } = await params;
        const body = await req.json().catch(() => ({})) as { status?: string };
        const status = String(body?.status || "").toUpperCase() as ReviewStatus;

        if (!ALLOWED_STATUSES.has(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const existing = await prisma.review?.findFirst({ where: { id, storeId }, select: { id: true } });
        if (!existing) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        await prisma.review?.update({
            where: { id },
            data: { status: status as Prisma.ReviewUpdateInput["status"] },
        });

        return NextResponse.json({ success: true }, {
            headers: { "Cache-Control": "no-store" },
        });
    } catch (error: unknown) {
        logger.error("[REVIEW_STATUS_PATCH]", error);
        return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
    }
});
