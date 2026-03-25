import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { Paystack } from "@vayva/payments";
import {
  urls,
  standardHeaders,
  logger,
  BaseError,
  PaymentStatus
} from "@vayva/shared";
import { getTenantFromHost } from "@/lib/tenant";
import { withStorefrontAPI } from "@/lib/api-handler";

function getRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withStorefrontAPI(async (req: any, ctx: any) => {
  const { requestId } = ctx;
  try {
    const t = await getTenantFromHost(req.headers.get("host") || undefined);
    if (!t.ok) {
      return NextResponse.json(
        { error: "Store not found", requestId },
        { status: 404 },
      );
    }

    const { reference } = await req.json().catch(() => ({}));

    if (!reference || typeof reference !== "string") {
      return NextResponse.json(
        { error: "reference is required", requestId },
        { status: 400 },
      );
    }

    const order = await prisma.order.findFirst({
      where: { refCode: reference },
      include: { customer: true, store: true },
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

    if (
      order.paymentStatus === PaymentStatus.SUCCESS ||
      order.status === "PAID"
    ) {
      return NextResponse.json(
        { error: "Order already paid", requestId },
        { status: 409 },
      );
    }

    const storeSlug = order.store.slug;
    const callbackUrl = urls.storefrontOrderConfirmation(
      storeSlug,
      order.refCode || order.id,
    );

    const email =
      order.customer?.email || order.customerEmail || "guest@vayva.ng";

    const amountKobo = Math.round(Number(order.total) * 100);
    if (!Number.isFinite(amountKobo) || amountKobo <= 0) {
      return NextResponse.json(
        { error: "Invalid order amount", requestId },
        { status: 400 },
      );
    }

    const paystackRef = `order_${order.refCode || order.id}`;

    if (process.env.VAYVA_E2E_MODE === "true") {
      const fakeAuthorizationUrl = `https://paystack.test/authorize?reference=${encodeURIComponent(
        paystackRef,
      )}`;

      const fakeReference = `e2e_${paystackRef}`;

      await prisma.paymentTransaction.upsert({
        where: { reference: fakeReference },
        update: {
          metadata: {
            orderId: order.id,
            storeId: order.storeId,
            authorization_url: fakeAuthorizationUrl,
            access_code: "e2e_access_code",
          },
        },
        create: {
          storeId: order.storeId,
          orderId: order.id,
          reference: fakeReference,
          amount: amountKobo,
          currency: "NGN",
          status: "INITIATED",
          provider: "PAYSTACK",
          type: "CHARGE",
          metadata: {
            orderId: order.id,
            storeId: order.storeId,
            authorization_url: fakeAuthorizationUrl,
            access_code: "e2e_access_code",
          },
        },
      });

      return NextResponse.json(
        {
          success: true,
          authorizationUrl: fakeAuthorizationUrl,
          reference: fakeReference,
          requestId,
        },
        { headers: standardHeaders(requestId) },
      );
    }

    // 41.2: Idempotency check - Reuse existing pending transaction for this order
    const existingTx = await prisma.paymentTransaction.findFirst({
      where: {
        orderId: order.id,
        status: { in: [PaymentStatus.INITIATED, PaymentStatus.PENDING] },
        amount: amountKobo,
        currency: "NGN",
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingTx) {
      const metadata = getRecord(existingTx.metadata) ?? {};
      const authorizationUrl = metadata.authorization_url;
      if (typeof authorizationUrl === "string") {
        return NextResponse.json(
          {
            success: true,
            authorizationUrl,
            reference: existingTx.reference,
            requestId,
          },
          { headers: standardHeaders(requestId) },
        );
      }
    }

    const init = await Paystack.initializeTransaction({
      email,
      amountKobo,
      reference: paystackRef,
      callbackUrl,
      metadata: {
        orderRef: order.refCode,
        storeId: order.storeId,
      },
    });

    // Record the transaction and store auth URL for reuse
    await prisma.paymentTransaction.upsert({
      where: { reference: init.reference },
      update: {
        metadata: {
          orderId: order.id,
          storeId: order.storeId,
          authorization_url: init.authorizationUrl,
          access_code: init.accessCode,
        },
      },
      create: {
        storeId: order.storeId,
        orderId: order.id,
        reference: init.reference,
        amount: amountKobo,
        currency: "NGN",
        status: "INITIATED",
        provider: "PAYSTACK",
        type: "CHARGE",
        metadata: {
          orderId: order.id,
          storeId: order.storeId,
          authorization_url: init.authorizationUrl,
          access_code: init.accessCode,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        authorizationUrl: init.authorizationUrl,
        reference: init.reference,
        requestId,
      },
      { headers: standardHeaders(requestId) },
    );
  } catch (err: unknown) {
    if (err instanceof BaseError) throw err;

    logger.error("[PUBLIC_PAY_INIT]", {
      requestId,
      error: err instanceof Error ? err.message : String(err),
      app: "storefront",
    });
    const msg =
      err instanceof Error ? err.message : "Failed to initialize payment";
    return NextResponse.json(
      { error: msg, requestId },
      { status: 500, headers: standardHeaders(requestId) },
    );
  }
});
