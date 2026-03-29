import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export interface CampaignFilters {
  status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  type?: 'email' | 'sms' | 'whatsapp' | 'push' | 'social';
  search?: string;
}

export class MarketingService {
  constructor(private readonly db = prisma) {}

  // ==================== Flash Sales (Existing) ====================
  async getFlashSales(storeId: string, id?: string) {
    if (id) {
      const flashSale = await this.db.flashSale.findFirst({
        where: { id, storeId },
        include: {
          products: {
            select: {
              id: true,
              title: true,
              price: true,
            },
          },
        },
      });
      return flashSale;
    }

    const flashSales = await this.db.flashSale.findMany({
      where: { storeId },
      include: {
        products: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return flashSales.map((fs) => ({
      id: fs.id,
      title: fs.title,
      description: fs.description,
      discountPercentage: Number(fs.discountPercentage),
      startDate: fs.startDate,
      endDate: fs.endDate,
      active: fs.active,
      products: fs.products,
      productCount: fs._count.products,
    }));
  }

  // ==================== Campaign Management ====================
  
  async getCampaigns(storeId: string, filters?: CampaignFilters) {
    const where: any = { storeId };
    
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const campaigns = await this.db.campaign.findMany({
      where,
      include: {
        _count: {
          select: {
            recipients: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type as any,
      status: c.status as any,
      description: c.description,
      audience: c.audience ? JSON.parse(c.audience as string) : null,
      content: c.content ? JSON.parse(c.content as string) : null,
      schedule: c.schedule ? JSON.parse(c.schedule as string) : null,
      budget: c.budget ? Number(c.budget) : null,
      recipientCount: c._count.recipients,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  async getCampaignById(id: string, storeId: string) {
    const campaign = await this.db.campaign.findFirst({
      where: { id, storeId },
      include: {
        recipients: true,
      },
    });

    if (!campaign) throw new Error('Campaign not found');

    return {
      id: campaign.id,
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      description: campaign.description,
      audience: campaign.audience ? JSON.parse(campaign.audience as string) : null,
      content: campaign.content ? JSON.parse(campaign.content as string) : null,
      schedule: campaign.schedule ? JSON.parse(campaign.schedule as string) : null,
      metrics: campaign.metrics ? JSON.parse(campaign.metrics as string) : null,
      budget: campaign.budget ? Number(campaign.budget) : null,
      recipients: campaign.recipients,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    };
  }

  async createCampaign(storeId: string, campaignData: any) {
    const campaign = await this.db.campaign.create({
      data: {
        storeId,
        name: campaignData.name,
        type: campaignData.type,
        status: campaignData.status || 'draft',
        description: campaignData.description,
        audience: campaignData.audience ? JSON.stringify(campaignData.audience) : null,
        content: campaignData.content ? JSON.stringify(campaignData.content) : null,
        schedule: campaignData.schedule ? JSON.stringify(campaignData.schedule) : null,
        budget: campaignData.budget,
      },
    });

    logger.info('[MarketingService] Campaign created', { campaignId: campaign.id });
    return campaign;
  }

  async updateCampaign(id: string, storeId: string, updates: any) {
    const data: any = {};
    
    if (updates.name) data.name = updates.name;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.status) data.status = updates.status;
    if (updates.audience) data.audience = JSON.stringify(updates.audience);
    if (updates.content) data.content = JSON.stringify(updates.content);
    if (updates.schedule) data.schedule = JSON.stringify(updates.schedule);
    if (updates.budget !== undefined) data.budget = updates.budget;

    const campaign = await this.db.campaign.update({
      where: { id, storeId },
      data,
    });

    logger.info('[MarketingService] Campaign updated', { campaignId: id });
    return campaign;
  }

  async deleteCampaign(id: string, storeId: string) {
    await this.db.campaign.delete({
      where: { id, storeId },
    });

    logger.info('[MarketingService] Campaign deleted', { campaignId: id });
  }

  async sendCampaign(id: string, storeId: string) {
    const campaign = await this.db.campaign.update({
      where: { id, storeId },
      data: { status: 'sending' },
    });

    logger.info('[MarketingService] Campaign sending triggered', { campaignId: id });
    
    // TODO: Trigger actual sending via BullMQ job
    // This would integrate with email/SMS/WhatsApp providers
    
    return campaign;
  }

  // ==================== Promotions ====================
  
  async getPromotions(storeId: string, filters?: { status?: string }) {
    const where: any = { storeId };
    if (filters?.status) where.status = filters.status;

    const promotions = await this.db.promotion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return promotions.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      status: p.status,
      description: p.description,
      discountType: p.discountType,
      discountValue: Number(p.discountValue),
      minPurchaseAmount: p.minPurchaseAmount ? Number(p.minPurchaseAmount) : null,
      maxDiscountAmount: p.maxDiscountAmount ? Number(p.maxDiscountAmount) : null,
      usageLimit: p.usageLimit,
      usedCount: p.usedCount,
      validFrom: p.validFrom,
      validUntil: p.validUntil,
      applicableProducts: p.applicableProducts ? JSON.parse(p.applicableProducts as string) : null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  async getPromotionById(id: string, storeId: string) {
    const promotion = await this.db.promotion.findFirst({
      where: { id, storeId },
    });

    if (!promotion) throw new Error('Promotion not found');

    return {
      id: promotion.id,
      name: promotion.name,
      type: promotion.type,
      status: promotion.status,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: Number(promotion.discountValue),
      minPurchaseAmount: promotion.minPurchaseAmount ? Number(promotion.minPurchaseAmount) : null,
      maxDiscountAmount: promotion.maxDiscountAmount ? Number(promotion.maxDiscountAmount) : null,
      usageLimit: promotion.usageLimit,
      usedCount: promotion.usedCount,
      validFrom: promotion.validFrom,
      validUntil: promotion.validUntil,
      applicableProducts: promotion.applicableProducts ? JSON.parse(promotion.applicableProducts as string) : null,
      usageLimits: promotion.usageLimits ? JSON.parse(promotion.usageLimits as string) : null,
      createdAt: promotion.createdAt,
      updatedAt: promotion.updatedAt,
    };
  }

  async createPromotion(storeId: string, promotionData: any) {
    const promotion = await this.db.promotion.create({
      data: {
        storeId,
        name: promotionData.name,
        type: promotionData.type,
        status: promotionData.status || 'active',
        description: promotionData.description,
        discountType: promotionData.discountType,
        discountValue: promotionData.discountValue,
        minPurchaseAmount: promotionData.minPurchaseAmount,
        maxDiscountAmount: promotionData.maxDiscountAmount,
        usageLimit: promotionData.usageLimit || null,
        usedCount: 0,
        validFrom: promotionData.validFrom,
        validUntil: promotionData.validUntil,
        applicableProducts: promotionData.applicableProducts ? JSON.stringify(promotionData.applicableProducts) : null,
        usageLimits: promotionData.usageLimits ? JSON.stringify(promotionData.usageLimits) : null,
      },
    });

    logger.info('[MarketingService] Promotion created', { promotionId: promotion.id });
    return promotion;
  }

  async updatePromotion(id: string, storeId: string, updates: any) {
    const data: any = {};
    
    if (updates.name) data.name = updates.name;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.status) data.status = updates.status;
    if (updates.discountType) data.discountType = updates.discountType;
    if (updates.discountValue !== undefined) data.discountValue = updates.discountValue;
    if (updates.minPurchaseAmount !== undefined) data.minPurchaseAmount = updates.minPurchaseAmount;
    if (updates.maxDiscountAmount !== undefined) data.maxDiscountAmount = updates.maxDiscountAmount;
    if (updates.usageLimit !== undefined) data.usageLimit = updates.usageLimit;
    if (updates.validFrom !== undefined) data.validFrom = updates.validFrom;
    if (updates.validUntil !== undefined) data.validUntil = updates.validUntil;
    if (updates.applicableProducts) data.applicableProducts = JSON.stringify(updates.applicableProducts);
    if (updates.usageLimits) data.usageLimits = JSON.stringify(updates.usageLimits);

    const promotion = await this.db.promotion.update({
      where: { id, storeId },
      data,
    });

    logger.info('[MarketingService] Promotion updated', { promotionId: id });
    return promotion;
  }

  async deletePromotion(id: string, storeId: string) {
    await this.db.promotion.delete({
      where: { id, storeId },
    });

    logger.info('[MarketingService] Promotion deleted', { promotionId: id });
  }

  // ==================== Customer Segments ====================
  
  async getSegments(storeId: string) {
    const segments = await this.db.customerSegment.findMany({
      where: { storeId },
      include: {
        _count: {
          select: {
            memberships: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return segments.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      color: s.color,
      icon: s.icon,
      criteria: s.criteria ? JSON.parse(s.criteria as string) : null,
      customerCount: s._count.memberships,
      lastCalculatedAt: s.lastCalculatedAt,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }

  async getSegmentById(id: string, storeId: string) {
    const segment = await this.db.customerSegment.findFirst({
      where: { id, storeId },
      include: {
        memberships: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!segment) throw new Error('Segment not found');

    return {
      id: segment.id,
      name: segment.name,
      description: segment.description,
      color: segment.color,
      icon: segment.icon,
      criteria: segment.criteria ? JSON.parse(segment.criteria as string) : null,
      customerCount: segment.memberships.length,
      customers: segment.memberships.map((m) => m.customer),
      lastCalculatedAt: segment.lastCalculatedAt,
      createdAt: segment.createdAt,
      updatedAt: segment.updatedAt,
    };
  }

  async createSegment(storeId: string, segmentData: any) {
    const segment = await this.db.customerSegment.create({
      data: {
        storeId,
        name: segmentData.name,
        description: segmentData.description,
        color: segmentData.color,
        icon: segmentData.icon,
        criteria: segmentData.criteria ? JSON.stringify(segmentData.criteria) : null,
      },
    });

    logger.info('[MarketingService] Segment created', { segmentId: segment.id });
    return segment;
  }

  async updateSegment(id: string, storeId: string, updates: any) {
    const data: any = {};
    
    if (updates.name) data.name = updates.name;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.color !== undefined) data.color = updates.color;
    if (updates.icon !== undefined) data.icon = updates.icon;
    if (updates.criteria) data.criteria = JSON.stringify(updates.criteria);

    const segment = await this.db.customerSegment.update({
      where: { id, storeId },
      data,
    });

    logger.info('[MarketingService] Segment updated', { segmentId: id });
    return segment;
  }
}
