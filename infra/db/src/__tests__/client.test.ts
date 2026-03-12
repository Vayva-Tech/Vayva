/**
 * Database Client Tests
 * Tests for Prisma client configuration and utilities
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma, getIsolatedPrisma, PrismaClient, Prisma } from '../client';

describe('Database Client', () => {
  describe('Prisma Client Instance', () => {
    it('should export prisma client', () => {
      expect(prisma).toBeDefined();
      expect(prisma).toBeInstanceOf(PrismaClient);
    });

    it('should export PrismaClient class', () => {
      expect(PrismaClient).toBeDefined();
      expect(typeof PrismaClient).toBe('function');
    });

    it('should export Prisma namespace', () => {
      expect(Prisma).toBeDefined();
      expect(typeof Prisma).toBe('object');
    });

    it('should have required Prisma methods', () => {
      expect(typeof prisma.$connect).toBe('function');
      expect(typeof prisma.$disconnect).toBe('function');
      expect(typeof prisma.$transaction).toBe('function');
      expect(typeof prisma.$queryRaw).toBe('function');
      expect(typeof prisma.$executeRaw).toBe('function');
    });
  });

  describe('Model Access', () => {
    it('should have store model', () => {
      expect(prisma.store).toBeDefined();
      expect(typeof prisma.store.findMany).toBe('function');
      expect(typeof prisma.store.findUnique).toBe('function');
      expect(typeof prisma.store.create).toBe('function');
      expect(typeof prisma.store.update).toBe('function');
      expect(typeof prisma.store.delete).toBe('function');
    });

    it('should have user model', () => {
      expect(prisma.user).toBeDefined();
      expect(typeof prisma.user.findMany).toBe('function');
    });

    it('should have product model', () => {
      expect(prisma.product).toBeDefined();
      expect(typeof prisma.product.findMany).toBe('function');
    });

    it('should have order model', () => {
      expect(prisma.order).toBeDefined();
      expect(typeof prisma.order.findMany).toBe('function');
    });

    it('should have customer model', () => {
      expect(prisma.customer).toBeDefined();
      expect(typeof prisma.customer.findMany).toBe('function');
    });

    it('should have inventory item model', () => {
      expect(prisma.inventoryItem).toBeDefined();
      expect(typeof prisma.inventoryItem.findMany).toBe('function');
    });
  });

  describe('Isolated Client', () => {
    it('should create isolated client', () => {
      const isolated = getIsolatedPrisma();
      expect(isolated).toBeInstanceOf(PrismaClient);
      expect(isolated).not.toBe(prisma);
    });

    it('isolated client should have same models', () => {
      const isolated = getIsolatedPrisma();
      expect(isolated.store).toBeDefined();
      expect(isolated.user).toBeDefined();
      expect(isolated.product).toBeDefined();
    });
  });

  describe('Prisma Enums', () => {
    it('should export OrderStatus enum', () => {
      expect(Prisma.OrderStatus).toBeDefined();
    });

    it('should export PaymentStatus enum', () => {
      expect(Prisma.PaymentStatus).toBeDefined();
    });

    it('should export SubscriptionStatus enum', () => {
      expect(Prisma.SubscriptionStatus).toBeDefined();
    });

    it('should export SubscriptionPlan enum', () => {
      expect(Prisma.SubscriptionPlan).toBeDefined();
    });
  });

  describe('Connection Configuration', () => {
    it('should use environment variables for configuration', () => {
      // Verify that the client is configured to use env vars
      expect(process.env.DATABASE_URL).toBeDefined();
    });

    it('should have connection limit configuration', () => {
      const limit = process.env.DB_CONNECTION_LIMIT || '20';
      expect(parseInt(limit, 10)).toBeGreaterThan(0);
    });
  });
});
