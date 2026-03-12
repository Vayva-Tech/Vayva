import { prisma } from "./prisma";
/**
 * Create test product
 */
export async function createTestProduct(storeId, overrides) {
    const product = await prisma.product.create({
        data: {
            storeId,
            title: overrides?.title || "Test Product",
            handle: overrides?.handle || `test-product-${Date.now()}`,
            description: overrides?.description || "Test product description",
            status: overrides?.status || "ACTIVE",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });
    // Create default variant
    const variant = await prisma.productVariant.create({
        data: {
            productId: product.id,
            title: "Default",
            sku: `SKU-${Date.now()}`,
            price: overrides?.price || 10000, // 100.00 NGN
            compareAtPrice: overrides?.compareAtPrice || null,
            inventoryPolicy: "DENY",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });
    return { product, variant };
}
/**
 * Create test order
 */
export async function createTestOrder(storeId, customerId, overrides) {
    const order = await prisma.order.create({
        data: {
            storeId,
            customerId: customerId || null,
            orderNumber: `ORD-${Date.now()}`,
            status: overrides?.status || "PENDING",
            paymentStatus: overrides?.paymentStatus || "UNPAID",
            fulfillmentStatus: overrides?.fulfillmentStatus || "UNFULFILLED",
            subtotal: overrides?.subtotal || 10000,
            total: overrides?.total || 10000,
            currency: "NGN",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });
    return order;
}
/**
 * Create test customer
 */
export async function createTestCustomer(storeId, overrides) {
    const customer = await prisma.customer.create({
        data: {
            storeId,
            email: overrides?.email || `customer-${Date.now()}@test.com`,
            firstName: overrides?.firstName || "Test",
            lastName: overrides?.lastName || "Customer",
            phone: overrides?.phone || `+234${Date.now().toString().slice(-10)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });
    return customer;
}
/**
 * Create test inventory item
 */
export async function createTestInventory(merchantId, productId, variantId, quantity = 100) {
    const inventory = await prisma.inventoryItem.create({
        data: {
            merchantId,
            productId,
            variantId: variantId || null,
            onHand: quantity,
            reserved: 0,
            lowStockThreshold: 10,
        },
    });
    return inventory;
}
/**
 * Cleanup test data for a store
 */
export async function cleanupTestStore(storeId) {
    // Delete in correct order to respect foreign keys
    await prisma.orderLineItem.deleteMany({ where: { order: { storeId } } });
    await prisma.order.deleteMany({ where: { storeId } });
    await prisma.customer.deleteMany({ where: { storeId } });
    await prisma.productVariant.deleteMany({ where: { product: { storeId } } });
    await prisma.product.deleteMany({ where: { storeId } });
    await prisma.inventoryItem.deleteMany({ where: { storeId } });
}
/**
 * Create complete test store setup
 */
export async function createCompleteTestStore(userId) {
    // Create store
    const store = await prisma.store.create({
        data: {
            name: `Test Store ${Date.now()}`,
            slug: `test-store-${Date.now()}`,
            ownerId: userId,
            status: "ACTIVE",
            createdAt: new Date(),
        },
    });
    // Create products
    const { product: product1, variant: variant1 } = await createTestProduct(store.id, {
        title: "Product 1",
        price: 5000,
    });
    const { product: product2, variant: variant2 } = await createTestProduct(store.id, {
        title: "Product 2",
        price: 10000,
    });
    // Create inventory
    await createTestInventory(userId, product1.id, variant1.id, 50);
    await createTestInventory(userId, product2.id, variant2.id, 100);
    // Create customers
    const customer1 = await createTestCustomer(store.id, {
        email: "customer1@test.com",
        firstName: "John",
        lastName: "Doe",
    });
    const customer2 = await createTestCustomer(store.id, {
        email: "customer2@test.com",
        firstName: "Jane",
        lastName: "Smith",
    });
    // Create orders
    const order1 = await createTestOrder(store.id, customer1.id, {
        status: "CONFIRMED",
        paymentStatus: "PAID",
        total: 5000,
    });
    const order2 = await createTestOrder(store.id, customer2.id, {
        status: "PENDING",
        paymentStatus: "UNPAID",
        total: 10000,
    });
    return {
        store,
        products: [
            { product: product1, variant: variant1 },
            { product: product2, variant: variant2 },
        ],
        customers: [customer1, customer2],
        orders: [order1, order2],
    };
}
