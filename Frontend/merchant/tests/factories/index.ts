import type { User, Store, Product, Order, Customer } from "@vayva/db";

/**
 * Test data factory for creating mock User objects
 */
export const createMockUser = (overrides?: Partial<User>): User =>
  ({
    id: "user_test_123",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    emailVerified: new Date(),
    password: "$2a$10$hashedpassword", // bcrypt hash
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as User;

/**
 * Test data factory for creating mock Store objects
 */
export const createMockStore = (overrides?: Partial<Store>): Store =>
  ({
    id: "store_test_123",
    name: "Test Store",
    slug: "test-store",
    domain: null,
    customDomain: null,
    description: "A test store for unit testing",
    logo: null,
    favicon: null,
    primaryColor: "#000000",
    currency: "NGN",
    timezone: "Africa/Lagos",
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as Store;

/**
 * Test data factory for creating mock Product objects
 */
export const createMockProduct = (overrides?: Partial<Product>): Product =>
  ({
    id: "prod_test_123",
    storeId: "store_test_123",
    name: "Test Product",
    slug: "test-product",
    description: "Test product description",
    price: 1000,
    compareAtPrice: null,
    costPerItem: null,
    sku: "TEST-SKU-001",
    barcode: null,
    trackQuantity: true,
    quantity: 100,
    lowStockThreshold: 10,
    status: "ACTIVE",
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as Product;

/**
 * Test data factory for creating mock Order objects
 */
export const createMockOrder = (overrides?: Partial<Order>): Order =>
  ({
    id: "order_test_123",
    storeId: "store_test_123",
    orderNumber: 1,
    customerId: null,
    customerEmail: "customer@example.com",
    customerPhone: "+2348012345678",
    status: "PENDING",
    paymentStatus: "PENDING",
    fulfillmentStatus: "UNFULFILLED",
    subtotal: 1000,
    tax: 0,
    shipping: 0,
    discount: 0,
    total: 1000,
    notes: null,
    shippingAddress: null,
    billingAddress: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as Order;

/**
 * Test data factory for creating mock Customer objects
 */
export const createMockCustomer = (overrides?: Partial<Customer>): Customer =>
  ({
    id: "cust_test_123",
    storeId: "store_test_123",
    email: "customer@example.com",
    firstName: "Test",
    lastName: "Customer",
    phone: "+2348012345678",
    address: null,
    city: null,
    state: null,
    country: "Nigeria",
    postalCode: null,
    notes: null,
    tags: [],
    totalSpent: 0,
    orderCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as Customer;

/**
 * Create multiple mock products at once
 */
export const createMockProducts = (
  count: number,
  overrides?: Partial<Product>,
): Product[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockProduct({
      id: `prod_test_${i + 1}`,
      title: `Test Product ${i + 1}`,
      handle: `test-product-${i + 1}`,
      sku: `TEST-SKU-${String(i + 1).padStart(3, "0")}`,
      ...overrides,
    }),
  );
};

/**
 * Create multiple mock orders at once
 */
export const createMockOrders = (
  count: number,
  overrides?: Partial<Order>,
): Order[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockOrder({
      id: `order_test_${i + 1}`,
      orderNumber: i + 1,
      ...overrides,
    }),
  );
};

/**
 * Create multiple mock customers at once
 */
export const createMockCustomers = (
  count: number,
  overrides?: Partial<Customer>,
): Customer[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockCustomer({
      id: `cust_test_${i + 1}`,
      email: `customer${i + 1}@example.com`,
      ...overrides,
    }),
  );
};
