import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class CampaignsService {
  constructor(private readonly db = prisma) {}

  async getCampaigns(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 100);
    const where: any = {
      storeId,
      productType: 'CAMPAIGN',
    };

    if (filters.status) where.status = filters.status;

    const [campaigns, total] = await Promise.all([
      this.db.product.findMany({
        where,
        include: {
          productImages: { take: 1, orderBy: { position: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.db.product.count({ where }),
    ]);

    return {
      campaigns: campaigns.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        status: c.status,
        goalAmount: c.price,
        raisedAmount: c.totalSales || 0,
        imageUrl: c.productImages[0]?.url,
        createdAt: c.createdAt,
      })),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async createCampaign(storeId: string, campaignData: any) {
    const {
      title,
      description,
      goalAmount,
      startDate,
      endDate,
      category,
      tags,
    } = campaignData;

    const campaign = await this.db.product.create({
      data: {
        id: `campaign-${Date.now()}`,
        storeId,
        title,
        description: description || null,
        productType: 'CAMPAIGN',
        price: goalAmount,
        status: 'draft',
        category: category || null,
        tags: tags || [],
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        totalSales: 0,
      },
    });

    logger.info(`[Campaigns] Created campaign ${campaign.id}`);
    return campaign;
  }

  async getCampaignById(campaignId: string, storeId: string) {
    return await this.db.product.findFirst({
      where: { id: campaignId, storeId, productType: 'CAMPAIGN' },
      include: {
        productImages: true,
        variants: true,
      },
    });
  }

  async updateCampaign(campaignId: string, storeId: string, updates: any) {
    const campaign = await this.db.product.findFirst({
      where: { id: campaignId, storeId, productType: 'CAMPAIGN' },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const updated = await this.db.product.update({
      where: { id: campaignId },
      data: updates,
    });

    logger.info(`[Campaigns] Updated campaign ${campaignId}`);
    return updated;
  }

  async deleteCampaign(campaignId: string, storeId: string) {
    const campaign = await this.db.product.findFirst({
      where: { id: campaignId, storeId, productType: 'CAMPAIGN' },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    await this.db.product.delete({
      where: { id: campaignId },
    });

    logger.info(`[Campaigns] Deleted campaign ${campaignId}`);
    return { success: true };
  }

  async getCampaignStats(storeId: string) {
    const [totalCampaigns, activeCampaigns, totalRaised] = await Promise.all([
      this.db.product.count({
        where: { storeId, productType: 'CAMPAIGN' },
      }),
      this.db.product.count({
        where: { storeId, productType: 'CAMPAIGN', status: 'active' },
      }),
      this.db.product.aggregate({
        where: { storeId, productType: 'CAMPAIGN' },
        _sum: { totalSales: true },
      }),
    ]);

    return {
      total: totalCampaigns,
      active: activeCampaigns,
      totalRaised: totalRaised._sum.totalSales || 0,
    };
  }
}
