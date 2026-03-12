import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/**
 * Real Payout Accounts Implementation
 * Replaces in-memory mock with BankBeneficiary DB model.
 */
export const GET = withVayvaAPI(
  PERMISSIONS.FINANCE_VIEW,
  async (req, { storeId }) => {
    try {
      const beneficiaries = await prisma.bankBeneficiary.findMany({
        where: { storeId },
        orderBy: { isDefault: "desc" },
      });
      return NextResponse.json(beneficiaries, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[PAYOUT_ACCOUNTS_GET]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.PAYOUTS_MANAGE,
  async (req, { storeId, user, correlationId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};

      const bankName = getString(body.bankName);
      const bankCode = getString(body.bankCode);
      const accountNumber = getString(body.accountNumber);
      const accountName = getString(body.accountName);
      const isDefault = body.isDefault;

      if (!bankName || !bankCode || !accountNumber || !accountName) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 },
        );
      }

      if (isDefault) {
        await prisma.bankBeneficiary.updateMany({
          where: { storeId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const beneficiary = await prisma.bankBeneficiary.create({
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
      const { logAudit, AuditEventType } = await import("@/lib/audit");
      await logAudit(storeId, user.id, AuditEventType.PAYOUT_SETTING_CHANGED, {
        entityType: "BankBeneficiary",
        entityId: beneficiary.id,
        afterState: { bankName, bankCode, accountNumber, isDefault },
        correlationId,
      });

      return NextResponse.json(beneficiary);
    } catch (error: unknown) {
      logger.error("[PAYOUT_ACCOUNTS_POST]", error, {
        storeId,
        userId: user.id,
      });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
