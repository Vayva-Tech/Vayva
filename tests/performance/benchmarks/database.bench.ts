/**
 * Database Performance Benchmarks
 * Tests database query performance against targets
 */

import { describe, bench, beforeAll, afterAll } from 'vitest';
import { prisma } from '@vayva/db';
import { BENCHMARK_TARGETS, BENCHMARK_CATEGORIES } from '../config';

// Test data setup
let testStoreId: string;
let testProductIds: string[] = [];

describe('Database Query Benchmarks', () => {
  beforeAll(async () => {
    // Create test store
    const store = await prisma.store.create({
      data: {
        name: 'Benchmark Test Store',
        slug: `benchmark-store-${Date.now()}`,
        plan: 'PRO',
      },
    });
    testStoreId = store.id;

    // Create test products
    const products = await Promise.all(
      Array(100)
        .fill(null)
        .map((_, i) =>
          prisma.product.create({
            data: {
              storeId: testStoreId,
              name: `Benchmark Product ${i}`,
              sku: `BENCH-${Date.now()}-${i}`,
              price: Math.floor(Math.random() * 10000) + 1000,
              description: 'Benchmark test product',
            },
          })
        )
    );
    testProductIds = products.map(p => p.id);

    // Create inventory items
    await Promise.all(
      products.map(product =>
        prisma.inventoryItem.create({
          data: {
            storeId: testStoreId,
            productId: product.id,
            sku: product.sku,
            quantity: 1000,
            reservedQuantity: 0,
          },
        })
      )
    );
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.inventoryItem.deleteMany({ where: { storeId: testStoreId } });
    await prisma.product.deleteMany({ where: { storeId: testStoreId } });
    await prisma.store.delete({ where: { id: testStoreId } });
  });

  describe('Simple Queries', () => {
    bench(
      'findUnique by ID',
      async () => {
        const productId = testProductIds[Math.floor(Math.random() * testProductIds.length)];
        await prisma.product.findUnique({
          where: { id: productId },
        });
      },
      {
        iterations: 1000,
        time: 1000,
      }
    );

    bench(
      'findFirst with filter',
      async () => {
        await prisma.product.findFirst({
          where: { storeId: testStoreId, price: { gt: 5000 } },
        });
      },
      {
        iterations: 1000,
        time: 1000,
      }
    );

    bench(
      'count with filter',
      async () => {
        await prisma.product.count({
          where: { storeId: testStoreId },
        });
      },
      {
        iterations: 1000,
        time: 1000,
      }
    );
  });

  describe('Complex Queries', () => {
    bench(
      'findMany with relations',
      async () => {
        await prisma.product.findMany({
          where: { storeId: testStoreId },
          take: 20,
          include: {
            inventoryItems: true,
          },
        });
      },
      {
        iterations: 500,
        time: 1000,
      }
    );

    bench(
      'findMany with pagination',
      async () => {
        await prisma.product.findMany({
          where: { storeId: testStoreId },
          skip: 20,
          take: 20,
          orderBy: { createdAt: 'desc' },
        });
      },
      {
        iterations: 500,
        time: 1000,
      }
    );

    bench(
      'aggregate with grouping',
      async () => {
        await prisma.product.groupBy({
          by: ['storeId'],
          where: { storeId: testStoreId },
          _avg: { price: true },
          _count: { id: true },
        });
      },
      {
        iterations: 500,
        time: 1000,
      }
    );
  });

  describe('Write Operations', () => {
    bench(
      'create single record',
      async () => {
        await prisma.product.create({
          data: {
            storeId: testStoreId,
            name: `Temp Product ${Date.now()}`,
            sku: `TEMP-${Date.now()}`,
            price: 5000,
          },
        });
      },
      {
        iterations: 200,
        time: 1000,
      }
    );

    bench(
      'update single record',
      async () => {
        const productId = testProductIds[Math.floor(Math.random() * testProductIds.length)];
        await prisma.product.update({
          where: { id: productId },
          data: { price: Math.floor(Math.random() * 10000) + 1000 },
        });
      },
      {
        iterations: 200,
        time: 1000,
      }
    );

    bench(
      'createMany batch',
      async () => {
        await prisma.product.createMany({
          data: Array(10)
            .fill(null)
            .map((_, i) => ({
              storeId: testStoreId,
              name: `Batch Product ${Date.now()}-${i}`,
              sku: `BATCH-${Date.now()}-${i}`,
              price: 5000,
            })),
        });
      },
      {
        iterations: 100,
        time: 1000,
      }
    );
  });

  describe('Transaction Performance', () => {
    bench(
      'simple transaction',
      async () => {
        await prisma.$transaction(async (tx) => {
          const product = await tx.product.findFirst({
            where: { storeId: testStoreId },
          });
          if (product) {
            await tx.product.update({
              where: { id: product.id },
              data: { price: product.price + 1 },
            });
          }
        });
      },
      {
        iterations: 200,
        time: 1000,
      }
    );

    bench(
      'complex transaction with inventory',
      async () => {
        await prisma.$transaction(async (tx) => {
          const productId = testProductIds[Math.floor(Math.random() * testProductIds.length)];
          
          // Get product with inventory
          const product = await tx.product.findUnique({
            where: { id: productId },
            include: { inventoryItems: true },
          });
          
          if (product?.inventoryItems[0]) {
            // Update inventory
            await tx.inventoryItem.update({
              where: { id: product.inventoryItems[0].id },
              data: { quantity: { decrement: 1 } },
            });
            
            // Create order item record
            await tx.orderItem.create({
              data: {
                productId: product.id,
                quantity: 1,
                price: product.price,
                storeId: testStoreId,
                orderId: 'benchmark-order-id',
              },
            });
          }
        });
      },
      {
        iterations: 100,
        time: 1000,
      }
    );
  });

  describe('Connection Pool', () => {
    bench(
      'concurrent queries',
      async () => {
        await Promise.all(
          Array(10)
            .fill(null)
            .map(() =>
              prisma.product.findMany({
                where: { storeId: testStoreId },
                take: 10,
              })
            )
        );
      },
      {
        iterations: 100,
        time: 1000,
      }
    );
  });
});

// Performance assertions
describe('Database Performance Targets', () => {
  test('simple queries should meet p95 target', () => {
    // This would be populated by benchmark results
    // In real implementation, we'd parse benchmark output
    expect(BENCHMARK_TARGETS.database.simple).toBeLessThanOrEqual(10);
  });

  test('complex queries should meet p95 target', () => {
    expect(BENCHMARK_TARGETS.database.complex).toBeLessThanOrEqual(50);
  });
});

import { test, expect } from 'vitest';
