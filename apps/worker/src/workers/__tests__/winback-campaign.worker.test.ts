/**
 * Win-Back Campaign Worker Unit Tests
 * 
 * Tests for the automated win-back email campaign worker.
 * Covers: days since expiry calculation, email sequence selection, merchant processing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { prisma } from '@vayva/db';
import { AiSubscriptionStatus } from '@vayva/db';
import { 
  processWinbackCampaign, 
  calculateDaysSinceExpiry,
} from '../winback-campaign.worker';
import { sendWinBackEmail } from '@vayva/emails/campaign-utils';

// Mock dependencies
vi.mock('@vayva/db', () => ({
  prisma: {
    merchantAiSubscription: {
      findMany: vi.fn(),
    },
  },
  AiSubscriptionStatus: {
    TRIAL_EXPIRED_GRACE: 'TRIAL_EXPIRED_GRACE',
    SOFT_CLOSED: 'SOFT_CLOSED',
  },
}));

vi.mock('@vayva/emails/campaign-utils', () => ({
  sendWinBackEmail: vi.fn(),
}));

vi.mock('@/lib/sentry', () => ({
  captureException: vi.fn(),
  addBreadcrumb: vi.fn(),
  withErrorTracking: vi.fn((fn) => fn()),
}));

describe('Win-Back Campaign Worker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('calculateDaysSinceExpiry', () => {
    it('should calculate days since expiry correctly', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);
      
      const days = calculateDaysSinceExpiry(pastDate);
      
      expect(days).toBe(7);
    });

    it('should round up partial days', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);
      pastDate.setHours(pastDate.getHours() - 12); // 3.5 days
      
      const days = calculateDaysSinceExpiry(pastDate);
      
      expect(days).toBe(4);
    });

    it('should return 0 for today', () => {
      const today = new Date();
      
      const days = calculateDaysSinceExpiry(today);
      
      expect(days).toBe(0);
    });

    it('should handle future dates as negative', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      
      const days = calculateDaysSinceExpiry(futureDate);
      
      expect(days).toBeLessThan(0);
    });
  });

  describe('processWinbackCampaign', () => {
    const mockExpiredMerchant = {
      id: 'merchant-789',
      storeId: 'store-012',
      status: AiSubscriptionStatus.TRIAL_EXPIRED_GRACE,
      trialExpiresAt: new Date(),
      graceEndsAt: null,
      closedAt: null,
      store: {
        name: 'Expired Store',
        memberships: [
          {
            user: {
              email: 'expired@test.com',
              firstName: 'Jane',
            },
          },
        ],
      },
    };

    it('should fetch expired merchants from database', async () => {
      vi.mocked(prisma.merchantAiSubscription.findMany).mockResolvedValue([]);
      
      await processWinbackCampaign();
      
      expect(prisma.merchantAiSubscription.findMany).toHaveBeenCalledWith({
        where: {
          status: {
            in: [
              AiSubscriptionStatus.TRIAL_EXPIRED_GRACE,
              AiSubscriptionStatus.SOFT_CLOSED,
            ],
          },
        },
        include: {
          store: {
            include: {
              memberships: {
                where: { role_enum: 'OWNER' },
                include: { user: true },
              },
            },
          },
        },
      });
    });

    it('should send day +3 email (20% discount) when 3 days since expiry', async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const merchant3Days = {
        ...mockExpiredMerchant,
        trialExpiresAt: threeDaysAgo,
      };
      
      vi.mocked(prisma.merchantAiSubscription.findMany).mockResolvedValue([merchant3Days]);
      
      await processWinbackCampaign();
      
      expect(sendWinBackEmail).toHaveBeenCalledWith(
        'expired@test.com',
        'Expired Store',
        'Jane',
        3
      );
    });

    it('should send day +7 email (value reminder) when 7 days since expiry', async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const merchant7Days = {
        ...mockExpiredMerchant,
        trialExpiresAt: sevenDaysAgo,
      };
      
      vi.mocked(prisma.merchantAiSubscription.findMany).mockResolvedValue([merchant7Days]);
      
      await processWinbackCampaign();
      
      expect(sendWinBackEmail).toHaveBeenCalledWith(
        'expired@test.com',
        'Expired Store',
        'Jane',
        7
      );
    });

    it('should send day +14 email (final 50% off) when 14 days since expiry', async () => {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      
      const merchant14Days = {
        ...mockExpiredMerchant,
        trialExpiresAt: fourteenDaysAgo,
      };
      
      vi.mocked(prisma.merchantAiSubscription.findMany).mockResolvedValue([merchant14Days]);
      
      await processWinbackCampaign();
      
      expect(sendWinBackEmail).toHaveBeenCalledWith(
        'expired@test.com',
        'Expired Store',
        'Jane',
        14
      );
    });

    it('should send day +30 email (fresh start) when 30 days since expiry', async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const merchant30Days = {
        ...mockExpiredMerchant,
        trialExpiresAt: thirtyDaysAgo,
      };
      
      vi.mocked(prisma.merchantAiSubscription.findMany).mockResolvedValue([merchant30Days]);
      
      await processWinbackCampaign();
      
      expect(sendWinBackEmail).toHaveBeenCalledWith(
        'expired@test.com',
        'Expired Store',
        'Jane',
        30
      );
    });

    it('should not send email if days since expiry does not match sequence', async () => {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      
      const merchant5Days = {
        ...mockExpiredMerchant,
        trialExpiresAt: fiveDaysAgo,
      };
      
      vi.mocked(prisma.merchantAiSubscription.findMany).mockResolvedValue([merchant5Days]);
      
      await processWinbackCampaign();
      
      expect(sendWinBackEmail).not.toHaveBeenCalled();
    });

    it('should skip merchant if no owner found', async () => {
      const merchantWithoutOwner = {
        ...mockExpiredMerchant,
        store: {
          ...mockExpiredMerchant.store,
          memberships: [],
        },
      };
      
      vi.mocked(prisma.merchantAiSubscription.findMany).mockResolvedValue([merchantWithoutOwner]);
      
      await processWinbackCampaign();
      
      expect(sendWinBackEmail).not.toHaveBeenCalled();
    });

    it('should continue processing if email send fails', async () => {
      const merchant1 = {
        ...mockExpiredMerchant,
        id: 'merchant-1',
        trialExpiresAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      };
      
      const merchant2 = {
        ...mockExpiredMerchant,
        id: 'merchant-2',
        trialExpiresAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      };
      
      vi.mocked(prisma.merchantAiSubscription.findMany).mockResolvedValue([merchant1, merchant2]);
      vi.mocked(sendWinBackEmail)
        .mockRejectedValueOnce(new Error('Email service unavailable'))
        .mockResolvedValueOnce(undefined);
      
      await processWinbackCampaign();
      
      expect(sendWinBackEmail).toHaveBeenCalledTimes(2);
    });

    it('should process multiple merchants with different sequences', async () => {
      const merchants = [
        {
          ...mockExpiredMerchant,
          id: 'merchant-1',
          trialExpiresAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          ...mockExpiredMerchant,
          id: 'merchant-2',
          trialExpiresAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          ...mockExpiredMerchant,
          id: 'merchant-3',
          trialExpiresAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
        {
          ...mockExpiredMerchant,
          id: 'merchant-4',
          trialExpiresAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      ];
      
      vi.mocked(prisma.merchantAiSubscription.findMany).mockResolvedValue(merchants);
      
      await processWinbackCampaign();
      
      expect(sendWinBackEmail).toHaveBeenCalledTimes(4);
      expect(sendWinBackEmail).toHaveBeenNthCalledWith(1, expect.anything(), expect.anything(), expect.anything(), 3);
      expect(sendWinBackEmail).toHaveBeenNthCalledWith(2, expect.anything(), expect.anything(), expect.anything(), 7);
      expect(sendWinBackEmail).toHaveBeenNthCalledWith(3, expect.anything(), expect.anything(), expect.anything(), 14);
      expect(sendWinBackEmail).toHaveBeenNthCalledWith(4, expect.anything(), expect.anything(), expect.anything(), 30);
    });

    it('should handle merchants with SOFT_CLOSED status', async () => {
      const softClosedMerchant = {
        ...mockExpiredMerchant,
        status: AiSubscriptionStatus.SOFT_CLOSED,
        trialExpiresAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      };
      
      vi.mocked(prisma.merchantAiSubscription.findMany).mockResolvedValue([softClosedMerchant]);
      
      await processWinbackCampaign();
      
      expect(sendWinBackEmail).toHaveBeenCalled();
    });
  });
});
