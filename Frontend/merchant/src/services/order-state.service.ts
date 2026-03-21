import { prisma, FulfillmentStatus, OrderStatus } from "@vayva/db";
import { ResendEmailService } from "@/lib/email/resend";
import { logAuditEvent, AuditEventType } from "@/lib/audit";
import { mustUpdateScoped } from "@/lib/db/safe-update";
import { logger } from "@vayva/shared";

export class OrderStateService {
    /**
     * Transition Order Status
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async transition(orderId: any, toStatus: any, actorId: any, storeId: string) {
        // 1. Fetch current order
        const order = await prisma.order.findFirst({
            where: { id: orderId, storeId },
            include: { customer: true, store: true, shipments: true }
        });
        if (!order)
            throw new Error("Order not found");
        const fromStatus = order.fulfillmentStatus;
        // 2. Validate Transition (Simple State Machine)
        // Allowed: UNFULFILLED -> PROCESSING -> SHIPPED -> DELIVERED
        // Allowing loose transitions for MVP flexibility, but logging them.
        if (toStatus === fromStatus)
            return order;
        // 3. Update Status
        await mustUpdateScoped(
            prisma.order.updateMany({
                where: { id: orderId, storeId },
                data: {
                    fulfillmentStatus: toStatus,
                    status: toStatus === FulfillmentStatus.DELIVERED ? OrderStatus.DELIVERED : order.status
                }
            }),
            "Order not found or access denied"
        );

        const updatedOrder = await prisma.order.findFirst({
            where: { id: orderId, storeId }
        });
        // 4. Side Effects (Notifications)
        // Trigger "Shipped" email when status moves to OUT_FOR_DELIVERY (carrier has it)
        if (toStatus === FulfillmentStatus.OUT_FOR_DELIVERY) {
            const customerEmail = order.customerEmail;
            if (customerEmail) {
                // Async fire and forget
                const storeName = order.store?.name ? order.store.name : "Store";
                const trackingUrl = order.shipments?.[0]?.trackingUrl ?? "";
                ResendEmailService.sendOrderShippedEmail(customerEmail as string, String(order.orderNumber), trackingUrl, storeName as string).catch((e: any) => logger.error("Failed to send shipped email", { error: e.message, orderId, storeId, app: "merchant" }));
            }
        }
        // 5. Audit Log
        if (actorId) {
            await logAuditEvent(storeId, actorId, AuditEventType.ORDER_UPDATED, {
                targetType: "ORDER",
                targetId: orderId,
                meta: { from: fromStatus, to: toStatus }
            });
        }
        return updatedOrder;
    }
}
