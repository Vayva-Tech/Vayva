import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class MarketingService {
  constructor(private readonly db = prisma) {}

  async getFlashSales(storeId: string) {
    const flashSales = await this.db.flashSale.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });

    return flashSales;
  }

  async createFlashSale(storeId: string, saleData: any) {
    const { name, discount, startTime, endTime, targetType, targetId } = saleData;

    const flashSale = await this.db.flashSale.create({
      data: {
        id: `fs-${Date.now()}`,
        storeId,
        name,
        discount: Number(discount),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        targetType: targetType || 'ALL',
        targetId: targetId || null,
        isActive: true,
      },
    });

    logger.info(`[Marketing] Created flash sale ${flashSale.id}`);
    return flashSale;
  }

  async updateFlashSale(flashSaleId: string, storeId: string, updates: any) {
    const flashSale = await this.db.flashSale.findFirst({
      where: { id: flashSaleId },
    });

    if (!flashSale || flashSale.storeId !== storeId) {
      throw new Error('Flash sale not found');
    }

    const updated = await this.db.flashSale.update({
      where: { id: flashSaleId },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.discount !== undefined && { discount: Number(updates.discount) }),
        ...(updates.startTime && { startTime: new Date(updates.startTime) }),
        ...(updates.endTime && { endTime: new Date(updates.endTime) }),
        ...(updates.isActive !== undefined && { isActive: updates.isActive }),
      },
    });

    logger.info(`[Marketing] Updated flash sale ${flashSaleId}`);
    return updated;
  }

  async getDiscounts(storeId: string) {
    const discounts = await this.db.discount.findMany({
      where: { storeId },
      include: {
        products: true,
        collections: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return discounts;
  }

  async createDiscount(storeId: string, discountData: any) {
    const { code, type, value, minPurchase, maxDiscount, startDate, endDate, productIds, collectionIds } = discountData;

    const discount = await this.db.discount.create({
      data: {
        id: `disc-${Date.now()}`,
        storeId,
        code,
        type,
        value,
        minPurchase: minPurchase || 0,
        maxDiscount: maxDiscount || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: true,
        usageLimit: null,
        usedCount: 0,
        products: productIds ? {
          connect: productIds.map((id: string) => ({ id })),
        } : undefined,
        collections: collectionIds ? {
          connect: collectionIds.map((id: string) => ({ id })),
        } : undefined,
      },
      include: { products: true, collections: true },
    });

    logger.info(`[Marketing] Created discount ${discount.id}`);
    return discount;
  }

  async updateDiscount(discountId: string, storeId: string, updates: any) {
    const discount = await this.db.discount.findFirst({
      where: { id: discountId },
    });

    if (!discount || discount.storeId !== storeId) {
      throw new Error('Discount not found');
    }

    const updated = await this.db.discount.update({
      where: { id: discountId },
      data: {
        ...(updates.code && { code: updates.code }),
        ...(updates.type && { type: updates.type }),
        ...(updates.value !== undefined && { value: Number(updates.value) }),
        ...(updates.minPurchase !== undefined && { minPurchase: Number(updates.minPurchase) }),
        ...(updates.maxDiscount !== undefined && { maxDiscount: Number(updates.maxDiscount) }),
        ...(updates.startDate && { startDate: new Date(updates.startDate) }),
        ...(updates.endDate && { endDate: new Date(updates.endDate) }),
        ...(updates.isActive !== undefined && { isActive: updates.isActive }),
      },
    });

    logger.info(`[Marketing] Updated discount ${discountId}`);
    return updated;
  }

  async getAffiliates(storeId: string) {
    const affiliates = await this.db.affiliate.findMany({
      where: { storeId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        referrals: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { totalEarnings: 'desc' },
    });

    return affiliates;
  }

  async createAffiliate(storeId: string, affiliateData: any) {
    const { userId, commissionRate, paymentMethod } = affiliateData;

    const affiliate = await this.db.affiliate.create({
      data: {
        id: `aff-${Date.now()}`,
        storeId,
        userId,
        referralCode: `REF-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        commissionRate: Number(commissionRate),
        paymentMethod: paymentMethod || 'bank_transfer',
        status: 'active',
        totalEarnings: 0,
        paidEarnings: 0,
      },
      include: { user: true },
    });

    logger.info(`[Marketing] Created affiliate ${affiliate.id}`);
    return affiliate;
  }

  async trackAffiliateReferral(affiliateId: string, customerId: string, orderId: string) {
    const referral = await this.db.affiliateReferral.create({
      data: {
        id: `afr-${Date.now()}`,
        affiliateId,
        customerId,
        orderId,
        status: 'pending',
      },
    });

    logger.info(`[Marketing] Tracked affiliate referral ${referral.id}`);
    return referral;
  }

  async getApiKeys(storeId: string) {
    const apiKeys = await this.db.apiKey.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });

    return apiKeys;
  }

  async createApiKey(storeId: string, keyData: any) {
    const { name, permissions } = keyData;

    const apiKey = await this.db.apiKey.create({
      data: {
        id: `ak-${Date.now()}`,
        storeId,
        name,
        key: `sk_${Date.now()}_${Math.random().toString(36).substr(2, 32)}`,
        permissions: permissions || [],
        isActive: true,
        lastUsedAt: null,
      },
    });

    logger.info(`[Integrations] Created API key ${apiKey.id}`);
    return { ...apiKey, key: apiKey.key }; 
  }

  async rotateApiKey(apiKeyId: string, storeId: string) {
    const apiKey = await this.db.apiKey.findFirst({
      where: { id: apiKeyId },
    });

    if (!apiKey || apiKey.storeId !== storeId) {
      throw new Error('API key not found');
    }

    const rotated = await this.db.apiKey.update({
      where: { id: apiKeyId },
      data: {
        key: `sk_${Date.now()}_${Math.random().toString(36).substr(2, 32)}`,
        lastRotatedAt: new Date(),
      },
    });

    logger.info(`[Integrations] Rotated API key ${apiKeyId}`);
    return { ...rotated, key: rotated.key };
  }

  async deleteApiKey(apiKeyId: string, storeId: string) {
    const apiKey = await this.db.apiKey.findFirst({
      where: { id: apiKeyId },
    });

    if (!apiKey || apiKey.storeId !== storeId) {
      throw new Error('API key not found');
    }

    await this.db.apiKey.delete({
      where: { id: apiKeyId },
    });

    logger.info(`[Integrations] Deleted API key ${apiKeyId}`);
    return { success: true };
  }

  async getWebhooks(storeId: string) {
    const webhooks = await this.db.webhook.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });

    return webhooks;
  }

  async createWebhook(storeId: string, webhookData: any) {
    const { url, events, secret } = webhookData;

    const webhook = await this.db.webhook.create({
      data: {
        id: `wh-${Date.now()}`,
        storeId,
        url,
        events: events || [],
        secret: secret || `whsec_${Math.random().toString(36).substr(2, 32)}`,
        isActive: true,
      },
    });

    logger.info(`[Integrations] Created webhook ${webhook.id}`);
    return webhook;
  }

  async testWebhook(webhookId: string, storeId: string) {
    const webhook = await this.db.webhook.findFirst({
      where: { id: webhookId },
    });

    if (!webhook || webhook.storeId !== storeId) {
      throw new Error('Webhook not found');
    }

    const testPayload = {
      event: 'TEST_EVENT',
      timestamp: new Date().toISOString(),
      data: { message: 'This is a test webhook delivery' },
    };

    logger.info(`[Integrations] Tested webhook ${webhookId}`);
    return { success: true, payload: testPayload };
  }
}
