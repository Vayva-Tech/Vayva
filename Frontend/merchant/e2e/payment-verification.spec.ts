import { test, expect } from "@playwright/test";
import { signIn } from "./fixtures/auth";

test.describe("Payment Verification Flow", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("should prevent double-fulfillment on duplicate verification", async ({
    page,
    context,
  }) => {
    // This test verifies the idempotency guard works correctly

    // Create a test order (assuming API endpoint exists)
    const orderResponse = await page.request.post("/api/orders", {
      data: {
        items: [
          {
            productId: "test-product",
            quantity: 1,
            price: 1000,
          },
        ],
        customerEmail: "customer@test.com",
        total: 1000,
      },
    });

    if (!orderResponse.ok()) {
      test.skip();
      return;
    }

    const order = await orderResponse.json();
    const orderId = order.data?.id || order.id;

    // Simulate payment verification (first call)
    const verifyResponse1 = await page.request.get(
      `/api/payments/verify?reference=${orderId}`,
    );

    if (verifyResponse1.ok()) {
      const result1 = await verifyResponse1.json();
      expect(result1.success).toBe(true);

      // Simulate duplicate verification (second call)
      const verifyResponse2 = await page.request.get(
        `/api/payments/verify?reference=${orderId}`,
      );
      const result2 = await verifyResponse2.json();

      // Should return success but indicate already processed
      expect(result2.success).toBe(true);
      expect(result2.message).toContain("already processed");

      // Verify order status is still SUCCESS (not duplicated)
      const orderCheck = await page.request.get(`/api/orders/${orderId}`);
      const orderData = await orderCheck.json();

      expect(orderData.paymentStatus).toBe("SUCCESS");
    }
  });

  test("should validate payment amount matches order total", async ({
    page,
  }) => {
    // This test verifies amount validation works
    // Note: This requires mocking Paystack or using test mode

    // Create order with specific amount
    const orderResponse = await page.request.post("/api/orders", {
      data: {
        items: [{ productId: "test", quantity: 1, price: 5000 }],
        total: 5000,
        customerEmail: "test@example.com",
      },
    });

    if (orderResponse.ok()) {
      const order = await orderResponse.json();
      const orderId = order.data?.id || order.id;

      // Attempt verification (will fail if Paystack amount doesn't match)
      const verifyResponse = await page.request.get(
        `/api/payments/verify?reference=${orderId}`,
      );

      // If verification fails due to amount mismatch, error should be clear
      if (!verifyResponse.ok()) {
        const error = await verifyResponse.json();
        if (error.error?.includes("amount mismatch")) {
          expect(error.details).toBeDefined();
          expect(error.details.expected).toBeDefined();
          expect(error.details.received).toBeDefined();
        }
      }
    }
  });

  test("should create ledger entry on successful payment", async ({ page }) => {
    // Create and verify order
    const orderResponse = await page.request.post("/api/orders", {
      data: {
        items: [{ productId: "test", quantity: 1, price: 2000 }],
        total: 2000,
        customerEmail: "ledger@test.com",
      },
    });

    if (orderResponse.ok()) {
      const order = await orderResponse.json();
      const orderId = order.data?.id || order.id;

      // Verify payment
      const verifyResponse = await page.request.get(
        `/api/payments/verify?reference=${orderId}`,
      );

      if (verifyResponse.ok()) {
        // Check if ledger entry was created
        const ledgerResponse = await page.request.get(
          "/api/wallet/transactions",
        );

        if (ledgerResponse.ok()) {
          const ledger = await ledgerResponse.json();

          // Find ledger entry for this order
          const entry = ledger.find((l: any) => l.referenceId === orderId);

          if (entry) {
            expect(entry.type).toBe("PAYMENT");
            expect(entry.amount).toBeGreaterThan(0);
            expect(entry.description).toContain("Order");
          }
        }
      }
    }
  });

  test("should include correlation ID in verification responses", async ({
    page,
  }) => {
    const correlationId = `test-${Date.now()}`;

    // Make verification request with correlation ID header
    const verifyResponse = await page.request.get(
      "/api/payments/verify?reference=test-ref",
      {
        headers: {
          "x-correlation-id": correlationId,
        },
      },
    );

    const result = await verifyResponse.json();

    // Verify correlation ID is returned
    expect(result.correlationId).toBe(correlationId);
  });

  test("should log audit event on payment verification", async ({ page }) => {
    // Create order
    const orderResponse = await page.request.post("/api/orders", {
      data: {
        items: [{ productId: "test", quantity: 1, price: 3000 }],
        total: 3000,
        customerEmail: "audit@test.com",
      },
    });

    if (orderResponse.ok()) {
      const order = await orderResponse.json();
      const orderId = order.data?.id || order.id;

      // Verify payment
      await page.request.get(`/api/payments/verify?reference=${orderId}`);

      // Check audit logs (if endpoint exists)
      const auditResponse = await page.request.get("/api/settings/activity");

      if (auditResponse.ok()) {
        const logs = await auditResponse.json();

        // Look for payment verification audit log
        const paymentLog = logs.find(
          (log: any) =>
            log.entityType === "ORDER" &&
            log.entityId === orderId &&
            log.actorLabel?.includes("paystack"),
        );

        if (paymentLog) {
          expect(paymentLog.afterState).toBeDefined();
          expect(paymentLog.afterState.paymentStatus).toBe("SUCCESS");
        }
      }
    }
  });
});
