import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

export const GET = withVayvaAPI(PERMISSIONS.SUPPORT_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 100);
        const status = searchParams.get("status")?.toLowerCase() || "all";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: Record<string, any> = { storeId };
        if (status !== "all") {
            if (status === "open") {where.status = { notIn: ["resolved", "closed"] };
            }
            else if (status === "closed" || status === "resolved") {where.status = { in: ["resolved", "closed"] };
            }
            else {where.status = status;
            }
        }

        const tickets = await prisma.supportTicket?.findMany({
            where,
            orderBy: { lastMessageAt: "desc" },
            take: limit,
            select: {
                id: true,
                storeId: true,
                customerId: true,
                orderId: true,
                conversationId: true,
                type: true,
                category: true,
                status: true,
                priority: true,
                subject: true,
                summary: true,
                lastMessageAt: true,
                createdAt: true,
            },
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = (tickets ?? []).map((t) => ({
            ...(t as Record<string, unknown>),
            status: (((t as any).status) || "").toString().toLowerCase(),
        }));

        return NextResponse.json(items, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (_error: unknown) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
