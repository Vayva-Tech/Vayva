import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, type Product } from "@vayva/db";
import { PaystackService } from "@/services/PaystackService";
import { logger } from "@/lib/logger";

interface CheckoutItem {
  productId: string;
  quantity: number;
}

interface OrderItemData {
  productId: string;
  title: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

interface StoreCounterResult {
  orderSeq: number;
}

export const POST = withVayvaAPI(PERMISSIONS.ORDERS_MANAGE, async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string; email: string } }) => {
    try {
        const email = user.email || null;
        const body = await req.json().catch(() => null);
        const rawItems = body?.items;

        if (!Array.isArray(rawItems) || rawItems.length === 0) {
            return NextResponse.json({ error: "Checkout must include items" }, { status: 400 });
        }

        const normalizedItems: CheckoutItem[] = rawItems
            .map((item: unknown) => ({
                productId: String((item as { productId?: string })?.productId || ""),
                quantity: Number((item as { quantity?: number })?.quantity || 0),
            }))
            .filter((item: CheckoutItem) => item.productId && Number.isFinite(item.quantity) && item.quantity > 0);

        if (normalizedItems.length === 0) {
            return NextResponse.json({ error: "Invalid items" }, { status: 400 });
        }

        const productIds = Array.from(new Set(normalizedItems.map((i) => i.productId)));
        const products = await prisma.product?.findMany({
            where: {
                storeId,
                id: { in: productIds },
            },
            select: {
                id: true,
                title: true,
                price: true,
            },
        });

        type ProductRow = { id: string; title: string | null; price: unknown };
        const productById = new Map(products.map((p: ProductRow) => [p.id, p]));
        const missing = productIds.filter((id: string) => !productById.has(id));
        if (missing.length > 0) {
            return NextResponse.json({ error: "One or more items are invalid" }, { status: 400 });
        }

        const orderItems: OrderItemData[] = normalizedItems.map((i) => {
            const product = productById.get(i.productId) as ProductRow;
            const unitPrice = Number(product.price);
            return {
                productId: product.id,
                title: product.title || "Item",
                quantity: i.quantity,
                price: unitPrice,
                lineTotal: unitPrice * i.quantity,
            };
        });

        const subtotal = orderItems.reduce((sum, i: OrderItemData) => sum + i.lineTotal, 0);
        const total = subtotal;

        const store = await prisma.store?.findUnique({
            where: { id: storeId },
            select: { slug: true },
        });

        const order = await prisma.$transaction(async (tx) => {
            const counter = await tx.$queryRaw<StoreCounterResult[]>`
                    INSERT INTO "StoreCounter" ("storeId", "orderSeq")
                    VALUES (${storeId}, 1)
                    ON CONFLICT ("storeId")
                    DO UPDATE SET "orderSeq" = "StoreCounter"."orderSeq" + 1
                    RETURNING "orderSeq"
                `;

            const orderNumber = counter[0].orderSeq;

            return tx.order?.create({
                data: {
                    storeId,
                    orderNumber,
                    total,
                    subtotal,
                    tax: 0,
                    shippingTotal: 0,
                    discountTotal: 0,
                    currency: "NGN",
                    status: "PENDING_PAYMENT",
                    paymentStatus: "INITIATED",
                    fulfillmentStatus: "UNFULFILLED",
                    source: "STOREFRONT",
                    refCode: `ORD-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                    customerEmail: email ? String(email).toLowerCase() : null,
                    items: {
                        create: orderItems.map((i) => ({
                            productId: i.productId,
                            title: i.title,
                            quantity: i.quantity,
                            price: i.price,
                        })),
                    },
                },
                select: {
                    id: true,
                    refCode: true,
                    total: true,
                    customerEmail: true,
                },
            });
        });

        const storeSlug = store?.slug || "store";
        const baseUrl = process.env?.NEXT_PUBLIC_APP_URL || "";
        const callbackUrl = `${baseUrl}/store/${storeSlug}/orders/${order.id}/confirmation`;

        const amountKobo = Math.round(Number(order.total) * 100);
        const payEmail = order.customerEmail || `guest@vayva.co`;
        const reference = order.refCode || order.id;

        const initResponse = await PaystackService.initializeTransaction(
            payEmail,
            amountKobo,
            reference,
            callbackUrl,
            {
                orderId: order.id,
                storeId,
            },
        );

        return NextResponse.json({
            checkoutUrl: initResponse.authorization_url,
            orderId: order.id,
            reference: initResponse.reference,
        });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[CHECKOUT_INITIALIZE_POST] Checkout initialization failed", { storeId, error: err.message });
        const message = err.message || "Checkout initialization failed";
        const status = message.includes("PAYSTACK_SECRET_KEY") ? 503 : 500;
        return NextResponse.json({ error: message }, { status });
    }
});
