/**
 * Trial Nurture Worker Unit Tests
 * 
 * Tests for the automated trial nurture email campaign worker.
 * Covers: day calculation, email template selection, merchant processing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { prisma } from '@vayva/db';
import { AiSubscriptionStatus } from '@vayva/db';
import { 
  processTrialNurtureCampaign, 
  calculateDaysRemaining,
  runTrialNurtureWorker 
} from '../trial-nurture.worker';
import { sendTrialNurtureEmail } from '@vayva/emails/campaign-utils';

// Mock dependencies
vi.mock('@vayva/db', () => ({
  prisma: {
    merchantAiSubscription: {
      findMany: vi.fn(),
    },
  },
  AiSubscriptionStatus: {
    TRIAL_ACTIVE: 'TRIAL_ACTIVE',
    TRIAL_EXPIRED_GRACE: 'TRIAL_EXPIRED_GRACE',
  },
}));

vi.mock('@vayva/emails/campaign-utils', () => ({
  sendTrialNurtureEmail: vi.fn(),
}));

vi.mock('@/lib/sentry', () => ({
  captureException: vi.fn(),
  addBreadcrumb: vi.fn(),
  withErrorTracking: vi.fn((fn) => fn()),
}));

describe('Trial Nurture Worker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('calculateDaysRemaining', () => {
    it('should calculate days remaining correctly for future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      
      const days = calculateDaysRemaining(futureDate);
      
      expect(days).toBe(7);
    });

    it('should round up partial days', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      futureDate.setHours(futureDate.getHours() - 12); // 3.5 days
      
      const days = calculateDaysRemaining(futureDate);
      
      expect(days).toBe(4);
    });

    it('should return negative for past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);
      
      const days = calculateDaysRemaining(pastDate);
      
      expect(days).toBeLessThan(0);
    });

    it('should handle today as 0 days', () => {
      const today = new Date();
      
      const days = calculateDaysRemaining(today);
      
      expect(days).toBe(0);
    });
  });

  describe('processTrialNurtureCampaign', () => {
    const mockMerchant = {
      id: 'merchant-123',
      storeId: 'store-456',
      status: AiSubscriptionStatus.TRIAL_ACTIVE,
      trialExpiresAt: new Date(),
      graceEndsAt: null,
      store: {
        name: 'Test Store',
        memberships: [
          {
            user: {
              email: 'owner@test.com',
              firstName: 'John',
            },
          },
        ],
      },
    };

    it('should fetch active trials from database', async () => {
      vi.mocked(prisma.merchantAiSubscription.findMany).mockResolvedValue([]);
      
      await processTrialNurtureCampaign();
      
      expect(prisma.merchantAiSubscription.findMany).toHaveBeenCalledWith({
        where: {
          status: AiSubscriptionStatus.TRIAL_ACTIVE,
          trialExpiresAt: {
            gte: expect.any(Date),
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

    it('should send day -7 email when 7 days remaining', async () => {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      const merchantWith7Days = {
        ...mockMerchant,
        trialExpiresAt: sevenDaysFromNow,
      };
      
      vi.mocked(prisma.merchantAiSubscription.findMany).mockResolvedValue([merchantWith7Days]);
      
      await processTrialNurtureCampaign();
      
      expect(sendTrialNurtureEmail).toHaveBeenCalledWith(
        'owner@test.com',
        'Test Store',
        'John',
        7
      );
    });

    it('should send day -3 email when 3 days remaining', async () => {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      const merchantWith3Days = {
        ...mockMerchant,
        trialExpiresAt: threeDaysFromNow,
      };
      
      vi.mocked(prisma.merchantAiSubscription.findMany).mockResolvedValue([merchantWith3Days]);
      
      await processTrialNurtureCampaign();
      
      expect(sendTrialNurtureEmail).toHaveBeenCalledWith(
        'owner@test.com',
        'Test Store',
        'John',
        3
      );
    });

    it('should send day -1 email when 1 day remaining', async () => {
      const oneDayFromNow = new Date();
      oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
      
      const merchantWith1Day = {
        ...mockMerchant,
        trialExpiresAt: oneDayFromNow,
      };
      
      vi.mocked(prisma.merchantAiSubscription.findMany).mockResolvedValue([merchantWith1Day]);
      
      await processTrialNurtureCampaign();
      
      expect(sendTrialNurtureEmail).toHaveBeenCalledWith(
        'owner@test.com',
        'Test Store',
        'John',
        1
      );
    });

    it('should not send email if days remaining does not match sequence', async () => {
      const fiveDaysFromNow = new Date();
      fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
      
      const merchantWith5Days = {
        ...mockMerchant,
        trialExpiresAt: fiveDaysFromNow,
      };
      
      vi.mocked(prisma.merchantAiSubscription.findMany).mockResolvedValue([merchantWith5Days]);
      
      await processTrialNurtureCampaign();
      
      expect(sendTrialNurtureEmail).not.toHaveBeenCalled();
    });

    it('should skip merchant if no owner found', async () => {
      const merchantWithoutOwner = {
        ...mockMerchant,
        store: {
          ...mockMerchant.store,
          memberships: [],
        },
      };
      
      vi.mocked(prisma.merchantAiSubscription.findMany).mockResolvedValue([merchantWithoutOwner]);
      
      await processTrialNurtureCampaign();
      
      expect(sendTrialNurtureEmail).not.toHaveBeenCalled();
    });

    it('should continue processing other merchants if one fails', async () => {
      const merchant1 = {
        ...mockMerchant,
        id: 'merchant-1',
        trialExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      };
      
      const merchant2 = {
        ...mockMerchant,
        id: 'merchant-2',
        trialExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      };
      
      vi.mocked(prisma.merchantAiSubscription.findMany).mockResolvedValue([merchant1, merchant2]);
      vi.mocked(sendTrialNurtureEmail)
        .mockRejectedValueOnce(new Error('Email service unavailable'))
        .mockResolvedValueOnce(undefined);
      
      await processTrialNurtureCampaign();
      
      expect(sendTrialNurtureEmail).toHaveBeenCalledTimes(2);
    });

    it('should process multiple merchants in single batch', async () => {
      const merchants = [
        {
          ...mockMerchant,
          id: 'merchant-1',
          trialExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        {
          ...mockMerchant,
          id: 'merchant-2',
          trialExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
        {
          ...mockMerchant,
          id: 'merchant-3',
          trialExpiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        },
      ];
      
      vi.mocked(prisma.merchantAiSubscription.findMany).mockResolvedValue(merchants);
      
      await processTrialNurtureCampaign();
      
      expect(sendTrialNurtureEmail).toHaveBeenCalledTimes(3);
      expect(sendTrialNurtureEmail).toHaveBeenNthCalledWith(1, expect.anything(), expect.anything(), expect.anything(), 7);
      expect(sendTrialNurtureEmail).toHaveBeenNthCalledWith(2, expect.anything(), expect.anything(), expect.anything(), 3);
      expect(sendTrialNurtureEmail).toHaveBeenNthCalledWith(3, expect.anything(), expect.anything(), expect.anything(), 1);
    });
  });

  describe('runTrialNurtureWorker', () => {
    it('should execute campaign successfully', async () => {
      vi.mocked(prisma.merchantAiSubscription.findMany).mockResolvedValue([]);
      
      await expect(runTrialNurtureWorker()).resolves.not.toThrow();
      
      expect(prisma.merchantAiSubscription.findMany).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(prisma.merchantAiSubscription.findMany).mockRejectedValue(
        new Error('Database connection failed')
      );
      
      await expect(runTrialNurtureWorker()).rejects.toThrow('Database connection failed');
    });
  });
});
