import { NextResponse } from "next/server";
import { PaystackService } from "@/lib/payment/paystack";
import { prisma, SubscriptionPlan } from "@vayva/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logAuditEvent as logAudit, AuditEventType } from "@/lib/audit";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getErrorMessage(error: unknown): string | undefined {
  if (error instanceof Error) return error.message;
  if (!isRecord(error)) return undefined;
  return getString(error.message);
}

export const runtime = "nodejs";
export const POST = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (request: Request, ctx: APIContext) => {
    try {
      const forwardedFor = request.headers.get("x-forwarded-for") || "";
      const ipAddress =
        forwardedFor.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        undefined;
      const userAgent = request.headers.get("user-agent") || undefined;

      const storeId = ctx.storeId;
      const userId = ctx.user?.id;
      const actorLabel =
        `${ctx.user?.firstName || ""} ${ctx.user?.lastName || ""}`.trim() ||
        ctx.user?.email ||
        userId;

      const parsedBody: unknown = await request.json().catch(() => ({}));
      const body: Record<string, unknown> = isRecord(parsedBody)
        ? parsedBody
        : {};
      const reference = getString(body.reference) ?? "";
      if (!reference) {
        return NextResponse.json(
          { error: "Payment reference is required" },
          { status: 400, headers: { "Cache-Control": "no-store" } },
        );
      }

      // 1) Verify payment with Paystack (tenant binding happens via metadata)
      const verification =
        await PaystackService.verifyPlanChangePayment(reference);
      if (verification.storeId !== storeId) {
        return NextResponse.json(
          { error: "Payment reference does not belong to this store" },
          { status: 403 },
        );
      }

      // 2) Idempotency check AFTER tenant binding to reduce cross-tenant leakage
      const existingTx = await prisma.paymentTransaction.findUnique({
        where: { reference },
        select: { storeId: true, status: true },
      });
      if (existingTx) {
        if (existingTx.storeId !== storeId) {
          return NextResponse.json(
            { error: "Payment reference already used" },
            { status: 409 },
          );
        }
        if (existingTx.status === "SUCCESS") {
          return NextResponse.json(
            {
              success: true,
              message: "Payment already verified and applied",
            },
            { headers: { "Cache-Control": "no-store" } },
          );
        }
      }

      const newPlan = verification.newPlan;
      const amountKobo = Number(verification.amountKobo || 0);
      const currency = String(verification.currency || "NGN");
      const amount = Number.isFinite(amountKobo) ? amountKobo / 100 : 0;

      // 3) Update store plan + record transaction (avoid aiSubscription until schema supports it)
      await prisma.$transaction(async (tx) => {
        const store = await tx.store.findUnique({
          where: { id: storeId },
          select: { plan: true },
        });
        const oldPlan = store?.plan || "STARTER";

        await tx.store.update({
          where: { id: storeId },
          data: { plan: newPlan as SubscriptionPlan },
        });

        await tx.paymentTransaction.upsert({
          where: { reference },
          create: {
            storeId,
            reference,
            provider: "PAYSTACK",
            amount,
            currency,
            status: "SUCCESS",
            type: "SUBSCRIPTION",
            metadata: { newPlan, oldPlan },
          },
          update: {
            status: "SUCCESS",
            metadata: { newPlan, oldPlan },
          },
        });

        await logAudit(storeId, userId, AuditEventType.SETTINGS_CHANGED, {
          targetType: "SUBSCRIPTION",
          reason: "Plan Changed",
          before: { plan: oldPlan },
          after: { plan: newPlan, reference },
          correlationId: ctx.correlationId,
          actorType: "merchant_user",
          actorLabel,
          ipAddress,
          userAgent,
        });
      });

      return NextResponse.json(
        {
          success: true,
          message: "Subscription updated successfully",
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (error: unknown) {
      logger.error("[BILLING_VERIFY_PAYMENT]", error, { storeId: ctx.storeId });
      return NextResponse.json(
        { error: getErrorMessage(error) || "Failed to verify payment" },
        { status: 500, headers: { "Cache-Control": "no-store" } },
      );
    }
  },
);
