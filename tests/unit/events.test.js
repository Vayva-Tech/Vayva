import { describe, it, expect, vi } from "vitest";
import { EVENT_CATALOG } from "../../apps/merchant-admin/src/lib/events/catalog";
import { EventBus } from "../../apps/merchant-admin/src/lib/events/eventBus";
import { prisma } from "@vayva/db";
vi.mock("@vayva/db", () => ({
    prisma: {
        notification: {
            create: vi.fn(),
            upsert: vi.fn(),
        },
        auditLog: {
            create: vi.fn(),
        },
        $transaction: vi.fn((ops) => Promise.resolve(ops)),
    },
}));
describe("EventBus", () => {
    it("catalog has required events", () => {
        expect(EVENT_CATALOG["order.created"]).toBeDefined();
        expect(EVENT_CATALOG["delivery.failed"]).toBeDefined();
        expect(EVENT_CATALOG["dispute.opened"]).toBeDefined();
    });
    it("publish creates notification and audit logs correctly", async () => {
        const payload = {
            merchantId: "m1",
            type: "order.created",
            payload: {
                orderNumber: 1,
                currency: "NGN",
                totalAmount: 5000,
                customerName: "Test User",
            },
            ctx: {
                actorId: "sys",
                actorType: "system",
                actorLabel: "System",
                correlationId: "test-corr-id",
            },
        };
        await EventBus.publish(payload);
        expect(prisma.notification.create).toHaveBeenCalled();
        const callArgs = prisma.notification.create.mock.calls[0][0];
        expect(callArgs.data.title).toBe("New Order Received");
        expect(callArgs.data.severity).toBe("success");
    });
    it("publish creates audit log correctly", async () => {
        const payload = {
            merchantId: "m1",
            type: "order.paid",
            entityType: "ORDER",
            entityId: "o1",
            ctx: {
                actorId: "u1",
                actorType: "merchant_user",
                actorLabel: "John Doe",
                correlationId: "cid-1",
            },
        };
        await EventBus.publish(payload);
        expect(prisma.auditLog.create).toHaveBeenCalled();
        const callArgs = prisma.auditLog.create.mock.calls[0][0];
        expect(callArgs.data.action).toBe("order.payment_confirmed");
        expect(callArgs.data.correlationId).toBe("cid-1");
    });
});
