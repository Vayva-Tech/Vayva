import { NextResponse } from "next/server";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError, PaymentStatus } from "@vayva/shared";

export const POST = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId, db, storeId } = ctx;

  try {
    const body = await request.json().catch(() => ({}));

    const campaignId = body?.campaignId ? String(body.campaignId) : null;
    const amount = Number(body?.amount || 0);
    const donorEmail = String(body?.donorEmail || "");
    const donorName = body?.donorName ? String(body.donorName) : null;
    const recurring = Boolean(body?.recurring);
    const isAnonymous = Boolean(body?.isAnonymous);
    const message = body?.message ? String(body.message) : null;

    if (!donorEmail || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid payload", requestId },
        { status: 400, headers: standardHeaders(requestId) },
      );
    }

    if (campaignId) {
      const campaign = await db.donationCampaign.findFirst({
        where: { id: campaignId, storeId, status: "active" },
        select: { id: true, title: true },
      });

      if (!campaign) {
        return NextResponse.json(
          { error: "Campaign not found", requestId },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }
    }

    const result = await db.$transaction(async (tx: any) => {
      const donation = await tx.donation.create({
        data: {
          storeId,
          campaignId,
          donorEmail,
          donorName: donorName || undefined,
          amount,
          currency: "NGN",
          isAnonymous,
          message: message || undefined,
          recurring,
          frequency: recurring ? "monthly" : undefined,
          paymentMethod: "PAYSTACK",
          status: "pending",
        },
        select: { id: true, amount: true },
      });

      // Reuse the existing payment pipeline by creating an Order.
      const count = await tx.order.count();
      const orderNumber = count + 1001;
      const refCode = `DON-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const order = await tx.order.create({
        data: {
          storeId,
          refCode,
          orderNumber,
          status: "DRAFT",
          paymentStatus: PaymentStatus.PENDING,
          fulfillmentStatus: "UNFULFILLED",
          subtotal: amount,
          total: amount,
          shippingTotal: 0,
          discountTotal: 0,
          tax: 0,
          currency: "NGN",
          source: "STOREFRONT",
          deliveryMethod: "digital",
          paymentMethod: "PAYSTACK",
          customerEmail: donorEmail,
          customerNote: donorName || undefined,
          metadata: {
            type: "DONATION",
            donationId: donation.id,
            campaignId,
          },
        },
        select: { id: true, refCode: true },
      });

      return {
        donationId: donation.id,
        orderId: order.id,
        reference: order.refCode,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
        requestId,
      },
      { headers: standardHeaders(requestId) },
    );
  } catch (e: unknown) {
    if (e instanceof BaseError) throw e;

    logger.error("Failed to create donation checkout", {
      requestId,
      error: e instanceof Error ? e.message : String(e),
      app: "storefront",
    });

    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error", requestId },
      { status: 500, headers: standardHeaders(requestId) },
    );
  }
});
