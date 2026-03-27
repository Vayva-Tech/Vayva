import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class RetailService {
  constructor(private readonly db = prisma) {}

  async getGiftCards(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.status) where.status = filters.status;

    const [giftCards, total] = await Promise.all([
      this.db.giftCard.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: 'desc' },
        include: {
          issuedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.db.giftCard.count({ where }),
    ]);

    return { giftCards, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async issueGiftCard(storeId: string, giftCardData: any) {
    const {
      amount,
      recipientName,
      recipientEmail,
      message,
      expiryDate,
      sendImmediately,
    } = giftCardData;

    const code = `GC-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    const giftCard = await this.db.giftCard.create({
      data: {
        id: `gc-${Date.now()}`,
        storeId,
        code,
        amount,
        balance: amount,
        recipientName,
        recipientEmail,
        message: message || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        status: 'active',
        issuedById: (giftCardData.issuedById as string) || null,
      },
    });

    logger.info(`[Retail] Issued gift card ${giftCard.id}`);
    return giftCard;
  }

  async redeemGiftCard(giftCardId: string, storeId: string, amount: number) {
    const giftCard = await this.db.giftCard.findFirst({
      where: { id: giftCardId, storeId },
    });

    if (!giftCard) {
      throw new Error('Gift card not found');
    }

    if (giftCard.balance < amount) {
      throw new Error('Insufficient gift card balance');
    }

    const redemption = await this.db.giftCardRedemption.create({
      data: {
        id: `gcr-${Date.now()}`,
        giftCardId,
        amount,
        redeemedAt: new Date(),
      },
    });

    await this.db.giftCard.update({
      where: { id: giftCardId },
      data: { balance: giftCard.balance - amount },
    });

    logger.info(`[Retail] Redeemed ${amount} from gift card ${giftCardId}`);
    return redemption;
  }

  async getCustomerSegments(storeId: string) {
    const segments = await this.db.customerSegment.findMany({
      where: { storeId, active: true },
      include: {
        _count: {
          select: { customers: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return segments;
  }

  async createCustomerSegment(storeId: string, segmentData: any) {
    const { name, description, criteria, benefits } = segmentData;

    const segment = await this.db.customerSegment.create({
      data: {
        id: `seg-${Date.now()}`,
        storeId,
        name,
        description: description || null,
        criteria: criteria || {},
        benefits: benefits || [],
        active: true,
      },
    });

    logger.info(`[Retail] Created customer segment ${segment.id}`);
    return segment;
  }

  async getLoyaltyTiers(storeId: string) {
    const tiers = await this.db.loyaltyTier.findMany({
      where: { storeId, active: true },
      orderBy: { requiredPoints: 'asc' },
    });

    return tiers;
  }

  async getLoyaltyPointsTransactions(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.type) where.type = filters.type;

    const [transactions, total] = await Promise.all([
      this.db.loyaltyPointsTransaction.findMany({
        where,
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.loyaltyPointsTransaction.count({ where }),
    ]);

    return { transactions, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async awardLoyaltyPoints(storeId: string, transactionData: any) {
    const { customerId, points, reason, orderId } = transactionData;

    const transaction = await this.db.loyaltyPointsTransaction.create({
      data: {
        id: `lpt-${Date.now()}`,
        storeId,
        customerId,
        type: 'EARN',
        points,
        reason: reason || null,
        orderId: orderId || null,
        balanceAfter: 0,
      },
    });

    // Update customer points
    const customer = await this.db.customer.findUnique({
      where: { id: customerId },
    });

    if (customer) {
      await this.db.customer.update({
        where: { id: customerId },
        data: {
          loyaltyPoints: (customer.loyaltyPoints || 0) + points,
        },
      });

      await this.db.loyaltyPointsTransaction.update({
        where: { id: transaction.id },
        data: { balanceAfter: (customer.loyaltyPoints || 0) + points },
      });
    }

    logger.info(`[Retail] Awarded ${points} points to customer ${customerId}`);
    return transaction;
  }

  async getStores(storeId: string) {
    const stores = await this.db.retailStore.findMany({
      where: { merchantId: storeId, active: true },
      include: {
        _count: {
          select: { orders: true, customers: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return stores;
  }

  async createStore(storeId: string, storeData: any) {
    const {
      name,
      address,
      city,
      state,
      zipCode,
      phone,
      manager,
      operatingHours,
    } = storeData;

    const store = await this.db.retailStore.create({
      data: {
        id: `store-${Date.now()}`,
        merchantId: storeId,
        name,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        phone: phone || null,
        manager: manager || null,
        operatingHours: operatingHours || {},
        active: true,
      },
    });

    logger.info(`[Retail] Created store ${store.id}`);
    return store;
  }

  async getStorePerformance(storeId: string, storeFilterId: string) {
    const [totalOrders, totalRevenue, totalCustomers] = await Promise.all([
      this.db.order.count({
        where: { storeId: storeFilterId },
      }),
      this.db.order.aggregate({
        where: { storeId: storeFilterId },
        _sum: { totalAmount: true },
      }),
      this.db.customer.count({
        where: { storeId: storeFilterId },
      }),
    ]);

    return {
      orders: totalOrders,
      revenue: totalRevenue._sum.totalAmount || 0,
      customers: totalCustomers,
    };
  }

  async getRetailStats(storeId: string) {
    const [
      totalStores,
      totalCustomers,
      totalOrders,
      totalRevenue,
      giftCardsIssued,
      giftCardsRedeemed,
    ] = await Promise.all([
      this.db.retailStore.count({ where: { merchantId: storeId } }),
      this.db.customer.count({ where: { storeId } }),
      this.db.order.count({ where: { storeId } }),
      this.db.order.aggregate({
        where: { storeId },
        _sum: { totalAmount: true },
      }),
      this.db.giftCard.count({ where: { storeId } }),
      this.db.giftCardRedemption.count({
        where: { giftCard: { storeId } },
      }),
    ]);

    return {
      stores: { total: totalStores },
      customers: { total: totalCustomers },
      orders: { total: totalOrders, revenue: totalRevenue._sum.totalAmount || 0 },
      giftCards: { issued: giftCardsIssued, redeemed: giftCardsRedeemed },
    };
  }
}
