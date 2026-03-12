import { test, expect } from "@playwright/test";
import { InventoryService } from "../../apps/merchant-admin/src/lib/inventory/inventoryService";
import { prisma } from "@vayva/db";
test.describe("Inventory System", () => {
    const merchantId = "test_inv_merchant";
    const productId = "prod_test_inv_001";
    test.beforeAll(async () => {
        // Ensure store exists
        await prisma.store.upsert({
            where: { id: merchantId },
            update: {},
            create: {
                id: merchantId,
                name: "Inventory Test Store",
                slug: merchantId,
            },
        });
        // Cleanup
        await prisma.stockMovement.deleteMany({ where: { merchantId } });
        await prisma.stockReservation.deleteMany({ where: { merchantId } });
        await prisma.inventoryItem.deleteMany({ where: { merchantId } });
    });
    test("full inventory lifecycle", async () => {
        // 1. Set Initial Stock to 5
        await InventoryService.setStock(merchantId, productId, null, 5, {
            type: "system",
            label: "Test Init",
        });
        const item = await prisma.inventoryItem.findFirst({
            where: { merchantId, productId },
        });
        expect(item?.onHand).toBe(5);
        expect(item?.reserved).toBe(0);
        // 2. Reserve 2 items
        const draftId = "draft_001";
        await InventoryService.reserveStock(merchantId, draftId, [
            { productId, variantId: null, quantity: 2 },
        ]);
        const itemReserved = await prisma.inventoryItem.findFirst({
            where: { merchantId, productId },
        });
        expect(itemReserved?.onHand).toBe(5);
        expect(itemReserved?.reserved).toBe(2);
        // Available = 5 - 2 = 3
        // 3. Try to reserve 4 (Stock is 5, but available is 3) -> Should Fail
        const draftFail = "draft_fail";
        try {
            await InventoryService.reserveStock(merchantId, draftFail, [
                { productId, variantId: null, quantity: 4 },
            ]);
            throw new Error("Should have failed");
        }
        catch (e) {
            expect(e.message).toContain("Out of stock");
        }
        // 4. Confirm Reservation (Sale)
        await InventoryService.confirmReservation(merchantId, draftId, "ord_001");
        const itemSold = await prisma.inventoryItem.findFirst({
            where: { merchantId, productId },
        });
        expect(itemSold?.onHand).toBe(3); // 5 - 2
        expect(itemSold?.reserved).toBe(0); // Released 2
        // 5. Release (simulate cancel)
        // First reserve 1
        const draftCancel = "draft_cancel";
        await InventoryService.reserveStock(merchantId, draftCancel, [
            { productId, variantId: null, quantity: 1 },
        ]);
        await InventoryService.releaseReservation(merchantId, draftCancel);
        const itemReleased = await prisma.inventoryItem.findFirst({
            where: { merchantId, productId },
        });
        expect(itemReleased?.onHand).toBe(3); // Unchanged
        expect(itemReleased?.reserved).toBe(0); // Released
    });
});
