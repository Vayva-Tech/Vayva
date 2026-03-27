import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class SubscriptionsService {
  constructor(private readonly db = prisma) {}

  async getSubscriptions(storeId: string, filters: any) {
    const limit = Math.min(filters.limit || 50, 100);
    const offset = filters.offset || 0;
    const where: any = { storeId };

    if (filters.status) where.status = filters.status;
    if (filters.provider) where.provider = filters.provider;

    const [subscriptions, totalCount] = await Promise.all([
      this.db.subscription.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.subscription.count({ where }),
    ]);

    return {
      subscriptions: subscriptions.map((s) => ({
        id: s.id,
        storeId: s.storeId,
        planKey: s.planKey,
        status: s.status,
        provider: s.provider,
        providerSubscriptionId: s.providerSubscriptionId,
        currentPeriodStart: s.currentPeriodStart,
        currentPeriodEnd: s.currentPeriodEnd,
        cancelAtPeriodEnd: s.cancelAtPeriodEnd,
        startedAt: s.startedAt,
        createdAt: s.createdAt,
      })),
      totalCount,
      hasMore: offset + limit < totalCount,
    };
  }

  async createSubscription(storeId: string, subscriptionData: any) {
    const { planKey, provider, providerSubscriptionId, trialEndsAt } = subscriptionData;

    const subscription = await this.db.subscription.create({
      data: {
        id: `sub-${Date.now()}`,
        storeId,
        planKey,
        provider: provider || 'STRIPE',
        providerSubscriptionId: providerSubscriptionId || null,
        status: 'TRIALING',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        trialEndsAt: trialEndsAt ? new Date(trialEndsAt) : null,
        startedAt: new Date(),
      },
    });

    logger.info(`[Subscriptions] Created subscription ${subscription.id}`);
    return subscription;
  }

  async updateSubscription(subscriptionId: string, storeId: string, updates: any) {
    const subscription = await this.db.subscription.findFirst({
      where: { id: subscriptionId },
    });

    if (!subscription || subscription.storeId !== storeId) {
      throw new Error('Subscription not found');
    }

    const updated = await this.db.subscription.update({
      where: { id: subscriptionId },
      data: {
        ...(updates.status && { status: updates.status }),
        ...(updates.planKey && { planKey: updates.planKey }),
        ...(updates.cancelAtPeriodEnd !== undefined && { cancelAtPeriodEnd: updates.cancelAtPeriodEnd }),
      },
    });

    logger.info(`[Subscriptions] Updated subscription ${subscriptionId}`);
    return updated;
  }

  async cancelSubscription(subscriptionId: string, storeId: string) {
    const subscription = await this.db.subscription.findFirst({
      where: { id: subscriptionId },
    });

    if (!subscription || subscription.storeId !== storeId) {
      throw new Error('Subscription not found');
    }

    const cancelled = await this.db.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'CANCELED',
        cancelAtPeriodEnd: false,
        canceledAt: new Date(),
      },
    });

    logger.info(`[Subscriptions] Cancelled subscription ${subscriptionId}`);
    return cancelled;
  }

  async activateSubscription(subscriptionId: string, storeId: string) {
    const subscription = await this.db.subscription.findFirst({
      where: { id: subscriptionId },
    });

    if (!subscription || subscription.storeId !== storeId) {
      throw new Error('Subscription not found');
    }

    const activated = await this.db.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'ACTIVE',
        startedAt: new Date(),
      },
    });

    logger.info(`[Subscriptions] Activated subscription ${subscriptionId}`);
    return activated;
  }

  async getSubscriptionById(subscriptionId: string, storeId: string) {
    const subscription = await this.db.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!subscription || subscription.storeId !== storeId) {
      throw new Error('Subscription not found');
    }

    return subscription;
  }

  async getSubscriptionUsage(storeId: string) {
    const subscription = await this.db.subscription.findFirst({
      where: { storeId },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      return {
        usage: {},
        limits: {},
      };
    }

    const [orderCount, productCount, customerCount] = await Promise.all([
      this.db.order.count({ where: { storeId } }),
      this.db.product.count({ where: { storeId } }),
      this.db.customer.count({ where: { storeId } }),
    ]);

    return {
      usage: {
        orders: orderCount,
        products: productCount,
        customers: customerCount,
      },
      limits: subscription.plan?.metadata as any || {},
    };
  }

  /**
   * Box Subscriptions - Subscription Boxes Management
   */
  async getSubscriptionBoxes(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.status) where.status = filters.status;

    const [boxes, total] = await Promise.all([
      this.db.subscriptionBox.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { subscriptions: true },
          },
        },
      }),
      this.db.subscriptionBox.count({ where }),
    ]);

    return {
      boxes,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createSubscriptionBox(storeId: string, boxData: any) {
    const {
      name,
      slug,
      description,
      frequency,
      pricing,
      customization,
      contents,
      curation,
      shippingSchedule,
      seo,
      status = 'draft',
      images = [],
      shortDescription,
    } = boxData;

    const box = await this.db.subscriptionBox.create({
      data: {
        id: `box-${Date.now()}`,
        storeId,
        name,
        slug,
        description: description || null,
        shortDescription: shortDescription || null,
        images,
        status,
        frequency,
        pricing: pricing || {},
        customization: customization || {},
        contents: contents || [],
        curation: curation || { type: 'curated' },
        shippingSchedule: shippingSchedule || {},
        seo: seo || {},
      },
    });

    logger.info(`[Subscriptions] Created subscription box ${box.id}`);
    return box;
  }

  async updateSubscriptionBox(boxId: string, storeId: string, updates: any) {
    const box = await this.db.subscriptionBox.findFirst({
      where: { id: boxId },
    });

    if (!box || box.storeId !== storeId) {
      throw new Error('Subscription box not found');
    }

    const updated = await this.db.subscriptionBox.update({
      where: { id: boxId },
      data: updates,
    });

    logger.info(`[Subscriptions] Updated subscription box ${boxId}`);
    return updated;
  }

  /**
   * Box Subscriptions - Customer Subscriptions
   */
  async getBoxSubscriptions(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.status) where.status = filters.status;
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.boxId) where.boxId = filters.boxId;

    const [subscriptions, total] = await Promise.all([
      this.db.boxSubscription.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          box: {
            select: {
              name: true,
              frequency: true,
              pricing: true,
            },
          },
          customer: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: { dunningAttempts: true },
          },
        },
      }),
      this.db.boxSubscription.count({ where }),
    ]);

    return {
      subscriptions: subscriptions.map((sub) => ({
        id: sub.id,
        boxId: sub.boxId,
        boxName: sub.box?.name || 'Unknown Box',
        boxFrequency: sub.box?.frequency || 'monthly',
        customerId: sub.customerId,
        customerEmail: sub.customer?.email || 'Unknown Customer',
        customerName:
          sub.customer && `${sub.customer.firstName || ''} ${sub.customer.lastName || ''}`.trim() !== ''
            ? `${sub.customer.firstName || ''} ${sub.customer.lastName || ''}`.trim()
            : 'Unknown Customer',
        status: sub.status,
        startDate: sub.startDate.toISOString(),
        endDate: sub.endDate?.toISOString() || null,
        nextBillingDate: sub.nextBillingDate?.toISOString() || null,
        frequency: sub.frequency,
        currentPricing: sub.pricing,
        dunningAttemptCount: sub._count.dunningAttempts,
        preferences: sub.preferences,
        createdAt: sub.createdAt.toISOString(),
        updatedAt: sub.updatedAt.toISOString(),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createBoxSubscription(storeId: string, subscriptionData: any) {
    const {
      boxId,
      customerId,
      startDate,
      frequency,
      preferences,
      pricing,
    } = subscriptionData;

    // Verify box exists
    const box = await this.db.subscriptionBox.findUnique({
      where: { id: boxId },
    });

    if (!box || box.storeId !== storeId) {
      throw new Error('Subscription box not found');
    }

    const subscription = await this.db.boxSubscription.create({
      data: {
        id: `bsub-${Date.now()}`,
        storeId,
        boxId,
        customerId,
        startDate: new Date(startDate),
        frequency,
        status: 'ACTIVE',
        pricing: pricing || box.pricing || {},
        preferences: preferences || {},
        nextBillingDate: new Date(startDate),
      },
    });

    logger.info(`[Subscriptions] Created box subscription ${subscription.id}`);
    return subscription;
  }

  async updateBoxSubscription(subscriptionId: string, storeId: string, updates: any) {
    const subscription = await this.db.boxSubscription.findFirst({
      where: { id: subscriptionId },
    });

    if (!subscription || subscription.storeId !== storeId) {
      throw new Error('Box subscription not found');
    }

    const updated = await this.db.boxSubscription.update({
      where: { id: subscriptionId },
      data: updates,
    });

    logger.info(`[Subscriptions] Updated box subscription ${subscriptionId}`);
    return updated;
  }

  /**
   * Dunning Management
   */
  async getDunningConfig(storeId: string, boxId?: string | null) {
    const where: any = { storeId };
    if (boxId !== undefined) {
      where.boxId = boxId;
    } else {
      where.boxId = null; // Store-level default
    }

    const config = await this.db.boxDunningConfig.findUnique({
      where,
    });

    if (!config) {
      return {
        storeId,
        boxId: boxId || null,
        retrySchedule: [1, 3, 7, 14],
        maxRetries: 4,
        finalAction: 'cancel',
        notifyCustomer: true,
        notifyOwner: true,
        isDefault: true,
      };
    }

    return {
      id: config.id,
      storeId: config.storeId,
      boxId: config.boxId,
      retrySchedule: config.retrySchedule,
      maxRetries: config.maxRetries,
      finalAction: config.finalAction,
      notifyCustomer: config.notifyCustomer,
      notifyOwner: config.notifyOwner,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
    };
  }

  async saveDunningConfig(storeId: string, configData: any) {
    const {
      boxId,
      retrySchedule = [1, 3, 7, 14],
      maxRetries = 4,
      finalAction = 'cancel',
      notifyCustomer = true,
      notifyOwner = true,
    } = configData;

    // Verify box exists if specified
    if (boxId) {
      const box = await this.db.subscriptionBox.findUnique({
        where: { id: boxId },
        select: { storeId: true },
      });

      if (!box || box.storeId !== storeId) {
        throw new Error('Subscription box not found');
      }
    }

    const existing = await this.db.boxDunningConfig.findUnique({
      where: { storeId, boxId: boxId || null },
    });

    let config;
    if (existing) {
      config = await this.db.boxDunningConfig.update({
        where: { id: existing.id },
        data: {
          retrySchedule,
          maxRetries,
          finalAction,
          notifyCustomer,
          notifyOwner,
        },
      });
    } else {
      config = await this.db.boxDunningConfig.create({
        data: {
          id: `dun-${Date.now()}`,
          storeId,
          boxId: boxId || null,
          retrySchedule,
          maxRetries,
          finalAction,
          notifyCustomer,
          notifyOwner,
        },
      });
    }

    logger.info(`[Subscriptions] Saved dunning config for box ${boxId || 'store-level'}`);
    return config;
  }

  async triggerDunning(subscriptionId: string, attemptNumber: number) {
    const subscription = await this.db.boxSubscription.findUnique({
      where: { id: subscriptionId },
      include: {
        box: true,
        customer: true,
      },
    });

    if (!subscription) {
      throw new Error('Box subscription not found');
    }

    // Get dunning config
    const config = await this.getDunningConfig(subscription.storeId, subscription.boxId);

    // Create dunning attempt record
    const attempt = await this.db.boxDunningAttempt.create({
      data: {
        id: `datt-${Date.now()}`,
        subscriptionId,
        attemptNumber,
        scheduledDate: new Date(),
        status: 'PENDING',
      },
    });

    logger.info(
      `[Subscriptions] Triggered dunning attempt ${attemptNumber} for subscription ${subscriptionId}`,
    );

    return { success: true, attempt, config };
  }
}
