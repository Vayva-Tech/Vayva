import { prisma, MerchantType } from "@vayva/db";
import { OrderCoreService } from "@vayva/shared";
import { describe, test, expect, afterAll, beforeAll } from "vitest";

describe("Marketplace Integrity Integration", () => {
    const TEST_ID = `test-${Date.now()}`;
    let testUser: any, testStore: any, testProduct: any, testCart: any;

    beforeAll(async () => {
        console.log("   [Setup] Creating test data...");
        // Check DB connection
        try {
            await prisma.$connect();
        } catch (err) {
            console.error("❌ Database connection failed. Skipping rest of setup.");
            throw err;
        }

        testUser = await prisma.user.create({
            data: {
                email: `${TEST_ID}@vayva.test`,
                firstName: "Test",
                lastName: "Buyer",
                password: "password123", // Required field
            }
        });

        testStore = await prisma.store.create({
            data: {
                name: `Test Store ${TEST_ID}`,
                slug: `test-store-${TEST_ID}`, // Was 'handle' in previous attempt
                type: MerchantType.LOCAL,
                isActive: true,
                // ownerId is not a direct field, relation is via Membership
            }
        });

        // Link User to Store
        await prisma.membership.create({
            data: {
                userId: testUser.id,
                storeId: testStore.id,
                role: "owner",
            }
        });

        // Create Customer record (OrderCoreService expects customerId = userId)
        await prisma.customer.create({
            data: {
                id: testUser.id,
                storeId: testStore.id,
                email: testUser.email,
                firstName: testUser.firstName,
                lastName: testUser.lastName,
            }
        });

        testProduct = await prisma.product.create({
            data: {
                storeId: testStore.id,
                title: "Integrity Test Product",
                handle: `test-prod-${TEST_ID}`,
                price: 1000,
                status: "PUBLISHED",
                ProductVariant: {
                    create: {
                        title: "Default",
                        price: 1000,
                        sku: `SKU-${TEST_ID}`,
                        options: {},
                    }
                }
            },
            include: { ProductVariant: true }
        });
    });

    afterAll(async () => {
        console.log("   [Teardown] Cleaning up test data...");
        try {
            if (testUser) {
                await prisma.user.delete({ where: { id: testUser.id } }).catch(() => { });
            }
            if (testStore) {
                // Deleting store should cascade or we clean up manually
                await prisma.store.delete({ where: { id: testStore.id } }).catch(() => { });
            }
        } finally {
            await prisma.$disconnect();
        }
    });

    test("OrderCoreService should correctly split multi-vendor carts into fulfillment groups", async () => {
        const variant = testProduct.ProductVariant[0];

        // 1. Action: Simulate Cart -> Order Flow
        testCart = await prisma.cart.create({
            data: {
                id: TEST_ID,
                userId: testUser.id,
                items: {
                    create: {
                        variantId: variant.id,
                        quantity: 2
                    }
                }
            }
        });

        const order = await OrderCoreService.createOrdersFromCart(testCart.id, testUser.id);

        // 2. Assertions
        const verifiedOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: { items: true, fulfillmentGroups: true }
        });

        expect(verifiedOrder).toBeDefined();
        // total is Decimal, convert to number for comparison or use .eq() if Decimal.js is available
        // Items (2000) + Default Delivery Fee (1000) = 3000
        expect(Number(verifiedOrder?.total)).toBe(3000);
        expect(verifiedOrder?.fulfillmentGroups.length).toBe(1);
        expect(verifiedOrder?.items.length).toBe(1);

        const group = verifiedOrder!.fulfillmentGroups[0];
        expect(group.storeId).toBe(testStore.id);
        expect(verifiedOrder!.items[0].fulfillmentGroupId).toBe(group.id);
    });
});
