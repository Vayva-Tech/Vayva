import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth module before importing gating
vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

// Mock @vayva/db for checkSubscription tests - using factory that returns its own mock
vi.mock("@vayva/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@vayva/db")>();
  return {
    ...actual,
    prisma: {
      membership: {
        findFirst: vi.fn(),
      },
      subscription: {
        findUnique: vi.fn(),
      },
    },
  };
});

import { prisma } from "@vayva/db";
import {
  enforcePlanLimit,
  getSubscriptionLimits,
  checkSubscription,
  type SubscriptionTier,
} from "./gating";

// Mock prisma for enforcePlanLimit tests
const mockPrisma = {
  product: { count: vi.fn() },
  order: { count: vi.fn() },
  membership: { count: vi.fn() },
  merchantAiSubscription: { findUnique: vi.fn() },
  upload: { aggregate: vi.fn() },
  store: { findUnique: vi.fn() },
  subscription: { findUnique: vi.fn() },
  membershipFindFirst: vi.fn(),
};

describe("Plan Limit Enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSubscriptionLimits", () => {
    it("should return correct limits for FREE plan", () => {
      const limits = getSubscriptionLimits("free");
      expect(limits.maxProducts).toBe(20);
      expect(limits.maxOrders).toBe(50);
      expect(limits.maxTeamMembers).toBe(1);
    });

    it("should return correct limits for STARTER plan", () => {
      const limits = getSubscriptionLimits("starter");
      expect(limits.maxProducts).toBe(100);
      expect(limits.maxOrders).toBe(500);
      expect(limits.maxTeamMembers).toBe(2);
    });

    it("should return correct limits for PRO plan", () => {
      const limits = getSubscriptionLimits("pro");
      expect(limits.maxProducts).toBe(500);
      expect(limits.maxOrders).toBe(10000);
      expect(limits.maxTeamMembers).toBe(10);
    });
  });

  describe("enforcePlanLimit - products", () => {
    it("should allow product creation when under limit", async () => {
      mockPrisma.store.findUnique.mockResolvedValue({ plan: "FREE" });
      mockPrisma.product.count.mockResolvedValue(19);

      await expect(
        enforcePlanLimit("store_123", "products", mockPrisma as any)
      ).resolves.not.toThrow();
    });

    it("should block product creation when at limit", async () => {
      mockPrisma.store.findUnique.mockResolvedValue({ plan: "FREE" });
      mockPrisma.product.count.mockResolvedValue(20);

      await expect(
        enforcePlanLimit("store_123", "products", mockPrisma as any)
      ).rejects.toThrow("Product limit reached: 20 on FREE plan");
    });

    it("should allow more products on PRO plan", async () => {
      mockPrisma.store.findUnique.mockResolvedValue({ plan: "PRO" });
      mockPrisma.product.count.mockResolvedValue(100);

      await expect(
        enforcePlanLimit("store_123", "products", mockPrisma as any)
      ).resolves.not.toThrow();
    });
  });

  describe("enforcePlanLimit - orders", () => {
    it("should allow order creation when under monthly limit", async () => {
      mockPrisma.store.findUnique.mockResolvedValue({ plan: "FREE" });
      mockPrisma.order.count.mockResolvedValue(49);

      await expect(
        enforcePlanLimit("store_123", "orders", mockPrisma as any)
      ).resolves.not.toThrow();
    });

    it("should block order creation when at monthly limit", async () => {
      mockPrisma.store.findUnique.mockResolvedValue({ plan: "FREE" });
      mockPrisma.order.count.mockResolvedValue(50);

      await expect(
        enforcePlanLimit("store_123", "orders", mockPrisma as any)
      ).rejects.toThrow("Monthly order limit reached: 50 on FREE plan");
    });
  });

  describe("enforcePlanLimit - team", () => {
    it("should allow team invite when under limit", async () => {
      mockPrisma.store.findUnique.mockResolvedValue({ plan: "STARTER" });
      mockPrisma.membership.count.mockResolvedValue(1);

      await expect(
        enforcePlanLimit("store_123", "team", mockPrisma as any)
      ).resolves.not.toThrow();
    });

    it("should block team invite when at limit", async () => {
      mockPrisma.store.findUnique.mockResolvedValue({ plan: "STARTER" });
      mockPrisma.membership.count.mockResolvedValue(2);

      await expect(
        enforcePlanLimit("store_123", "team", mockPrisma as any)
      ).rejects.toThrow("Team limit reached: 2 members on STARTER plan");
    });
  });

  describe("enforcePlanLimit - ai_messages", () => {
    it("should allow AI messages when under limit", async () => {
      mockPrisma.store.findUnique.mockResolvedValue({ plan: "STARTER" });
      mockPrisma.merchantAiSubscription.findUnique.mockResolvedValue({
        monthMessagesUsed: 50,
      });

      await expect(
        enforcePlanLimit("store_123", "ai_messages", mockPrisma as any)
      ).resolves.not.toThrow();
    });

    it("should block AI messages when at limit", async () => {
      mockPrisma.store.findUnique.mockResolvedValue({ plan: "STARTER" });
      mockPrisma.merchantAiSubscription.findUnique.mockResolvedValue({
        monthMessagesUsed: 100,
      });

      await expect(
        enforcePlanLimit("store_123", "ai_messages", mockPrisma as any)
      ).rejects.toThrow("AI message limit reached: 100 this month on STARTER plan");
    });
  });

  describe("enforcePlanLimit - storage", () => {
    it("should allow upload when under storage quota", async () => {
      mockPrisma.store.findUnique.mockResolvedValue({ plan: "FREE" });
      mockPrisma.upload.aggregate.mockResolvedValue({
        _sum: { size: 50 * 1024 * 1024 }, // 50MB
      });

      await expect(
        enforcePlanLimit("store_123", "storage", mockPrisma as any)
      ).resolves.not.toThrow();
    });

    it("should block upload when at storage quota", async () => {
      mockPrisma.store.findUnique.mockResolvedValue({ plan: "FREE" });
      mockPrisma.upload.aggregate.mockResolvedValue({
        _sum: { size: 100 * 1024 * 1024 }, // 100MB
      });

      await expect(
        enforcePlanLimit("store_123", "storage", mockPrisma as any)
      ).rejects.toThrow("Storage limit reached: 100MB on FREE plan");
    });
  });
});

describe("checkSubscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return no access when user has no membership", async () => {
    (prisma.membership.findFirst as any).mockResolvedValue(null);

    const result = await checkSubscription("user_123", "starter");

    expect(result.hasAccess).toBe(false);
    expect(result.currentTier).toBe("free");
  });

  it("should return access when user has active subscription", async () => {
    (prisma.membership.findFirst as any).mockResolvedValue({
      storeId: "store_123",
    });
    (prisma.subscription.findUnique as any).mockResolvedValue({
      planKey: "PRO",
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      trialEndsAt: null,
    });

    const result = await checkSubscription("user_123", "starter");

    expect(result.hasAccess).toBe(true);
    expect(result.currentTier).toBe("pro");
  });

  it("should deny access when subscription is expired", async () => {
    (prisma.membership.findFirst as any).mockResolvedValue({
      storeId: "store_123",
    });
    (prisma.subscription.findUnique as any).mockResolvedValue({
      planKey: "PRO",
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      trialEndsAt: null,
    });

    const result = await checkSubscription("user_123", "starter");

    expect(result.hasAccess).toBe(false);
  });
});
