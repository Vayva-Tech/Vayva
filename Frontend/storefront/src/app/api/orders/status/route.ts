import { NextResponse } from "next/server";
import { prisma, Prisma } from "@vayva/db";
import { reportError } from "@/lib/error";
import { getTenantFromHost } from "@/lib/tenant";
import { Paystack } from "@vayva/payments";
import {
  PaymentStatus,
  standardHeaders,
  logger,
  BaseError,
} from "@vayva/shared";
import { withStorefrontAPI } from "@/lib/api-handler";

function getRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function toInputJsonValue(value: unknown): Prisma.InputJsonValue {
  // Prisma JSON input does not accept undefined.
  // For provider payloads, we also avoid null here to satisfy InputJsonValue typing.
  if (value === null || value === undefined) return {};

  if (typeof value === "string") return value;
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value;

  if (Array.isArray(value)) return value as Prisma.InputJsonValue;
  if (typeof value === "object") return value as Prisma.InputJsonValue;

  return String(value);
}

function getPaystackCurrency(raw: unknown): string | null {
  const r1 = getRecord(raw);
  const data = r1 ? getRecord(r1.data) : null;
  const currency = data?.currency;
  return typeof currency === "string" ? currency : null;
}

function normalizePhone(value: string): string {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/[^0-9]/g, "")
    .trim();
}

