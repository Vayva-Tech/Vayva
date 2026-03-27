import { prisma, type Prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class InvoiceService {
  constructor(private readonly db = prisma) {}

  async getInvoices(storeId: string, filters: any) {
    const limit = Math.min(filters.limit || 50, 100);
    const offset = filters.offset || 0;

    const where: any = { storeId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.subscriptionId) {
      where.subscriptionId = filters.subscriptionId;
    }

    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    const [invoices, total, totalAmount] = await Promise.all([
      this.db.invoiceV2.findMany({
        where,
        include: {
          subscription: {
            select: {
              planKey: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.invoiceV2.count({ where }),
      this.db.invoiceV2.aggregate({
        where,
        _sum: { totalKobo: true },
      }),
    ]);

    return {
      invoices: invoices.map((i) => ({
        id: i.id,
        subscriptionId: i.subscriptionId,
        plan: i.subscription?.planKey,
        amount: Number(i.totalKobo) / 100,
        currency: 'NGN',
        status: i.status,
        dueDate: i.dueDate,
        paidAt: null,
        paidVia: null,
        providerRef: null,
        items: i.items,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      })),
      summary: {
        total,
        totalAmount: Number(totalAmount._sum.totalKobo || 0) / 100,
      },
      pagination: {
        limit,
        offset,
      },
    };
  }

  async createInvoice(storeId: string, invoiceData: any) {
    const {
      subscriptionId,
      amount,
      currency = 'NGN',
      dueDate,
      items,
      metadata,
    } = invoiceData;

    // Calculate total from items
    const itemTotal = items.reduce(
      (sum: number, item: any) => sum + item.amount * item.quantity,
      0
    );

    if (Math.abs(itemTotal - amount) > 0.01) {
      throw new Error('Amount does not match item total');
    }

    // If subscriptionId provided, verify it belongs to store
    if (subscriptionId) {
      const subscription = await this.db.subscription.findFirst({
        where: { id: subscriptionId, storeId },
      });
      if (!subscription) {
        throw new Error('Subscription not found');
      }
    }

    const invoice = await this.db.invoiceV2.create({
      data: {
        store: { connect: { id: storeId } },
        ...(subscriptionId
          ? { subscription: { connect: { id: subscriptionId } } }
          : {}),
        invoiceNumber: `INV-${Date.now()}`,
        totalKobo: BigInt(Math.round(amount * 100)),
        subtotalKobo: BigInt(Math.round(amount * 100)),
        taxKobo: BigInt(0),
        status: 'DRAFT',
        dueDate: dueDate
          ? new Date(dueDate)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        items: items as Prisma.InputJsonValue,
      },
    });

    logger.info(`[Invoice] Created invoice ${invoice.id}`);
    return {
      id: invoice.id,
      amount: Number(invoice.totalKobo) / 100,
      currency: 'NGN',
      status: invoice.status,
      dueDate: invoice.dueDate,
      items: invoice.items,
    };
  }

  async updateInvoiceStatus(
    storeId: string,
    invoiceId: string,
    action: string,
    additionalData?: any
  ) {
    const invoice = await this.db.invoiceV2.findFirst({
      where: { id: invoiceId, storeId },
      include: { subscription: true },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    switch (action) {
      case 'mark_paid': {
        if (invoice.status === 'PAID') {
          throw new Error('Invoice is already paid');
        }

        const paidInvoice = await this.db.invoiceV2.update({
          where: { id: invoiceId },
          data: { status: 'PAID' },
        });

        // Update subscription period if this is a subscription invoice
        if (invoice.subscription) {
          const now = new Date();
          await this.db.subscription.update({
            where: { id: invoice.subscription.id },
            data: {
              status: 'ACTIVE',
              currentPeriodStart: now,
              currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
              gracePeriodEndsAt: null,
            },
          });
        }

        logger.info(`[Invoice] Marked invoice ${invoiceId} as paid`);
        return paidInvoice;
      }

      case 'mark_overdue': {
        if (invoice.status !== 'SENT') {
          throw new Error('Can only mark sent invoices as overdue');
        }

        const overdueInvoice = await this.db.invoiceV2.update({
          where: { id: invoiceId },
          data: { status: 'OVERDUE' },
        });

        // Create dunning attempt if this is a subscription invoice
        if (invoice.subscription) {
          await this.db.dunningAttempt.create({
            data: {
              storeId,
              subscriptionId: invoice.subscription.id,
              attemptNumber: 1,
              status: 'FAILED',
              nextAttemptAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            },
          });

          if (invoice.subscription.status === 'ACTIVE') {
            await this.db.subscription.update({
              where: { id: invoice.subscription.id },
              data: {
                status: 'PAST_DUE',
                gracePeriodEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              },
            });
          }
        }

        logger.info(`[Invoice] Marked invoice ${invoiceId} as overdue`);
        return overdueInvoice;
      }

      case 'cancel': {
        if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') {
          throw new Error('Cannot cancel paid or already cancelled invoices');
        }

        const canceledInvoice = await this.db.invoiceV2.update({
          where: { id: invoiceId },
          data: { status: 'CANCELLED' },
        });

        logger.info(`[Invoice] Cancelled invoice ${invoiceId}`);
        return canceledInvoice;
      }

      case 'refund': {
        if (invoice.status !== 'PAID') {
          throw new Error('Can only refund paid invoices');
        }

        const refundedInvoice = await this.db.invoiceV2.update({
          where: { id: invoiceId },
          data: { status: 'PAID' },
        });

        logger.info(`[Invoice] Refunded invoice ${invoiceId}`);
        return refundedInvoice;
      }

      default:
        throw new Error('Invalid action');
    }
  }
}
