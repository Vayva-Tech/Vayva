import { z } from "zod";
import { OrderFulfillmentStatus, OrderPaymentStatus } from "../enums";
export const OrderItemSchema = z.object({
    id: z.string().uuid(),
    orderId: z.string().uuid(),
    productId: z.string().uuid(),
    variantId: z.string().uuid().optional(),
    name: z.string(),
    sku: z.string().optional(),
    quantity: z.number().int().min(1),
    price: z.number().nonnegative(), // Price at purchase time
    total: z.number().nonnegative(), // quantity * price
});
export const OrderTimelineEventSchema = z.object({
    id: z.string().uuid(),
    orderId: z.string().uuid(),
    type: z.enum(["STATUS_CHANGE", "NOTE", "EMAIL_SENT", "PAYMENT_EVENT"]),
    message: z.string(),
    userId: z.string().uuid().optional(), // If triggered by user
    metadata: z.record(z.any()).optional(),
    createdAt: z.date(),
});
export const OrderSchema = z.object({
    id: z.string().uuid(),
    storeId: z.string().uuid(),
    customerId: z.string().uuid().optional(), // Can be guest
    orderNumber: z.string(), // e.g. #1001
    // Amounts (Minor units)
    currency: z.string().default("NGN"),
    subtotal: z.number().nonnegative(),
    tax: z.number().nonnegative().default(0),
    shippingCost: z.number().nonnegative().default(0),
    discount: z.number().nonnegative().default(0),
    total: z.number().nonnegative(),
    // Statuses
    paymentStatus: z
        .nativeEnum(OrderPaymentStatus)
        .default(OrderPaymentStatus.PENDING),
    fulfillmentStatus: z
        .nativeEnum(OrderFulfillmentStatus)
        .default(OrderFulfillmentStatus.PROCESSING),
    // Customer Info (Snapshot)
    email: z.string().email(),
    phone: z.string().optional(),
    shippingAddress: z.record(z.any()).optional(), // Structured json
    billingAddress: z.record(z.any()).optional(),
    items: z.array(OrderItemSchema).optional(), // Can be loaded separately
    createdAt: z.date(),
    updatedAt: z.date(),
});
