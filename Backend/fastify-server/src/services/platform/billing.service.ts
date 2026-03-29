import { prisma, Prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class BillingService {
  constructor(private readonly db = prisma) {}

  async createSubscription(
    plan: string,
    storeId: string,
    customerId: string,
    trialDays: number = 7
  ) {
    const subscription = await this.db.subscription.create({
      data: {
        id: `sub-${Date.now()}`,
        storeId,
        customerId,
        plan,
        status: 'TRIALING',
        trialStart: new Date(),
        trialEnd: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    logger.info(`[Billing] Created subscription ${subscription.id} for store ${storeId}`);
    return subscription;
  }

  async cancelSubscription(subscriptionId: string, storeId: string) {
    const subscription = await this.db.subscription.findFirst({
      where: { id: subscriptionId },
    });

    if (!subscription || subscription.storeId !== storeId) {
      throw new Error('Subscription not found');
    }

    const updated = await this.db.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
      },
    });

    logger.info(`[Billing] Canceled subscription ${subscriptionId}`);
    return updated;
  }

  async upgradeSubscription(
    subscriptionId: string,
    storeId: string,
    newPlan: string,
    prorateDate?: Date
  ) {
    const subscription = await this.db.subscription.findFirst({
      where: { id: subscriptionId },
    });

    if (!subscription || subscription.storeId !== storeId) {
      throw new Error('Subscription not found');
    }

    const proratedAmount = prorateDate
      ? await this.calculateProratedAmount(
          subscription.plan,
          newPlan,
          prorateDate
        )
      : 0;

    const updated = await this.db.subscription.update({
      where: { id: subscriptionId },
      data: {
        plan: newPlan,
        proratedCredit: proratedAmount,
      },
    });

    logger.info(`[Billing] Upgraded subscription ${subscriptionId} to ${newPlan}`);
    return updated;
  }

  async calculateProratedAmount(
    oldPlan: string,
    newPlan: string,
    prorateDate: Date
  ): Promise<number> {
    // Get plan prices
    const plans = {
      FREE: 0,
      STARTER: 500000, // 5000 NGN in kobo
      PRO: 1500000, // 15000 NGN in kobo
      ENTERPRISE: 5000000, // 50000 NGN in kobo
    };

    const oldPrice = plans[oldPlan as keyof typeof plans] || 0;
    const newPrice = plans[newPlan as keyof typeof plans] || 0;

    // Calculate days remaining in billing period
    const daysInMonth = 30;
    const daysRemaining = daysInMonth - prorateDate.getDate();
    const prorationFactor = daysRemaining / daysInMonth;

    const priceDifference = newPrice - oldPrice;
    return Math.max(0, priceDifference * prorationFactor);
  }

  async generateInvoice(subscriptionId: string) {
    const subscription = await this.db.subscription.findFirst({
      where: { id: subscriptionId },
      include: {
        store: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const invoice = await this.db.invoice.create({
      data: {
        id: `inv-${Date.now()}`,
        storeId: subscription.storeId,
        subscriptionId,
        amount: this.getPlanAmount(subscription.plan),
        currency: 'NGN',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        lineItems: [
          {
            description: `${subscription.plan} Plan Subscription`,
            quantity: 1,
            unitPrice: this.getPlanAmount(subscription.plan),
            total: this.getPlanAmount(subscription.plan),
          },
        ],
      },
    });

    logger.info(`[Billing] Generated invoice ${invoice.id} for subscription ${subscriptionId}`);
    return invoice;
  }

  private getPlanAmount(plan: string): number {
    const plans = {
      FREE: 0,
      STARTER: 500000,
      PRO: 1500000,
      ENTERPRISE: 5000000,
    };
    return plans[plan as keyof typeof plans] || 0;
  }

  async getPaymentHistory(storeId: string) {
    const invoices = await this.db.invoice.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return invoices.map((invoice) => ({
      id: invoice.id,
      amount: invoice.amount,
      currency: invoice.currency,
      status: invoice.status,
      dueDate: invoice.dueDate,
      paidAt: invoice.paidAt,
      createdAt: invoice.createdAt,
    }));
  }

  async handleFailedPayment(
    transactionId: string,
    retryCount: number = 0
  ) {
    const maxRetries = 3;

    if (retryCount >= maxRetries) {
      // Suspend subscription after max retries
      await this.db.subscription.update({
        where: { id: transactionId },
        data: { status: 'SUSPENDED' },
      });

      logger.warn(`[Billing] Suspended subscription ${transactionId} after ${maxRetries} failed payment attempts`);
      return { success: false, action: 'suspended' };
    }

    // Schedule retry
    const nextRetryDate = new Date();
    nextRetryDate.setDate(nextRetryDate.getDate() + Math.pow(2, retryCount)); // Exponential backoff

    await this.db.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        status: 'FAILED',
        metadata: {
          retryCount: retryCount + 1,
          nextRetryDate: nextRetryDate.toISOString(),
        } as Prisma.JsonObject,
      },
    });

    logger.info(`[Billing] Scheduled payment retry for ${transactionId}, attempt ${retryCount + 1}`);
    return { success: false, action: 'retry_scheduled', nextRetryDate };
  }

  async applyDiscount(
    code: string,
    storeId: string,
    amount: number
  ) {
    // Validate discount code
    const discount = await this.db.discountCode.findFirst({
      where: {
        code,
        active: true,
      },
    });

    if (!discount) {
      throw new Error('Invalid discount code');
    }

    if (discount.storeId && discount.storeId !== storeId) {
      throw new Error('Discount code not applicable to this store');
    }

    // Apply discount
    const appliedDiscount = await this.db.appliedDiscount.create({
      data: {
        id: `disc-${Date.now()}`,
        storeId,
        discountCodeId: discount.id,
        amount,
        status: 'ACTIVE',
        expiresAt: discount.expiresAt,
      },
    });

    logger.info(`[Billing] Applied discount ${code} to store ${storeId}`);
    return appliedDiscount;
  }
}
