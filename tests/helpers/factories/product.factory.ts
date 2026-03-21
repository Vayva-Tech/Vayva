/**
 * Product Factory
 * Test data factory for Product entity
 */

import { prisma, type Product, type Prisma } from '@vayva/db';

export type ProductCreateInput = Partial<Prisma.ProductCreateInput> & {
  storeId: string;
};

export class ProductFactory {
  private static counter = 0;

  static defaults(storeId: string): Prisma.ProductCreateInput {
    this.counter++;
    return {
      name: `Test Product ${this.counter}`,
      sku: `SKU-${this.counter}-${Date.now()}`,
      price: 10000, // 100.00 in cents
      description: 'A test product for testing purposes',
      store: {
        connect: { id: storeId },
      },
      status: 'ACTIVE',
    };
  }

  static create(overrides: ProductCreateInput): Promise<Product> {
    const { storeId, ...rest } = overrides;
    return prisma.product.create({
      data: {
        ...this.defaults(storeId),
        ...rest,
      },
    });
  }

  static createMany(
    count: number,
    storeId: string,
    overrides: Omit<ProductCreateInput, 'storeId'> = {}
  ): Promise<Product[]> {
    return Promise.all(
      Array(count)
        .fill(null)
        .map(() => this.create({ storeId, ...overrides }))
    );
  }

  static async cleanup(productId: string): Promise<void> {
    await prisma.product.delete({ where: { id: productId } }).catch(() => {});
  }

  static async cleanupByStore(storeId: string): Promise<void> {
    await prisma.product.deleteMany({
      where: {
        storeId,
        sku: {
          startsWith: 'SKU-',
        },
      },
    });
  }
}
