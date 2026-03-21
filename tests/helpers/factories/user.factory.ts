/**
 * User Factory
 * Test data factory for User entity
 */

import { prisma, type User, type Prisma } from '@vayva/db';

export type UserCreateInput = Partial<Prisma.UserCreateInput>;

export class UserFactory {
  private static counter = 0;

  static defaults(): Prisma.UserCreateInput {
    this.counter++;
    return {
      email: `test-user-${this.counter}@example.com`,
      firstName: 'Test',
      lastName: `User ${this.counter}`,
      password: 'hashed-password-placeholder',
      emailVerified: new Date(),
    };
  }

  static create(overrides: UserCreateInput = {}): Promise<User> {
    return prisma.user.create({
      data: {
        ...this.defaults(),
        ...overrides,
      },
    });
  }

  static createMany(count: number, overrides: UserCreateInput = {}): Promise<User[]> {
    return Promise.all(
      Array(count)
        .fill(null)
        .map((_, i) =>
          this.create({
            email: `test-user-${i}-${Date.now()}@example.com`,
            ...overrides,
          })
        )
    );
  }

  static async cleanup(userId: string): Promise<void> {
    await prisma.user.delete({ where: { id: userId } }).catch(() => {});
  }

  static async cleanupAll(): Promise<void> {
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test-user-',
        },
      },
    });
  }
}
