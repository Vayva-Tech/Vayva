/**
 * Integration Tests for Customer Experience & Marketing APIs
 * Tests for Referral System, WhatsApp Broadcast, and Virtual Try-On
 */

import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { getReferralService } from '@/services/referral';
import { getWhatsAppBroadcastService } from '@/services/whatsapp-broadcast';
import { getVirtualTryOnService } from '@/services/virtual-try-on';

// Mock Prisma for testing
vi.mock('@vayva/db', () => ({
  PrismaClient: vi.fn(() => ({
    referralProgram: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    referralCode: {
      create: vi.fn(),
      upsert: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    referralConversion: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    referralPayout: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    customer: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    store: {
      findUnique: vi.fn(),
    },
    whatsAppTemplate: {
      create: vi.fn(),
      upsert: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      updateMany: vi.fn(),
    },
    whatsAppBroadcast: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    whatsAppBroadcastRecipient: {
      createMany: vi.fn(),
      findMany: vi.fn(),
    },
    customerSegment: {
      findUnique: vi.fn(),
    },
    virtualTryOnAsset: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    tryOnSession: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
    },
  })),
}));

describe('Referral System Integration', () => {
  let service: ReturnType<typeof getReferralService>;

  beforeEach(() => {
    service = getReferralService();
  });

  describe('Program Management', () => {
    it('should create or update a referral program', async () => {
      const mockProgram = {
        id: 'prog-123',
        storeId: 'store-123',
        name: 'Test Program',
        rewardType: 'percentage' as const,
        rewardValue: 10,
        isActive: true,
      };

      // Mock the prisma response
      const { prisma } = await import('@vayva/db');
      (prisma.referralProgram.upsert as any).mockResolvedValue(mockProgram);

      const result = await service.createOrUpdateProgram('store-123', {
        name: 'Test Program',
        rewardType: 'percentage',
        rewardValue: 10,
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Program');
    });

    it('should get referral analytics', async () => {
      const { prisma } = await import('@vayva/db');
      (prisma.referralCode.findMany as any).mockResolvedValue([
        { clicks: 10, signups: 5, conversions: 2, rewardsEarned: 100 },
      ]);
      (prisma.referralConversion.findMany as any).mockResolvedValue([
        { orderAmount: 500 },
        { orderAmount: 300 },
      ]);
      (prisma.referralPayout.findMany as any).mockResolvedValue([
        { amount: 50 },
      ]);

      const analytics = await service.getReferralAnalytics('store-123');

      expect(analytics).toBeDefined();
      expect(analytics.totalCodes).toBe(1);
      expect(analytics.totalClicks).toBe(10);
      expect(analytics.totalConversions).toBe(2);
    });
  });

  describe('Referral Codes', () => {
    it('should generate a unique referral code', async () => {
      const { prisma } = await import('@vayva/db');
      (prisma.referralCode.findFirst as any).mockResolvedValue(null);
      (prisma.store.findUnique as any).mockResolvedValue({ slug: 'test-store' });
      (prisma.referralCode.create as any).mockResolvedValue({
        id: 'code-123',
        code: 'ABC123',
        link: 'https://test-store.vayva.ng/ref/ABC123',
      });

      const code = await service.generateReferralCode('prog-123', 'cust-123', 'test-store');

      expect(code).toBeDefined();
      expect(code.code).toHaveLength(6);
    });

    it('should track referral clicks', async () => {
      const { prisma } = await import('@vayva/db');
      (prisma.referralCode.findFirst as any).mockResolvedValue({
        id: 'code-123',
        code: 'ABC123',
        clicks: 5,
      });
      (prisma.referralCode.update as any).mockResolvedValue({
        id: 'code-123',
        clicks: 6,
      });

      await service.trackReferralClick('ABC123');

      expect(prisma.referralCode.update).toHaveBeenCalled();
    });
  });

  describe('Payouts', () => {
    it('should request a payout', async () => {
      const { prisma } = await import('@vayva/db');
      (prisma.referralCode.findMany as any).mockResolvedValue([
        { id: 'code-1', rewardsEarned: 1000, rewardsPaid: 0 },
      ]);
      (prisma.referralPayout.create as any).mockResolvedValue({
        id: 'payout-123',
        amount: 1000,
        status: 'pending',
      });

      const payout = await service.requestPayout('cust-123', 'store-123', {
        paymentMethod: 'wallet',
      });

      expect(payout).toBeDefined();
      expect(payout.amount).toBe(1000);
    });
  });
});

describe('WhatsApp Broadcast Integration', () => {
  let service: ReturnType<typeof getWhatsAppBroadcastService>;

  beforeEach(() => {
    service = getWhatsAppBroadcastService();
  });

  describe('Template Management', () => {
    it('should create a template', async () => {
      const { prisma } = await import('@vayva/db');
      (prisma.whatsAppTemplate.create as any).mockResolvedValue({
        id: 'template-123',
        name: 'Welcome Message',
        category: 'utility',
        content: 'Welcome!',
        isApproved: false,
        approvalStatus: 'pending',
      });

      const template = await service.createTemplate('store-123', {
        name: 'Welcome Message',
        category: 'utility',
        content: 'Welcome!',
      });

      expect(template).toBeDefined();
      expect(template.name).toBe('Welcome Message');
    });

    it('should approve a template', async () => {
      const { prisma } = await import('@vayva/db');
      (prisma.whatsAppTemplate.updateMany as any).mockResolvedValue({ count: 1 });
      (prisma.whatsAppTemplate.findFirst as any).mockResolvedValue({
        id: 'template-123',
        isApproved: true,
        approvalStatus: 'approved',
      });

      const template = await service.approveTemplate('template-123', 'store-123');

      expect(template).toBeDefined();
      expect(template?.isApproved).toBe(true);
    });
  });

  describe('Broadcast Management', () => {
    it('should create a broadcast', async () => {
      const { prisma } = await import('@vayva/db');
      (prisma.customerSegment.findUnique as any).mockResolvedValue({
        _count: { customers: 150 },
      });
      (prisma.whatsAppBroadcast.create as any).mockResolvedValue({
        id: 'broadcast-123',
        name: 'Weekend Sale',
        status: 'draft',
        totalRecipients: 150,
      });

      const broadcast = await service.createBroadcast('store-123', 'user-123', {
        name: 'Weekend Sale',
        content: 'Sale!',
        segmentId: 'segment-123',
      });

      expect(broadcast).toBeDefined();
      expect(broadcast.totalRecipients).toBe(150);
    });

    it('should get broadcast analytics', async () => {
      const { prisma } = await import('@vayva/db');
      (prisma.whatsAppBroadcast.count as any).mockResolvedValue(10);
      (prisma.whatsAppBroadcast.aggregate as any).mockResolvedValue({
        _sum: {
          sentCount: 1000,
          failedCount: 50,
          openCount: 400,
          clickCount: 120,
        },
      });

      const analytics = await service.getBroadcastAnalytics('store-123');

      expect(analytics).toBeDefined();
      expect(analytics.totalBroadcasts).toBe(10);
      expect(analytics.deliveryRate).toBe(0.95);
      expect(analytics.readRate).toBe(0.4);
    });
  });
});

describe('Virtual Try-On Integration', () => {
  let service: ReturnType<typeof getVirtualTryOnService>;

  beforeEach(() => {
    service = getVirtualTryOnService();
  });

  describe('Asset Management', () => {
    it('should create an asset', async () => {
      const { prisma } = await import('@vayva/db');
      (prisma.virtualTryOnAsset.create as any).mockResolvedValue({
        id: 'asset-123',
        name: 'Red Dress',
        assetType: 'clothing',
        status: 'pending',
      });

      const asset = await service.createAsset('store-123', {
        name: 'Red Dress',
        assetType: 'clothing',
        sourceUrl: 'https://example.com/dress.png',
      });

      expect(asset).toBeDefined();
      expect(asset.name).toBe('Red Dress');
    });

    it('should update asset status', async () => {
      const { prisma } = await import('@vayva/db');
      (prisma.virtualTryOnAsset.findFirst as any).mockResolvedValue({ id: 'asset-123' });
      (prisma.virtualTryOnAsset.update as any).mockResolvedValue({
        id: 'asset-123',
        status: 'ready',
        generatedUrl: 'https://example.com/processed.png',
      });

      const asset = await service.updateAssetStatus('asset-123', 'store-123', 'ready', {
        generatedUrl: 'https://example.com/processed.png',
      });

      expect(asset).toBeDefined();
      expect(asset?.status).toBe('ready');
    });
  });

  describe('Try-On Sessions', () => {
    it('should generate a try-on', async () => {
      const { prisma } = await import('@vayva/db');
      (prisma.virtualTryOnAsset.findFirst as any).mockResolvedValue({
        id: 'asset-123',
        status: 'ready',
      });
      (prisma.tryOnSession.create as any).mockResolvedValue({
        id: 'session-123',
        status: 'pending',
      });
      (prisma.tryOnSession.update as any).mockResolvedValue({
        id: 'session-123',
        status: 'processing',
      });

      const session = await service.generateTryOn('store-123', {
        customerId: 'cust-123',
        productAssetId: 'asset-123',
        customerPhotoUrl: 'https://example.com/photo.jpg',
      });

      expect(session).toBeDefined();
      expect(session.status).toBe('processing');
    });

    it('should get analytics', async () => {
      const { prisma } = await import('@vayva/db');
      (prisma.tryOnSession.count as any).mockResolvedValue(100);
      (prisma.tryOnSession.groupBy as any).mockResolvedValue([
        { productAssetId: 'asset-1', _count: { productAssetId: 50 } },
      ]);
      (prisma.virtualTryOnAsset.findUnique as any).mockResolvedValue({
        name: 'Blue Shirt',
        productId: 'prod-1',
      });

      const analytics = await service.getTryOnAnalytics('store-123');

      expect(analytics).toBeDefined();
      expect(analytics.totalSessions).toBe(100);
      expect(analytics.topProducts).toHaveLength(1);
    });
  });
});
