import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const POST = withVayvaAPI(PERMISSIONS.CUSTOMERS_MANAGE, async (req: NextRequest, { storeId, user, params }: { storeId: string; user: { id: string }; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await params;
        const { id: customerId } = resolvedParams;
        const { content } = await req.json().catch(() => ({}));

        if (!content || typeof content !== "string") {
            return NextResponse.json({ error: "content is required" }, { status: 400 });
        }

        const customer = await prisma.customer?.findFirst({
            where: { id: customerId, storeId },
            select: { id: true },
        });

        if (!customer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }

        const note = await prisma.customerNote?.create({
            data: {
                storeId,
                customerId,
                content: content.trim(),
                authorUserId: user.id,
            },
        });

        return NextResponse.json({ success: true, data: note }, { status: 201 });
    } catch (error) {
        logger.error("[CUSTOMER_NOTE_CREATE] Failed to create customer note", { storeId, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
