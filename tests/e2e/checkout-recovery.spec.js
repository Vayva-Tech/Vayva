import { test, expect } from "@playwright/test";
import { CheckoutService } from "../../apps/merchant-admin/src/lib/checkout/checkoutService";
import { RecoveryService } from "../../apps/merchant-admin/src/lib/checkout/recoveryService";
import { prisma } from "@vayva/db";
test.describe("Checkout & Recovery", () => {
    const storeId = "chk_test_store";
    const merchantId = "chk_test_merch";
    test.beforeAll(async () => {
        // Setup Settings
        await prisma.checkoutRecoverySettings.upsert({
            where: { merchantId },
            update: { enabled: true },
            create: { merchantId, enabled: true },
        });
    });
    test("Session Creation & Idempotency", async () => {
        const cart = { items: [] };
        const key = `idem_test_${Date.now()}`;
        // 1. Create
        const { session, resumeToken } = await CheckoutService.createSession({
            storeId,
            merchantId,
            cart,
            amount: 1000,
            customerEmail: "ab@c.com",
            idempotencyKey: key,
        });
        expect(session).toBeTruthy();
        expect(session.idempotencyKey).toBe(key);
        expect(resumeToken).toBeTruthy();
        // 2. Retry (Idempotent)
        const retried = await CheckoutService.createSession({
            storeId,
            merchantId,
            cart,
            amount: 1000,
            customerEmail: "ab@c.com",
            idempotencyKey: key,
        });
        expect(retried.session.id).toBe(session.id);
        expect(retried.resumeToken).toBeNull(); // Should not return secret again
    });
    test("Recovery Scheduling", async () => {
        // Create session
        const { session } = await CheckoutService.createSession({
            storeId,
            merchantId,
            cart: {},
            amount: 500,
            customerEmail: "rec@test.com",
        });
        // Verify Message Scheduled
        const msgs = await prisma.checkoutRecoveryMessage.findMany({
            where: { checkoutSessionId: session.id },
        });
        expect(msgs.length).toBeGreaterThan(0);
        expect(msgs[0].status).toBe("scheduled");
        // Verify Cancellation
        await RecoveryService.cancelRecovery(session.id);
        const cancelled = await prisma.checkoutRecoveryMessage.findUnique({
            where: { id: msgs[0].id },
        });
        expect(cancelled?.status).toBe("cancelled");
    });
});
