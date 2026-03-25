import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { Paystack } from "@vayva/payments";
import { getTenantFromHost } from "@/lib/tenant";
import { withStorefrontAPI } from "@/lib/api-handler";
import {
  standardHeaders,
  logger,
  BaseError,
  PaymentStatus
} from "@vayva/shared";

function getRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function getPaystackDataStatus(raw: unknown): string | null {
  const r1 = getRecord(raw);
  const data = r1 ? getRecord(r1.data) : null;
  const status = data?.status;
  return typeof status === "string" ? status : null;
}

function getPaystackAmountKobo(raw: unknown): number | null {
  const r1 = getRecord(raw);
  const data = r1 ? getRecord(r1.data) : null;
  const amount = data?.amount;
  const n = typeof amount === "number" ? amount : Number(amount);
  return Number.isFinite(n) ? n : null;
}

export const runtime = "nodejs";

export const GET = withStorefrontAPI(async (req: any, ctx: any) => {
  const { requestId } = ctx;
  try {
    const t = await getTenantFromHost(req.headers.get("host") || undefined);
    if (!t.ok) {
      return NextResponse.json(
        { error: "Store not found", requestId },
        { status: 404 },
      );
    }

    const url = new URL(req.url);
    const reference = url.searchParams.get("reference"); // Paystack ref: order_<refCode>

    if (!reference) {
      return NextResponse.json(
        { error: "reference required", requestId },
        { status: 400 },
      );
    }

    // Verify via Paystack (canonical module)
    const verified = await Paystack.verifyTransaction(reference);
    const raw = (verified as { raw?: unknown }).raw ?? {};
    const isOk =
      Boolean(getRecord(raw)) &&
      String(getPaystackDataStatus(raw) || "").toLowerCase() === "success";
    if (!isOk) {
      return NextResponse.json(
        { success: false, message: "Payment not successful", requestId },
        { status: 402 },
      );
    }

    const orderRef = reference.startsWith("order_")
      ? reference.slice("order_".length)
      : null;
    if (!orderRef) {
      return NextResponse.json(
        { error: "Invalid reference format", requestId },
        { status: 400 },
      );
    }

    const order = await prisma.order.findFirst({
      where: { refCode: orderRef },
      include: { store: true },
    });
    if (!order) {
      return NextResponse.json(
        { error: "Order not found", requestId },
        { status: 404 },
      );
    }

    if (String(order.store?.slug || "") !== t.slug) {
      return NextResponse.json(
        { error: "Order not found", requestId },
        { status: 404 },
      );
    }

    const expectedAmountKobo = Math.round(Number(order.total) * 100);
    const paidAmountKobo = getPaystackAmountKobo(raw);
    if (
      !Number.isFinite(paidAmountKobo) ||
      expectedAmountKobo !== paidAmountKobo
    ) {
      return NextResponse.json(
        {
          error: "Payment amount mismatch",
          requestId,
          details: { expected: expectedAmountKobo, received: paidAmountKobo },
        },
        { status: 400, headers: standardHeaders(requestId) },
      );
    }

    // Idempotent update
    if (
      order.paymentStatus !== PaymentStatus.SUCCESS &&
      order.status !== "PAID"
    ) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.SUCCESS,
          status: "PAID",
        },
      });
    }

    const updated = await prisma.order.findUnique({ where: { id: order.id } });

    return NextResponse.json(
      {
        success: true,
        message: "Payment successful",
        order: {
          refCode: updated?.refCode,
          status: updated?.status,
          paymentStatus: updated?.paymentStatus,
        },
        requestId,
      },
      { headers: standardHeaders(requestId) },
    );
  } catch (err: unknown) {
    if (err instanceof BaseError) throw err;
    logger.error("[PUBLIC_PAY_VERIFY]", {
      requestId,
      error: err instanceof Error ? err.message : String(err),
      app: "storefront",
    });
    const msg = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json(
      { error: msg, requestId },
      { status: 500, headers: standardHeaders(requestId) },
    );
  }
});
