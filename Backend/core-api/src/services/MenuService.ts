import { db } from "@/lib/db";
import { Prisma, FulfillmentStatus } from "@vayva/db";
export const MenuService = {
  async createMenuItem(storeId: string, data: Record<string, unknown>) {
    // 1. Create the base Product
    const product = await db.product.create({
      data: {
        storeId,
        title: String(data.name || "Untitled"),
        handle:
          String(data.name || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-") +
          "-" +
          Date.now(),
        description:
          typeof data.description === "string" ? data.description : undefined,
        price: new Prisma.Decimal(
          typeof data.price === "number" ? data.price : 0,
        ),
        productType: "menu_item",
        status: "ACTIVE", // Default to active for menu items
        trackInventory: false, // Usually unlimited for restaurants unless specific
        // 2. Store food-specific fields in metadata
        metadata: (data.metadata as Prisma.InputJsonValue) || {},
        // Default category handling could go here if categoryId is provided
      },
    });
    return product;
  },
  async getKitchenOrders(storeId: string) {
    return await db.order.findMany({
      where: {
        storeId,
        // Using fulfillmentStatus as proxy for Kitchen Status
        // In a real system, might want a specific 'kitchenStatus' field
        fulfillmentStatus: { in: ["UNFULFILLED", "PREPARING"] },
        paymentStatus: { in: ["SUCCESS", "VERIFIED"] },
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "asc", // Oldest first (FIFO)
      },
    });
  },
  async updateOrderStatus(orderId: string, status: string) {
    // Map simplified kitchen status to Order schema status
    // READY -> READY_FOR_PICKUP
    const fulfillmentStatus =
      status === "READY"
        ? FulfillmentStatus.READY_FOR_PICKUP
        : FulfillmentStatus.READY_FOR_PICKUP;
    return await db.order.update({
      where: { id: orderId },
      data: {
        fulfillmentStatus,
      },
    });
  },
};