function extractOrderIdFromReference(reference: string | null): string | null {
  if (!reference) return null;
  const m = String(reference).match(/ORD-([0-9a-f-]{36})/i);
  return m?.[1] || null;
}

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

    const store = await prisma.store.findUnique({
      where: { slug: t.slug },
      select: { id: true },
    });
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const upstreamBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    const isAbsoluteUpstream =
      typeof upstreamBaseUrl === "string" &&
      /^https?:\/\//i.test(upstreamBaseUrl);

    const url = new URL(req.url);
    const reference = url.searchParams.get("reference");
    const orderIdParam = url.searchParams.get("orderId");
    const ref = url.searchParams.get("ref");
    const phone = url.searchParams.get("phone");

    if (isAbsoluteUpstream) {
      const base = upstreamBaseUrl.replace(/\/$/, "").replace(/\/v1$/, "");
      const upstreamUrl = new URL(`${base}/public/orders/status`);

      if (reference) upstreamUrl.searchParams.set("reference", reference);
      if (ref) upstreamUrl.searchParams.set("ref", ref);
      if (phone) upstreamUrl.searchParams.set("phone", phone);
      if (orderIdParam) upstreamUrl.searchParams.set("orderId", orderIdParam);

      const upstreamResponse = await fetch(upstreamUrl.toString(), {
        headers: { "Content-Type": "application/json" },
      });

      const upstreamData = await upstreamResponse
        .json()
        .catch(async () => ({ raw: await upstreamResponse.text() }));

      return NextResponse.json(upstreamData, {
        status: upstreamResponse.status,
      });
    }

    const derivedOrderId = extractOrderIdFromReference(reference);
    const orderId = orderIdParam || derivedOrderId;

    if (!orderId && !ref) {
      return NextResponse.json(
        { error: "Missing orderId, ref, or reference", requestId },
        { status: 400, headers: standardHeaders(requestId) },
      );
    }

    if (!orderId && ref && !phone) {
      return NextResponse.json(
        {
          error: "Phone is required when looking up an order by ref",
          requestId,
        },
        { status: 400, headers: standardHeaders(requestId) },
      );
    }

    const order = orderId
      ? await prisma.order.findFirst({
          where: { id: orderId, storeId: store.id },
          select: {
            id: true,
            refCode: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            deliveryMethod: true,
            paymentMethod: true,
            customerPhone: true,
            customerNote: true,
            subtotal: true,
            shippingTotal: true,
            total: true,
            createdAt: true,
            updatedAt: true,
            items: {
              select: {
                title: true,
                quantity: true,
                price: true,
              },
            },
          },
        })
      : await prisma.order.findFirst({
          where: { refCode: String(ref), storeId: store.id },
          select: {
            id: true,
            refCode: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            deliveryMethod: true,
            paymentMethod: true,
            customerPhone: true,
            customerNote: true,
            subtotal: true,
            shippingTotal: true,
            total: true,
            createdAt: true,
            updatedAt: true,
            items: {
              select: {
                title: true,
                quantity: true,
                price: true,
              },
            },
          },
        });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found", requestId },
        { status: 404, headers: standardHeaders(requestId) },
      );
    }

    // 41.3: Fallback reconciliation if DB still pending after some time
    // If the order is PENDING/INITIATED and was created > 30 seconds ago, try a quick verify
    const isPending =
      order.paymentStatus === "PENDING" || order.paymentStatus === "INITIATED";
    const ageSeconds =
      (Date.now() - new Date(order.createdAt).getTime()) / 1000;

    let effectivePaymentStatus = order.paymentStatus;
    let effectiveStatus = order.status;

    if (isPending && ageSeconds > 30 && reference) {
      try {
        const paystackData = await Paystack.verifyTransaction(reference);
        if (paystackData.status === "success") {
          const receivedAmountKobo = paystackData.amountKobo;
          const receivedCurrency = getPaystackCurrency(paystackData.raw);
          const expectedAmountKobo = Math.round(Number(order.total) * 100);
          const expectedCurrency = "NGN"; // Default for storefront

          if (
            receivedAmountKobo === expectedAmountKobo &&
            receivedCurrency === expectedCurrency
          ) {
            // Update order status in DB
            await prisma.$transaction(async (tx) => {
              // Double check status hasn't changed
              const fresh = await tx.order.findUnique({
                where: { id: order.id },
                select: { paymentStatus: true },
              });
              if (fresh?.paymentStatus !== PaymentStatus.SUCCESS) {
                await tx.order.update({
                  where: { id: order.id },
                  data: { paymentStatus: "SUCCESS", status: "PAID" },
                });

                // Record the transaction as verified
                const metadata = toInputJsonValue(paystackData.raw);
                await tx.paymentTransaction.upsert({
                  where: { reference },
                  update: { status: "SUCCESS", metadata },
                  create: {
                    storeId: store.id,
                    orderId: order.id,
                    reference,
                    amount: expectedAmountKobo,
                    currency: expectedCurrency,
                    status: "SUCCESS",
                    provider: "PAYSTACK",
                    type: "CHARGE",
                    metadata,
                  },
                });
              }
            });

            // Update response values (avoid mutating the typed Prisma result)
            effectivePaymentStatus = "SUCCESS";
            effectiveStatus = "PAID";
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        logger.warn("[RECONCILE_FALLBACK_ERROR]", {
          requestId,
          error: errMsg,
          app: "storefront",
        });
      }
    }

    if (!orderId && ref && phone) {
      const expected = normalizePhone(order.customerPhone || "");
      const provided = normalizePhone(phone);
      if (!expected || !provided || expected !== provided) {
        // Avoid leaking existence of orders.
        return NextResponse.json(
          { error: "Order not found", requestId },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }
    }

    const timeline = [
      {
        type: "ORDER_CREATED",
        text: "Order created",
        createdAt: order.createdAt,
      },
      {
        type: "PAYMENT_STATUS",
        text:
          String(order.paymentStatus) === "SUCCESS"
            ? "Payment confirmed"
            : "Payment pending",
        createdAt: order.updatedAt,
      },
    ];

    return NextResponse.json(
      {
        id: order.id,
        refCode: order.refCode,
        orderNumber: order.orderNumber,
        status: effectiveStatus,
        paymentStatus: effectivePaymentStatus,
        deliveryMethod: order.deliveryMethod,
        subtotal: order.subtotal,
        shippingTotal: order.shippingTotal,
        total: order.total,
        items: order.items,
        customer: {
          phone: orderId ? null : order.customerPhone,
          note: order.customerNote,
        },
        timeline,
        requestId,
      },
      { headers: standardHeaders(requestId) },
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    if (error instanceof BaseError) throw error;
    const errMsg = error instanceof Error ? error.message : String(error);
    reportError(error, { route: "GET /api/orders/status", requestId });
    logger.error("Failed to fetch order status", {
      requestId,
      error: errMsg,
      app: "storefront",
    });
    return NextResponse.json(
      { error: errMsg || "Failed to fetch order status", requestId },
      { status: 500, headers: standardHeaders(requestId) },
    );
  }
});
