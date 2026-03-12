import { test, expect } from "@playwright/test";

const STORE_HOST = "e2e-store-a.localhost";

test.describe("@storefront Payment Init (Full)", () => {
  test("@storefront can create order and initialize payment in E2E mode", async ({ request }) => {
    const createOrderRes = await request.post("/api/orders", {
      headers: {
        host: STORE_HOST,
      },
      data: {
        items: [
          {
            id: "11111111-1111-1111-1111-111111111111",
            quantity: 1,
          },
        ],
        customer: {
          email: "buyer@vayva.test",
        },
        deliveryMethod: "pickup",
        paymentMethod: "card",
        shippingCost: 0,
      },
    });

    // If product doesn't exist, route will 500 with "Product not found".
    // We intentionally keep this strict so it forces us to have deterministic seed data.
    expect(createOrderRes.status()).toBe(200);

    const createOrderJson = (await createOrderRes.json()) as {
      success?: boolean;
      orderId?: string;
      paymentUrl?: string;
    };

    expect(createOrderJson.success).toBeTruthy();

    const orderStatusRes = await request.get(
      `/api/orders/status?orderId=${encodeURIComponent(String(createOrderJson.orderId))}`,
      {
        headers: {
          host: STORE_HOST,
        },
      },
    );

    expect(orderStatusRes.status()).toBe(200);

    const orderStatusJson = (await orderStatusRes.json()) as {
      success?: boolean;
      data?: { refCode?: string };
    };

    expect(orderStatusJson.success).toBeTruthy();

    const refCode = orderStatusJson.data?.refCode;

    expect(refCode).toBeTruthy();

    const initRes = await request.post("/api/payments/initialize", {
      headers: {
        host: STORE_HOST,
      },
      data: {
        reference: refCode,
      },
    });

    expect(initRes.status()).toBe(200);

    const initJson = (await initRes.json()) as {
      success?: boolean;
      authorizationUrl?: string;
      reference?: string;
    };

    expect(initJson.success).toBeTruthy();
    expect(typeof initJson.authorizationUrl).toBe("string");
    expect(initJson.authorizationUrl).toContain("paystack.test");
    expect(typeof initJson.reference).toBe("string");
    expect(initJson.reference).toContain("e2e_order_");
  });
});
