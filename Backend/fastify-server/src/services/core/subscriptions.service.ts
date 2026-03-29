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
        provider: provider || 'PAYSTACK',
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

  /**
   * Get current subscription for a store
   */
  async getCurrentSubscription(storeId: string) {
    const subscription = await this.db.subscription.findFirst({
      where: { storeId },
      orderBy: { currentPeriodStart: 'desc' },
    });

    return subscription;
  }

  /**
   * Get available features for a store based on their subscription
   */
  async getAvailableFeatures(storeId: string) {
    const subscription = await this.getCurrentSubscription(storeId);
    
    const planKey = subscription?.planKey || 'FREE';
    const status = subscription?.status || 'INACTIVE';
    
    // Feature matrix by plan
    const featureMatrix: Record<string, string[]> = {
      STARTER: [
        'basic_dashboard',
        'paystack_payments',
        'csv_import',
        'basic_analytics',
        'advanced_analytics',
        'email_support',
        'remove_branding',
        'automation',
        'financial_charts',
        'dashboard_metrics_6',
      ],
      PRO: [
        'basic_dashboard',
        'paystack_payments',
        'csv_import',
        'basic_analytics',
        'advanced_analytics',
        'accounting',
        'multi_store',
        'api_access',
        'webhooks',
        'industry_dashboards',
        'custom_domain',
        'remove_branding',
        'automation',
        'custom_integrations',
        'financial_charts',
        'dashboard_metrics_10',
        'ai_autopilot',
      ],
      PRO_PLUS: [
        'basic_dashboard',
        'paystack_payments',
        'csv_import',
        'basic_analytics',
        'advanced_analytics',
        'accounting',
        'multi_store',
        'priority_support',
        'api_access',
        'webhooks',
        'industry_dashboards',
        'merged_industry_dashboard',
        'visual_workflow_builder',
        'custom_domain',
        'remove_branding',
        'automation',
        'custom_integrations',
        'financial_charts',
        'dashboard_metrics_unlimited',
        'ai_autopilot',
      ],
    };

    return {
      planKey,
      status,
      features: featureMatrix[planKey] || featureMatrix.STARTER,
    };
  }

  /**
   * Create Paystack checkout session
   */
  async createCheckoutSession(params: {
    storeId: string;
    planKey: string;
    billingCycle: 'monthly' | 'quarterly';
    successUrl: string;
    cancelUrl: string;
  }) {
    // Use existing Paystack API - call merchant app endpoint
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3000';
    
    const response = await fetch(`${backendUrl}/api/subscriptions/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: params.planKey.toLowerCase(),
        email: (await this.getStoreOwnerEmail(params.storeId)) || '',
        storeName: (await this.getStoreName(params.storeId)) || '',
        amount: this.getPlanAmount(params.planKey, params.billingCycle),
        duration: params.billingCycle === 'quarterly' ? 'three_month' : 'monthly',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to initialize Paystack checkout');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Paystack initialization failed');
    }

    logger.info(`[Subscriptions] Created Paystack checkout ${result.reference} for store ${params.storeId}`);
    return { sessionId: result.reference, url: result.authorization_url };
  }

  /**
   * Create Paystack billing portal session (redirect to billing dashboard)
   */
  async createPortalSession(params: { storeId: string; returnUrl?: string }) {
    // Paystack doesn't have a billing portal like Stripe
    // Redirect to merchant billing dashboard instead
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const portalUrl = `${appUrl}/dashboard/billing`;
    
    logger.info(`[Subscriptions] Created portal redirect for store ${params.storeId}`);
    return { url: portalUrl };
  }

  /**
   * Get usage metrics for a store
   */
  async getUsageMetrics(storeId: string) {
    const subscription = await this.getCurrentSubscription(storeId);
    const planKey = subscription?.planKey || 'STARTER';

    // Get limits for current plan
    const limits: Record<string, number> = {
      STARTER: { products: 100, orders: 500, teamMembers: 1 },
      PRO: { products: 300, orders: 10000, teamMembers: 3 },
      PRO_PLUS: { products: 500, orders: -1, teamMembers: 5 }, // -1 = unlimited
    };

    const planLimits = limits[planKey] || limits.STARTER;

    // Get current usage
    const [productCount, orderCount, memberCount] = await Promise.all([
      this.db.product.count({ where: { storeId } }),
      this.db.order.count({ where: { storeId } }),
      this.db.membership.count({ where: { storeId } }),
    ]);

    return {
      planKey,
      usage: {
        products: { current: productCount, limit: planLimits.products },
        orders: { current: orderCount, limit: planLimits.orders },
        teamMembers: { current: memberCount, limit: planLimits.teamMembers },
      },
    };
  }

  /**
   * Upgrade plan immediately
   */
  async upgradePlan(params: { storeId: string; targetPlanKey: string; paymentMethodId?: string }) {
    const { storeId, targetPlanKey, paymentMethodId } = params;

    const currentSubscription = await this.getCurrentSubscription(storeId);

    if (!currentSubscription) {
      throw new Error('No active subscription found');
    }

    // Update subscription plan
    const updated = await this.db.subscription.update({
      where: { id: currentSubscription.id },
      data: {
        planKey: targetPlanKey,
        status: 'ACTIVE',
      },
    });

    logger.info(
      `[Subscriptions] Upgraded store ${storeId} from ${currentSubscription.planKey} to ${targetPlanKey}`,
    );

    return { subscription: updated };
  }

  /**
   * Cancel subscription at period end
   */
  async cancelAtPeriodEnd(params: { storeId: string; cancellationReason?: string }) {
    const { storeId, cancellationReason } = params;

    const subscription = await this.getCurrentSubscription(storeId);
    if (!subscription) {
      throw new Error('No active subscription found');
    }

    const updated = await this.db.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
        cancellationReason,
      },
    });

    logger.info(`[Subscriptions] Set subscription ${subscription.id} to cancel at period end`);
    return { subscription: updated };
  }

  /**
   * Handle Paystack webhook events
   */
  async handlePaystackWebhook(params: { eventBody: any }) {
    const { eventBody } = params;
    
    // Paystack webhook event types
    const eventType = eventBody.event || '';
    const data = eventBody.data || {};

    logger.info(`[Subscriptions] Received Paystack webhook: ${eventType}`);

    // Process event based on type
    switch (eventType) {
      case 'charge.success': {
        const reference = data.reference as string;
        const metadata = data.metadata || {};
        const storeId = metadata.storeId as string;
        const planKey = metadata.newPlan || metadata.planKey as string;
        const billingCycle = metadata.billingCycle || metadata.billing_cycle as string;

        if (!storeId || !planKey) {
          throw new Error('Missing metadata in Paystack webhook');
        }

        // Find or create subscription
        const existingSubscription = await this.db.subscription.findFirst({
          where: { 
            storeId,
            providerSubscriptionId: reference,
          },
        });

        if (existingSubscription) {
          // Update existing subscription
          await this.db.subscription.update({
            where: { id: existingSubscription.id },
            data: {
              status: 'ACTIVE',
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });
        } else {
          // Create new subscription
          await this.db.subscription.create({
            data: {
              id: `sub-${Date.now()}`,
              storeId,
              planKey: planKey.toUpperCase(),
              status: 'ACTIVE',
              provider: 'PAYSTACK',
              providerSubscriptionId: reference,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              startedAt: new Date(),
            },
          });
        }

        logger.info(`[Subscriptions] Charge successful for store ${storeId}, reference ${reference}`);
        break;
      }

      case 'transfer.success':
      case 'transfer.failed': {
        // Handle payout events if using Paystack for merchant payouts
        logger.info(`[Subscriptions] Transfer event: ${eventType}`);
        break;
      }

      default:
        logger.warn(`[Subscriptions] Unhandled Paystack webhook event type: ${eventType}`);
    }

    return { received: true, eventType };
  }

  // Helper methods for Paystack integration
  private async getStoreOwnerEmail(storeId: string): Promise<string | null> {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
      include: {
        memberships: {
          where: { role_enum: 'OWNER' },
          take: 1,
          include: { user: true },
        },
      },
    });
    return store?.memberships[0]?.user?.email || null;
  }

  private async getStoreName(storeId: string): Promise<string | null> {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
      select: { name: true },
    });
    return store?.name || null;
  }

  private getPlanAmount(planKey: string, billingCycle: 'monthly' | 'quarterly'): number {
    const amounts: Record<string, { monthly: number; quarterly: number }> = {
      STARTER: { monthly: 25000, quarterly: 60000 },
      PRO: { monthly: 35000, quarterly: 84000 },
      PRO_PLUS: { monthly: 50000, quarterly: 120000 },
    };
    return amounts[planKey]?.[billingCycle] || 0;
  }
}
