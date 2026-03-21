/**
 * Store Factory
 * Test data factory for Store entity
 */

import { prisma, type Store, type Prisma } from '@vayva/db';

export type StoreCreateInput = Partial<Prisma.StoreCreateInput>;

export class StoreFactory {
  private static counter = 0;

  static defaults(): Prisma.StoreCreateInput {
    this.counter++;
    return {
      name: `Test Store ${this.counter}`,
      slug: `test-store-${this.counter}-${Date.now()}`,
      plan: 'PRO',
      status: 'ACTIVE',
    };
  }

  static create(overrides: StoreCreateInput = {}): Promise<Store> {
    return prisma.store.create({
      data: {
        ...this.defaults(),
        ...overrides,
      },
    });
  }

  static createMany(count: number, overrides: StoreCreateInput = {}): Promise<Store[]> {
    return Promise.all(
      Array(count)
        .fill(null)
        .map(() => this.create(overrides))
    );
  }

  static async cleanup(storeId: string): Promise<void> {
    await prisma.store.delete({ where: { id: storeId } }).catch(() => {});
  }

  static async cleanupAll(): Promise<void> {
    await prisma.store.deleteMany({
      where: {
        slug: {
          startsWith: 'test-store-',
        },
      },
    });
  }
}
