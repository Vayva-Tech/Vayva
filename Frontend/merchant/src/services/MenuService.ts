import { db } from "@/lib/db";
import { Prisma, type Prisma as PrismaClient } from "@vayva/db";

interface MenuItemData {
    name: string;
    description?: string;
    price: number;
    metadata?: Record<string, unknown>;
    categoryId?: string;
}

export const MenuService = {
    async createMenuItem(storeId: string, data: MenuItemData) {
        const product = await db.product?.create({
            data: {
                storeId,
                title: data.name,
                handle: data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
                description: data.description,
                price: new Prisma.Decimal(data.price),
                productType: "menu_item",
                status: "ACTIVE",
                trackInventory: false,
                metadata: data.metadata as unknown as PrismaClient.InputJsonValue,
            }
        });
        return product;
    },
    
    async getKitchenOrders(storeId: string) {
        return await db.order?.findMany({
            where: {
                storeId,
                fulfillmentStatus: { in: ["UNFULFILLED", "PREPARING"] },
                paymentStatus: { in: ["SUCCESS", "VERIFIED"] }
            },
            include: {
                items: true,
            },
            orderBy: {
                createdAt: "asc"
            }
        });
    },
    
    async updateOrderStatus(orderId: string, status: string) {
        const fulfillmentStatus = status === "READY" ? "READY_FOR_PICKUP" : "READY_FOR_PICKUP";
        return await db.order?.update({
            where: { id: orderId },
            data: {
                fulfillmentStatus
            }
        });
    }
};
