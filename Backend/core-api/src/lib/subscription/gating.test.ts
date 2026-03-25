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
      store: {
        findUnique: vi.fn(),
      },
    },
  };
});

import { prisma } from "@vayva/db";
import { getSubscriptionLimits, checkSubscription } from "./gating";

describe("Plan limits", () => {
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
      expect(limits.maxTeamMembers).toBe(1);
    });

    it("should return correct limits for PRO plan", () => {
      const limits = getSubscriptionLimits("pro");
      expect(limits.maxProducts).toBe(300);
      expect(limits.maxOrders).toBe(10000);
      expect(limits.maxTeamMembers).toBe(3);
    });

    it("should return correct limits for PRO_PLUS plan", () => {
      const limits = getSubscriptionLimits("pro_plus");
      expect(limits.maxProducts).toBe(500);
      expect(limits.maxOrders).toBe(-1);
      expect(limits.maxTeamMembers).toBe(5);
    });
  });
});

describe("checkSubscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.store.findUnique as any).mockResolvedValue(null);
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
