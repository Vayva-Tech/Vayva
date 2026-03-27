import { prisma } from '@vayva/db';
import { AccommodationType, Prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class PropertyService {
  constructor(private readonly db = prisma) {}

  /**
   * Get all properties for a store
   */
  async findAll(storeId: string, filters: any) {
    const limit = Math.min(filters.limit || 50, 100);
    const offset = filters.offset || 0;
    const status = filters.status || null;
    const type = filters.type || null;

    const whereProduct: Prisma.ProductWhereInput = {
      storeId,
      ...(status ? { status: status as 'DRAFT' | 'PENDING' | 'ACTIVE' | 'ARCHIVED' } : {}),
    };

    const whereAccommodation: Prisma.AccommodationProductWhereInput = {
      product: whereProduct,
      ...(type ? { type: type as AccommodationType } : {}),
    };

    const [accommodations, total] = await Promise.all([
      this.db.accommodationProduct.findMany({
        where: whereAccommodation,
        include: {
          product: true,
        },
        orderBy: {
          product: { createdAt: 'desc' },
        },
        take: limit,
        skip: offset,
      }),
      this.db.accommodationProduct.count({
        where: whereAccommodation,
      }),
    ]);

    return {
      data: accommodations,
      meta: {
        total,
        limit,
        offset,
      },
    };
  }

  /**
   * Get a single property by ID
   */
  async findOne(propertyId: string, storeId: string) {
    const accommodation = await this.db.accommodationProduct.findFirst({
      where: {
        productId: propertyId,
        product: {
          storeId,
        },
      },
      include: {
        product: true,
      },
    });

    if (!accommodation) {
      throw new Error('Property not found');
    }

    return accommodation;
  }

  /**
   * Create a new property (Product + AccommodationProduct)
   */
  async create(storeId: string, userId: string, data: any) {
    const {
      title,
      description,
      price,
      type,
      maxGuests,
      bedCount,
      bathrooms,
      totalUnits,
      amenities,
    } = data;

    const result = await this.db.$transaction(async (tx) => {
      // 1. Create Base Product
      const product = await tx.product.create({
        data: {
          storeId,
          title: title || 'Untitled Property',
          handle:
            String(title || '')
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '') || `property-${Date.now()}`,
          description: description || null,
          price: price ? parseFloat(String(price)) : 0,
          productType: 'ACCOMMODATION',
          status: 'ACTIVE',
        },
      });

      // 2. Create Accommodation Detail
      const accommodation = await tx.accommodationProduct.create({
        data: {
          productId: product.id,
          type: (type as AccommodationType) || 'ROOM',
          maxGuests: Number(maxGuests) || 1,
          bedCount: Number(bedCount) || 1,
          bathrooms: Number(bathrooms) || 1,
          totalUnits: Number(totalUnits) || 1,
          amenities: Array.isArray(amenities) ? amenities : [],
        },
      });

      return { product, accommodation };
    });

    logger.info(`[Property] Created property ${result.product.id}`);
    return result;
  }

  /**
   * Update a property
   */
  async update(propertyId: string, storeId: string, userId: string, data: any) {
    const existing = await this.db.accommodationProduct.findFirst({
      where: {
        productId: propertyId,
        product: {
          storeId,
        },
      },
    });

    if (!existing) {
      throw new Error('Property not found');
    }

    const {
      title,
      description,
      price,
      type,
      maxGuests,
      bedCount,
      bathrooms,
      totalUnits,
      amenities,
    } = data;

    const result = await this.db.$transaction(async (tx) => {
      // Update Product
      const product = await tx.product.update({
        where: { id: propertyId },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(price !== undefined && { price: parseFloat(String(price)) }),
        },
      });

      // Update Accommodation
      const accommodation = await tx.accommodationProduct.update({
        where: { productId: propertyId },
        data: {
          ...(type && { type: type as AccommodationType }),
          ...(maxGuests !== undefined && { maxGuests: Number(maxGuests) }),
          ...(bedCount !== undefined && { bedCount: Number(bedCount) }),
          ...(bathrooms !== undefined && { bathrooms: Number(bathrooms) }),
          ...(totalUnits !== undefined && { totalUnits: Number(totalUnits) }),
          ...(amenities !== undefined && { amenities: Array.isArray(amenities) ? amenities : [] }),
        },
      });

      return { product, accommodation };
    });

    logger.info(`[Property] Updated property ${propertyId}`);
    return result;
  }

  /**
   * Delete a property
   */
  async delete(propertyId: string, storeId: string) {
    const existing = await this.db.accommodationProduct.findFirst({
      where: {
        productId: propertyId,
        product: {
          storeId,
        },
      },
    });

    if (!existing) {
      throw new Error('Property not found');
    }

    await this.db.$transaction(async (tx) => {
      await tx.accommodationProduct.delete({
        where: { productId: propertyId },
      });
      await tx.product.delete({
        where: { id: propertyId },
      });
    });

    logger.info(`[Property] Deleted property ${propertyId}`);
  }

  /**
   * Get property viewings/bookings
   */
  async getViewings(storeId: string, propertyId?: string) {
    const where: any = {
      storeId,
      service: {
        productType: 'ACCOMMODATION',
      },
    };

    if (propertyId) {
      where.serviceId = propertyId;
    }

    const viewings = await this.db.booking.findMany({
      where,
      include: {
        service: true,
        customer: true,
      },
      orderBy: {
        startsAt: 'desc',
      },
    });

    return viewings;
  }

  /**
   * Schedule a property viewing
   */
  async scheduleViewing(storeId: string, userId: string, data: any) {
    const { propertyId, customerId, startsAt, endsAt, notes } = data;

    const property = await this.db.accommodationProduct.findFirst({
      where: {
        productId: propertyId,
        product: {
          storeId,
          status: 'ACTIVE',
        },
      },
    });

    if (!property) {
      throw new Error('Property not found or inactive');
    }

    const viewing = await this.db.booking.create({
      data: {
        storeId,
        serviceId: propertyId,
        customerId: customerId || null,
        startsAt: new Date(startsAt),
        endsAt: endsAt ? new Date(endsAt) : null,
        status: 'CONFIRMED',
        notes: notes || '',
        metadata: {
          type: 'property_viewing',
          source: 'dashboard',
        },
      },
      include: {
        service: true,
        customer: true,
      },
    });

    logger.info(`[Property] Scheduled viewing ${viewing.id} for property ${propertyId}`);
    return viewing;
  }

  /**
   * Real Estate Leads Management
   */
  async getRealEstateLeads(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 100);
    const where: any = { merchantId: storeId };

    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.source) where.source = filters.source;
    if (filters.agentId) where.agentId = filters.agentId;

    const [leads, total] = await Promise.all([
      this.db.realEstateLead.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          agent: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.db.realEstateLead.count({ where }),
    ]);

    return {
      leads,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createRealEstateLead(storeId: string, userId: string, leadData: any) {
    const {
      firstName,
      lastName,
      email,
      phone,
      type,
      source,
      budgetMin,
      budgetMax,
      preferredLocations,
      propertyTypes,
      bedrooms,
      bathrooms,
      timeline,
      preApproved,
      preApprovalAmount,
      notes,
      tags,
    } = leadData;

    if (!firstName || !lastName || !email) {
      throw new Error('First name, last name, and email are required');
    }

    const lead = await this.db.realEstateLead.create({
      data: {
        merchantId: storeId,
        agentId: userId,
        firstName,
        lastName,
        email,
        phone,
        type: type || 'buyer',
        status: 'new',
        source: source || 'website',
        budgetMin,
        budgetMax,
        preferredLocations: preferredLocations || [],
        propertyTypes: propertyTypes || [],
        bedrooms,
        bathrooms,
        timeline,
        preApproved: preApproved || false,
        preApprovalAmount,
        notes,
        tags: tags || [],
      },
    });

    logger.info(`[Property] Created real estate lead ${lead.id}`);
    return lead;
  }

  async getRealEstateLead(leadId: string, storeId: string) {
    const lead = await this.db.realEstateLead.findFirst({
      where: { id: leadId, merchantId: storeId },
      include: {
        agent: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    return lead;
  }

  async updateRealEstateLead(leadId: string, storeId: string, updates: any) {
    const lead = await this.db.realEstateLead.findFirst({
      where: { id: leadId, merchantId: storeId },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    const updated = await this.db.realEstateLead.update({
      where: { id: leadId },
      data: updates,
    });

    logger.info(`[Property] Updated real estate lead ${leadId}`);
    return updated;
  }

  async convertRealEstateLead(leadId: string, storeId: string, customerId?: string) {
    const lead = await this.db.realEstateLead.findFirst({
      where: { id: leadId, merchantId: storeId },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    const updated = await this.db.realEstateLead.update({
      where: { id: leadId },
      data: {
        status: 'converted',
        customerId: customerId || null,
      },
    });

    logger.info(`[Property] Converted lead ${leadId} to customer`);
    return updated;
  }

  async scoreRealEstateLead(leadId: string, storeId: string, score: number) {
    const lead = await this.db.realEstateLead.findFirst({
      where: { id: leadId, merchantId: storeId },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    const updated = await this.db.realEstateLead.update({
      where: { id: leadId },
      data: {
        leadScore: Math.min(Math.max(score, 0), 100),
      },
    });

    logger.info(`[Property] Scored lead ${leadId} with ${score}`);
    return updated;
  }

  async getLeadPipeline(storeId: string) {
    const pipelineData = await this.db.realEstateLead.groupBy({
      by: ['status'],
      where: { merchantId: storeId },
      _count: true,
    });

    const sourceBreakdown = await this.db.realEstateLead.groupBy({
      by: ['source'],
      where: { merchantId: storeId },
      _count: true,
    });

    const typeBreakdown = await this.db.realEstateLead.groupBy({
      by: ['type'],
      where: { merchantId: storeId },
      _count: true,
    });

    return {
      byStatus: pipelineData,
      bySource: sourceBreakdown,
      byType: typeBreakdown,
    };
  }

  /**
   * Real Estate Transactions
   */
  async getRealEstateTransactions(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 100);
    const where: any = { storeId };

    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;

    const [transactions, total] = await Promise.all([
      this.db.realEstateTransaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.realEstateTransaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createRealEstateTransaction(storeId: string, transactionData: any) {
    const {
      propertyId,
      buyerId,
      sellerId,
      type,
      price,
      status,
      closingDate,
      notes,
    } = transactionData;

    const transaction = await this.db.realEstateTransaction.create({
      data: {
        storeId,
        propertyId,
        buyerId,
        sellerId,
        type: type || 'sale',
        price: parseFloat(String(price)),
        status: status || 'pending',
        closingDate: closingDate ? new Date(closingDate) : null,
        notes: notes || null,
      },
    });

    logger.info(`[Property] Created real estate transaction ${transaction.id}`);
    return transaction;
  }

  async getRealEstateTransaction(transactionId: string, storeId: string) {
    const transaction = await this.db.realEstateTransaction.findFirst({
      where: { id: transactionId, storeId },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return transaction;
  }

  async updateRealEstateTransaction(transactionId: string, storeId: string, updates: any) {
    const transaction = await this.db.realEstateTransaction.findFirst({
      where: { id: transactionId, storeId },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const updated = await this.db.realEstateTransaction.update({
      where: { id: transactionId },
      data: updates,
    });

    logger.info(`[Property] Updated real estate transaction ${transactionId}`);
    return updated;
  }

  async deleteRealEstateTransaction(transactionId: string, storeId: string) {
    const transaction = await this.db.realEstateTransaction.findFirst({
      where: { id: transactionId, storeId },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    await this.db.realEstateTransaction.delete({
      where: { id: transactionId },
    });

    logger.info(`[Property] Deleted real estate transaction ${transactionId}`);
    return { success: true };
  }

  async addTransactionMilestone(transactionId: string, storeId: string, milestoneData: any) {
    const transaction = await this.db.realEstateTransaction.findFirst({
      where: { id: transactionId, storeId },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const milestone = await this.db.realEstateTransactionMilestone.create({
      data: {
        transactionId,
        ...milestoneData,
      },
    });

    logger.info(`[Property] Added milestone ${milestone.id} to transaction ${transactionId}`);
    return milestone;
  }

  /**
   * Comparative Market Analysis (CMA)
   */
  async getCMAReports(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);

    const [reports, total] = await Promise.all([
      this.db.cmaReport.findMany({
        where: { storeId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            select: {
              title: true,
              address: true,
            },
          },
        },
      }),
      this.db.cmaReport.count({ where: { storeId } }),
    ]);

    return {
      reports,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createCMAReport(storeId: string, reportData: any) {
    const { propertyId, address, comparables, adjustments, suggestedPrice, notes } = reportData;

    const report = await this.db.cmaReport.create({
      data: {
        storeId,
        propertyId: propertyId || null,
        address,
        comparables: comparables || [],
        adjustments: adjustments || {},
        suggestedPrice: parseFloat(String(suggestedPrice)),
        notes: notes || null,
      },
    });

    logger.info(`[Property] Created CMA report ${report.id}`);
    return report;
  }

  async getCMAReport(reportId: string, storeId: string) {
    const report = await this.db.cmaReport.findUnique({
      where: { id: reportId },
      include: {
        property: {
          select: {
            title: true,
            address: true,
          },
        },
      },
    });

    if (!report || report.storeId !== storeId) {
      throw new Error('CMA report not found');
    }

    return report;
  }

  async deleteCMAReport(reportId: string, storeId: string) {
    const report = await this.db.cmaReport.findUnique({
      where: { id: reportId },
    });

    if (!report || report.storeId !== storeId) {
      throw new Error('CMA report not found');
    }

    await this.db.cmaReport.delete({
      where: { id: reportId },
    });

    logger.info(`[Property] Deleted CMA report ${reportId}`);
    return { success: true };
  }

  async generateCMA(storeId: string, data: any) {
    const { subjectProperty, comparableProperties, adjustments } = data;

    // Simple CMA calculation logic
    const adjustedPrices = comparableProperties.map((comp: any) => {
      let adjustedPrice = comp.salePrice;
      if (adjustments) {
        Object.keys(adjustments).forEach((key) => {
          if (comp[key] !== undefined) {
            adjustedPrice += adjustments[key] * (comp[key] - subjectProperty[key]);
          }
        });
      }
      return adjustedPrice;
    });

    const avgPrice = adjustedPrices.reduce((sum: number, price: number) => sum + price, 0) / adjustedPrices.length;

    return {
      subjectProperty,
      comparables: comparableProperties,
      adjustedPrices,
      averagePrice: Math.round(avgPrice),
      suggestedListPrice: Math.round(avgPrice * 0.99),
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Real Estate Agents
   */
  async getRealEstateAgents(storeId: string) {
    const agents = await this.db.user.findMany({
      where: {
        stores: {
          some: {
            id: storeId,
          },
        },
        role: 'AGENT',
      },
      include: {
        _count: {
          select: {
            realEstateLeads: true,
            realEstateTransactions: true,
          },
        },
      },
    });

    return agents.map((agent) => ({
      ...agent,
      leadCount: agent._count.realEstateLeads,
      transactionCount: agent._count.realEstateTransactions,
    }));
  }

  async getAgentPerformance(agentId: string, storeId: string) {
    const [leadStats, totalSales, avgSalePrice] = await Promise.all([
      this.db.realEstateLead.groupBy({
        by: ['status'],
        where: { agentId, merchantId: storeId },
        _count: true,
      }),
      this.db.realEstateTransaction.count({
        where: { storeId },
      }),
      this.db.realEstateTransaction.aggregate({
        where: { storeId },
        _avg: { price: true },
      }),
    ]);

    return {
      agentId,
      leadStats,
      totalTransactions: totalSales,
      averageSalePrice: Math.round(avgSalePrice._avg.price || 0),
    };
  }
}
