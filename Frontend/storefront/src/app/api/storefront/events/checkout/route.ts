import { NextResponse } from "next/server";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError, PaymentStatus } from "@vayva/shared";

export const POST = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId, db, storeId } = ctx;

  try {
    const body = await request.json().catch(() => ({}));

    const eventId = String(body?.eventId || "");
    const items = Array.isArray(body?.items) ? body.items : [];
    const customerName = String(body?.customerName || "");
    const customerEmail = String(body?.customerEmail || "");
    const customerPhone = body?.customerPhone ? String(body.customerPhone) : null;

    if (!eventId || items.length === 0 || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: "Missing required fields", requestId },
        { status: 400, headers: standardHeaders(requestId) },
      );
    }

    const event = await db.event.findFirst({
      where: { id: eventId, storeId, isPublic: true, status: "published" },
      select: { id: true, title: true },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found", requestId },
        { status: 404, headers: standardHeaders(requestId) },
      );
    }

    const normalized = items
      .map((i: any) => ({
        tierId: String(i?.tierId || ""),
        quantity: Number(i?.quantity || 0),
      }))
      .filter((i: any) => i.tierId && Number.isFinite(i.quantity) && i.quantity > 0);

    if (normalized.length === 0) {
      return NextResponse.json(
        { error: "No tickets selected", requestId },
        { status: 400, headers: standardHeaders(requestId) },
      );
    }

    const result = await db.$transaction(async (tx: any) => {
      const customer = await tx.customer.upsert({
        where: {
          storeId_email: {
            storeId,
            email: customerEmail,
          },
        },
        update: {
          phone: customerPhone,
          name: customerName,
        },
        create: {
          storeId,
          email: customerEmail,
          phone: customerPhone,
          name: customerName,
        },
        select: { id: true },
      });

      const count = await tx.order.count();
      const orderNumber = count + 1001;
      const refCode = `EVT-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      let subtotal = 0;
      const orderItemsData: any[] = [];

      // Validate tiers and reserve inventory.
      for (const item of normalized) {
        const tier = await tx.ticketTier.findFirst({
          where: {
            id: item.tierId,
            eventId: event.id,
            isActive: true,
            remaining: { gte: item.quantity },
            salesStart: { lte: new Date() },
            salesEnd: { gte: new Date() },
          },
          select: {
            id: true,
            name: true,
            price: true,
            remaining: true,
          },
        });

        if (!tier) {
          throw new Error("Ticket tier unavailable");
        }

        const unitPrice = Number(tier.price);
        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;

        orderItemsData.push({
          productId: null,
          title: `${event.title} — ${tier.name}`,
          sku: null,
          price: unitPrice,
          quantity: item.quantity,
        });

        const updated = await tx.ticketTier.updateMany({
          where: {
            id: tier.id,
            remaining: { gte: item.quantity },
          },
          data: { remaining: { decrement: item.quantity } },
        });

        if (updated.count === 0) {
          throw new Error("Not enough tickets available");
        }
      }

      const order = await tx.order.create({
        data: {
          storeId,
          refCode,
          orderNumber,
          status: "DRAFT",
          paymentStatus: PaymentStatus.PENDING,
          fulfillmentStatus: "UNFULFILLED",
          subtotal,
          total: subtotal,
          shippingTotal: 0,
          discountTotal: 0,
          tax: 0,
          currency: "NGN",
          source: "STOREFRONT",
          deliveryMethod: "digital",
          paymentMethod: "PAYSTACK",
          customerEmail,
          customerPhone,
          customerNote: customerName,
          customerId: customer.id,
          metadata: {
            type: "EVENT_TICKETS",
            eventId: event.id,
          },
          items: {
            create: orderItemsData,
          },
        },
        select: { id: true, refCode: true },
      });

      // Create TicketPurchase records (one per tier selection)
      const purchases: any[] = [];
      for (const item of normalized) {
        const tier = await tx.ticketTier.findUnique({
          where: { id: item.tierId },
          select: { id: true, price: true },
        });

        const unitPrice = Number(tier?.price || 0);
        const totalPrice = unitPrice * item.quantity;

        const purchase = await tx.ticketPurchase.create({
          data: {
            tierId: item.tierId,
            eventId: event.id,
            customerId: customer.id,
            orderId: order.id,
            quantity: item.quantity,
            unitPrice,
            totalPrice,
            status: "active",
            ticketNumber: `TKT-${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
          },
          select: { id: true, ticketNumber: true },
        });

        purchases.push(purchase);
      }

      return { order, purchases };
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          orderId: result.order.id,
          reference: result.order.refCode,
          purchases: result.purchases,
        },
        requestId,
      },
      { headers: standardHeaders(requestId) },
    );
  } catch (e: unknown) {
    if (e instanceof BaseError) throw e;

    logger.error("Failed to checkout tickets", {
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
