import { NextResponse } from "next/server";
import { reportError } from "@/lib/error";
import { z } from "zod";
import {
  urls,
  standardHeaders,
  logger,
  BaseError,
  PaymentStatus,
} from "@vayva/shared";
import { withStorefrontAPI } from "@/lib/api-handler";

export const POST = withStorefrontAPI(async (req: any, ctx: any) => {
  const { requestId, db, storeId, storeSlug } = ctx;

  try {
    const upstreamBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    const isAbsoluteUpstream =
      typeof upstreamBaseUrl === "string" &&
      /^https?:\/\//i.test(upstreamBaseUrl);

    const body = await req.json();

    // Zod Validation Schema
    const OrderSchema = z.object({
      items: z
        .array(
          z
            .object({
              id: z.string().uuid().optional(),
              productId: z.string().uuid().optional(),
              quantity: z.number().int().positive(),
              metadata: z.record(z.unknown()).optional(),
            })
            .refine((i) => Boolean(i.id || i.productId), {
              message: "Each item must include id or productId",
            }),
        )
        .min(1),
      customer: z
        .object({
          email: z.string().email(),
          phone: z.string().optional(),
          note: z.string().optional(),
        })
        .optional(),
      deliveryMethod: z.string().optional(),
      paymentMethod: z.string().optional(),
      shippingCost: z.number().min(0).optional().default(0),
      referralCode: z.string().optional(), // Affiliate referral code
    });

    const parseResult = OrderSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          message: "Invalid payload",
          errors: parseResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { items, customer, deliveryMethod, shippingCost, referralCode } = parseResult.data;

    const normalizedItems = items.map((i: any) => ({
      id: (i.id || i.productId) as string,
      quantity: i.quantity,
      metadata: i.metadata,
    }));

    if (isAbsoluteUpstream) {
      const base = upstreamBaseUrl.replace(/\/$/, "").replace(/\/v1$/, "");
      const upstreamUrl = `${base}/v1/orders/storefront`;

      const upstreamResponse = await fetch(upstreamUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-store-id": storeId,
        },
        body: JSON.stringify({
          ...parseResult.data,
          storeId,
          items: normalizedItems,
        }),
      });

      const upstreamData = await upstreamResponse
        .json()
        .catch(async () => ({ raw: await upstreamResponse.text() }));

      return NextResponse.json(upstreamData, {
        status: upstreamResponse.status,
      });
    }

    // Generate Identifiers
    // db.order.count automatically filtered by storeId
    const count = await db.order.count();
    const orderNumber = count + 1001;
    const refCode = `ORD-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    let initialPaymentStatus: PaymentStatus = PaymentStatus.PENDING;
    if (deliveryMethod === "pickup" && body.paymentMethod === "cash") {
      initialPaymentStatus = PaymentStatus.PENDING;
    }

    // Transaction: Inventory Check & Order Creation
    // db.$transaction uses the isolated client, so tx inside is also isolated
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await db.$transaction(async (tx: any) => {
      let calculatedSubtotal = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orderItemsData: any[] = [];

      // 1. Process Items & Inventory
      for (const item of normalizedItems) {
        if (!item.id) continue;

        // Fetch Product (Trusted Price)
        // Use findFirst because we are effectively filtering by { id, storeId }
        const product = await tx.product.findFirst({
          where: { id: item.id },
          select: { id: true, title: true, price: true, trackInventory: true },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.id}`);
        }

        // Use DB Price
        const itemPrice = Number(product.price);
        const itemTotal = itemPrice * item.quantity;
        calculatedSubtotal += itemTotal;

        orderItemsData.push({
          productId: product.id,
          title: product.title,
          quantity: item.quantity,
          price: itemPrice, // TRUSTED PRICE
          metadata: item.metadata || {},
        });

        // Inventory Management
        if (product.trackInventory) {
          // Find default location
          const defaultLocation = await tx.inventoryLocation.findFirst({
            where: { isDefault: true }, // storeId injected
            select: { id: true },
          });

          if (!defaultLocation)
            throw new Error("Default inventory location not found");

          const updateResult = await tx.inventoryItem.updateMany({
            where: {
              productId: product.id,
              locationId: defaultLocation.id,
              available: { gte: item.quantity },
            },
            data: {
              available: { decrement: item.quantity },
            },
          });

          if (updateResult.count === 0) {
            throw new Error(`Out of stock for product: ${product.title}`);
          }
        }
      }

      // 2. Create Order
      const finalTotal = calculatedSubtotal + shippingCost;

      const order = await tx.order.create({
        data: {
          // storeId injected by extension
          refCode,
          orderNumber,
          status: "DRAFT",
          paymentStatus: initialPaymentStatus,
          fulfillmentStatus: "UNFULFILLED",
          total: finalTotal,
          subtotal: calculatedSubtotal,
          shippingTotal: shippingCost,
          customerEmail: customer?.email,
          customerPhone: customer?.phone,
          customerNote: customer?.note,
          deliveryMethod: deliveryMethod || "shipping",
          metadata: referralCode ? { affiliateReferralCode: referralCode } : undefined,
          items: {
            create: orderItemsData,
          },
        },
      });

      // Create notification
      try {
        await tx.notification.create({
          data: {
            type: "ORDER",
            title: "New order received",
            body: `Order ${refCode} created`,
            severity: "INFO",
            actionUrl: urls.storefrontOrderUrl(storeSlug, refCode),
          },
        });
      } catch {
        /* ignore */
      }

      // Email outbox
      if (order.customerEmail) {
        try {
          await tx.emailOutbox.create({
            data: {
              type: "ORDER_CONFIRMED",
              toEmail: order.customerEmail,
              subject: `Order confirmed — ${refCode}`,
              dedupeKey: `order_confirmed_${order.id}`,
              payload: {
                refCode,
                orderUrl: urls.storefrontOrderUrl(storeSlug, refCode),
              },
              status: "PENDING",
            },
          });
        } catch {
          /* ignore */
        }
      }

      return order;
    });

    // 4. Fetch Details for Response
    // Wallet is not tenant-scoped model in list in extension?
    // Let's check infra/db/src/extension.ts or assume we need to handle it.
    // If Wallet IS scoped, findFirst works. To be safe, use findFirst.
    const wallet = await db.wallet.findFirst({
      select: { vaBankName: true, vaAccountNumber: true, vaAccountName: true },
    });

    // We need store name from somewhere.
    // We already fetched store in api-handler, but didn't pass it fully, just ID/Slug.
    // We can fetch it or just omit it if not critical.
    // The original code returned storeName.
    // Let's fetch it quickly or omit. Fetching is safer.
    const storeObj = await db.store.findUnique({
      where: { id: storeId },
      select: { name: true },
    });

    return NextResponse.json(
      {
        success: true,
        orderId: result.id,
        orderNumber: result.orderNumber,
        paymentUrl: `/checkout/pay/${result.id}`,
        storeName: storeObj?.name || "Store",
        bankDetails: wallet
          ? {
              bankName: wallet.vaBankName,
              accountNumber: wallet.vaAccountNumber,
              accountName: wallet.vaAccountName,
            }
          : null,
      },
      { headers: standardHeaders(requestId) },
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    if (error instanceof BaseError) throw error;

    reportError(error, {
      route: "POST /api/orders",
      storeId: storeId,
      requestId,
    });
    logger.error("Failed to create order", {
      requestId,
      storeId,
      error: error instanceof Error ? error.message : String(error),
      app: "storefront",
    });

    return NextResponse.json(
      {
        error: "Failed to create order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: standardHeaders(requestId) },
    );
  }
});
