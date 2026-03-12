import { prisma, FulfillmentStatus, OrderStatus } from "@vayva/db";
import { ResendEmailService } from "@/lib/email/resend";
import { logAuditEvent, AuditEventType } from "@/lib/audit";
import { mustUpdateScoped } from "@/lib/db/safe-update";
import { logger } from "@vayva/shared";

export class OrderStateService {
  /**
   * Transition Order Status
   */
  static async transition(
    orderId: string,
    toStatus: string,
    actorId: string,
    storeId: string,
  ) {
    // 1. Fetch current order
    const order = await prisma.order.findFirst({
      where: { id: orderId, storeId },
      include: { customer: true, store: true, shipments: true },
    });
    if (!order) throw new Error("Order not found");
    const fromStatus = order.fulfillmentStatus;
    // 2. Validate Transition (Simple State Machine)
    // Allowed: UNFULFILLED -> PROCESSING -> SHIPPED -> DELIVERED
    // Allowing loose transitions for MVP flexibility, but logging them.
    if (toStatus === fromStatus) return order;
    // 3. Update Status
    await mustUpdateScoped(
      prisma.order.updateMany({
        where: { id: orderId, storeId },
        data: {
          fulfillmentStatus: toStatus as FulfillmentStatus,
          status:
            toStatus === FulfillmentStatus.DELIVERED
              ? OrderStatus.DELIVERED
              : order.status,
        },
      }),
      "Order not found or access denied",
    );

    const updatedOrder = await prisma.order.findFirst({
      where: { id: orderId, storeId },
    });
    // 4. Side Effects (Notifications)
    // Trigger "Shipped" email when status moves to OUT_FOR_DELIVERY (carrier has it)
    if (toStatus === FulfillmentStatus.OUT_FOR_DELIVERY) {
      if (order.customerEmail) {
        // Async fire and forget
        ResendEmailService.sendOrderShippedEmail(
          order.customerEmail,
          String(order.orderNumber),
          order.shipments?.[0]?.trackingUrl ?? "",
          order.store.name,
        ).catch((e) =>
          logger.error("Failed to send shipped email", {
            error: e.message,
            orderId,
            storeId,
            app: "merchant",
          }),
        );
      }
    }
    // 5. Audit Log
    if (actorId) {
      await logAuditEvent(
        storeId,
        actorId,
        AuditEventType.ORDER_STATUS_CHANGED,
        {
          targetType: "ORDER",
          targetId: orderId,
          meta: { from: fromStatus, to: toStatus },
        },
      );
    }
    return updatedOrder;
  }
}
