import { vi } from 'vitest';
import { prisma } from '@vayva/db';

// Mock external dependencies
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn(),
    },
  })),
}));

// Extend vitest matchers for better error messages
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be within range ${floor}-${ceiling}`,
      pass,
    };
  },
});

// Global test utilities
global.testUtils = {
  // Clean database before each test
  async cleanup() {
    // Delete all test data in reverse order of dependencies
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.product.deleteMany();
    await prisma.store.deleteMany();
    await prisma.user.deleteMany();
  },

  // Create a test store
  async createStore(overrides = {}) {
    const user = await prisma.user.create({
      data: {
        email: `test_${Date.now()}@example.com`,
        passwordHash: 'hashed_password',
      },
    });

    const store = await prisma.store.create({
      data: {
        name: `Test Store ${Date.now()}`,
        ownerId: user.id,
        industrySlug: 'retail',
        ...overrides,
      },
    });

    return { user, store };
  },

  // Create test products
  async createProducts(storeId, count = 10, overrides = {}) {
    const products = [];
    for (let i = 0; i < count; i++) {
      const product = await prisma.product.create({
        data: {
          storeId,
          title: `Product ${i + 1}`,
          price: Math.random() * 100 + 10,
          inventory: Math.floor(Math.random() * 100),
          ...overrides,
        },
      });
      products.push(product);
    }
    return products;
  },

  // Create test orders
  async createOrders(storeId, count = 5, overrides = {}) {
    const customers = await Promise.all(
      Array.from({ length: 3 }).map(() =>
        prisma.customer.create({
          data: {
            storeId,
            name: `Customer ${Date.now()}`,
            email: `customer${Date.now()}@example.com`,
          },
        })
      )
    );

    const orders = [];
    for (let i = 0; i < count; i++) {
      const customer = customers[i % customers.length];
      const order = await prisma.order.create({
        data: {
          storeId,
          customerId: customer.id,
          total: Math.random() * 500 + 50,
          paymentStatus: 'SUCCESS',
          status: 'COMPLETED',
          ...overrides,
        },
      });
      orders.push(order);
    }
    return orders;
  },
};

// Setup hooks
beforeEach(async () => {
  await global.testUtils.cleanup();
});

afterAll(async () => {
  await prisma.$disconnect();
});
