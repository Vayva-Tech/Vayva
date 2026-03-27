import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class BillingService {
  constructor(private readonly db = prisma) {}

  async getSubscription(storeId: string) {
    const subscription = await this.db.subscription.findFirst({
      where: { storeId },
      include: {
        plan: true,
      },
    });

    return subscription;
  }

  async upgradePlan(storeId: string, upgradeData: any) {
    const { planId, billingCycle } = upgradeData;

    const plan = await this.db.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    const existingSub = await this.db.subscription.findFirst({
      where: { storeId },
    });

    if (existingSub) {
      const updated = await this.db.subscription.update({
        where: { id: existingSub.id },
        data: {
          planId,
          billingCycle: billingCycle || 'monthly',
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        include: { plan: true },
      });

      logger.info(`[Billing] Upgraded store ${storeId} to plan ${planId}`);
      return updated;
    }

    const subscription = await this.db.subscription.create({
      data: {
        id: `sub-${Date.now()}`,
        storeId,
        planId,
        billingCycle: billingCycle || 'monthly',
        status: 'active',
        startDate: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      include: { plan: true },
    });

    logger.info(`[Billing] Created subscription for store ${storeId}`);
    return subscription;
  }

  async downgradePlan(storeId: string, downgradeData: any) {
    const { planId, reason } = downgradeData;

    const subscription = await this.db.subscription.findFirst({
      where: { storeId },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const updated = await this.db.subscription.update({
      where: { id: subscription.id },
      data: {
        planId,
        status: 'active',
        cancellationReason: reason || null,
      },
      include: { plan: true },
    });

    logger.info(`[Billing] Downgraded store ${storeId} to plan ${planId}`);
    return updated;
  }

  async cancelSubscription(storeId: string, reason: string) {
    const subscription = await this.db.subscription.findFirst({
      where: { storeId },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const cancelled = await this.db.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    logger.info(`[Billing] Cancelled subscription for store ${storeId}`);
    return cancelled;
  }

  async calculateProration(storeId: string, newPlanId: string) {
    const subscription = await this.db.subscription.findFirst({
      where: { storeId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const newPlan = await this.db.plan.findUnique({
      where: { id: newPlanId },
    });

    if (!newPlan) {
      throw new Error('New plan not found');
    }

    const daysRemaining = Math.floor(
      (subscription.currentPeriodEnd.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    );

    const oldDailyCost = subscription.plan.price / 30;
    const newDailyCost = newPlan.price / 30;

    const prorationAmount = (newDailyCost - oldDailyCost) * daysRemaining;

    return {
      daysRemaining,
      oldPlanPrice: subscription.plan.price,
      newPlanPrice: newPlan.price,
      prorationAmount,
      dueNow: Math.max(0, prorationAmount),
    };
  }

  async verifyPayment(storeId: string, paymentData: any) {
    const { paymentIntentId, amount, signature } = paymentData;

    const payment = await this.db.payment.create({
      data: {
        id: `pay-${Date.now()}`,
        storeId,
        amount,
        currency: 'USD',
        status: 'succeeded',
        paymentIntentId,
        signature,
        paidAt: new Date(),
      },
    });

    logger.info(`[Billing] Verified payment ${payment.id}`);
    return payment;
  }

  async verifyTemplate(storeId: string, templateId: string) {
    const template = await this.db.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    const verification = await this.db.templateVerification.create({
      data: {
        id: `tv-${Date.now()}`,
        templateId,
        storeId,
        status: 'verified',
        verifiedAt: new Date(),
      },
    });

    logger.info(`[Billing] Verified template ${templateId}`);
    return verification;
  }

  async getPaymentHistory(storeId: string) {
    const payments = await this.db.payment.findMany({
      where: { storeId },
      orderBy: { paidAt: 'desc' },
    });

    return payments;
  }

  async getInvoices(storeId: string) {
    const invoices = await this.db.invoice.findMany({
      where: { storeId },
      include: {
        subscription: {
          include: { plan: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invoices;
  }
}
