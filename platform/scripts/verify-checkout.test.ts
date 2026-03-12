if (process.env.NODE_ENV === "production") {
  throw new Error(
    "❌ FATAL: Test scripts must NEVER run against production. Aborting.",
  );
}

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@vayva/db";
import { CartService, OrderCoreService } from "@vayva/shared";

describe("Checkout Price Safety E2E", () => {
  let userId: string;
  let storeId: string;
  let productId: string;
  let variantId: string;
  let cartId: string;

  const TEST_PREFIX = "E2E_TEST_" + Date.now();
  const TEST_PRICE = 5000;
  const DELIVERY_FEE = 1000;

  beforeAll(async () => {
    // 1. Create User
    const user = await prisma.user.create({
      data: {
        email: `${TEST_PREFIX}@example.com`,
        password: "password123",
        firstName: "E2E",
        lastName: "Tester",
      },
      select: { id: true },
    });
    userId = user.id;

    // 2. Create Store
    const store = await prisma.store.create({
      data: {
        name: `${TEST_PREFIX} Store`,
        slug: `${TEST_PREFIX}-store`,
      },
      select: { id: true },
    });
    storeId = store.id;

    // 3. Create Product & Variant
    const product = await prisma.product.create({
      data: {
        storeId,
        title: `${TEST_PREFIX} Product`,
        handle: `${TEST_PREFIX}-product`,
        status: "ACTIVE",
        condition: "NEW",
        warrantyMonths: 0,
        moq: 1,
        ProductImage: {
          create: { url: "https://example.com/img.jpg", position: 0 },
        },
        ProductVariant: {
          create: {
            title: "Default Variant",
            price: TEST_PRICE,
            sku: `${TEST_PREFIX}-SKU`,
            inventoryQty: 100,
            position: 0,
          },
        },
      },
      include: { ProductVariant: true },
    });
    productId = product.id;
    variantId = product.ProductVariant[0].id;
  });

  afterAll(async () => {
    // Cleanup with error suppression
    try {
      // 1. Delete Created Order (if exists)
      // Search for it or use the one from the test?
      // The test might not have finished, so we search.
      const orders = await prisma.order.findMany({
        where: {
          items: { some: { title: { contains: TEST_PREFIX } } },
        },
        include: { items: true, fulfillmentGroups: true },
      });

      for (const o of orders) {
        // Delete dependants
        await prisma.orderItem.deleteMany({ where: { orderId: o.id } });
        await prisma.fulfillmentGroup.deleteMany({ where: { orderId: o.id } });
        await prisma.order.delete({ where: { id: o.id } });
      }

      // 2. Delete Cart
      if (cartId) {
        await prisma.cartItem.deleteMany({ where: { cartId } });
        await prisma.cart.deleteMany({ where: { id: cartId } });
      }

      // 3. Product & Store
      if (productId) {
        // Disconnect/Delete dependants
        await prisma.productVariant.deleteMany({ where: { productId } });
        await prisma.productImage.deleteMany({ where: { productId } });
        await prisma.product.deleteMany({ where: { id: productId } });
      }

      if (storeId) {
        await prisma.store.deleteMany({ where: { id: storeId } });
      }

      if (userId) {
        await prisma.user.deleteMany({ where: { id: userId } });
      }
    } catch (e) {
      console.error("Cleanup failed:", e);
    }
  });

  it("should calculate order totals correctly independent of client input", async () => {
    // 1. Create Cart
    const cart = await CartService.createCart(userId);
    cartId = cart.id;

    // 2. Add Item (Quantity 2)
    await CartService.addItem(cartId, variantId, 2);

    // 3. Verify Cart State (Pre-Order)
    const enrichedCart = await CartService.getCart(cartId);
    expect(enrichedCart).not.toBeNull();
    expect(enrichedCart!.cartTotal).toBe(TEST_PRICE * 2); // 10000
    expect(enrichedCart!.items[0].variantId).toBe(variantId);

    // 4. Create Order
    const order = await OrderCoreService.createOrdersFromCart(cartId, userId);

    // 5. Verify Order Integrity
    expect(order).toBeDefined();
    expect(order.storeId).toBe(storeId);

    // Price Checks
    // Subtotal should be Item Price * Qty
    expect(order.subtotal.toString()).toBe((TEST_PRICE * 2).toString());

    // Delivery Fee check
    // CartService default is 1000 if no settings
    const expectedDelivery = DELIVERY_FEE;
    const expectedTotal = TEST_PRICE * 2 + expectedDelivery;

    expect(order.deliveryFee.toNumber()).toBe(expectedDelivery);
    expect(order.total.toNumber()).toBe(expectedTotal);

    // Verify Order Items
    const dbOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });

    expect(dbOrder!.items).toHaveLength(1);
    expect(dbOrder!.items[0].price.toNumber()).toBe(TEST_PRICE);
    expect(dbOrder!.items[0].quantity).toBe(2);

    // Double check: Price on item should NOT be total, but unit price
    expect(dbOrder!.items[0].price.toString()).toBe(TEST_PRICE.toString());
  });
});
