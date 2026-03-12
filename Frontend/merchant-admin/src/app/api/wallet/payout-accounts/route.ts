import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

/**
 * Real Payout Accounts Implementation
 * Replaces in-memory mock with BankBeneficiary DB model.
 */
export const GET = withVayvaAPI(PERMISSIONS.FINANCE_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const beneficiaries = await prisma.bankBeneficiary?.findMany({
            where: { storeId },
            orderBy: { isDefault: "desc" },
        });
        return NextResponse.json(beneficiaries, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        logger.error("[PAYOUT_ACCOUNTS_GET] Failed to fetch payout accounts", { storeId, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});

export const POST = withVayvaAPI(PERMISSIONS.PAYOUTS_MANAGE, async (req: NextRequest, { storeId, user, correlationId }: { storeId: string; user: { id: string }; correlationId: string }) => {
    try {
        const body = await req.json().catch(() => ({}));
        const { bankName, bankCode, accountNumber, accountName, isDefault } = body;

        if (!bankName || !bankCode || !accountNumber || !accountName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (isDefault) {
            await prisma.bankBeneficiary?.updateMany({
                where: { storeId, isDefault: true },
                data: { isDefault: false },
            });
        }

        const beneficiary = await prisma.bankBeneficiary?.create({
            data: {
                storeId,
                bankName,
                bankCode,
                accountNumber,
                accountName,
                isDefault: !!isDefault,
            },
        });

        // Audit Log
        const { logAuditEvent, AuditEventType } = await import("@/lib/audit");
        await logAuditEvent(storeId, user.id, AuditEventType.SETTINGS_CHANGED, {
            targetType: "BankBeneficiary",
            targetId: beneficiary.id,
            meta: { bankName, bankCode, accountNumber, isDefault },
        });

        return NextResponse.json(beneficiary);
    } catch (error) {
        logger.error("[PAYOUT_ACCOUNTS_POST] Failed to create payout account", { storeId, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
