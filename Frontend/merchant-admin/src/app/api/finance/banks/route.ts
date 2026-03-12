import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.FINANCE_VIEW, async (_req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const banks = await prisma.bankBeneficiary?.findMany({
            where: { storeId },
            select: {
                id: true,
                bankName: true,
                accountNumber: true,
                accountName: true,
                isDefault: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(banks, {
            headers: { "Cache-Control": "no-store" },
        });
    } catch (error: unknown) {
        logger.error("[FINANCE_BANKS_GET]", error);
        return NextResponse.json({ error: "Failed to load bank accounts" }, { status: 500 });
    }
});
