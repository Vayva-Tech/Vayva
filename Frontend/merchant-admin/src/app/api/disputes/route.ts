import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger, standardHeaders } from "@vayva/shared";

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 50;

export const GET = withVayvaAPI(PERMISSIONS.SUPPORT_MANAGE, async (req: NextRequest, { storeId, correlationId }: { storeId: string; correlationId: string }) => {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = Math.min(
            parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE), 10),
            MAX_PAGE_SIZE
        );
        const skip = (page - 1) * limit;

        const [disputes, total] = await Promise.all([
            prisma.dispute?.findMany({
                where: { storeId },
                include: {
                    order: { select: { orderNumber: true, customerEmail: true } }
                },
                orderBy: { evidenceDueAt: "asc" },
                take: limit,
                skip,
            }),
            prisma.dispute?.count({ where: { storeId } })
        ]);

        const formatted = disputes.map((d) => ({
            id: d.id,
            amount: Number(d.amount),
            currency: d.currency,
            status: (d as any).status,
            reason: d.reasonCode || "General Dispute",
            dueAt: d.evidenceDueAt,
            orderNumber: d.order?.orderNumber || "N/A",
            customerEmail: d.order?.customerEmail || "N/A",
            createdAt: d.createdAt
        }));

        return NextResponse.json({
            success: true,
            data: formatted,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            requestId: correlationId
        }, {
            headers: standardHeaders(correlationId),
        });
    }
    catch (error: unknown) {
        logger.error("Disputes API Error", { error: (error as Error).message, stack: (error as Error).stack, requestId: correlationId, storeId });
        return NextResponse.json({ error: "Failed to fetch disputes", requestId: correlationId }, { status: 500, headers: standardHeaders(correlationId) });
    }
});
