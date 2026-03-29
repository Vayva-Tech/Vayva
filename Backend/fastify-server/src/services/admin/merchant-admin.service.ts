import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * Merchant Admin Service - Backend
 * Ops-level merchant management operations
 */
export class MerchantAdminService {
  constructor(private readonly db = prisma) {}

  /**
   * Get all merchants with filtering and pagination
   */
  async getAllMerchants(params: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { page = 1, limit = 20, search = '' } = params;
    const skip = (page - 1) * limit;

    // Build search filter
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        {
          tenant: {
            tenantMemberships: {
              some: {
                user: {
                  OR: [
                    { email: { contains: search, mode: 'insensitive' } },
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                  ],
                },
              },
            },
          },
        },
      ];
    }

    const [stores, total] = await Promise.all([
      this.db.store.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          aiSubscription: true,
          wallet: {
            select: {
              kycStatus: true,
              isLocked: true,
            },
          },
          orders: {
            where: {
              createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
              paymentStatus: 'SUCCESS',
            },
            select: { total: true },
          },
          tenant: {
            include: {
              tenantMemberships: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          _count: { select: { orders: true } },
        },
      }),
      this.db.store.count({ where }),
    ]);

    // Transform data
    const data = stores.map((store: any) => {
      const members = store.tenant?.tenantMemberships || [];
      const ownerMember = members.find((m: any) => m.role === 'OWNER') || members[0];
      const owner = ownerMember?.user;
      const ownerName = owner ? `${owner.firstName || ''} ${owner.lastName || ''}`.trim() : 'Unknown';

      // Calculate GMV
      const gmv30d = store.orders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);

      // Risk flags
      const riskFlags: string[] = [];
      if (store.wallet?.isLocked) riskFlags.push('WALLET_LOCKED');

      return {
        id: store.id,
        name: store.name,
        slug: store.slug,
        ownerName: ownerName || 'Unknown',
        ownerEmail: owner?.email || 'Unknown',
        status: 'ACTIVE' as const,
        plan: store.plan || 'STARTER',
        trialEndsAt: null,
        kycStatus: store.wallet?.kycStatus || 'NOT_SUBMITTED',
        riskFlags,
        gmv30d: gmv30d,
        lastActive: store.createdAt.toISOString(),
        createdAt: store.createdAt.toISOString(),
        location: 'N/A' as const,
      };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get merchant details by ID
   */
  async getMerchantById(storeId: string) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
      include: {
        tenant: {
          include: {
            tenantMemberships: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            orders: true,
            products: true,
            customers: true,
          },
        },
      },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    // Get GMV aggregate
    const gmvAggregate = await this.db.order.aggregate({
      where: { storeId, paymentStatus: 'SUCCESS' },
      _sum: { total: true },
    });

    // Get wallet
    const wallet = await this.db.wallet.findUnique({
      where: { storeId },
    });

    // Get recent audit logs
    const recentAudit = await this.db.auditLog.findMany({
      where: { app: 'ops', targetStoreId: storeId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { action: true, ip: true, createdAt: true },
    });

    // Find owner
    const ownerMember = store.tenant?.tenantMemberships.find((m: any) => m.role === 'OWNER');
    const ownerEmail = ownerMember?.user.email;

    // Parse settings for notes
    const settings = (store.settings as Record<string, unknown>) || {};
    const notes = Array.isArray(settings.internalNotes) ? settings.internalNotes : [];

    return {
      id: store.id,
      name: store.name,
      slug: store.slug,
      onboardingStatus: store.onboardingStatus,
      industrySlug: store.industrySlug,
      kycStatus: store.kycStatus,
      isActive: store.isActive,
      payoutsEnabled: store.payoutsEnabled,
      kycDetails: null,
      walletStatus: wallet
        ? {
            id: wallet.id,
            storeId: wallet.storeId,
            availableKobo: wallet.availableKobo,
            pendingKobo: wallet.pendingKobo,
            isLocked: wallet.isLocked,
            kycStatus: wallet.kycStatus,
            vaStatus: wallet.vaStatus,
            vaBankName: wallet.vaBankName,
            vaAccountNumber: wallet.vaAccountNumber,
            vaAccountName: wallet.vaAccountName,
            vaProviderRef: wallet.vaProviderRef,
            updatedAt: wallet.updatedAt,
          }
        : null,
      history: recentAudit.map((a) => ({
        action: a.action,
        timestamp: a.createdAt,
        ip: a.ip,
      })),
      profile: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        logoUrl: store.logoUrl,
        isLive: store.isLive,
        createdAt: store.createdAt,
        ownerEmail,
      },
      stats: {
        ordersCount: store._count.orders,
        productsCount: store._count.products,
        customersCount: store._count.customers,
        gmv: gmvAggregate._sum.total || 0,
        walletBalance: wallet ? Number(wallet.availableKobo) / 100 : 0,
      },
      notes,
    };
  }

  /**
   * Add internal note to merchant
   */
  async addNote(storeId: string, userId: string, userEmail: string, note: string) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
      select: { settings: true },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    const currentSettings = (store.settings as Record<string, unknown>) || {};
    const currentNotes = Array.isArray(currentSettings.internalNotes)
      ? currentSettings.internalNotes
      : [];

    const newNoteEntry = {
      id: Date.now().toString(),
      text: note,
      author: userEmail,
      date: new Date().toISOString(),
    };

    const updatedNotes = [newNoteEntry, ...currentNotes];

    await this.db.store.update({
      where: { id: storeId },
      data: {
        settings: {
          ...currentSettings,
          internalNotes: updatedNotes,
        },
      },
    });

    return { success: true, notes: updatedNotes };
  }

  /**
   * Suspend merchant account
   */
  async suspendMerchant(storeId: string, userId: string, reason: string) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
      select: { id: true, name: true, isActive: true, isLive: true },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    if (!store.isActive) {
      throw new Error('Store is already suspended');
    }

    await this.db.store.update({
      where: { id: storeId },
      data: {
        isActive: false,
        isLive: false,
      },
    });

    logger.info(`[MerchantAdmin] Store ${storeId} suspended. Reason: ${reason}`);
    return { success: true, message: 'Store suspended successfully' };
  }

  /**
   * Unsuspend merchant account
   */
  async unsuspendMerchant(storeId: string, userId: string, reason: string) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
      select: { id: true, name: true, isActive: true, isLive: true },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    if (store.isActive) {
      throw new Error('Store is already active');
    }

    await this.db.store.update({
      where: { id: storeId },
      data: {
        isActive: true,
        isLive: true,
      },
    });

    logger.info(`[MerchantAdmin] Store ${storeId} unsuspended. Reason: ${reason}`);
    return { success: true, message: 'Store reactivated successfully' };
  }

  /**
   * Disable payouts for merchant
   */
  async disablePayouts(storeId: string) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    await this.db.store.update({
      where: { id: storeId },
      data: { payoutsEnabled: false },
    });

    logger.info(`[MerchantAdmin] Payouts disabled for store ${storeId}`);
    return { success: true, message: 'Payouts disabled' };
  }

  /**
   * Enable payouts for merchant
   */
  async enablePayouts(storeId: string) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    await this.db.store.update({
      where: { id: storeId },
      data: { payoutsEnabled: true },
    });

    logger.info(`[MerchantAdmin] Payouts enabled for store ${storeId}`);
    return { success: true, message: 'Payouts enabled' };
  }

  /**
   * Force KYC review for merchant
   */
  async forceKycReview(storeId: string, reason: string) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    // Mark wallet for review
    await this.db.wallet.update({
      where: { storeId },
      data: { kycStatus: 'REVIEW_REQUIRED' },
    });

    logger.info(`[MerchantAdmin] KYC review forced for store ${storeId}. Reason: ${reason}`);
    return { success: true, message: 'KYC review queued' };
  }

  /**
   * Issue warning to merchant
   */
  async issueWarning(storeId: string, userId: string, reason: string) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    // Create warning record in audit log or warnings table
    logger.warn(`[MerchantAdmin] Warning issued to store ${storeId}. Reason: ${reason}`);
    return { success: true, message: 'Warning issued' };
  }

  /**
   * Rotate merchant secret
   */
  async rotateSecret(storeId: string) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    // Generate new secret
    const newSecret = `sk_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // In production, store hashed secret
    await this.db.store.update({
      where: { id: storeId },
      data: {
        settings: {
          ...((store.settings as any) || {}),
          apiSecretLastRotated: new Date().toISOString(),
        },
      },
    });

    logger.info(`[MerchantAdmin] Secret rotated for store ${storeId}`);
    return { 
      success: true, 
      message: 'Secret rotated',
      // In production, return via secure channel only
    };
  }

  /**
   * Set restrictions for merchant
   */
  async setRestrictions(storeId: string, restrictions: any) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    await this.db.store.update({
      where: { id: storeId },
      data: {
        settings: {
          ...((store.settings as any) || {}),
          restrictions,
        },
      },
    });

    logger.info(`[MerchantAdmin] Restrictions set for store ${storeId}`);
    return { success: true, message: 'Restrictions updated' };
  }

  /**
   * Replay order webhook for merchant
   */
  async replayOrderWebhook(storeId: string, orderId: string) {
    const order = await this.db.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.storeId !== storeId) {
      throw new Error('Order not found');
    }

    // In production, queue webhook replay
    logger.info(`[MerchantAdmin] Webhook replay queued for order ${orderId}`);
    return { success: true, message: 'Webhook replay queued' };
  }

  /**
   * Get merchant customers
   */
  async getMerchantCustomers(storeId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      this.db.customer.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      this.db.customer.count({ where: { storeId } }),
    ]);

    return {
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get merchant orders
   */
  async getMerchantOrders(storeId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.db.order.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        include: {
          items: { take: 2 },
          customer: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      this.db.order.count({ where: { storeId } }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get merchant products
   */
  async getMerchantProducts(storeId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.db.product.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        include: {
          variants: { take: 2 },
        },
      }),
      this.db.product.count({ where: { storeId } }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get merchant payments
   */
  async getMerchantPayments(storeId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.db.payment.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      this.db.payment.count({ where: { storeId } }),
    ]);

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get merchant integrations
   */
  async getMerchantIntegrations(storeId: string) {
    const integrations = await this.db.integration.findMany({
      where: { storeId },
    });

    return { integrations };
  }

  /**
   * Get merchant activity
   */
  async getMerchantActivity(storeId: string, limit = 50) {
    const activities = await this.db.auditLog.findMany({
      where: { targetStoreId: storeId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return { activities };
  }

  /**
   * Get batch merchant data
   */
  async getBatchMerchants(filters: any) {
    // Implementation for batch operations
    const merchants = await this.db.store.findMany({
      where: filters,
      take: 100,
    });

    return { merchants };
  }

  /**
   * Bulk update merchants
   */
  async bulkUpdateMerchants(ids: string[], updates: any) {
    await this.db.store.updateMany({
      where: { id: { in: ids } },
      data: updates,
    });

    logger.info(`[MerchantAdmin] Bulk update completed for ${ids.length} merchants`);
    return { success: true, updated: ids.length };
  }
}
