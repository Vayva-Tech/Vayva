import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { Prisma, prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { PayoutCreateSchema } from "@/lib/validations/finance-ops";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (isRecord(error) && typeof error.message === "string")
    return error.message as string;
  return "Failed to request payout";
}

export const GET = withVayvaAPI(
  PERMISSIONS.PAYOUTS_VIEW,
  async (_req, { storeId }) => {
    try {
      const payouts = await prisma.payout.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return NextResponse.json(payouts, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[FINANCE_PAYOUTS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to load payouts" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.PAYOUTS_MANAGE,
  async (req, { storeId }) => {
    try {
      const body = await req.json().catch(() => ({}));
      const validation = PayoutCreateSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: validation.error.format(),
          },
          { status: 400 },
        );
      }

      const { amount, currency, bankDetails } = validation.data;

      // We need to convert bankDetails to InputJsonValue
      // strictly speaking bankDetails is an object, so it's a valid JsonValue.
      // However, Prisma types can be tricky.
      const destination = bankDetails as unknown as Prisma.InputJsonValue;

      const payout = await prisma.payout.create({
        data: {
          storeId,
          provider: "MANUAL",
          providerPayoutId: `manual_${Date.now()}`,
          status: "PENDING",
          amount,
          currency,
          reference: `payout_${Date.now()}`,
          destination,
        },
      });

      return NextResponse.json(payout);
    } catch (error: unknown) {
      logger.error("[FINANCE_PAYOUTS_POST]", error, { storeId });
      return NextResponse.json(
        { error: getErrorMessage(error) },
        { status: 500 },
      );
    }
  },
);
