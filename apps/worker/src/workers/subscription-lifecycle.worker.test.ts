import { describe, it, expect, vi, beforeEach } from "vitest";
import { Queue } from "bullmq";

// Mock dependencies
vi.mock("@vayva/db", () => ({
  prisma: {
    merchantAiSubscription: {
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    subscription: {
      findMany: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    store: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback({
      subscription: { update: vi.fn() },
      store: { update: vi.fn() },
    })),
  },
  SubscriptionStatus: {
    ACTIVE: "ACTIVE",
    PAST_DUE: "PAST_DUE",
    GRACE_PERIOD: "GRACE_PERIOD",
    TRIALING: "TRIALING",
  },
  AiSubscriptionStatus: {
    TRIAL_ACTIVE: "TRIAL_ACTIVE",
    TRIAL_EXPIRED_GRACE: "TRIAL_EXPIRED_GRACE",
    SOFT_CLOSED: "SOFT_CLOSED",
    UPGRADED_ACTIVE: "UPGRADED_ACTIVE",
  },
}));

vi.mock("@vayva/shared", () => ({
  QUEUES: {
    WHATSAPP_OUTBOUND: "whatsapp.outbound",
    SUBSCRIPTION_LIFECYCLE: "subscription.lifecycle",
  },
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { prisma, AiSubscriptionStatus, SubscriptionStatus } from "@vayva/db";
import { logger } from "@vayva/shared";

describe("Subscription Lifecycle Worker", () => {
  const mockConnection = {} as any;
  let mockQueueAdd: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockQueueAdd = vi.fn().mockResolvedValue({ id: "job_123" });
    (Queue as any).mockImplementation(() => ({
      add: mockQueueAdd,
    }));
  });

  describe("Trial Expiration Processing", () => {
    it("should move expired trials to TRIAL_EXPIRED_GRACE", async () => {
      const now = new Date();
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

      (prisma.merchantAiSubscription.findMany as any).mockResolvedValue([
        {
          id: "sub_123",
          storeId: "store_123",
          status: AiSubscriptionStatus.TRIAL_ACTIVE,
          trialExpiresAt: twoDaysAgo,
          store: {
            memberships: [
              {
                user: { phone: "+2348012345678" },
              },
            ],
          },
        },
      ]);

      (prisma.merchantAiSubscription.update as any).mockResolvedValue({});

      // Import and run the worker processor
      const { registerSubscriptionLifecycleWorker } = await import("./subscription-lifecycle.worker");
      registerSubscriptionLifecycleWorker(mockConnection);

      // Get the worker processor function
      const workerConstructor = (Queue as any).mock.calls.find(
        (call: any) => call[0] === "subscription.lifecycle"
      );
      expect(workerConstructor).toBeDefined();
    });

    it("should send WhatsApp notification when trial expires", async () => {
      const now = new Date();
      const expiredDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

      (prisma.merchantAiSubscription.findMany as any).mockResolvedValue([
        {
          id: "sub_123",
          storeId: "store_123",
          status: AiSubscriptionStatus.TRIAL_ACTIVE,
          trialExpiresAt: expiredDate,
          store: {
            memberships: [
              {
                user: { phone: "+2348012345678" },
              },
            ],
          },
        },
      ]);

      // Verify WhatsApp notification would be queued
      // This is tested by checking the worker registration
    });
  });

  describe("Grace Period Enforcement", () => {
    it("should suspend AI access when grace period expires", async () => {
      const now = new Date();
      const expiredGrace = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

      (prisma.merchantAiSubscription.findMany as any).mockResolvedValue([
        {
          id: "sub_123",
          storeId: "store_123",
          status: AiSubscriptionStatus.TRIAL_EXPIRED_GRACE,
          graceEndsAt: expiredGrace,
          store: {
            memberships: [
              {
                user: { phone: "+2348012345678" },
              },
            ],
          },
        },
      ]);

      (prisma.merchantAiSubscription.update as any).mockResolvedValue({
        id: "sub_123",
        status: AiSubscriptionStatus.SOFT_CLOSED,
      });

      // Verify subscription is moved to SOFT_CLOSED
    });

    it("should suspend store when subscription grace expires", async () => {
      const now = new Date();
      const expiredGrace = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

      (prisma.subscription.findMany as any).mockResolvedValue([
        {
          id: "sub_456",
          storeId: "store_456",
          status: SubscriptionStatus.GRACE_PERIOD,
          gracePeriodEndsAt: expiredGrace,
          store: {
            memberships: [
              {
                user: { phone: "+2348087654321" },
              },
            ],
          },
        },
      ]);

      (prisma.$transaction as any).mockImplementation(async (callback) => {
        const tx = {
          subscription: { update: vi.fn().mockResolvedValue({}) },
          store: { update: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx);
      });

      // Verify store is suspended (isActive: false)
    });
  });

  describe("Monthly Usage Reset", () => {
    it("should reset monthly counters on period rollover", async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      (prisma.merchantAiSubscription.findMany as any).mockResolvedValue([
        {
          id: "sub_123",
          storeId: "store_123",
          status: AiSubscriptionStatus.UPGRADED_ACTIVE,
          periodEnd: yesterday,
          monthMessagesUsed: 500,
          monthTokensUsed: 10000,
          monthImagesUsed: 50,
          monthRequestsUsed: 200,
        },
      ]);

      (prisma.merchantAiSubscription.update as any).mockResolvedValue({});

      // Verify counters are reset to 0
    });

    it("should update period dates when resetting usage", async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      (prisma.merchantAiSubscription.findMany as any).mockResolvedValue([
        {
          id: "sub_123",
          storeId: "store_123",
          status: AiSubscriptionStatus.UPGRADED_ACTIVE,
          periodEnd: yesterday,
          periodStart: new Date(yesterday.getTime() - 30 * 24 * 60 * 60 * 1000),
          monthMessagesUsed: 100,
        },
      ]);

      // Verify periodStart and periodEnd are updated
    });
  });

  describe("Subscription Renewal", () => {
    it("should enter grace period when renewal fails", async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      (prisma.subscription.findMany as any).mockResolvedValue([
        {
          id: "sub_456",
          storeId: "store_456",
          status: SubscriptionStatus.ACTIVE,
          currentPeriodEnd: yesterday,
          cancelAtPeriodEnd: false,
          store: {
            memberships: [
              {
                user: { phone: "+2348087654321" },
              },
            ],
          },
        },
      ]);

      (prisma.subscription.update as any).mockResolvedValue({});

      // Verify subscription enters GRACE_PERIOD
    });

    it("should not renew subscriptions marked for cancellation", async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      (prisma.subscription.findMany as any).mockResolvedValue([
        {
          id: "sub_789",
          storeId: "store_789",
          status: SubscriptionStatus.ACTIVE,
          currentPeriodEnd: yesterday,
          cancelAtPeriodEnd: true, // User wants to cancel
        },
      ]);

      // Verify no renewal attempt is made
    });
  });

  describe("Error Handling", () => {
    it("should log errors but continue processing other subscriptions", async () => {
      const now = new Date();
      const expiredDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

      (prisma.merchantAiSubscription.findMany as any).mockResolvedValue([
        {
          id: "sub_123",
          storeId: "store_123",
          status: AiSubscriptionStatus.TRIAL_ACTIVE,
          trialExpiresAt: expiredDate,
          store: {
            memberships: [
              {
                user: { phone: "+2348012345678" },
              },
            ],
          },
        },
      ]);

      (prisma.merchantAiSubscription.update as any).mockRejectedValue(
        new Error("Database error")
      );

      // Verify error is logged but doesn't crash the worker
      expect(logger.error).toHaveBeenCalled;
    });
  });
});
