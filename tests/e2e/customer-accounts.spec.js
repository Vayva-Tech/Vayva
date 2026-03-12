import { test, expect } from "@playwright/test";
import { CustomerAuthService } from "../../apps/merchant-admin/src/lib/storefront/customerAuthService";
import { CustomerOrderService } from "../../apps/merchant-admin/src/lib/storefront/customerOrderService";
import { prisma } from "@vayva/db";
test.describe("Customer Accounts", () => {
    const storeId = "store_cust_test";
    const email = "shopper@example.com";
    test.beforeAll(async () => {
        // Ensure store exists
        await prisma.store.upsert({
            where: { id: storeId },
            update: {},
            create: {
                id: storeId,
                name: "Customer Test Store",
                slug: storeId,
            },
        });
        // Cleanup
        // Delete orders first (fk constraint)
        await prisma.order.deleteMany({ where: { storeId } });
        // Delete customers (fk constraint)
        await prisma.customer.deleteMany({ where: { storeId, email } });
        // Find account
        const account = await prisma.customerAccount.findUnique({
            where: { email },
        });
        if (account) {
            await prisma.customerSession.deleteMany({
                where: { customerId: account.id },
            });
            await prisma.customerAccount.delete({ where: { id: account.id } });
        }
    });
    test("Auth Flow", async () => {
        // Signup
        const user = await CustomerAuthService.signup(storeId, {
            email,
            password: "password123",
        });
        expect(user).toBeTruthy();
        expect(user.email).toBe(email);
        // Login
        const { sessionToken } = await CustomerAuthService.login(storeId, {
            email,
            password: "password123",
        });
        expect(sessionToken).toBeTruthy();
        // Validate
        const session = await CustomerAuthService.validateSession(sessionToken);
        expect(session).toBeTruthy();
        expect(session?.customerId).toBe(user.id);
    });
    test("Order Access Control", async () => {
        // Setup Customer (Store-specific)
        let customer;
        try {
            customer = await prisma.customer.create({
                data: {
                    storeId,
                    email,
                    firstName: "Shopper",
                    lastName: "Test",
                },
            });
        }
        catch (e) {
            customer = await prisma.customer.findFirst({
                where: { storeId, email },
            });
        }
        if (!customer)
            throw new Error("Failed to create/find customer");
        // Setup Order
        const orderId = "ord_cust_123";
        // Ensure order exists with customerId
        await prisma.order.upsert({
            where: { id: orderId },
            update: { customerId: customer.id },
            create: {
                id: orderId,
                refCode: orderId,
                storeId,
                customerId: customer.id,
                subtotal: 5000,
                total: 5000,
            },
        });
        // Valid Access
        const detail = await CustomerOrderService.getOrderDetail(storeId, customer.id, orderId);
        expect(detail.id).toBe(orderId);
        // Invalid Access (Other User)
        const otherUserId = "user_other"; // Mock ID
        await expect(CustomerOrderService.getOrderDetail(storeId, otherUserId, orderId)).rejects.toThrow();
    });
});
